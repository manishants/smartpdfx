import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

function buildAi() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('No Gemini API key configured. Set GOOGLE_API_KEY in the environment.');
  }
  return genkit({
    plugins: [googleAI({ apiKey })],
    model: 'googleai/gemini-2.0-flash',
  });
}

const ai = buildAi();
export { ai };
