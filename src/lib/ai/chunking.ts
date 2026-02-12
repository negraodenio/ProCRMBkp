export interface ChunkOptions {
    chunkSize: number;
    overlap: number;
}

export function splitTextWithOverlap(text: string, options: ChunkOptions = { chunkSize: 1000, overlap: 200 }): string[] {
    const { chunkSize, overlap } = options;

    if (text.length <= chunkSize) {
        return [text];
    }

    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        let endIndex = startIndex + chunkSize;

        // Ensure we don't go out of bounds
        if (endIndex > text.length) {
            endIndex = text.length;
        } else {
            // Smart break: try to find a period, newline or space to break cleanly
            // Look back from endIndex to find a good break point within the last 100 chars
            const lookback = Math.min(100, endIndex - startIndex);
            const slice = text.substring(endIndex - lookback, endIndex);

            const lastPeriod = slice.lastIndexOf(".");
            const lastNewLine = slice.lastIndexOf("\n");

            let breakPoint = -1;

            if (lastNewLine !== -1) {
                breakPoint = endIndex - lookback + lastNewLine + 1;
            } else if (lastPeriod !== -1) {
                breakPoint = endIndex - lookback + lastPeriod + 1;
            } else {
                // Fallback to last space
                const lastSpace = slice.lastIndexOf(" ");
                if (lastSpace !== -1) {
                    breakPoint = endIndex - lookback + lastSpace + 1;
                }
            }

            if (breakPoint !== -1) {
                endIndex = breakPoint;
            }
        }

        const chunk = text.substring(startIndex, endIndex).trim();
        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        // Move window forward, but subtract overlap
        // If we reached the end, break
        if (endIndex === text.length) {
            break;
        }

        startIndex = endIndex - overlap;

        // Safety check to prevent infinite loops if overlap >= chunkSize (shouldn't happen with defaults)
        if (startIndex >= endIndex) {
            startIndex = endIndex;
        }
    }

    return chunks;
}
