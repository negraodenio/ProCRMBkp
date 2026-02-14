import { NextResponse } from "next/server";
import { buildSystemPrompt, type PersonalityType } from "@/lib/bot-personalities";
import { ragAnswerWithGating } from "@/lib/ai/router_rag";
import { retrieveContextText } from "@/lib/rag/retrieve";

export const runtime = "nodejs";

/**
 * Endpoint interno para testes de regressão do RAG.
 * Simula o pipeline do WhatsApp com paridade total de retrieval e routing.
 */
export async function POST(req: Request) {
  try {
    // 1. Segurança (Token Opcional)
    const token = req.headers.get("x-eval-token") || "";
    if (process.env.EVAL_TOKEN && token !== process.env.EVAL_TOKEN) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const query = String(body?.query || "").trim();
    const org_id = String(body?.org_id || "").trim();

    if (!query) return NextResponse.json({ error: "missing query" }, { status: 400 });
    if (!org_id) return NextResponse.json({ error: "missing org_id" }, { status: 400 });

    // 2. Retrieval com Paridade de Produção
    const { contextText } = await retrieveContextText({
      orgId: org_id,
      query,
      match_threshold: Number(body?.match_threshold ?? 0.5),
      match_count: Number(body?.match_count ?? 5),
    });

    // 3. System Prompt (Assinatura Real)
    const presetKey = (body?.personality_preset || "instruction_follower") as PersonalityType;
    const systemPrompt = buildSystemPrompt(
      presetKey,
      String(body?.custom_instructions || ""),
      contextText,
      String(body?.contactName || "Eval"),
      {
        mention_name: Boolean(body?.mention_name ?? false),
        use_emojis: Boolean(body?.use_emojis ?? false)
      }
    );

    // 4. Pipeline Roteado (Phase 1 Logic)
    const showRaw = process.env.RAG_DEBUG === "1" || Boolean(body?.debug);

    const routed = await ragAnswerWithGating({
      systemPrompt,
      userText: query,
      chatHistory: [], // Eval isolado por padrão
      contextText,
      temperature: Number(body?.temperature ?? 0.1),
      max_tokens: Number(body?.max_tokens ?? 250),
      primaryModelAlias: "balanced",
      fallbackModelAlias: "coding",
      showRaw
    });

    return NextResponse.json({
      answer: routed.text,
      model_used: routed.model_used,
      reason: routed.reason,
      raw: routed.raw,
      context_preview: contextText.slice(0, 1200)
    });

  } catch (e: any) {
    console.error("[Eval API] Final Failure:", e.message);
    return NextResponse.json(
      { error: "eval_failed", details: e.message },
      { status: 500 }
    );
  }
}
