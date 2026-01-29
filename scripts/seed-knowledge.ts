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

// Resume data - imported as raw content since we're in a script
const RESUME_DATA = {
    name: "Nick Bohmer",
    location: "Dallas, TX",
    summary: `I am a product leader and hands-on builder who bridges the gap between enterprise strategy and execution with a focus on building industry leading managed SD-WAN & SASE solutions.

Over the past year, I've learned to design, build, and launch full-stack AI applications, taking ideas from prototype to production using modern development workflows and CI/CD pipelines.

By working closely with multi-agent frameworks like Google's Agent Development Kit, I've gained firsthand insight into the strengths and limitations of modern AI systems. This perspective helps me collaborate more effectively with engineering teams, drive product decisions grounded in real implementation challenges, and push the boundaries of what's possible in AI-driven enterprise products.`,

    work: [
        {
            company: "AT&T",
            title: "Associate Director (Value Added Solutions)",
            period: "August 2025 - Current",
            description: `Led major product portfolio including Global Solution Center and Network Function Virtualization, partnering with executives to align roadmaps with business strategy.
Directed end-to-end development of a modern AI-powered platform (Next.js, React, Python) throughout the full lifecycle, significantly improving seller experience.
Spearheaded LLM workflow integrations using LangSmith to drive AI adoption and operational efficiency.
Selected for Growth Council to lead AI-focused product evolution initiatives for business networks.`,
        },
        {
            company: "AT&T",
            title: "Lead Product Management & Development (Edge Solutions)",
            period: "August 2022 - August 2025",
            description: `Took network-integrated SD-WAN solution from concept to market launch, managing significant budget and cross-functional teams to deploy an extensive device fleet.
Developed comprehensive GTM strategies and customer-facing collateral to position Edge solutions effectively and ensure consistent messaging.
Secured "Market Leader" recognition from top industry analysts (Frost & Sullivan, Vertical Systems Group) through strategic engagement and product differentiation.`,
        },
        {
            company: "AT&T",
            title: "Solutions Architect",
            period: "August 2020 - July 2022",
            description: `Designed tailored network and security solutions (SD-WAN, SASE) for global enterprise clients, driving significant product adoption.
Managed executive-level relationships generating substantial annual revenue, serving as a trusted advisor on network transformation.
Orchestrated collaboration between engineering, marketing, and sales to ensure solutions aligned with strategic vision.`,
        },
        {
            company: "AT&T",
            title: "Sr. Edge Solutions Specialist (SD-WAN & MNS SME)",
            period: "January 2019 - July 2020",
            description: `Key driver in launching the Edge Specialist team, increasing service adoption by effectively positioning SD-WAN and security solutions.
Led 20+ SD-WAN workshops translating technical concepts for stakeholders, directly generating significant new revenue.
Created and delivered specialized technical training for sales teams to enhance expertise in Managed Network Services.`,
        },
    ],

    projects: [
        {
            title: "vana.bot",
            description: "Full-stack AI chat application with interactive artifacts (React components, SVG, Mermaid diagrams) rendering live in-browser.",
            technologies: ["React", "TypeScript", "Vite", "OpenRouter", "Supabase", "PostgreSQL", "Deno"],
            url: "https://vana.bot",
        },
    ],

    useCases: [
        {
            title: "BreeziNet",
            description: "Prototyped and pitched a unified fiber & wireless offering in a two-day workshop, securing executive buy-in for development.",
        },
    ],

    contact: {
        email: "nbohmer@gmail.com",
        linkedin: "https://www.linkedin.com/in/nickbohmer",
        github: "https://github.com/NickB03",
    },
};

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
    };
}

function parsePersonalKnowledge(): KnowledgeChunk[] {
    const chunks: KnowledgeChunk[] = [];

    try {
        // Read the personal knowledge file
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

            // Get the full section content (remove the title line)
            const sectionContent = lines.slice(1).join("\n").trim();

            if (!sectionContent) continue;

            // Determine the type based on section title
            let type:
                | "personal"
                | "family"
                | "hobbies"
                | "values"
                | "preferences"
                | "summary" = "personal";

            const titleLower = sectionTitle.toLowerCase();
            if (titleLower.includes("family") || titleLower.includes("home life")) {
                type = "family";
            } else if (
                titleLower.includes("hobbies") ||
                titleLower.includes("interests") ||
                titleLower.includes("games") ||
                titleLower.includes("media")
            ) {
                type = "hobbies";
            } else if (
                titleLower.includes("values") ||
                titleLower.includes("principles") ||
                titleLower.includes("personality")
            ) {
                type = "values";
            } else if (
                titleLower.includes("preferences") ||
                titleLower.includes("routine") ||
                titleLower.includes("habits")
            ) {
                type = "preferences";
            }

            chunks.push({
                content: `${sectionTitle}\n\n${sectionContent}`,
                metadata: {
                    source: "personal-knowledge",
                    type,
                    section: sectionTitle,
                },
            });
        }

        console.log(`   ✓ Parsed ${chunks.length} sections from nick-info.md`);
    } catch (error) {
        console.warn(`   ⚠️  Could not read nick-info.md: ${error}`);
        console.warn("   Continuing with resume data only...");
    }

    return chunks;
}

function createChunks(): KnowledgeChunk[] {
    const chunks: KnowledgeChunk[] = [];

    // Summary chunk
    chunks.push({
        content: `About Nick Bohmer: ${RESUME_DATA.summary}`,
        metadata: {
            source: "resume",
            type: "summary",
        },
    });

    // Work experience chunks - one per role
    for (const job of RESUME_DATA.work) {
        chunks.push({
            content: `${job.title} at ${job.company} (${job.period}): ${job.description}`,
            metadata: {
                source: "resume",
                type: "work",
                title: job.title,
                company: job.company,
                period: job.period,
            },
        });
    }

    // Project chunks
    for (const project of RESUME_DATA.projects) {
        chunks.push({
            content: `Project: ${project.title} - ${project.description} Technologies used: ${project.technologies.join(", ")}. ${project.url ? `Live at ${project.url}` : ""}`,
            metadata: {
                source: "resume",
                type: "project",
                title: project.title,
            },
        });
    }

    // Use case chunks
    for (const useCase of RESUME_DATA.useCases) {
        chunks.push({
            content: `Case Study: ${useCase.title} - ${useCase.description}`,
            metadata: {
                source: "resume",
                type: "use_case",
                title: useCase.title,
            },
        });
    }

    // Contact info chunk
    chunks.push({
        content: `Contact Nick Bohmer: Email ${RESUME_DATA.contact.email}, LinkedIn ${RESUME_DATA.contact.linkedin}, GitHub ${RESUME_DATA.contact.github}. Located in ${RESUME_DATA.location}.`,
        metadata: {
            source: "resume",
            type: "contact",
        },
    });

    return chunks;
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
