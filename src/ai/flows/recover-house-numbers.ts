"use server";

/**
 * @fileOverview A Genkit AI flow to recover missing house numbers from a voter list page image.
 * Input: page image URI and optional candidate voter IDs found by the primary extractor.
 * Output: pairs of { id, houseNumber } with digits-only values.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RecoverHouseNumbersInputSchema = z.object({
  imageUri: z.string().describe('The page image as a data URI.'),
  candidateIds: z.array(z.string()).optional().describe('Optional list of voter serial IDs to match.'),
});
export type RecoverHouseNumbersInput = z.infer<typeof RecoverHouseNumbersInputSchema>;

const RecoverHouseNumbersOutputSchema = z.object({
  pairs: z.array(
    z.object({
      id: z.string().describe('Voter serial ID inside the box.'),
      houseNumber: z.string().describe('Digits-only house number for the voter.'),
    })
  ),
});
export type RecoverHouseNumbersOutput = z.infer<typeof RecoverHouseNumbersOutputSchema>;

const recoverHouseNumbersPrompt = ai.definePrompt({
  name: 'recoverHouseNumbersPrompt',
  input: { schema: RecoverHouseNumbersInputSchema },
  output: { schema: RecoverHouseNumbersOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an OCR expert for Indian Electoral Rolls. Focus ONLY on mapping voter serial IDs to their house numbers on this page.

Instructions:
- Identify each voter box and read:
  • Serial ID labels: "क्रम संख्या", "क्रम सं.", "Serial No".
  • House number labels: "मकान संख्या", "मकान सं.", "मकान नं.", "घर क्रमांक", "घर संख्या", "House No", "House Number".
- Return an array of objects { id, houseNumber }.
- Values must be digits only (strip text and punctuation).
- Do NOT confuse the serial id with the house number.
- If candidateIds are provided, only include entries whose id matches an item in that list.
- If you cannot read a value confidently, omit that pair instead of guessing.

Page Image:
{{media url=imageUri}}`,
});

const recoverHouseNumbersFlow = ai.defineFlow(
  {
    name: 'recoverHouseNumbersFlow',
    inputSchema: RecoverHouseNumbersInputSchema,
    outputSchema: RecoverHouseNumbersOutputSchema,
  },
  async (input) => {
    const { output } = await recoverHouseNumbersPrompt(input);
    if (!output) {
      return { pairs: [] };
    }
    return output;
  }
);

export async function recoverHouseNumbers(
  input: RecoverHouseNumbersInput
): Promise<RecoverHouseNumbersOutput> {
  return recoverHouseNumbersFlow(input);
}