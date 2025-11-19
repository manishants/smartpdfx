"use server";

/**
 * @fileOverview A Genkit AI flow to recover missing voter IDs (EPIC numbers) from a voter list page image.
 * Input: page image URI and optional candidate voter serial IDs found by the primary extractor.
 * Output: pairs of { id, voterId } with uppercase alphanumeric EPIC values.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RecoverVoterIdsInputSchema = z.object({
  imageUri: z.string().describe('The page image as a data URI.'),
  candidateIds: z.array(z.string()).optional().describe('Optional list of voter serial IDs to match.'),
});
export type RecoverVoterIdsInput = z.infer<typeof RecoverVoterIdsInputSchema>;

const RecoverVoterIdsOutputSchema = z.object({
  pairs: z.array(
    z.object({
      id: z.string().describe('Voter serial ID inside the box.'),
      voterId: z.string().describe('Uppercase alphanumeric EPIC (spaces/hyphens removed).'),
    })
  ),
});
export type RecoverVoterIdsOutput = z.infer<typeof RecoverVoterIdsOutputSchema>;

const recoverVoterIdsPrompt = ai.definePrompt({
  name: 'recoverVoterIdsPrompt',
  input: { schema: RecoverVoterIdsInputSchema },
  output: { schema: RecoverVoterIdsOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an OCR expert for Indian Electoral Rolls. Focus ONLY on mapping voter serial IDs to their EPIC/Voter ID values on this page.

Instructions:
- Identify each voter box and read:
  • Serial number labels: "क्रम संख्या", "Serial No" (string id)
  • EPIC labels: "EPIC No.", "EPIC Number", "EPIC", "Voter ID", "Elector ID", "मतदाता पहचान पत्र संख्या", "निर्वाचक पहचान पत्र संख्या", "EPIC क्रमांक", "मतदाता परिचय पत्र संख्या"
- Extract EPIC values as uppercase alphanumeric (A–Z, 0–9), remove spaces and hyphens.
- EPIC format is typically 10–12 characters, often starting with 2–4 letters followed by digits (e.g., "ABC1234567").
- Do NOT return Aadhaar (12-digit numeric only) or the serial id. If multiple candidates exist near the label, choose the best EPIC-format token.
- If candidateIds are provided, return mappings only for those ids found on the page; otherwise return mappings for all voter boxes with EPIC present.

Return JSON strictly as: { "pairs": [ { "id": "...", "voterId": "..." }, ... ] }

Document:
{{media url=imageUri}}
`,
});

const recoverVoterIdsFlow = ai.defineFlow(
  {
    name: 'recoverVoterIdsFlow',
    inputSchema: RecoverVoterIdsInputSchema,
    outputSchema: RecoverVoterIdsOutputSchema,
  },
  async (input) => {
    const { output } = await recoverVoterIdsPrompt(input);
    if (!output) {
      return { pairs: [] };
    }
    return output;
  }
);

export async function recoverVoterIds(input: RecoverVoterIdsInput): Promise<RecoverVoterIdsOutput> {
  return recoverVoterIdsFlow(input);
}