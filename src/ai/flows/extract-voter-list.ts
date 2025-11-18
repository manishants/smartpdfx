
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
    prompt: `You are an expert at extracting structured data from Indian Electoral Rolls (voter lists). Analyze the provided page image or PDF page. Identify EVERY voter entry and return a JSON object: { "voters": Voter[] }.

For EACH voter, extract and return these fields:
1.  id — Serial number of the voter in the list.
2.  voterId — Voter ID card number (e.g., "UYA0837520").
3.  name — Full name of the voter.
4.  fatherOrHusbandName — Name of the father/mother/husband.
5.  age — Age value shown.
6.  gender — One of: Male, Female, Other.

Additionally, attach PAGE-LEVEL metadata to EACH voter on that page:
7.  assemblyConstituencyNumber — From header like "172-बिहारशरीफ" → take the number part "172".
8.  assemblyConstituencyName — From header like "172-बिहारशरीफ" → take the name part after the hyphen, e.g., "बिहारशरीफ".
9.  sectionNumber — From text like "भाग संख्या : : 1" → take "1".
10. houseNumber — From the voter box text like "मकान संख्या : 4" → take "4" (per voter).
11. ageAsOn — From footer/header text like "उम्र : 01-07-2025 को संदर्भित आयु" → take the date "01-07-2025".
12. publicationDate — From footer text like "प्रकाशन की पूरक तिथि के अनुसार संशोधित : :- 30-09-2025" → take "30-09-2025".

Guidelines:
- Keep values exactly as printed; do not translate or reformat. Dates should remain in DD-MM-YYYY if seen that way.
- If a field is not present for a voter, omit that key entirely for that voter (do NOT invent values).
- Detect minor formatting variations (extra colons or spaces) and still extract the correct values.
- Each voter entry usually appears inside a boxed section; parse the box to get id, voterId, name, fatherOrHusbandName, age, gender, and houseNumber.
- The header/footer metadata (assemblyConstituencyNumber, assemblyConstituencyName, sectionNumber, ageAsOn, publicationDate) applies to all voters on the page — include these fields for each voter in this page's output.

Return ONLY the JSON object with a single key "voters" containing the array of voter objects.

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
