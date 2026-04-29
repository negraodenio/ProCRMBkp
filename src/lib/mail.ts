import { resend } from "./resend";

interface OutreachEmailParams {
    to: string;
    subject: string;
    recipientName: string;
    companyName: string;
    researchTitle: string;
    teaserContent: string;
}

export async function sendOutreachEmail(params: OutreachEmailParams) {
    const { to, subject, recipientName, companyName, researchTitle, teaserContent } = params;

    const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
            <h2 style="color: #ea580c;">Oportunidade de Inovaçío: ${researchTitle}</h2>
            <p>Olá, <strong>${recipientName}</strong>,</p>
            <p>Espero que este e-mail o encontre bem.</p>
            <p>Identificamos uma forte sinergia entre as atividades de P&D da <strong>${companyName}</strong> e uma nova tecnologia que estamos gerenciando:</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #ea580c; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; font-style: italic;">"${teaserContent}"</p>
            </div>

            <p>Acreditamos que esta soluçío pode agregar valor aos seus objetivos estratégicos. Gostarí­amos de agendar uma breve conversa de 15 minutos para apresentar os detalhes técnicos e as possibilidades de licenciamento ou parceria.</p>
            
            <p>Qual seria o melhor horário para você na próxima semana?</p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="font-size: 12px; color: #94a3b8;">
                Este é um convite de parceria tecnológica enviado via Nexum Platform.
            </p>
        </div>
    `;

    try {
        const data = await resend.emails.send({
            from: 'Inovaçío <onboarding@resend.dev>', // Should be a verified domain in production
            to: [to],
            subject: subject,
            html: htmlContent,
        });

        return { success: true, data };
    } catch (error) {
        console.error("Mail Error:", error);
        return { success: false, error };
    }
}
