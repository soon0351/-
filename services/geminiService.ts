import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Character, PanelScript } from "../types";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Script Generation ---
export const generateScript = async (
  topic: string,
  genre: string,
  prompt: string
): Promise<PanelScript[]> => {
  const modelId = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are a professional 4-koma (4-panel) manga script writer.
    Create a funny or engaging 4-panel story based on the user's request.
    The output must be a JSON array of exactly 4 objects.
    Each object represents a panel and must have:
    - panelNumber (integer)
    - description (string): Visual description of what happens in the panel.
    - dialogue (string): What the characters say (or narration).
    Language: Korean.
  `;

  const userPrompt = `
    Topic: ${topic}
    Genre: ${genre}
    Story Details: ${prompt}
    
    Generate the 4-panel script now.
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        panelNumber: { type: Type.INTEGER },
        description: { type: Type.STRING },
        dialogue: { type: Type.STRING },
      },
      required: ["panelNumber", "description", "dialogue"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as PanelScript[];
  } catch (error) {
    console.error("Script generation failed:", error);
    throw error;
  }
};

// --- Character Extraction & Generation ---
export const analyzeCharacters = async (script: PanelScript[]): Promise<Omit<Character, 'imageUrl'>[]> => {
  const modelId = "gemini-2.5-flash";
  
  const scriptText = script.map(p => `Panel ${p.panelNumber}: ${p.description} (Dialogue: ${p.dialogue})`).join("\n");

  const prompt = `
    Analyze the following 4-panel manga script and identify the main characters.
    Return a JSON list of characters.
    For each character, provide:
    - name (string)
    - description (string): A short, safe-for-work visual description (hair color, eye color, clothing, distinctive features) optimized for an image generator prompt. Avoid violent or explicit terms.
    
    Script:
    ${scriptText}
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ["name", "description"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("No text");
    const rawChars = JSON.parse(text) as {name: string, description: string}[];
    
    return rawChars.map(c => ({
      id: crypto.randomUUID(),
      name: c.name,
      description: c.description
    }));
  } catch (error) {
    console.error("Character analysis failed:", error);
    throw error;
  }
};

export const generateCharacterImage = async (
  character: Omit<Character, 'imageUrl'>,
  style: string
): Promise<string> => {
  const modelId = "gemini-2.5-flash-image";
  
  // Refined prompt to avoid safety triggers
  const prompt = `
    Character design sheet for anime/manga.
    Style: ${style}.
    Character Name: ${character.name}.
    Visual Details: ${character.description}.
    
    Requirements:
    - White background
    - Full body shot
    - High quality, detailed, vibrant
    - Wholesome, safe for all audiences, rated G
    - No text, no speech bubbles
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
            aspectRatio: "1:1",
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No image generated");

    // Check for inlineData (Image)
    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // If no image, check if there's text (usually a refusal explanation)
    const textPart = parts.find(p => p.text);
    if (textPart) {
        console.warn("AI Refusal or Explanation:", textPart.text);
        throw new Error("AI refused to generate image. Try modifying the character description.");
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error(`Failed to generate image for ${character.name}:`, error);
    throw error;
  }
};

// --- Final Panel Generation ---
export const generatePanelImage = async (
  panel: PanelScript,
  style: string,
  characters: Character[]
): Promise<string> => {
  const modelId = "gemini-2.5-flash-image";

  // Construct a prompt that includes character references
  const characterContext = characters.map(c => `${c.name}: ${c.description}`).join("; ");

  const prompt = `
    Anime/Manga Panel Illustration.
    Style: ${style}.
    Panel Number: ${panel.panelNumber}.
    Action/Scene: ${panel.description}.
    
    Characters in scene (Visual Reference):
    ${characterContext}
    
    Atmosphere: High quality, detailed, expressive.
    Constraints:
    - Safe for all audiences, wholesome, rated G.
    - No dialogue bubbles, no text.
    - Anime aesthetic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
            aspectRatio: "4:3", // Classic panel ratio
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No image generated");

    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    // If no image, check if there's text (usually a refusal explanation)
    const textPart = parts.find(p => p.text);
    if (textPart) {
        console.warn("AI Refusal or Explanation:", textPart.text);
        throw new Error("AI refused to generate panel. Try simplifying the scene.");
    }

    throw new Error("No image data found");

  } catch (error) {
    console.error(`Failed to generate panel ${panel.panelNumber}:`, error);
    throw error;
  }
};