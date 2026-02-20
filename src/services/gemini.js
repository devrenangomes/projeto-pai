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
 * Processes an image using Gemini 2.0 Flash to extract a list of items.
 * @param {File} imageFile - The image file to process.
 * @returns {Promise<Array<{name: string, value: string, category: string}>>} - Structured data.
 */
export const processImageWithGemini = async (imageFile) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const imagePart = await fileToGenerativePart(imageFile);

        const prompt = `
      Analyze this image (which is likely a receipt, list, or invoice) and extract the items.
      Return ONLY a raw JSON array (no markdown code blocks, no explanation).
      Each object in the array should have:
      - "name": Using the item description. Fix typos if obvious.
      - "value": The price/value formatted as "R$ 0,00". If missing, use "R$ 0,00".
      - "category": Infer a short category (e.g., "Alimentação", "Transporte", "Material") based on the name.

      Example output:
      [
        {"name": "Item A", "value": "R$ 10,00", "category": "Material"},
        {"name": "Item B", "value": "R$ 5,50", "category": "Alimentação"}
      ]
    `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        console.log("Raw Gemini Response:", text);

        // Clean up potential markdown code blocks if the model ignores "no markdown"
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedText);
    } catch (error) {
        if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error("Muitas tentativas. O plano gratuito da IA atingiu o limite. Aguarde 1 minuto.");
        }
        console.error("Gemini API Error:", error);
        throw new Error("Falha ao processar imagem com Gemini AI. Tente novamente.");
    }
};
