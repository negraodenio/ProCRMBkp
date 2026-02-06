
const EVOLUTION_API_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_GLOBAL_KEY;

if (!EVOLUTION_API_URL) {
    console.warn("Missing NEXT_PUBLIC_EVOLUTION_API_URL");
}

type CreateInstanceResponse = {
    instance: {
        instanceName: string;
        instanceId: string;
        status: string;
        qrcode?: {
            base64: string;
            count: number;
        };
    };
    hash?: {
        apikey: string;
    };
};

export const EvolutionService = {
    async createInstance(instanceName: string) {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) throw new Error("Missing Config");

        const payload = {
            instanceName,
            token: instanceName,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS"
        };


        const res = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": EVOLUTION_API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const error = await res.text();
            console.error("Evolution Create Error:", error);
            // Throw the actual error details so the UI can show it
            throw new Error(`Failed to create instance (${res.status}): ${error}`);
        }

        return await res.json();
    },

    async connectInstance(instanceName: string) {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) throw new Error("Missing Config");

        try {
            const res = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
                method: "GET",
                headers: { "apikey": EVOLUTION_API_KEY }
            });

            if (!res.ok) {
                // Try fetching instance info to see if it exists/is already connected
                console.log(`Connect failed for ${instanceName}, checking info...`);
                const infoRes = await fetch(`${EVOLUTION_API_URL}/instance/info/${instanceName}`, {
                    headers: { "apikey": EVOLUTION_API_KEY }
                });
                
                if (infoRes.ok) {
                    return await infoRes.json();
                }
                return null;
            }

            return await res.json();
        } catch (error) {
            console.error("Connect instance error:", error);
            return null;
        }
    },

    async sendMessage(instanceName: string, remoteJid: string, text: string) {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) throw new Error("Missing Config");

        const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                number: remoteJid,
                options: {
                    delay: 1200,
                    presence: "composing",
                    linkPreview: false
                },
                textMessage: {
                    text: text
                }
            })
        });

        if (!res.ok) {
            console.error("Evolution Send Error:", await res.text());
            // don't throw to avoid crashing webhook loop, just log
            return null;
        }

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
