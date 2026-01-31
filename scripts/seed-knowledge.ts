/**
 * Seed Knowledge Base Script
 *
 * This script extracts content from resume data AND personal knowledge,
 * chunks it, generates embeddings via Gemini, and stores in Supabase pgvector.
 *
 * Usage: npx tsx scripts/seed-knowledge.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Resume data - written in conversational first-person voice for natural AI responses
const RESUME_CHUNKS = [
    {
        content: `I'm a product leader and hands-on builder. My professional focus has been bridging enterprise strategy and execution, particularly around managed SD-WAN and SASE solutions. Over the past year I've also taught myself to design, build, and launch full-stack AI applications — taking ideas from prototype to production with modern dev workflows and CI/CD pipelines. Working hands-on with multi-agent frameworks like Google's Agent Development Kit gave me real insight into the strengths and limitations of AI systems, which helps me collaborate better with engineering teams and make product decisions grounded in actual implementation challenges.`,
        metadata: {
            source: "resume",
            type: "summary" as const,
            topics: ["product-management", "ai", "sd-wan", "leadership", "full-stack"],
        },
    },
    {
        content: `Since August 2025 I've been an Associate Director at AT&T leading Value Added Solutions. I run a major product portfolio that includes the Global Solution Center and Network Function Virtualization, working closely with executives to align roadmaps with business strategy. I also directed the end-to-end development of an AI-powered platform built with Next.js, React, and Python — took it through the full lifecycle and it significantly improved the seller experience. I've been driving LLM workflow integrations using LangSmith to push AI adoption, and I was selected for AT&T's Growth Council to lead AI-focused product evolution for business networks.`,
        metadata: {
            source: "resume",
            type: "work" as const,
            title: "Associate Director (Value Added Solutions)",
            company: "AT&T",
            period: "August 2025 - Current",
            topics: ["at&t", "leadership", "ai", "product-management", "next.js", "langsmith"],
        },
    },
    {
        content: `From August 2022 to August 2025 I led Product Management & Development for AT&T's Edge Solutions. The big thing during this stretch was taking a network-integrated SD-WAN solution from concept all the way to market launch — managing a significant budget and cross-functional teams to deploy a large device fleet. I built out the GTM strategies and customer-facing collateral to position the Edge solutions. One of the highlights was earning "Market Leader" recognition from top industry analysts like Frost & Sullivan and Vertical Systems Group.`,
        metadata: {
            source: "resume",
            type: "work" as const,
            title: "Lead Product Management & Development (Edge Solutions)",
            company: "AT&T",
            period: "August 2022 - August 2025",
            topics: ["at&t", "sd-wan", "product-launch", "gtm", "analyst-relations"],
        },
    },
    {
        content: `Before leading product, I was a Solutions Architect at AT&T from August 2020 to July 2022. I designed tailored network and security solutions — SD-WAN, SASE — for global enterprise clients and drove significant product adoption. I managed executive-level relationships that generated substantial annual revenue, basically serving as a trusted advisor on network transformation. A lot of the role was orchestrating collaboration between engineering, marketing, and sales to keep solutions aligned with the strategic vision.`,
        metadata: {
            source: "resume",
            type: "work" as const,
            title: "Solutions Architect",
            company: "AT&T",
            period: "August 2020 - July 2022",
            topics: ["at&t", "solutions-architecture", "sd-wan", "sase", "enterprise"],
        },
    },
    {
        content: `My first role in the SD-WAN space was as a Sr. Edge Solutions Specialist at AT&T from January 2019 to July 2020. I was a key driver in launching the Edge Specialist team and increasing service adoption by positioning SD-WAN and security solutions effectively. I led over 20 SD-WAN workshops where I translated technical concepts for stakeholders, which directly generated significant new revenue. I also created and delivered specialized technical training for sales teams to build their expertise in Managed Network Services.`,
        metadata: {
            source: "resume",
            type: "work" as const,
            title: "Sr. Edge Solutions Specialist (SD-WAN & MNS SME)",
            company: "AT&T",
            period: "January 2019 - July 2020",
            topics: ["at&t", "sd-wan", "training", "workshops", "sales-enablement"],
        },
    },
    {
        content: `One of my main side projects is vana.bot — a full-stack AI chat application I built that renders interactive artifacts like React components, SVG graphics, and Mermaid diagrams live in the browser. It's built with React, TypeScript, and Vite on the frontend, uses OpenRouter for LLM access, and has a Supabase/PostgreSQL backend running on Deno. You can check it out at https://vana.bot. It's a good example of me taking an AI idea all the way to a shipped, production application.`,
        metadata: {
            source: "resume",
            type: "project" as const,
            title: "vana.bot",
            topics: ["ai", "react", "typescript", "supabase", "full-stack", "side-project"],
        },
    },
    {
        content: `BreeziNet was a concept I prototyped and pitched during a two-day workshop — a unified fiber and wireless offering. I managed to secure executive buy-in for further development. It's a good example of how I work: move fast, build something tangible, and use it to sell the vision.`,
        metadata: {
            source: "resume",
            type: "use_case" as const,
            title: "BreeziNet",
            topics: ["innovation", "prototyping", "fiber", "wireless"],
        },
    },
    {
        content: `You can reach me at nbohmer@gmail.com, find me on LinkedIn at linkedin.com/in/nickbohmer, or check out my code on GitHub at github.com/NickB03. I'm based in Dallas, TX.`,
        metadata: {
            source: "resume",
            type: "contact" as const,
            topics: ["contact", "email", "linkedin", "github", "location"],
        },
    },
];

interface KnowledgeChunk {
    content: string;
    metadata: {
        source: string;
        type:
            | "summary"
            | "work"
            | "project"
            | "use_case"
            | "contact"
            | "personal"
            | "family"
            | "hobbies"
            | "values"
            | "preferences";
        title?: string;
        company?: string;
        period?: string;
        section?: string;
        topics?: string[];
    };
}

// Map section titles to type and topics for richer metadata
const SECTION_METADATA: Record<string, { type: KnowledgeChunk["metadata"]["type"]; topics: string[] }> = {
    "core identity": { type: "personal", topics: ["name", "location", "identity"] },
    "family & home life": { type: "family", topics: ["family", "wife", "kids", "dogs", "home"] },
    "hobbies & interests": { type: "hobbies", topics: ["hobbies"] },
    "hobbies & interests > 3d printing & prop making": { type: "hobbies", topics: ["3d-printing", "props", "crafting", "painting"] },
    "hobbies & interests > building ai projects": { type: "hobbies", topics: ["ai-projects", "side-projects", "building"] },
    "hobbies & interests > movies": { type: "hobbies", topics: ["movies", "theater", "entertainment"] },
    "photography & video": { type: "hobbies", topics: ["photography", "video", "cinematography", "cameras", "creative"] },
    "photography & video > photography": { type: "hobbies", topics: ["photography", "cameras", "sony", "candid", "concerts"] },
    "photography & video > video & cinematography": { type: "hobbies", topics: ["video", "cinematography", "drones", "weddings"] },
    "personality": { type: "values", topics: ["personality", "traits", "character"] },
    "habits & quirks": { type: "preferences", topics: ["habits"] },
    "habits & quirks > work snacking": { type: "preferences", topics: ["snacks", "food", "protein", "coffee", "health"] },
    "habits & quirks > morning routine": { type: "preferences", topics: ["morning-routine", "coffee", "daily-habits"] },
    "books, tv & music": { type: "hobbies", topics: ["entertainment"] },
    "books, tv & music > books": { type: "hobbies", topics: ["books", "reading", "audiobooks", "brandon-sanderson", "sci-fi", "fantasy"] },
    "books, tv & music > tv": { type: "hobbies", topics: ["tv", "always-sunny"] },
    "books, tv & music > music": { type: "hobbies", topics: ["music", "taylor-swift", "spotify", "broadway"] },
    "gaming": { type: "hobbies", topics: ["gaming", "video-games", "fortnite", "fps"] },
    "values & principles": { type: "values", topics: ["values", "principles", "philosophy", "beliefs"] },
    "how i learn": { type: "values", topics: ["learning", "hands-on", "style"] },
    "perfect weekend": { type: "preferences", topics: ["weekend", "family", "outdoors", "routine", "ideal-day"] },
    "travel goals": { type: "preferences", topics: ["travel", "photography", "northern-lights"] },
    "stress reset": { type: "preferences", topics: ["stress", "coping", "gaming", "projects"] },
    "about this ai assistant": { type: "personal", topics: ["ai-assistant", "rag", "portfolio", "technical-stack"] },
};

function parsePersonalKnowledge(): KnowledgeChunk[] {
    const chunks: KnowledgeChunk[] = [];

    try {
        const filePath = join(process.cwd(), "nick-info.md");
        const content = readFileSync(filePath, "utf-8");

        // Split by major sections (## headers)
        const sections = content.split(/^## /m).filter((s) => s.trim());

        for (const section of sections) {
            const lines = section.split("\n");
            const sectionTitle = lines[0].trim();

            // Skip the header/intro section
            if (sectionTitle.startsWith("Nick Bohmer") || sectionTitle.includes("---")) {
                continue;
            }

            const sectionContent = lines.slice(1).join("\n").trim();
            if (!sectionContent) continue;

            // Check if this section has ### subsections
            const subsections = sectionContent.split(/^### /m);

            if (subsections.length > 1) {
                // First part before any ### is preamble — skip if empty
                const preamble = subsections[0].trim();
                if (preamble) {
                    const titleLower = sectionTitle.toLowerCase();
                    const meta = SECTION_METADATA[titleLower] ?? { type: "personal" as const, topics: [] };
                    chunks.push({
                        content: preamble,
                        metadata: {
                            source: "personal-knowledge",
                            type: meta.type,
                            section: sectionTitle,
                            topics: meta.topics,
                        },
                    });
                }

                // Each ### subsection becomes its own chunk
                for (let i = 1; i < subsections.length; i++) {
                    const subLines = subsections[i].split("\n");
                    const subTitle = subLines[0].trim();
                    const subContent = subLines.slice(1).join("\n").trim();
                    if (!subContent) continue;

                    // Build a combined key for metadata lookup: "parent section > subsection"
                    const subKey = `${sectionTitle.toLowerCase()} > ${subTitle.toLowerCase()}`;
                    const parentKey = sectionTitle.toLowerCase();
                    const meta = SECTION_METADATA[subKey] ?? SECTION_METADATA[parentKey] ?? { type: "personal" as const, topics: [] };

                    chunks.push({
                        content: subContent,
                        metadata: {
                            source: "personal-knowledge",
                            type: meta.type,
                            section: `${sectionTitle} > ${subTitle}`,
                            topics: meta.topics,
                        },
                    });
                }
            } else {
                // No subsections — store as a single chunk
                const titleLower = sectionTitle.toLowerCase();
                const meta = SECTION_METADATA[titleLower] ?? { type: "personal" as const, topics: [] };

                chunks.push({
                    content: sectionContent,
                    metadata: {
                        source: "personal-knowledge",
                        type: meta.type,
                        section: sectionTitle,
                        topics: meta.topics,
                    },
                });
            }
        }

        console.log(`   ✓ Parsed ${chunks.length} sections from nick-info.md`);
    } catch (error) {
        console.warn(`   ⚠️  Could not read nick-info.md: ${error}`);
        console.warn("   Continuing with resume data only...");
    }

    return chunks;
}

function createChunks(): KnowledgeChunk[] {
    return RESUME_CHUNKS;
}

async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "models/gemini-embedding-001",
                content: {
                    parts: [{ text }],
                },
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Embedding API error: ${error}`);
    }

    const data = await response.json();
    return data.embedding.values;
}

async function main() {
    console.log("🚀 Starting knowledge base seeding...\n");

    // Validate environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("❌ Missing Supabase environment variables");
        console.error("   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
        process.exit(1);
    }

    if (!geminiKey) {
        console.error("❌ Missing GEMINI_API_KEY environment variable");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create chunks from resume
    console.log("📝 Creating chunks from resume data...");
    const resumeChunks = createChunks();
    console.log(`   ✓ Created ${resumeChunks.length} chunks from resume\n`);

    // Create chunks from personal knowledge
    console.log("📚 Parsing personal knowledge from nick-info.md...");
    const personalChunks = parsePersonalKnowledge();

    // Combine all chunks
    const chunks = [...resumeChunks, ...personalChunks];
    console.log(`\n📊 Total chunks to process: ${chunks.length}\n`);

    // Clear existing chunks (optional - comment out to append)
    console.log("🗑️  Clearing existing knowledge chunks...");
    const { error: deleteError } = await supabase
        .from("knowledge_chunks")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (deleteError) {
        console.error("❌ Error clearing chunks:", deleteError.message);
        // Continue anyway - table might not exist yet
    }

    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`📊 Processing chunk ${i + 1}/${chunks.length}: ${chunk.metadata.type}${chunk.metadata.title ? ` - ${chunk.metadata.title}` : ""}`);

        try {
            // Generate embedding
            const embedding = await generateEmbedding(chunk.content);
            console.log(`   ✓ Generated embedding (${embedding.length} dimensions)`);

            // Insert into database
            const { error: insertError } = await supabase.from("knowledge_chunks").insert({
                content: chunk.content,
                metadata: chunk.metadata,
                embedding: embedding,
            });

            if (insertError) {
                console.error(`   ❌ Insert error: ${insertError.message}`);
            } else {
                console.log(`   ✓ Stored in database`);
            }

            // Small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
            console.error(`   ❌ Error: ${error}`);
        }
    }

    // Verify
    const { count, error: countError } = await supabase
        .from("knowledge_chunks")
        .select("*", { count: "exact", head: true });

    if (countError) {
        console.error("\n❌ Error counting chunks:", countError.message);
    } else {
        console.log(`\n✅ Done! ${count} chunks stored in knowledge base.`);
    }
}

main().catch(console.error);
