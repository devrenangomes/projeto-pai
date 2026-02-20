import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("VITE_GEMINI_API_KEY is missing!");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Converts a File object to a GoogleGenerativeAI.Part object (Base64).
 */
async function fileToGenerativePart(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1];
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                },
            });
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Processes an image using Gemini to extract tabular data dynamically.
 * @param {File} imageFile - The image file to process.
 * @returns {Promise<{ columns: string[], rows: Record<string, string>[] }>}
 */
export const processImageWithGemini = async (imageFile) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const imagePart = await fileToGenerativePart(imageFile);

        const prompt = `
Analyze this image carefully. It may be a table, list, receipt, spreadsheet, or any structured document.

Your task:
1. Identify what columns/fields appear in the content (e.g., "Nome", "Cargo", "Matrícula", "Valor", "Data", etc.)
2. Extract each row of data into those columns.

Return ONLY a raw JSON object (no markdown, no explanation) in this exact format:
{
  "columns": ["Column1", "Column2", "Column3"],
  "rows": [
    {"Column1": "value", "Column2": "value", "Column3": "value"},
    {"Column1": "value", "Column2": "value", "Column3": "value"}
  ]
}

Rules:
- Use the language of the document for column names (if it's in Portuguese, use Portuguese column names).
- Fix obvious typos in the data.
- If a cell is empty or missing, use an empty string "".
- Infer the most logical column names from the document structure.
- If the image is just a plain list with no clear columns, use a single column called "Item".
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        console.log("Raw Gemini Response:", text);

        // Strip potential markdown code blocks
        const cleanedText = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const parsed = JSON.parse(cleanedText);

        if (!parsed.columns || !Array.isArray(parsed.columns) || !parsed.rows || !Array.isArray(parsed.rows)) {
            throw new Error("Formato inválido retornado pela IA.");
        }

        return parsed; // { columns: string[], rows: object[] }

    } catch (error) {
        if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error("Limite da IA atingido. Aguarde 1 minuto e tente novamente.");
        }
        console.error("Gemini API Error:", error);
        throw new Error("Falha ao processar imagem com Gemini AI. Verifique o console para mais detalhes.");
    }
};
