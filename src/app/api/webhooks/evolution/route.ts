
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const eventType = body.event;
        const instance = body.instance;

        console.log(`Webhook Received [${eventType}]:`, instance);

        // Only process new messages for now
        if (eventType === "messages.upsert") {
            const msg = body.data;
            const supabase = await createClient();

            // 1. Log to Database (Supabase)
            // We need to find the bot_id corresponding to this instance.
            // For now, we'll store raw payload. Ideally, we query 'bots' table by evolution_instance_id.

            // Finding Bot:
            // const { data: bot } = await supabase.from('bots').select('id').eq('evolution_instance_id', instance).single();

            // Inserting Event Log (Minimal implementation)
            // await supabase.from('event_logs').insert({
            //     bot_id: bot?.id,
            //     event_type: 'inbound',
            //     payload: body
            // });

            console.log("Message Content:", msg.message?.conversation || msg.message?.extendedTextMessage?.text);
        }

        return NextResponse.json({ status: "success" });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ status: "error" }, { status: 500 });
    }
}
