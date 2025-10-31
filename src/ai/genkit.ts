import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { getGeminiRotation, getRotatingGeminiKey } from '@/lib/apiKeysStore';

// Build a Genkit instance using the currently selected Gemini API key.
function buildAi() {
  const apiKey = getRotatingGeminiKey() || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      'No Gemini API key configured. Add a key in Superadmin → System & Settings → API Key, or set GOOGLE_API_KEY in the environment.'
    );
  }
  return genkit({
    plugins: [googleAI({ apiKey })],
    model: 'googleai/gemini-2.0-flash',
  });
}

// Export a live binding that can be updated when the key rotates.
let ai = buildAi();
export { ai };

// Set up hourly rotation if enabled in the store. Guard against duplicate timers in dev.
const rotation = getGeminiRotation();
const globalAny = globalThis as unknown as {
  __geminiRotationTimer?: NodeJS.Timeout;
};

// Rotation ticker: checks every minute and rebuilds when the active key changes
if (globalAny.__geminiRotationTimer) {
  clearInterval(globalAny.__geminiRotationTimer);
}
let lastKey: string | null = getRotatingGeminiKey();
globalAny.__geminiRotationTimer = setInterval(() => {
  const rot = getGeminiRotation();
  const nextKey = getRotatingGeminiKey();
  // When rotation is disabled, nextKey resolves to the first enabled key.
  if (!rot.enabled) return;
  if (nextKey && nextKey !== lastKey) {
    ai = buildAi();
    lastKey = nextKey;
  }
}, 60 * 1000);
