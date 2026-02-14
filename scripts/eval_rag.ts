import fs from "node:fs";
import path from "node:path";

/**
 * Script de Avaliação de Regressão RAG
 * Roda o dataset Golden contra o endpoint /api/eval/chat
 */

type Golden = {
  id: string;
  query: string;
  must_include_any: string[];
  must_include_all: string[];
  must_not_include: string[];
  requires_cta: boolean;
  type: string;
};

function includesAny(hay: string, needles: string[]) {
  if (!needles?.length) return true;
  const h = hay.toLowerCase();
  return needles.some(n => h.includes(n.toLowerCase()));
}
function includesAll(hay: string, needles: string[]) {
  if (!needles?.length) return true;
  const h = hay.toLowerCase();
  return needles.every(n => h.includes(n.toLowerCase()));
}
function includesNone(hay: string, needles: string[]) {
  if (!needles?.length) return true;
  const h = hay.toLowerCase();
  return needles.every(n => !h.includes(n.toLowerCase()));
}
function hasCta(text: string) {
  const t = text.trim();
  return t.endsWith("?") || /\b(posso|quer|prefere|qual)\b/i.test(t);
}

async function main() {
  const baseUrl = process.env.EVAL_BASE_URL || "http://localhost:3000";
  const orgId = process.env.EVAL_ORG_ID;

  if (!orgId) {
    console.error("❌ Erro: Defina EVAL_ORG_ID para rodar os testes com contexto real.");
    process.exit(1);
  }

  const goldenPath = path.join(process.cwd(), "eval", "rag_golden.jsonl");
  if (!fs.existsSync(goldenPath)) {
      console.error(`❌ Erro: Dataset golden não encontrado em ${goldenPath}`);
      process.exit(1);
  }

  const lines = fs.readFileSync(goldenPath, "utf8").split("\n").map(l => l.trim()).filter(Boolean);
  const goldens: Golden[] = lines.map(l => JSON.parse(l));

  console.log(`🚀 Iniciando Eval RAG (${goldens.length} casos)...`);

  const rows: any[] = [];
  let policy_violations = 0;
  let factual_refusals = 0;
  let blocks = 0;

  for (const g of goldens) {
    const t0 = Date.now();
    try {
      const res = await fetch(`${baseUrl}/api/eval/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(process.env.EVAL_TOKEN ? { "x-eval-token": process.env.EVAL_TOKEN } : {})
        },
        body: JSON.stringify({
            query: g.query,
            org_id: orgId,
            match_threshold: 0.2 // Lower threshold for testing visibility
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const latency_ms = Date.now() - t0;

      const answer: string = data.answer || "";
      const is_blocked = /não menciona|não contém|não encontrei|esclarecer|especific|não consta/i.test(answer) || data.reason?.includes("blocked");
      const retrieval_ok = !!(data.context_preview && String(data.context_preview).length > 20);

      const must_any_ok = includesAny(answer, g.must_include_any);
      const must_all_ok = includesAll(answer, g.must_include_all);
      const must_not_ok = includesNone(answer, g.must_not_include);
      const cta_ok = g.requires_cta ? hasCta(answer) : true;

      let ok = retrieval_ok && must_any_ok && must_all_ok && must_not_ok && cta_ok;
      if (g.type === "factual") {
        ok = ok && !is_blocked;
      }

      // 3) Runner Accuracy Logic
      const isSecurityType = ["unknown", "out_of_scope", "pricing_unknown"].includes(g.type);

      if (isSecurityType && !must_not_ok) {
          policy_violations++;
          console.error(`\n❌ MUST_NOT_VIOLATION (Security Failure) in [${g.id}]: "${answer.slice(0, 100)}..."`);
      } else if (g.type === "factual" && is_blocked) {
          factual_refusals++;
          console.warn(`\n⚠️ FACTUAL_REFUSAL (Safe but uninformative) in [${g.id}]: "${answer.slice(0, 50)}..."`);
      } else if (!ok && is_blocked) {
          blocks++;
      }

      rows.push({
        id: g.id,
        type: g.type,
        ok,
        is_blocked,
        retrieval_ok,
        must_any_ok,
        must_all_ok,
        must_not_ok,
        cta_ok,
        latency_ms,
        reason: data.reason,
        model_used: data.model_used,
        answer: answer.substring(0, 200) // Truncated for CSV readability
      });

      process.stdout.write(ok ? "." : "F");

      // Pequeno delay para evitar rate limit / race condition
      await new Promise(r => setTimeout(r, 1000));
    } catch (err: any) {
      console.error(`\n❌ Falha ao processar [${g.id}]: ${err.message}`);
    }
  }

  console.log("\n\n📊 Resultados:");
  const total = rows.length;
  const passed = rows.filter(r => r.ok).length;
  console.log(`Passou: ${passed}/${total}`);
  console.log(`Policy Violations: ${policy_violations}`);
  console.log(`Factual Refusals: ${factual_refusals}`);
  console.log(`Other Blocks: ${blocks}`);

  const outPath = path.join(process.cwd(), "eval_results.csv");
  const headers = Object.keys(rows[0] || {});
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => String(r[h]).replaceAll("\n", " ").replaceAll(",", ";")).join(","))
  ].join("\n");

  fs.writeFileSync(outPath, csv, "utf8");
  console.log(`📝 Relatório gerado em: ${outPath}`);

  if (policy_violations > 0 || (passed / total < 0.8)) {
    console.error("❌ Testes falharam por violação de política ou taxa de sucesso baixa!");
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
