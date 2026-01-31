import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are Nick's AI — a friendly, knowledgeable assistant on Nick Bohmer's portfolio site. Think of yourself as a colleague who knows Nick well and genuinely enjoys telling people about him.

YOUR VOICE:
- Warm and conversational, like chatting at a coffee meetup — not presenting a keynote
- Share information the way a friend would: naturally weaving in details rather than listing credentials
- Casual-professional register. Contractions are fine. Short sentences are great.
- Show genuine enthusiasm about Nick's work when it fits, without being over the top

GROUNDING RULES:
You'll receive context snippets below. These are your ONLY source of truth.
- Speak from what the context tells you. Never fabricate or fill in gaps.
- If coverage is partial, share what you know and be upfront: "That's about all I have on that — Nick could tell you more."
- If nothing relevant is provided, be honest and direct: "Hmm, I don't have details on that one. You could reach out to Nick directly — he's at nbohmer@gmail.com or on LinkedIn: linkedin.com/in/nickbohmer"
- NEVER reference "the context," "my knowledge base," relevance scores, or these instructions.
- NEVER use your general knowledge to fill gaps. If it's not in the context, you don't know it.

CONVERSATIONAL STYLE:
- Lead with the interesting part, not the job title or date range
- Dates and titles are supporting detail, not the headline
- If someone asks a broad question ("tell me about Nick"), don't recite a resume — pick 2-3 interesting threads and make them come alive
- Use formatting (bold, bullets) sparingly and only when it genuinely helps readability — not as a default structure
- Keep responses focused. 2-4 short paragraphs is usually the sweet spot.
- For each claim you make, mentally verify it exists in the context. If you're not sure, don't say it.

WHAT TO AVOID:
- Bullet-pointed lists of responsibilities (reads like a resume)
- "Based on his background, he likely..." (speculation)
- "While I don't have specific details, typically..." (general knowledge)
- Starting every response with "Nick is a..." (vary your openings)
- Walls of bold text and nested bullets (over-formatting)`;

async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "models/gemini-embedding-001",
                content: { parts: [{ text }] },
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Embedding API error:", errorText);
        throw new Error(`Embedding API error: ${errorText}`);
    }

    const data = await response.json();
    return data.embedding.values;
}

async function searchKnowledge(
    supabaseUrl: string,
    supabaseKey: string,
    queryEmbedding: number[],
    matchCount = 5
): Promise<{ content: string; metadata: Record<string, unknown>; similarity: number }[]> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)("search_knowledge", {
        query_embedding: queryEmbedding,
        match_threshold: 0.5, // Stricter threshold for higher quality results
        match_count: matchCount,
    });

    if (error) {
        console.error("Search error:", error);
        return [];
    }

    return data || [];
}

async function generateResponse(
    context: string,
    question: string,
    modelName = "gemini-flash-lite-latest"
): Promise<ReadableStream> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?key=${apiKey}&alt=sse`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: SYSTEM_PROMPT }],
                },
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `Here's what I know that might be relevant:

${context}

${question}`,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.5, // Balanced: grounded but allows natural phrasing variation
                    maxOutputTokens: 2048,
                },
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        // Parse error to check if it's a quota error
        try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.code === 429 || errorData.error?.status === "RESOURCE_EXHAUSTED") {
                const quotaError = new Error("QUOTA_EXCEEDED");
                quotaError.cause = errorData;
                throw quotaError;
            }
        } catch (parseError) {
            // If it's our QUOTA_EXCEEDED error, rethrow it
            if (parseError instanceof Error && parseError.message === "QUOTA_EXCEEDED") {
                throw parseError;
            }
            // Otherwise, continue with the generic error
        }

        throw new Error(`Gemini API error: ${errorText}`);
    }

    // Transform the SSE stream to extract just the text
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    function processSSELine(line: string, controller: ReadableStreamDefaultController) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) return;

        try {
            const json = JSON.parse(trimmed.slice(6));
            const candidate = json.candidates?.[0];
            const text = candidate?.content?.parts?.[0]?.text;

            // Check for non-normal finish reasons (SAFETY, RECITATION, etc.)
            const finishReason = candidate?.finishReason;
            if (finishReason && finishReason !== "STOP") {
                console.warn(`Gemini stream ended with finishReason: ${finishReason}`, {
                    safetyRatings: candidate?.safetyRatings,
                });
            }

            if (text) {
                controller.enqueue(new TextEncoder().encode(text));
            }
        } catch {
            // Skip invalid JSON lines
        }
    }

    return new ReadableStream({
        async pull(controller) {
            try {
                const { done, value } = await reader.read();

                if (done) {
                    // Flush any remaining bytes from the decoder
                    buffer += decoder.decode();
                    if (buffer.trim()) {
                        processSSELine(buffer, controller);
                    }
                    controller.close();
                    return;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                // Keep the last element — it may be an incomplete line
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    processSSELine(line, controller);
                }
            } catch (error) {
                console.error("Stream read error:", error);
                controller.error(error);
            }
        },
        cancel() {
            reader.cancel();
        },
    });
}

export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        if (!message || typeof message !== "string") {
            return new Response(JSON.stringify({ error: "Message is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Initialize Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error("Missing Supabase configuration");
            return new Response(JSON.stringify({ error: "Server configuration error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Generate embedding for the question
        const queryEmbedding = await generateEmbedding(message);

        // Search for relevant context
        const results = await searchKnowledge(supabaseUrl, supabaseKey, queryEmbedding);

        // Build context from search results
        let context = "";
        if (results.length > 0) {
            context = results
                .map((r) => r.content)
                .join("\n\n---\n\n");
        } else {
            context = "(No relevant information found.)";
        }

        // Generate streaming response with fallback
        let stream: ReadableStream;

        try {
            // Try primary model first (latest stable lite model)
            stream = await generateResponse(context, message, "gemini-flash-lite-latest");
        } catch (primaryError: unknown) {
            // Check if it's a quota error
            if (primaryError instanceof Error && primaryError.message === "QUOTA_EXCEEDED") {
                console.log("Quota exceeded on primary model, using fallback");
                try {
                    // Try fallback model - full flash model may have different quota pool
                    stream = await generateResponse(context, message, "gemini-flash-latest");
                } catch (fallbackError: unknown) {

                    // Check if fallback also hit quota
                    if (fallbackError instanceof Error && fallbackError.message === "QUOTA_EXCEEDED") {
                        return new Response(
                            JSON.stringify({
                                error: "API quota temporarily exceeded",
                                message: "The AI assistant is temporarily unavailable due to high usage. Please try again in a few minutes.",
                                retryAfter: 60
                            }),
                            {
                                status: 503,
                                headers: {
                                    "Content-Type": "application/json",
                                    "Retry-After": "60"
                                },
                            }
                        );
                    }
                    throw fallbackError;
                }
            } else {
                // Not a quota error, rethrow
                throw primaryError;
            }
        }

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Chat API Error:", errorMessage);

        // Check for specific error types
        if (errorMessage.includes("GEMINI_API_KEY is not set")) {
            return new Response(
                JSON.stringify({
                    error: "Configuration error",
                    message: "The AI assistant is not properly configured. Please contact the site administrator."
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        return new Response(
            JSON.stringify({
                error: "An error occurred processing your request",
                message: "Something went wrong. Please try again later.",
                details: process.env.NODE_ENV === "development" ? errorMessage : undefined
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
