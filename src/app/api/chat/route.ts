import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are an AI assistant on Nick Bohmer's portfolio website. Your role is to answer questions about Nick's professional experience, projects, and skills.

Guidelines:
- Be concise, professional, and helpful
- Base your answers on the provided context about Nick
- If the context doesn't contain relevant information, say "I don't have specific information about that, but you can reach Nick directly on LinkedIn."
- When discussing his experience, mention specific roles or projects when relevant
- Keep responses conversational but informative
- Don't make up information not in the context

Nick is a Product Leader & AI Builder based in Dallas, TX. He has extensive experience in enterprise networking (SD-WAN, SASE) at AT&T and has been building full-stack AI applications.`;

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
        throw new Error(`Embedding API error: ${await response.text()}`);
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
        match_threshold: 0.4,
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
    question: string
): Promise<ReadableStream> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${apiKey}&alt=sse`,
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
                                text: `Context about Nick Bohmer:
${context}

Question: ${question}

Please answer based on the context provided.`,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                },
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Gemini API error: ${await response.text()}`);
    }

    // Transform the SSE stream to extract just the text
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream({
        async pull(controller) {
            const { done, value } = await reader.read();

            if (done) {
                controller.close();
                return;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    try {
                        const json = JSON.parse(line.slice(6));
                        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                            controller.enqueue(new TextEncoder().encode(text));
                        }
                    } catch {
                        // Skip invalid JSON lines
                    }
                }
            }
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
        const context = results.length > 0
            ? results.map((r) => r.content).join("\n\n")
            : "Nick Bohmer is a Product Leader & AI Builder based in Dallas, TX with experience at AT&T in enterprise networking.";

        // Generate streaming response
        const stream = await generateResponse(context, message);

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error("Chat API error:", error);
        return new Response(
            JSON.stringify({ error: "An error occurred processing your request" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
