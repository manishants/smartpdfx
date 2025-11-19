
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
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert at extracting structured data from Indian Electoral Rolls (voter lists). Analyze the provided page image. Identify EVERY voter entry and capture page-level metadata required for each voter.

For each voter, extract these fields with the EXACT formats:
1. id: Serial number inside the voter box (string). Common labels: "क्रम संख्या", "Serial No".
2. voterId: EPIC/Voter ID card number (uppercase alphanumeric, e.g., "UYA0837520"). Common labels and variations include: "EPIC No.", "EPIC Number", "EPIC", "Voter ID", "Elector ID", "मतदाता पहचान पत्र संख्या", "निर्वाचक पहचान पत्र संख्या", "EPIC क्रमांक", "मतदाता परिचय पत्र संख्या". Extract ONLY the EPIC value (A–Z and 0–9), remove spaces and hyphens.
3. name: Full name.
4. fatherOrHusbandName: Father/Mother/Husband name.
5. age: Age value as digits (e.g., "43").
6. gender: "पुरुष" or "महिला" (or English equivalents if printed that way).
7. assemblyConstituencyNumber: Digits BEFORE hyphen in header like "172-XXXX". Extract ONLY digits (e.g., "172").
8. assemblyConstituencyName: Text AFTER hyphen in header like "172-बिहारशरीफ". Extract ONLY the name part (e.g., "बिहारशरीफ").
9. sectionNumber: Digits AFTER the pattern "भाग संख्या" (examples include "भाग संख्या : : 1"). Extract ONLY digits (e.g., "1").
10. houseNumber: Digits for the house number inside each voter box. Common labels and variations include: "मकान संख्या", "मकान सं.", "मकान नं.", "घर क्रमांक", "घर संख्या", "House No.", "House Number". Extract ONLY digits (e.g., "मकान संख्या : 4" → "4"). Do NOT return the serial number here; houseNumber must be different from id.
11. ageAsOn: Date in DD-MM-YYYY from a footer like "उम्र : 01-07-2025 को संदर्भित आयु". Return ONLY the date (e.g., "01-07-2025").
12. publicationDate: Date in DD-MM-YYYY from footer like "प्रकाशन की पूरक तिथि के अनुसार संशोधित : 30-09-2025". Return ONLY the date (e.g., "30-09-2025").

Important extraction rules:
- Return dates strictly as DD-MM-YYYY.
- Return numeric fields strictly as digits without extra text.
- If a field is not present on the page, return an empty string for that field.
- For houseNumber: search near the bottom area of each voter box for any of the label variations above. If partially occluded or faint, still capture the digits if visible. Never copy id into houseNumber.
- For voterId: prefer text near labels like "EPIC", "EPIC No.", "Voter ID". EPIC format is typically 10–12 uppercase alphanumeric characters, often starting with 2–4 letters followed by digits (e.g., "ABC1234567"). Do NOT confuse with Aadhaar (12-digit numeric only) or serial id (pure digits). Strip spaces and dashes. If multiple candidates exist, choose the best EPIC-format token nearest the EPIC label.
- Apply these rules consistently for ALL voter entries on the page.

Return a JSON object: { "voters": [ ... ] }

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
