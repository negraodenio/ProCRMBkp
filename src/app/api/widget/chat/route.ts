import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-scoped";
import { aiChat, generateEmbedding } from "@/lib/ai/client";
import { PERSONALITY_PRESETS, PersonalityType, buildSystemPrompt } from "@/lib/bot-personalities";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, orgId, history, config_override } = body;

        if (!message || !orgId) {
            return NextResponse.json({ error: "Missing message or orgId" }, { status: 400 });
        }

        const supabase = createServiceRoleClient();

        // 1. Fetch Org Settings
        const { data: org, error: orgError } = await supabase
            .from("organizations")
            .select("id, name, bot_settings")
            .eq("id", orgId)
            .single();

        if (orgError || !org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        // Use override if provided (Preview Mode), otherwise use DB settings
        const botSettings = config_override || org.bot_settings || {};

        // Check if active
        // if (botSettings.active === false) ... (Optional: maybe webchat is always active or follows same rules)

        // 2. RAG (Optional but recommended)
        let contextText = "";
        try {
            const embedding = await generateEmbedding(message);
            const { data: chunks } = await supabase.rpc("match_documents", {
                query_embedding: embedding,
                match_threshold: 0.7,
                match_count: 3,
                org_id: org.id
            });
            if (chunks && chunks.length > 0) {
                contextText = chunks.map((c: any) => c.content).join("\n");
            }
        } catch (e) {
            console.error("RAG Error:", e);
        }

        // 3. Build Prompt
        const presetKey = (botSettings.personality_preset || "friendly") as PersonalityType;
        const preset = PERSONALITY_PRESETS[presetKey];

        const systemPrompt = buildSystemPrompt(
            preset,
            botSettings.custom_instructions || "",
            contextText,
            "Visitante", // PushName
            {
                mention_name: botSettings.mention_name,
                use_emojis: botSettings.use_emojis
            }
        );

        // 4. AI Chat
        // Convert history to AI API format if needed, or just append last message
        const messages = [
            { role: "system", content: systemPrompt },
            ...(history || []).map((m: any) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
            { role: "user", content: message }
        ];

        const aiResponse = await aiChat({
            messages: messages as any,
            model: "fast",
            temperature: botSettings.temperature ?? 0.6,
            max_tokens: botSettings.max_tokens ?? 250
        });

        return NextResponse.json({ response: aiResponse });

    } catch (error: any) {
        console.error("Webchat API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
