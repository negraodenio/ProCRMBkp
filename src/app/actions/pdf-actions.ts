"use server";


export async function extractTextFromPDF(formData: FormData) {
    const pdf = require("pdf-parse");
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "Arquivo nío enviado" };

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const data = await pdf(buffer);
        
        return { 
            success: true, 
            text: data.text,
            info: data.info,
            metadata: data.metadata,
            numPages: data.numpages
        };
    } catch (error: any) {
        console.error("PDF Extraction Error:", error);
        return { success: false, error: "Falha ao processar PDF: " + error.message };
    }
}
