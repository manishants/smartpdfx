"use server";

/**
 * Recover Ward Part No. and Ward Part Name from the page header line.
 * Example source: "यादी भाग क्र. ४३ : २ - उंटवाडी गावठान उंटवाडी परिसर"
 * Output: { partNo: "४३ : २", partName: "उंटवाडी गावठान उंटवाडी परिसर" }
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RecoverWardPartInputSchema = z.object({
  imageUri: z.string().describe('The page image as a data URI.'),
});
export type RecoverWardPartInput = z.infer<typeof RecoverWardPartInputSchema>;

const RecoverWardPartOutputSchema = z.object({
  partNo: z.string().describe('Digits before and after colon (ASCII or Devanagari), formatted as "NN : NN".'),
  partName: z.string().describe('Full Marathi text after the hyphen.'),
});
export type RecoverWardPartOutput = z.infer<typeof RecoverWardPartOutputSchema>;

const recoverWardPartPrompt = ai.definePrompt({
  name: 'recoverWardPartPrompt',
  input: { schema: RecoverWardPartInputSchema },
  output: { schema: RecoverWardPartOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an OCR expert for Indian Electoral Rolls.

Task: Read the header line containing Marathi text beginning with "यादी भाग क्र" and extract:
- partNo: the numeric part around the colon (e.g., "४३ : २"). Accept ASCII or Devanagari digits; normalize to compact form with single spaces around the colon (" : ").
- partName: the exact text segment after the hyphen ("-", "–", or "—"). Trim leading/trailing spaces, preserve all Marathi characters.

Notes:
- Variations: "यादी भाग क्र.", "यादी भाग क्र", optional dot, optional extra spaces.
- Colon may be ":" or fullwidth "：" with spaces around it.
- Hyphen may be "-", "–", or "—".
- If the line is not visible, return empty strings.

Return JSON only.

Page Image:
{{media url=imageUri}}`,
});

const recoverWardPartFlow = ai.defineFlow(
  {
    name: 'recoverWardPartFlow',
    inputSchema: RecoverWardPartInputSchema,
    outputSchema: RecoverWardPartOutputSchema,
  },
  async (input) => {
    const { output } = await recoverWardPartPrompt(input);
    return output || { partNo: '', partName: '' };
  }
);

export async function recoverWardPart(
  input: RecoverWardPartInput
): Promise<RecoverWardPartOutput> {
  return recoverWardPartFlow(input);
}