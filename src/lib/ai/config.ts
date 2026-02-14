export const AI_CONFIG = {
    // Primary Provider
    siliconFlow: {
        apiKey: process.env.SILICONFLOW_API_KEY || "",
        baseURL: process.env.SILICONFLOW_API_URL || "https://api.siliconflow.cn/v1",
    },
    // Fallback Provider
    openRouter: {
        apiKey: process.env.OPENROUTER_API_KEY || "",
        baseURL: "https://openrouter.ai/api/v1",
    },
    // Model Mappings (Primary -> Fallback)
    models: {
        general: {
            primary: process.env.SILICONFLOW_MODEL_GENERAL || "Qwen/Qwen2.5-72B-Instruct",
            fallback: process.env.OPENROUTER_MODEL_GENERAL || "qwen/qwen-2.5-72b-instruct",
        },
        fast: {
            primary: process.env.SILICONFLOW_MODEL_FAST || "Qwen/Qwen2.5-7B-Instruct",
            fallback: process.env.OPENROUTER_MODEL_FAST || "qwen/qwen-2.5-7b-instruct",
        },
        balanced: {
            primary: process.env.SILICONFLOW_MODEL_BALANCED || "Qwen/Qwen2.5-72B-Instruct",
            fallback: process.env.OPENROUTER_MODEL_BALANCED || "qwen/qwen-2.5-72b-instruct",
        },
        coding: {
            primary: process.env.SILICONFLOW_MODEL_CODING || "deepseek-ai/DeepSeek-V3",
            fallback: process.env.OPENROUTER_MODEL_CODING || "deepseek/deepseek-chat",
        },
        sentiment: {
            primary: process.env.SILICONFLOW_MODEL_SENTIMENT || "Yi-34B-Chat",
            fallback: process.env.OPENROUTER_MODEL_SENTIMENT || "qwen/qwen-2.5-7b-instruct",
        }
    }
};

export const VECTOR_CONFIG = {
    dimensions: 2560,        // CORRECTED: Qwen-4B uses 2560 dimensions
    model: "Qwen/Qwen3-Embedding-4B",
    maxChunkLength: 4000,
    similarityThreshold: 0.7
} as const;
