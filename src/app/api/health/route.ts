import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    // 1. Check DB Connectivity
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);

    if (error) {
        return NextResponse.json({ status: "error", db: "disconnected" }, { status: 500 });
    }

    // 2. Return 200 OK for UptimeRobot
    return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    }, { status: 200 });
}
