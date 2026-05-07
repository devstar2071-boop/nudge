import { GoogleGenAI, Type } from '@google/genai';
import { UserProfile, Product, LensNudge } from '../types.ts';

// Initialize the Gemini Client
// Note: In a real frontend, API keys should not be exposed. 
// This is for demonstration purposes as per instructions.
const API_KEY = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : 'dummy_key';
const ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: true });

/**
 * API 3: Fetch Sephora Lens Nudges
 * Uses RAG (simulated via prompt context) to combine PDP content with User Profile.
 */
export const generateSephoraLensNudges = async (
  user: UserProfile,
  product: Product
): Promise<LensNudge[]> => {
  try {
    const prompt = `
      You are the "Sephora Lens" AI Agent, a real-time product translator.
      Your goal is to analyze a product's ingredients against a user's beauty profile and past purchase behavior to provide highly personalized, contextual insights.

      USER PROFILE:
      - Skin Type: ${user.beautyTraits.skinType}
      - Skin Concerns: ${user.beautyTraits.skinConcerns.join(', ')}
      - Loyalty Tier: ${user.loyaltyTier}

      PRODUCT:
      - Brand: ${product.brand}
      - Name: ${product.name}
      - Ingredients: ${product.ingredients.join(', ')}

      TASK:
      Select exactly 3 key ingredients from the product's ingredient list that are most relevant to THIS specific user's profile.
      For each selected ingredient, write a 2-sentence summary explaining WHY it matters for them. 
      The tone should be helpful, expert, and mimic Sephora's brand voice.
      
      Example summary: "Niacinamide is perfect for your dry skin as it helps strengthen the moisture barrier. It also directly targets the redness you've been concerned about."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'List of personalized ingredient nudges',
          items: {
            type: Type.OBJECT,
            properties: {
              ingredient: {
                type: Type.STRING,
                description: 'The exact name of the ingredient from the product list.',
              },
              summary: {
                type: Type.STRING,
                description: 'A 2-sentence personalized explanation of why this ingredient is good for the user.',
              },
            },
            required: ['ingredient', 'summary'],
          },
        },
        temperature: 0.7,
      },
    });

    if (response.text) {
      console.log(`[Sephora Lens AI] Successfully generated ${JSON.parse(response.text.trim()).length} nudges.`);
      const nudges: LensNudge[] = JSON.parse(response.text.trim());
      // Add a mock relevance score to simulate the "Popularity Engine"
      return nudges.map(n => ({ ...n, relevanceScore: Math.floor(Math.random() * 100) }));
    }
    
    return [];
  } catch (error) {
    console.error("Error generating Sephora Lens nudges:", error);
    return [];
  }
};
