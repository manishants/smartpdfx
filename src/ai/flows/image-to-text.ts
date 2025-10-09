'use server';

/**
 * @fileOverview An AI flow for extracting text from an image (OCR).
 *
 * - imageToText - A function that handles extracting text from an image.
 * - ImageToTextInput - The input type for the imageToText function.
 * - ImageToTextOutput - The return type for the imageToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit/zod';

export const ImageToTextInputSchema = z.object({
  imageUri: z
    .string()
    .describe(
      "The image to extract text from, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe('The language of the text in the image (e.g., "English", "Hindi", "English and Hindi").'),
});
export type ImageToTextInput = z.infer<typeof ImageToTextInputSchema>;

export const ImageToTextOutputSchema = z.object({
  text: z.string().describe('The extracted text from the image.'),
});
export type ImageToTextOutput = z.infer<typeof ImageToTextOutputSchema>;


const imageToTextPrompt = ai.definePrompt({
    name: 'imageToTextPrompt',
    input: { schema: ImageToTextInputSchema },
    output: { schema: ImageToTextOutputSchema },
    prompt: `You are an expert at Optical Character Recognition (OCR). Your task is to extract all text from the provided image. The text may be in {{{language}}}. Preserve the original formatting, including line breaks and paragraphs, as accurately as possible. If there is no text in the image, return an empty string.

Image: {{media url=imageUri}}`,
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
      return { text: '' };
    }
    return output;
  }
);


export async function imageToText(
  input: ImageToTextInput
): Promise<ImageToTextOutput> {
  return imageToTextFlow(input);
}
