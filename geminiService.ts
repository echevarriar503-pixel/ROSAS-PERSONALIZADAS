
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const generatePersonalizedRose = async (
  name: string, 
  size: number,
  referenceImageBase64?: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Convert numeric size to descriptive prompt instructions
  let sizeDescription = "balanced and elegant proportion";
  if (size < 35) {
    sizeDescription = "delicate, thin, and small cursive script, very subtle within the stem";
  } else if (size > 75) {
    sizeDescription = "bold, large, and thick cursive script, making the name the most prominent part of the design";
  }

  const prompt = `
    TASK: CREATE A BLACK AND WHITE MINIMALIST LINE-ART SILHOUETTE FOR LASER CUTTING.
    OBJECT: A horizontal rose where the stem is formed by the word "${name}".
    
    CRITICAL DESIGN RULES:
    1. INTEGRATION: The name "${name}" must be "SOLDERED" (physically connected) to the rose head on the right and the rest of the stem on the left.
    2. TYPOGRAPHY: Use a continuous, flowy CURSIVE script similar to the natural curves of a rose stem.
    3. SIZE: The name should have a ${sizeDescription}.
    4. STYLE: Minimalist, clean black lines on a PURE WHITE background. 
    5. CONNECTIVITY: Every letter must touch the next one and the stem parts to ensure it is a single piece when cut.
    6. NO SHADING: Pure solid black silhouette. No gradients, no gray, no shadows.
    
    ${referenceImageBase64 ? 'REFERENCING: Use the floral style and overall composition of the provided image, but replace its text with "' + name + '" using the specified size and cursive style.' : ''}
  `;

  try {
    const contents: any = {
      parts: [{ text: prompt }]
    };

    if (referenceImageBase64) {
      contents.parts.unshift({
        inlineData: {
          mimeType: "image/png",
          data: referenceImageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data returned from API");
  } catch (error) {
    console.error("Error generating rose:", error);
    throw error;
  }
};
