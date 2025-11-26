
'use server';

/**
 * @fileOverview An AI flow for extracting structured voter information from a PDF or image.
 *
 * - extractVoters - The main function to process the file.
 * - ExtractVotersInput - The input type for the flow.
 * - ExtractVotersOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { headers } from 'next/headers';
import { z } from 'zod';
import {
  ExtractVotersInputSchema,
  ExtractVotersOutputSchema,
  type ExtractVotersInput,
  type ExtractVotersOutput,
  Voter,
} from '@/lib/types';


const extractVotersPrompt = ai.definePrompt({
    name: 'extractVotersPrompt',
    input: { schema: z.object({ fileUri: z.string() }) },
    output: { schema: ExtractVotersOutputSchema },
    prompt: `You are an expert at extracting structured data from Indian Electoral Rolls (voter lists). Analyze the provided page image. Identify every voter entry and also capture page-level metadata required for each voter.

For each voter, extract these fields. Preserve text exactly as printed on the page (no translation, no normalization):
1. id: Serial number from the voter box (string).
2. voterId: ID card number (e.g., "UYA0837520").
3. name: Full name.
4. fatherOrHusbandName: Father/Mother/Husband name.
5. age: Age value exactly as printed (e.g., "43" or local numerals). Do not convert digits.
6. gender: "पुरुष" or "महिला" (or English equivalents if printed that way).
7. assemblyConstituencyNumber: Digits BEFORE hyphen in header like "172-XXXX". Extract ONLY digits (e.g., "172").
8. assemblyConstituencyName: Text AFTER hyphen in header like "172-बिहारशरीफ". Extract ONLY the name part (e.g., "बिहारशरीफ").
9. sectionNumber: Value after the label for Section Number. Recognize common variants in different languages (e.g., "भाग संख्या", "Section No.", "सेक्शन नंबर", "વિભાગ નંબર", "ವಿಭಾಗ ಸಂಖ್ಯೆ", "பிரிவு எண்", "విభాగ సంఖ్య", "বিভাগ নম্বর"). Return exactly as printed.
10. houseNumber: Value after the label for House Number within the voter box. Recognize common variants (e.g., "मकान संख्या", "घर संख्या", "घर क्रमांक", "House No.", "મકાન નંબર", "ಮನೆ ಸಂಖ್ಯೆ", "வீட்டு எண்", "ఇంటి సంఖ్య", "বাড়ির নম্বর", "ঘৰ নং", "ঘৰ নম্বৰ"). Return exactly as printed (digits or alphanumerics, including local numerals). If a label isn’t present, infer the house number from the address line only if it is explicitly marked as a house number; otherwise leave empty.
11. ageAsOn: Date in DD-MM-YYYY from a footer like "उम्र : 01-07-2025 को संदर्भित आयु". Return ONLY the date (e.g., "01-07-2025").
12. publicationDate: Date in DD-MM-YYYY from footer like "# प्रकाशन की पूरक तिथि के अनुसार संशोधित : :- 30-09-2025". Return ONLY the date (e.g., "30-09-2025").

Strict formatting rules:
- Return dates strictly as DD-MM-YYYY.
- Return all other fields exactly as printed (do not translate or convert local-script numerals).
- If a field is not present on the page, return an empty string for that field.
- Apply these rules consistently for all voter entries on the page.

Return a JSON object: { "voters": [ ... ] }

Document:
{{media url=fileUri}}
`,
});

const extractVoterIdsFallbackPrompt = ai.definePrompt({
  name: 'extractVoterIdsFallbackPrompt',
  input: { schema: z.object({ fileUri: z.string() }) },
  output: { schema: z.object({ pairs: z.array(z.object({ id: z.string(), voterId: z.string() })) }) },
  prompt: `Identify and return only voter IDs (EPIC numbers) per serial box.

Instructions:
- For each voter box, output { id, voterId }.
- Recognize labels: "EPIC No.", "EPIC", "EPIC नं", "EPIC नंबर", "EPIC क्रमांक", "मतदाता पहचान पत्र क्रमांक", "EPIC নম্বৰ", "EPIC নং", "ভোটাৰ পৰিচয়পত্ৰ নম্বৰ", "வாக்காளர் அடையாள எண்", "EPIC எண்", "ബോട്ടർ ഐഡി", "EPIC ಸಂಖ್ಯೆ", and similar.
- If the label is missing, detect the typical EPIC pattern: uppercase letters A–Z and digits, usually length 10 (e.g., ABC1234567). Do not invent; use best visible match.
- Preserve the voterId exactly as printed.
- If not found for a box, return voterId as empty string.

Return JSON strictly as: { "pairs": [ { "id": "...", "voterId": "..." }, ... ] }

Document:
{{media url=fileUri}}`,
});

function dateKey() { return new Date().toISOString().slice(0, 10); }
function getClientIp() {
  try {
    const h = headers();
    const xf = h.get('x-forwarded-for');
    if (xf) return xf.split(',')[0].trim();
    const xr = h.get('x-real-ip');
    if (xr) return xr.trim();
  } catch {}
  return '127.0.0.1';
}

function enforceRateLimit(sessionId?: string) {
  const sid = sessionId || 'unknown';
  const ip = getClientIp();
  const day = dateKey();
  const g: any = globalThis as any;
  g.__voterRate ||= {};
  g.__voterRate[day] ||= {};
  const ipStore = (g.__voterRate[day][ip] ||= { sessions: new Set<string>(), pageCounts: {} });
  if (!ipStore.sessions.has(sid)) {
    if (ipStore.sessions.size >= 1) {
      throw new Error('Daily limit reached: only one PDF per IP per day');
    }
    ipStore.sessions.add(sid);
    ipStore.pageCounts[sid] = 0;
  }
  ipStore.pageCounts[sid] += 1;
  if (ipStore.pageCounts[sid] > 30) {
    throw new Error('Page limit exceeded: max 30 pages per PDF');
  }
}

const extractVotersFlow = ai.defineFlow(
  {
    name: 'extractVotersFlow',
    inputSchema: ExtractVotersInputSchema,
    outputSchema: ExtractVotersOutputSchema,
  },
  async (input) => {
    enforceRateLimit(input.sessionId);
    const { output } = await extractVotersPrompt({ fileUri: input.fileUri });
    if (!output) {
      throw new Error('The AI model failed to extract any voter information.');
    }
    const missing = output.voters.filter(v => !v.voterId || !v.voterId.trim());
    if (missing.length > 0) {
      try {
        const fb = await extractVoterIdsFallbackPrompt({ fileUri: input.fileUri });
        const map = new Map<string, string>(fb.pairs.map(p => [String(p.id).trim(), String(p.voterId || '').trim()]));
        output.voters = output.voters.map(v => ({
          ...v,
          voterId: v.voterId && v.voterId.trim() ? v.voterId : (map.get(String(v.id).trim()) || ''),
        }));
      } catch {}
    }
    return output;
  }
);


export async function extractVoters(
  input: ExtractVotersInput
): Promise<ExtractVotersOutput> {
  return extractVotersFlow(input);
}
