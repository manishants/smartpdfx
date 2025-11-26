
'use server';

/**
 * @fileOverview An AI flow for extracting text from an image using OCR.
 *
 * - imageToText - The main function to process the image file.
 * - ImageToTextInput - The input type for the flow.
 * - ImageToTextOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import {
  ImageToTextInputSchema,
  ImageToTextOutputSchema,
  type ImageToTextInput,
  type ImageToTextOutput,
} from '@/lib/types';
import { z } from 'zod';

const imageToTextPrompt = ai.definePrompt({
  name: 'imageToTextPrompt',
  input: { schema: z.object({ imageUri: z.string(), language: z.string().optional() }) },
  output: { schema: ImageToTextOutputSchema },
  prompt: `You are an expert at Optical Character Recognition (OCR). Extract all text, including handwritten text, from the provided image. The language of the text is {{language}}. If no language is specified, assume it is English.

Image:
{{media url=imageUri}}
`,
});

const imageToTextFlow = ai.defineFlow(
  {
    name: 'imageToTextFlow',
    inputSchema: ImageToTextInputSchema,
    outputSchema: ImageToTextOutputSchema,
  },
  async (input) => {
    const { output } = await imageToTextPrompt(input);
    if (!output) {
      throw new Error('The AI model failed to extract any text from the image.');
    }
    return output;
  }
);

export async function imageToText(
  input: ImageToTextInput
): Promise<ImageToTextOutput> {
  return imageToTextFlow(input);
}

    