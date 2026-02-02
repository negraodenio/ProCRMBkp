import { createClient } from "@/lib/supabase/server";
import { VECTOR_CONFIG } from "@/lib/ai/config";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    try {
        // 1. Generate a test vector with the configured dimensions
        const testVector = Array(VECTOR_CONFIG.dimensions).fill(0.1);

        // 2. Attempt to call the match function
        // If dimensions mismatch (e.g., DB expects 1024), Postgres will throw an error
        const { error } = await supabase.rpc('match_documents', {
            query_embedding: testVector,
            match_threshold: 0.1,
            match_count: 1,
            org_id: '00000000-0000-0000-0000-000000000000' // Dummy UUID
        });

        if (error) {
            // Check for specific Postgres error codes if needed, but any error here is bad
            console.error("[HealthCheck] Vector Sync Failed:", error);
            return NextResponse.json({
                status: "ERROR",
                message: "Database schema mismatch",
                details: error.message,
                expected_dimensions: VECTOR_CONFIG.dimensions
            }, { status: 500 });
        }

        return NextResponse.json({
            status: "OK",
            message: "Vector dimensions synced",
            dimensions: VECTOR_CONFIG.dimensions
        });

    } catch (e: any) {
        return NextResponse.json({ status: "ERROR", message: e.message }, { status: 500 });
    }
}
