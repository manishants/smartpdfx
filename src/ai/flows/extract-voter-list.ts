
'use server';

/**
 * @fileOverview An AI flow for extracting structured voter information from a PDF or image.
 *
 * - extractVoters - The main function to process the file.
 * - ExtractVotersInput - The input type for the flow.
 * - ExtractVotersOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
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
    prompt: `You are an expert at extracting structured data from Indian Electoral Rolls (voter lists). Analyze the provided document, which could be an image or a PDF. Your task is to identify and extract every single voter entry from all pages of the document.

For each voter, extract the following details:
1.  **id**: The serial number of the voter in the list.
2.  **voterId**: The voter's ID card number (e.g., "UYA0837520").
3.  **name**: The voter's full name.
4.  **fatherOrHusbandName**: The name of the voter's father, mother, or husband.
5.  **age**: The voter's age.
6.  **gender**: The voter's gender (Male, Female, or Other).

Pay close attention to the layout. Each voter entry is typically in its own box or section. You must process every page and extract every voter. Do not stop until the entire document has been processed. A partial list is considered a failure.

Return the data as a JSON object with a single key "voters", which is an array of all the voter objects you have found.

Document:
{{media url=fileUri}}
`,
});

const extractVotersFlow = ai.defineFlow(
  {
    name: 'extractVotersFlow',
    inputSchema: ExtractVotersInputSchema,
    outputSchema: ExtractVotersOutputSchema,
  },
  async (input) => {
    const { output } = await extractVotersPrompt(input);
    if (!output) {
      throw new Error('The AI model failed to extract any voter information.');
    }
    return output;
  }
);


export async function extractVoters(
  input: ExtractVotersInput
): Promise<ExtractVotersOutput> {
  return extractVotersFlow(input);
}
