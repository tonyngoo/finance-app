import { getGeminiResponse } from './src/server/ai-handler/gemini-ai-handler.js';

async function testGemini() {
  try {
    const response = await getGeminiResponse(
      'Provide me 10 finance tips for budgeting my money.',
    );
    console.log('Gemini Response:\n\n', response.message);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testGemini();
