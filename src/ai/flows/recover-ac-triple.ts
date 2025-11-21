"use server";

/**
 * @fileOverview A Genkit AI flow to recover the AC/Part/SNo triple for each voter from a page image.
 * Input: page image URI and optional candidate voter IDs found by the primary extractor.
 * Output: pairs of { id, acPartInfo } where acPartInfo is like "125/43/1357" or in Devanagari digits.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RecoverAcTripleInputSchema = z.object({
  imageUri: z.string().describe('The page image as a data URI.'),
  candidateIds: z.array(z.string()).optional().describe('Optional list of voter serial IDs to match.'),
});
export type RecoverAcTripleInput = z.infer<typeof RecoverAcTripleInputSchema>;

const RecoverAcTripleOutputSchema = z.object({
  pairs: z.array(
    z.object({
      id: z.string().describe('Voter serial ID inside the box.'),
      acPartInfo: z.string().describe('Triple formatted as AC/Part/SNo, supports ASCII or Devanagari digits.'),
    })
  ),
});
export type RecoverAcTripleOutput = z.infer<typeof RecoverAcTripleOutputSchema>;

const recoverAcTriplePrompt = ai.definePrompt({
  name: 'recoverAcTriplePrompt',
  input: { schema: RecoverAcTripleInputSchema },
  output: { schema: RecoverAcTripleOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an OCR expert for Indian Electoral Rolls. Focus ONLY on mapping voter serial IDs to their AC/Part/SNo TRIPLE on this page.

Instructions:
- Identify each voter box. Near the EPIC/Voter ID on the top line, read the triple formatted as AC No./AC Part No/AC Part Sno (three segments separated by '/' ).
- Return an array of objects { id, acPartInfo }.
- Accept ASCII or Devanagari digits and optional spaces around slashes, but return compact form like "125/43/1357" or "१२५/४३/१३५७".
- Do NOT confuse any other numbers (e.g., serial id, age) for acPartInfo.
- If candidateIds are provided, only include entries whose id matches an item in that list.
- If uncertain, omit the pair rather than guessing.

Page Image:
{{media url=imageUri}}`,
});

const recoverAcTripleFlow = ai.defineFlow(
  {
    name: 'recoverAcTripleFlow',
    inputSchema: RecoverAcTripleInputSchema,
    outputSchema: RecoverAcTripleOutputSchema,
  },
  async (input) => {
    const { output } = await recoverAcTriplePrompt(input);
    if (!output) {
      return { pairs: [] };
    }
    return output;
  }
);

export async function recoverAcTriple(
  input: RecoverAcTripleInput
): Promise<RecoverAcTripleOutput> {
  return recoverAcTripleFlow(input);
}