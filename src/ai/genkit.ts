import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { getRotatingGeminiKey } from '@/lib/apiKeysStore';

function buildAi() {
  const envKey = process.env.GOOGLE_API_KEY;
  const apiKey = envKey || getRotatingGeminiKey() || '';
  if (!apiKey) {
    throw new Error('No Gemini API key configured. Set GOOGLE_API_KEY or add a key in Superadmin.');
  }
  return genkit({
    plugins: [googleAI({ apiKey })],
    model: 'googleai/gemini-2.0-flash',
  });
}

const ai = buildAi();
export { ai };
