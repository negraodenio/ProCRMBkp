
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
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
            console.error("❌ Evolution Config Missing:", { EVOLUTION_API_URL: !!EVOLUTION_API_URL, EVOLUTION_API_KEY: !!EVOLUTION_API_KEY });
            throw new Error("Evolution API configuration is missing");
        }

        // Ensure JID format
        const jid = remoteJid.includes("@") ? remoteJid : `${remoteJid}@s.whatsapp.net`;

        const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                number: jid,
                text: text, // Standard for many v2 versions
                textMessage: {
                    text: text // Standard for some v2.x versions
                },
                options: {
                    delay: 0,
                    presence: "composing",
                    linkPreview: false
                }
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ Evolution Send Error (${res.status}):`, errorText);
            throw new Error(`WhatsApp API Error: ${errorText}`);
        }

        return await res.json();
    },

    async setWebhook(instanceName: string, webhookUrl: string) {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) throw new Error("Missing Config");

        // For v2.3.x, /webhook/set/ is often the correct endpoint but REQUIRES the 'webhook' object wrapper
        console.log(`Setting webhook for ${instanceName} to ${webhookUrl}`);
        const res = await fetch(`${EVOLUTION_API_URL}/webhook/set/${instanceName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                webhook: {
                    enabled: true,
                    url: webhookUrl,
                    webhookByEvents: true,
                    events: [
                        "MESSAGES_UPSERT", 
                        "MESSAGES_UPDATE", 
                        "SEND_MESSAGE",
                        "CONNECTION_UPDATE",
                        "QRCODE_UPDATED" 
                    ]
                }
            })
        });

        if (!res.ok) {
            console.error("Evolution Webhook Error:", await res.text());
            return false;
        }

        return true;
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
