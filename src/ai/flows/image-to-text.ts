
'use server';

/**
 * @fileOverview A flow for extracting text from an image (OCR).
 *
 * - imageToText - A function that handles extracting text from an image.
 * - ImageToTextInput - The input type for the imageToText function.
 * - ImageToTextOutput - The return type for the imageToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ImageToTextInputSchema = z.object({
  imageUri: z
    .string()
    .describe(
      "An image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageToTextInput = z.infer<typeof ImageToTextInputSchema>;

const ImageToTextOutputSchema = z.object({
  text: z.string().describe('The extracted text from the image.'),
});
export type ImageToTextOutput = z.infer<typeof ImageToTextOutputSchema>;


export async function imageToText(
  input: ImageToTextInput
): Promise<ImageToTextOutput> {
  return imageToTextFlow(input);
}

const imageToTextFlow = ai.defineFlow(
  {
    name: 'imageToTextFlow',
    inputSchema: ImageToTextInputSchema,
    outputSchema: ImageToTextOutputSchema,
  },
  async (input) => {
    const { imageUri } = input;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: [
        { text: 'Extract all text from the following image. If there is no text, return an empty string.' },
        { media: { url: imageUri } },
      ],
    });

    return {
      text: llmResponse.text,
    };
  }
);
