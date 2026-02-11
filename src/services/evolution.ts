import { normalizePhone } from "@/lib/utils";

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

const TIMEOUT_MS = 15000; // 15 seconds

async function fetchWithTimeout(url: string, options: any = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

export const EvolutionService = {
    async createInstance(instanceName: string) {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) throw new Error("Missing Config");

        const payload = {
            instanceName,
            token: instanceName,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS"
        };


        const res = await fetchWithTimeout(`${EVOLUTION_API_URL}/instance/create`, {
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
            const res = await fetchWithTimeout(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
                method: "GET",
                headers: { "apikey": EVOLUTION_API_KEY }
            });

            if (!res.ok) {
                // Try fetching instance info to see if it exists/is already connected
                console.log(`Connect failed for ${instanceName}, checking info...`);
                const infoRes = await fetchWithTimeout(`${EVOLUTION_API_URL}/instance/info/${instanceName}`, {
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

        // Ensure JID format and normalize phone (always)
        // Ensure JID format and normalize phone (always)
        let jid = remoteJid;

        // FIX: If it's a Linked Identity Device (LID), use it as is.
        if (remoteJid.includes("@lid")) {
            jid = remoteJid;
        } else {
            const cleanPhone = normalizePhone(remoteJid);
            // HEURISTIC: If length is 15, it is likely a LID (e.g. 272104062746813)
            // Standard E.164 numbers are usually max 14 digits.
            if (cleanPhone.length === 15) {
                jid = `${cleanPhone}@lid`;
            } else {
                jid = `${cleanPhone}@s.whatsapp.net`;
            }
        }

        console.log(`📡 [Evolution] Sending message to ${jid} (original: ${remoteJid})`);

        const res = await fetchWithTimeout(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                number: jid,
                text: text,
                textMessage: {
                    text: text
                },
                options: {
                    delay: 1200,
                    presence: "composing",
                    linkPreview: false
                }
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ Evolution Send Error (${res.status}):`, errorText);

            try {
                // Try to find if there's JSON in the response (sometimes prefixed with noise)
                const jsonMatch = errorText.match(/\{.*\}/);
                const errorJson = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

                if (errorJson) {
                    const responseData = errorJson.response;

                    // 1. Handle "Number does not exist" specifically
                    if (responseData?.message && Array.isArray(responseData.message)) {
                        const firstMsg = responseData.message[0];
                        if (firstMsg?.exists === false) {
                            throw new Error(`O número ${jid.split('@')[0]} não está cadastrado no WhatsApp.`);
                        }
                    }

                    // 2. Handle "Instance not found" or disconnected
                    if (errorJson.error === "Instance not found" || (errorJson.message && typeof errorJson.message === 'string' && errorJson.message.includes("instance_not_found"))) {
                        throw new Error("WhatsApp desconectado! Conecte novamente no menu WhatsApp.");
                    }

                    // 3. Fallback to error message from JSON if it's not a generic "Bad Request"
                    if (errorJson.message || errorJson.error) {
                         const msg = errorJson.message || errorJson.error;
                         if (msg !== "Bad Request") {
                            throw new Error(msg);
                         }
                    }
                }
            } catch (pErr: any) {
                // Rethrow OUR custom errors
                if (pErr.message && (pErr.message.includes("não está cadastrado") || pErr.message.includes("desconectado") || !errorText.includes(pErr.message))) {
                    throw pErr;
                }
            }

            // Fallback for other errors (limit length and clean JSON)
            throw new Error(errorText.substring(0, 300));
        }

        return await res.json();
    },

    async setWebhook(instanceName: string, webhookUrl: string) {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) throw new Error("Missing Config");

        // For v2.3.x, /webhook/set/ is often the correct endpoint but REQUIRES the 'webhook' object wrapper
        console.log(`Setting webhook for ${instanceName} to ${webhookUrl}`);
        const res = await fetchWithTimeout(`${EVOLUTION_API_URL}/webhook/set/${instanceName}`, {
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

    async updateProfilePicture(instanceName: string, imageUrl: string) {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) throw new Error("Missing Config");

        console.log(`Updating profile picture for ${instanceName} with ${imageUrl}`);

        const res = await fetchWithTimeout(`${EVOLUTION_API_URL}/chat/updateProfilePicture/${instanceName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                picture: imageUrl
            })
        });

        if (!res.ok) {
            const error = await res.text();
            console.error("Evolution Update Profile Picture Error:", error);
            throw new Error(`Failed to update profile picture: ${error}`);
        }

        return await res.json();
    },

    async deleteInstance(instanceName: string) {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) throw new Error("Missing Config");

        const res = await fetchWithTimeout(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
            method: "DELETE",
            headers: { "apikey": EVOLUTION_API_KEY }
        });

        return res.ok;
    }
};
