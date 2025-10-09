
'use server';
/**
 * @fileOverview An AI flow for extracting voter information from a document.
 * - extractVoterList - Extracts a list of voters from a PDF or image.
 */
import {ai} from '@/ai/genkit';
import {
  ExtractVotersInputSchema,
  ExtractVotersOutputSchema,
  type ExtractVotersInput,
  type ExtractVotersOutput,
  Voter,
} from '@/lib/types';
import {z} from 'zod';

const VoterSchema = z.object({
  id: z.string().describe('The serial number of the voter in the list.'),
  name: z.string().describe("The voter's full name."),
  fatherOrHusbandName: z
    .string()
    .describe("The name of the voter's father or husband."),
  age: z.string().describe("The voter's age."),
  gender: z.string().describe("The voter's gender."),
  voterId: z.string().describe("The voter's ID card number."),
});

const extractVoterListFlow = ai.defineFlow(
  {
    name: 'extractVoterListFlow',
    inputSchema: ExtractVotersInputSchema,
    outputSchema: ExtractVotersOutputSchema,
  },
  async ({fileUri}) => {
    const extractPrompt = ai.definePrompt({
      name: 'voterExtractPrompt',
      input: {schema: z.object({doc: z.string()})},
      output: {schema: z.array(VoterSchema)},
      prompt: `Analyze the provided document, which is a page from an Indian voter list. It contains multiple columns of voter information blocks.
Your task is to extract the details for every voter on the page.

For each voter, you must extract exactly these 6 fields:
1.  **Serial no.**: The number at the very beginning of the voter block (e.g., 1, 2, 3...).
2.  **निर्वाचक का नाम**: The voter's name.
3.  **पिता का नाम / पति का नाम**: The father's or husband's name. Use the label provided (e.g., "पिता का नाम").
4.  **उम्र**: The voter's age.
5.  **लिंग**: The voter's gender (e.g., महिला, पुरुष).
6.  **Voter ID**: The alphanumeric ID, usually at the bottom of the block (e.g., YXZ2690055).

IMPORTANT: If a voter block has the word "DELETED" stamped over it, you must extract the Serial no., and then you must set the value for all other fields ('name', 'fatherOrHusbandName', 'age', 'gender', 'voterId') to the string "DELETED".

Do not extract any other information. Ignore all headers, footers, and any text outside of the voter information blocks.
Return the data as a JSON array of objects, where each object represents one voter.

Document:
{{media url=doc}}
`,
    });

    const {output} = await extractPrompt({doc: fileUri});

    if (!output) {
      throw new Error('AI model failed to extract any voter information.');
    }

    return {voters: output};
  }
);

export async function extractVoterList(
  input: ExtractVotersInput
): Promise<ExtractVotersOutput> {
  return extractVoterListFlow(input);
}
