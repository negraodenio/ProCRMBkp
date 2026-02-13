/**
 * RAG V3: CANONICALIZATION ENGINE
 * Transform unstructured text into structured knowledge blocks.
 */

export interface CanonicalBlock {
    niche: string;
    area: string;
    subject: string;
    sub_subject: string;
    intention: string;
    questions: string[];
    answer: string;
    // content: string; // The full text representation
    raw_block: string;
}

export interface CanonicalResult {
    canonical_text: string;
    blocks: CanonicalBlock[];
    report: {
        missing_fields: string[];
        stats: any;
    };
}

export function canonicalizeTxt(rawText: string, filename: string = ""): CanonicalResult {
    // 1. Split into potential blocks
    // Detects double newlines, dashes, or JSON-like structure
    const rawBlocks = rawText
        .split(/(?=\n-{3,}\n)|(?=\n\s*\n)|(?=^\{)/gm)
        .map(b => b.trim())
        .filter(b => b.length > 20); // Noise filter

    const blocks: CanonicalBlock[] = [];
    const missingFieldsGlobal: Set<string> = new Set();

    // Heuristic: Try to guess niche from filename if not in text
    let defaultNiche = "GERAL";
    if (filename.toLowerCase().includes("clinica")) defaultNiche = "clinica";
    if (filename.toLowerCase().includes("imob")) defaultNiche = "imobiliaria";
    if (filename.toLowerCase().includes("delivery")) defaultNiche = "delivery";

    for (const raw of rawBlocks) {
        // Regex Extraction
        const getNiche = (t: string) => t.match(/(?:NICHO|Nicho):\s*(.+)/i)?.[1]?.trim();
        const getArea = (t: string) => t.match(/(?:ÁREA|AREA|Area):\s*(.+)/i)?.[1]?.trim();
        const getSubject = (t: string) => t.match(/(?:ASSUNTO|Assunto):\s*(.+)/i)?.[1]?.trim();
        const getSubSubject = (t: string) => t.match(/(?:SUB-ASSUNTO|Sub-assunto):\s*(.+)/i)?.[1]?.trim();
        const getIntention = (t: string) => t.match(/(?:INTENÇÃO|Intenção|Intencao):\s*(.+)/i)?.[1]?.trim();
        const getQuestions = (t: string) => {
             const m = t.match(/(?:PERGUNTAS DE TRIAGEM|Perguntas):\s*(.+)/i)?.[1]?.trim();
             return m ? m.split(/[?;]/).map(q => q.trim()).filter(q => q.length > 5) : [];
        };
        const getAnswer = (t: string) => {
            // Priority: "RESPOSTA CURTA", then "ORIENTAÇÕES", then "Consigo..."
            const m1 = t.match(/(?:RESPOSTA CURTA|Resposta):\s*((?:.|\n)+?)(?=(?:ORIENTAÇÕES|QUANDO|LIMITAÇÕES|$))/i)?.[1]?.trim();
            const m2 = t.match(/(?:ORIENTAÇÕES|Orientacoes):\s*((?:.|\n)+?)(?=(?:QUANDO|LIMITAÇÕES|$))/i)?.[1]?.trim();
            return m1 || m2 || t; // Fallback to full text if nothing found
        };

        const niche = getNiche(raw) || defaultNiche;
        const area = getArea(raw) || "Geral";
        const subject = getSubject(raw) || "Informação";
        const sub_subject = getSubSubject(raw) || "";
        const intention = getIntention(raw) || "";
        const questions = getQuestions(raw);
        const answer = getAnswer(raw);

        // Quality check for this block
        if (niche === "GERAL") missingFieldsGlobal.add("NICHO");
        if (subject === "Informação") missingFieldsGlobal.add("ASSUNTO");
        if (!answer || answer.length < 10) missingFieldsGlobal.add("RESPOSTA");

        blocks.push({
            niche,
            area,
            subject,
            sub_subject,
            intention,
            questions,
            answer,
            raw_block: raw
        });
    }

    // 2. Reconstruct Canonical Text (Clean version for Embedding)
    // We format it strictly:
    // [NICHO] Clinica
    // [ASSUNTO] Agendamento
    // [RESPOSTA] ...
    const canonical_text = blocks.map(b => {
        let txt = `[CONTEXTO] ${b.niche} > ${b.area} > ${b.subject}`;
        if (b.sub_subject) txt += ` > ${b.sub_subject}`;
        if (b.intention) txt += `\n[INTENÇÃO] ${b.intention}`;
        if (b.questions.length) txt += `\n[PERGUNTAS TRIAGEM] ${b.questions.join(" | ")}`;
        txt += `\n[RESPOSTA] ${b.answer}`;
        return txt;
    }).join("\n\n---\n\n");

    return {
        canonical_text,
        blocks,
        report: {
            missing_fields: Array.from(missingFieldsGlobal),
            stats: {
                blocks_found: blocks.length,
                avg_block_size: Math.round(canonical_text.length / (blocks.length || 1))
            }
        }
    };
}
