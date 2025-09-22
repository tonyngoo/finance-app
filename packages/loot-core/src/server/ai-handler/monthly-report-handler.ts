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
    'Act as a professional Canadian financial advisor. Examine monthly budget reports and determine whether the user did a good or bad job, depending on their report. Avoid asking for additional personal information from the user. Do not respond in markdown, only respond in text.',
  generationConfig: {
    responseMimeType: 'application/json',
  },
});

export async function generateMonthlyReportResponse(
  reportData: object,
): Promise<GeminiResponse> {
  // If no prompt is provided, throw error
  if (!reportData) {
    throw new Error('Monthly Report Data is missing');
  }

  // Try to generate response and return it. Throw error if it failed to do so
  try {
    const result = await model.generateContent(
      'Evaluate the user’s monthly budget report and write a JSON report with 4 sections: (Overall Outlook, Positive Aspects, Negative Aspects, Recommendations), depending on their report’s details, such as the available funds, how much was budgeted, how much was overspent, etc... For the Overall Outlook, recap how well the user budgeted for the month in 1 to 3 sentences. For the Positive Aspects, Negative Aspects, and Recommendation sections, keep it moderately concise and keep it to 2 or 3 bullet points for those respective sections.' +
        reportData,
    );
    const text = await result.response.text();

    return { message: text.trim() };
  } catch (error: unknown) {
    console.error('Error contacting Gemini API:', error);
    throw new Error('Error communicating with Gemini API');
  }
}
