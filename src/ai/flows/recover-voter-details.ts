"use server";

/**
 * @fileOverview A Genkit AI flow to recover FULL voter details for specific serial IDs on a voter list page image.
 * Input: page image URI and optional candidate voter serial IDs. If no candidate ids provided, return details for all boxes found.
 * Output: { voters: Voter[] } with fields aligned to lib/types Voter schema.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ExtractVotersOutputSchema, type Voter } from '@/lib/types';

const RecoverVoterDetailsInputSchema = z.object({
  imageUri: z.string().describe('The page image as a data URI.'),
  candidateIds: z.array(z.string()).optional().describe('Optional list of voter serial IDs to retrieve. If omitted, return all boxes.'),
});
export type RecoverVoterDetailsInput = z.infer<typeof RecoverVoterDetailsInputSchema>;

const RecoverVoterDetailsOutputSchema = ExtractVotersOutputSchema;
export type RecoverVoterDetailsOutput = { voters: Voter[] };

const recoverVoterDetailsPrompt = ai.definePrompt({
  name: 'recoverVoterDetailsPrompt',
  input: { schema: RecoverVoterDetailsInputSchema },
  output: { schema: RecoverVoterDetailsOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an OCR expert for Indian Electoral Rolls (municipal voter lists). Extract FULL details per voter box.

When candidateIds are provided, return details ONLY for those serial IDs found on the page. Otherwise, return details for ALL voter boxes.

For each voter, extract fields exactly:
1. id: Serial number inside the voter box (string).
2. voterId: EPIC/Voter ID (uppercase alphanumeric, spaces/hyphens removed).
3. name: Full name.
4. fatherOrHusbandName: Father/Mother/Husband name.
5. age: Digits only.
6. gender: Text as printed (e.g., 'पुरुष', 'महिला').
7. assemblyConstituencyNumber: Digits BEFORE hyphen in header like '172-…'. Digits only.
8. assemblyConstituencyName: Text AFTER hyphen in header like '172-…'. Name only.
9. sectionNumber: Digits after 'भाग संख्या'.
10. houseNumber: FULL TEXT after house label preserving alphabets, ASCII and Devanagari digits, hyphen variants, slashes, underscores, spaces (do not copy serial id).
11. ageAsOn: Date DD-MM-YYYY.
12. publicationDate: Date DD-MM-YYYY.
13. acPartInfo: Triple like '125/43/1357' or Devanagari digits.

Important:
- Align each voter to the correct serial id (id).
- If a field is not legible, return empty string for that field.
- Output JSON strictly as { "voters": [ ... ] }.

Document:
{{media url=imageUri}}`,
});

const recoverVoterDetailsFlow = ai.defineFlow(
  {
    name: 'recoverVoterDetailsFlow',
    inputSchema: RecoverVoterDetailsInputSchema,
    outputSchema: RecoverVoterDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await recoverVoterDetailsPrompt(input);
    if (!output) {
      return { voters: [] };
    }
    return output;
  }
);

export async function recoverVoterDetails(
  input: RecoverVoterDetailsInput
): Promise<RecoverVoterDetailsOutput> {
  return recoverVoterDetailsFlow(input);
}

