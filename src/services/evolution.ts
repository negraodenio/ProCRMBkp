
const EVOLUTION_API_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_GLOBAL_KEY;

if (!EVOLUTION_API_URL) {
    console.warn("Missing NEXT_PUBLIC_EVOLUTION_API_URL");
}

type EvolutionInstance = {
    instance: {
        instanceName: string;
        instanceId: string;
        status: string;
    };
    hash: {
        apikey: string;
    };
};

export const EvolutionService = {
    async createInstance(instanceName: string) {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) throw new Error("Missing Config");

        const res = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                instanceName,
                token: instanceName, // Using name as token for simplicity
                qrcode: true
            })
        });

        if (!res.ok) {
            const error = await res.text();
            console.error("Evolution Create Error:", error);
            throw new Error(`Failed to create instance: ${res.statusText}`);
        }

        return await res.json();
    },

    async connectInstance(instanceName: string) {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) throw new Error("Missing Config");

        const res = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
            method: "GET",
            headers: {
                "apikey": EVOLUTION_API_KEY
            }
        });

        if (!res.ok) { // Instance might be already connected or not found
            // Try fetching instance info to see if it exists
            return null;
        }

        // Evolution V2 usually returns JSON with base64 for QR or just success
        return await res.json();
    },

    async deleteInstance(instanceName: string) {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) throw new Error("Missing Config");

        const res = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
            method: "DELETE",
            headers: { "apikey": EVOLUTION_API_KEY }
        });

        return res.ok;
    }
};
