import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';

/*
Handler that handles requests/responses from Cohere's API
*/
interface CohereResponse {
  message: string;
}

dotenv.config();

export async function getCohereResponse(
  prompt: string,
): Promise<CohereResponse> {
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  const apiUrl = 'https://api.cohere.ai/v1/generate';

  try {
    const response: AxiosResponse<unknown> = await axios.post(
      apiUrl,
      {
        model: 'command-xlarge-nightly', // Free model
        prompt,
        max_tokens: 150, // Tokens = length of response
        temperature: 0.7, // Variance
        stop_sequences: ['\n'],
      },
      {
        headers: {
          Authorization: 'Bearer 2N98j6qgCT4wVsc6pdjeMqbW4Q8MGdTs6ivYheKZ',
          //   'Authorization': `Bearer ${process.env.COHERE_API_KEY}`, TODO
          'Content-Type': 'application/json',
        },
      },
    );

    if (
      response.data &&
      typeof response.data === 'object' &&
      'generations' in response.data
    ) {
      return {
        message: (
          response.data as { generations: { text: string }[] }
        ).generations[0].text.trim(),
      };
    } else {
      throw new Error('Invalid response data structure');
    }
  } catch (error: unknown) {
    console.error('Error contacting Cohere API:', error);
    throw new Error('Error communicating with Cohere API');
  }
}
