export interface ChunkOptions {
    chunkSize: number;
    overlap: number;
}

export function splitTextWithOverlap(text: string, options: ChunkOptions = { chunkSize: 1000, overlap: 100 }): string[] {
    const { chunkSize, overlap } = options;

    // 1. Split by "semantic" boundaries (double newlines, headers)
    // We want to keep the separators to know where breaks happened
    const semanticSplit = text
        .replace(/\r\n/g, "\n") // Normalize newlines
        .split(/(\n\s*\n|(?=^#{1,3}\s)|(?=^[A-ZÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+:\s))/gm)
        .filter(t => t.trim().length > 0);

    const chunks: string[] = [];
    let currentChunk = "";

    for (const block of semanticSplit) {
        // If adding this block exceeds size...
        if (currentChunk.length + block.length > chunkSize) {
            // If current chunk is not empty, push it
            if (currentChunk.trim().length > 0) {
                chunks.push(currentChunk.trim());
            }

            // Start new chunk with overlap (last few chars of previous chunk)
            // For semantic chunking, true "overlap" is hard without duplicating whole paragraphs.
            // We will do a "soft overlap" by keeping the last sentence if possible,
            // but for now, let's just start fresh or use the overlap validation.

            // Simple approach: Start fresh, but if the BLOCK ITSELF is huge (> chunkSize),
            // we must split it using the old hard-limit logic.
            if (block.length > chunkSize) {
                const subChunks = splitByCharacters(block, chunkSize, overlap);
                chunks.push(...subChunks);
                currentChunk = ""; // Reset
            } else {
                currentChunk = block;
            }
        } else {
            // Append to current
            currentChunk += (currentChunk ? "\n" : "") + block;
        }
    }

    // Push last chunk
    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

// Fallback for massive blocks (like strict sliding window)
function splitByCharacters(text: string, chunkSize: number, overlap: number): string[] {
    if (text.length <= chunkSize) return [text];

    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        let endIndex = startIndex + chunkSize;
        if (endIndex > text.length) endIndex = text.length;

        // Smart break logic (same as before)
        if (endIndex < text.length) {
            const lookback = Math.min(100, endIndex - startIndex);
            const slice = text.substring(endIndex - lookback, endIndex);
            const lastPeriod = slice.lastIndexOf(".");
            const lastNewLine = slice.lastIndexOf("\n");

            let breakPoint = -1;
            if (lastNewLine !== -1) breakPoint = endIndex - lookback + lastNewLine + 1;
            else if (lastPeriod !== -1) breakPoint = endIndex - lookback + lastPeriod + 1;

            if (breakPoint !== -1) endIndex = breakPoint;
        }

        chunks.push(text.substring(startIndex, endIndex).trim());

        if (endIndex === text.length) break;
        startIndex = endIndex - overlap;
        if (startIndex >= endIndex) startIndex = endIndex;
    }
    return chunks;
}
