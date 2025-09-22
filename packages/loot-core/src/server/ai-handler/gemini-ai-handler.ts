import { GoogleGenerativeAI } from '@google/generative-ai';

/*
Handler that handles requests/responses from Gemini's API
*/

interface GeminiResponse {
  message: string;
}

const genAI = new GoogleGenerativeAI('INSERT_YOUR_API_KEY_HERE');
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction:
    'You are a very knowledgable, Canadian financial expert who can answer and provide advice about finance. You are helpful and friendly, yet professional. Only respond to questions regarding financing and nothing else. If you are asked questions non-related to finance, say that you are unable to answer.',
});

export async function getGeminiResponse(
  prompt: string,
): Promise<GeminiResponse> {
  // If no prompt is provided, throw error
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  // Try to generate response and return it. Throw error if it failed to do so
  try {
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    return { message: text.trim() };
  } catch (error: unknown) {
    console.error('Error contacting Gemini API:', error);
    throw new Error('Error communicating with Gemini API');
  }
}
