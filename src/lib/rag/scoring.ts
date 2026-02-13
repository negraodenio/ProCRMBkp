import { CanonicalResult } from "./canonicalize";

/**
 * RAG V3: SCORING ENGINE
 * Grades the document quality (0-100) before indexing.
 */

export interface ScoringResult {
    score: number;
    status: 'approved' | 'needs_review' | 'rejected';
    breakdown: {
        structure: number; // 0-30
        coverage: number;  // 0-25
        chunk_health: number; // 0-20
        duplication: number; // 0-15
        reliability: number; // 0-10
    };
    flags: string[];
}

export function scoreDocument(canonical: CanonicalResult): ScoringResult {
    const { blocks, report } = canonical;
    let flags: string[] = [...report.missing_fields];

    // 1. STRUCTURE (30pts)
    // Measures if we successfully parsed blocks or if it's a blob of text
    let structureScore = 0;
    if (blocks.length > 0) {
        // Did we find actual fields or just noise?
        const wellFormedBlocks = blocks.filter(b => b.niche !== "GERAL" && b.answer.length > 10).length;
        const ratio = wellFormedBlocks / blocks.length;
        structureScore = Math.round(ratio * 30);
    }

    // 2. COVERAGE (25pts)
    // Measures if critical fields are present
    let coverageScore = 25;
    if (report.missing_fields.includes("NICHO")) coverageScore -= 10;
    if (report.missing_fields.includes("RESPOSTA")) coverageScore -= 15;
    coverageScore = Math.max(0, coverageScore);

    // 3. CHUNK HEALTH (20pts)
    // Blocks shouldn't be too small (<50 chars) or too huge (>2000 chars)
    let chunkHealthScore = 20;
    let badChunks = 0;
    for (const b of blocks) {
        const len = b.answer.length;
        if (len < 15 || len > 3000) badChunks++;
    }
    const badRatio = badChunks / (blocks.length || 1);
    chunkHealthScore = Math.round(20 * (1 - badRatio));

    // 4. DUPLICATION (15pts)
    // Naive check: unique answers
    let duplicationScore = 15;
    const uniqueAnswers = new Set(blocks.map(b => b.answer)).size;
    const uniqRatio = uniqueAnswers / (blocks.length || 1);
    duplicationScore = Math.round(15 * uniqRatio);

    // 5. RELIABILITY (10pts)
    // Bonus for safety keywords
    let reliabilityScore = 0;
    const safeKeywords = ["escalar", "humano", "não faço", "não diagnostico", "urgência"];
    for (const b of blocks) {
        if (safeKeywords.some(kw => b.answer.toLowerCase().includes(kw) || b.raw_block.toLowerCase().includes(kw))) {
            reliabilityScore = 10;
            break;
        }
    }

    // TOTAL
    const totalScore = structureScore + coverageScore + chunkHealthScore + duplicationScore + reliabilityScore;

    // STATUS DECISION
    let status: ScoringResult['status'] = 'approved';
    if (totalScore < 60) status = 'rejected';
    else if (totalScore < 80) status = 'needs_review';

    if (status === 'rejected') flags.push('low_score');

    return {
        score: totalScore,
        status,
        breakdown: {
            structure: structureScore,
            coverage: coverageScore,
            chunk_health: chunkHealthScore,
            duplication: duplicationScore,
            reliability: reliabilityScore
        },
        flags
    };
}
