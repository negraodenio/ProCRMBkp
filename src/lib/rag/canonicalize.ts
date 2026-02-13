/**
 * RAG V3: CANONICALIZATION ENGINE
 * Transform unstructured text into structured knowledge blocks.
 */

export interface CanonicalBlock {
    id: string;
    niche: string;
    area: string;
    subject: string;
    sub_subject: string;
    intention: string;
    questions: string[];
    answer: string; // Concatenated answer for embedding/legacy
    short_answer: string;
    instructions: string;
    escalation: string;
    keywords: string[];
    updated_at: string;
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
        const getID = (t: string) => t.match(/(?:ID):\s*(.+)/i)?.[1]?.trim();
        const getNiche = (t: string) => t.match(/(?:NICHO|Nicho):\s*(.+)/i)?.[1]?.trim();
        const getArea = (t: string) => t.match(/(?:ÁREA|AREA|Area):\s*(.+)/i)?.[1]?.trim();
        const getSubject = (t: string) => t.match(/(?:ASSUNTO|Assunto):\s*(.+)/i)?.[1]?.trim();
        const getSubSubject = (t: string) => t.match(/(?:SUB-ASSUNTO|Sub-assunto):\s*(.+)/i)?.[1]?.trim();
        const getIntention = (t: string) => t.match(/(?:INTENÇÃO|Intenção|Intencao):\s*(.+)/i)?.[1]?.trim();
        const getQuestions = (t: string) => {
             const m = t.match(/(?:PERGUNTAS DE TRIAGEM|Perguntas):\s*(.+)/i)?.[1]?.trim();
             return m ? m.split(/[?;|]/).map(q => q.trim()).filter(q => q.length > 5) : [];
        };
        const getShortAnswer = (t: string) => t.match(/(?:RESPOSTA CURTA|Resposta):\s*((?:.|\n)+?)(?=(?:ORIENTAÇÕES|QUANDO|LIMITAÇÕES|PALAVRAS|$))/i)?.[1]?.trim();
        const getInstructions = (t: string) => t.match(/(?:ORIENTAÇÕES|Orientacoes):\s*((?:.|\n)+?)(?=(?:QUANDO|LIMITAÇÕES|PALAVRAS|ATUALIZADO|$))/i)?.[1]?.trim();
        const getEscalation = (t: string) => t.match(/(?:QUANDO ESCALAR|Escalamento):\s*(.+)/i)?.[1]?.trim();
        const getKeywords = (t: string) => {
            const m = t.match(/(?:PALAVRAS-CHAVE|Keywords):\s*(.+)/i)?.[1]?.trim();
            return m ? m.split(/[,;|]/).map(k => k.trim()).filter(k => k.length > 2) : [];
        };
        const getUpdatedAt = (t: string) => t.match(/(?:ATUALIZADO EM|Data):\s*(.+)/i)?.[1]?.trim();

        const id = getID(raw) || "RAND-" + Math.random().toString(36).substring(7);
        const niche = getNiche(raw) || defaultNiche;
        const area = getArea(raw) || "Geral";
        const subject = getSubject(raw) || "Informação";
        const sub_subject = getSubSubject(raw) || "";
        const intention = getIntention(raw) || "";
        const questions = getQuestions(raw);
        const short_answer = getShortAnswer(raw) || "";
        const instructions = getInstructions(raw) || "";
        const escalation = getEscalation(raw) || "";
        const keywords = getKeywords(raw);
        const updated_at = getUpdatedAt(raw) || new Date().toISOString().split('T')[0];

        // Concatenated answer for embedding/legacy fallback
        const answer = [short_answer, instructions, escalation].filter(Boolean).join("\n\n");

        // Quality check for this block
        if (niche === "GERAL") missingFieldsGlobal.add("NICHO");
        if (subject === "Informação") missingFieldsGlobal.add("ASSUNTO");
        if (!answer || answer.length < 10) missingFieldsGlobal.add("RESPOSTA");

        blocks.push({
            id,
            niche,
            area,
            subject,
            sub_subject,
            intention,
            questions,
            answer,
            short_answer,
            instructions,
            escalation,
            keywords,
            updated_at,
            raw_block: raw
        });
    }

    // 2. Reconstruct Canonical Text (Clean version for Embedding)
    const canonical_text = blocks.map(b => {
        let txt = `[BLOCK_ID] ${b.id}\n`;
        txt += `[CONTEXTO] ${b.niche} > ${b.area} > ${b.subject}`;
        if (b.sub_subject) txt += ` > ${b.sub_subject}`;
        if (b.intention) txt += `\n[INTENÇÃO] ${b.intention}`;
        if (b.questions.length) txt += `\n[PERGUNTAS TRIAGEM] ${b.questions.join(" | ")}`;
        if (b.short_answer) txt += `\n[RESPOSTA SUGERIDA] ${b.short_answer}`;
        if (b.instructions) txt += `\n[ORIENTAÇÕES COMPLETAS] ${b.instructions}`;
        if (b.escalation) txt += `\n[QUANDO ESCALAR] ${b.escalation}`;

        // Semantic expansion: include Area and Subject in Tags to help vector search
        const semanticTags = Array.from(new Set([...b.keywords, b.area, b.subject])).filter(Boolean);
        if (semanticTags.length) txt += `\n[TAGS] ${semanticTags.join(", ")}`;
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
