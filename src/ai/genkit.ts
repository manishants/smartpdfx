import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { getGeminiRotation, getRotatingGeminiKey } from '@/lib/apiKeysStore';

// Build a Genkit instance using the currently selected Gemini API key.
let lastKey: string | null = null;
function buildAi() {
  const envKey = process.env.GOOGLE_API_KEY;
  const apiKey = envKey ? envKey : getRotatingGeminiKey();
  if (!apiKey) {
    throw new Error('No Gemini API key configured');
  }
  lastKey = apiKey;
  return genkit({
    plugins: [googleAI({ apiKey })],
    model: 'googleai/gemini-2.0-flash',
  });
}

// Export a live binding that can be updated when the key rotates.
let ai = buildAi();
export { ai };
export function reloadAi() {
  ai = buildAi();
}
export function getActiveGeminiKey(): string | null {
  return lastKey;
}

// Set up hourly rotation if enabled in the store. Guard against duplicate timers in dev.
const rotation = getGeminiRotation();
const globalAny = globalThis as unknown as {
  __geminiRotationTimer?: NodeJS.Timeout;
};

// Rotation ticker: checks every minute and rebuilds when the active key changes
if (globalAny.__geminiRotationTimer) {
  clearInterval(globalAny.__geminiRotationTimer);
}
globalAny.__geminiRotationTimer = setInterval(() => {
  // If GOOGLE_API_KEY is set, prefer it and skip store rotation entirely
  if (process.env.GOOGLE_API_KEY) return;
  const rot = getGeminiRotation();
  const nextKey = getRotatingGeminiKey();
  // When rotation is disabled, nextKey resolves to the first enabled key.
  if (!rot.enabled) return;
  if (nextKey && nextKey !== lastKey) {
    ai = buildAi();
    // buildAi sets lastKey
  }
}, 60 * 1000);
