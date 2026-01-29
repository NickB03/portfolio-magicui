/**
 * Verify Knowledge Base Script
 *
 * Quick check to see what's in the knowledge_chunks table
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function main() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("❌ Missing Supabase environment variables");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get count
    const { count, error: countError } = await supabase
        .from("knowledge_chunks")
        .select("*", { count: "exact", head: true });

    if (countError) {
        console.error("❌ Error counting chunks:", countError.message);
        process.exit(1);
    }

    console.log(`\n📊 Total chunks in database: ${count}\n`);

    // Get sample data
    const { data, error } = await supabase
        .from("knowledge_chunks")
        .select("id, content, metadata")
        .limit(3);

    if (error) {
        console.error("❌ Error fetching chunks:", error.message);
        process.exit(1);
    }

    console.log("📝 Sample chunks:\n");
    data?.forEach((chunk, i) => {
        console.log(`${i + 1}. Type: ${chunk.metadata.type}${chunk.metadata.title ? ` - ${chunk.metadata.title}` : ""}`);
        console.log(`   Content preview: ${chunk.content.substring(0, 100)}...`);
        console.log();
    });
}

main().catch(console.error);
