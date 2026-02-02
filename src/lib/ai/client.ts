import { AI_CONFIG, VECTOR_CONFIG } from "./config";

// ... (previous imports/types remain same) 

// Validation runtime (defense in depth)
export function validateEmbedding(vector: number[]): void {
    if (vector.length !== VECTOR_CONFIG.dimensions) {
        throw new Error(
            `Embedding dimension mismatch: got ${vector.length}, ` +
            `expected ${VECTOR_CONFIG.dimensions}. ` +
            `Model and DB schema are out of sync.`
        );
    }
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const config = AI_CONFIG.siliconFlow;
    const model = VECTOR_CONFIG.model; // Use SSOT

    if (!config.apiKey) {
        throw new Error("SiliconFlow API Key not configured");
    }

    // console.log(`[Embedding] Generating for model: ${model}`); // Debug log

    const response = await fetch(`${config.baseURL}/embeddings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: model,
            input: text,
            encoding_format: "float"
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Embedding Failed: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;

    validateEmbedding(embedding); // ← Proteção extra

    return embedding;
}

type AIModelType = keyof typeof AI_CONFIG.models;

interface AIRequest {
    model?: AIModelType;
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    temperature?: number;
    max_tokens?: number;
}

async function callProvider(
    provider: "siliconFlow" | "openRouter",
    modelName: string,
    request: AIRequest
) {
    const config = AI_CONFIG[provider];

    if (!config.apiKey) {
        throw new Error(`${provider} API Key not configured`);
    }

    const response = await fetch(`${config.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.apiKey}`,
            // OpenRouter specific headers
            ...(provider === "openRouter" ? {
                "HTTP-Referer": "https://agenciacrm.com.br", // Replace with actual site
                "X-Title": "CRM Agency IA",
            } : {})
        },
        body: JSON.stringify({
            model: modelName,
            messages: request.messages,
            temperature: request.temperature || 0.7,
            max_tokens: request.max_tokens || 1000,
            stream: false,
        }),
    });

    if (!response.ok) {
        // 429 = Rate Limit, 5xx = Server Error
        if (response.status === 429 || response.status >= 500) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`RETRYABLE_ERROR: ${response.status} - ${JSON.stringify(errorData)}`);
        }
        // Other errors (400, 401) are critical
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`CRITICAL_ERROR: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

export async function aiChat(request: AIRequest) {
    const modelType = request.model || "general";
    const modelConfig = AI_CONFIG.models[modelType];

    // 1. Try Primary (SiliconFlow)
    try {
        // console.log(`[AI] Trying Primary: ${modelConfig.primary}`);
        return await callProvider("siliconFlow", modelConfig.primary, request);
    } catch (error: any) {
        const isRetryable = error.message.includes("RETRYABLE_ERROR") ||
            error.message.includes("fetch failed"); // Network errors

        if (isRetryable) {
            console.warn(`[AI] Primary failed (${error.message}). Switching to Fallback...`);

            // 2. Try Fallback (OpenRouter)
            try {
                // console.log(`[AI] Trying Fallback: ${modelConfig.fallback}`);
                return await callProvider("openRouter", modelConfig.fallback, request);
            } catch (fallbackError: any) {
                console.error(`[AI] Fallback also failed: ${fallbackError.message}`);
                throw new Error("Service unavailable. Please try again later.");
            }
        }

        // Critical error (auth, bad request) - rethrow
        throw error;
    }
}


