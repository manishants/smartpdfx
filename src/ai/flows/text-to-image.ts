
'use server';

/**
 * @fileOverview An AI flow for generating an image from a text prompt.
 *
 * - textToImage - Generates an image based on a textual description.
 * - TextToImageInput - The input type for the textToImage function.
 * - TextToImageOutput - The return type for the textToImage function.
 */

import { ai } from '@/ai/genkit';
import {
  TextToImageInputSchema,
  TextToImageOutputSchema,
  type TextToImageInput,
  type TextToImageOutput,
} from '@/lib/types';

export async function textToImage(
  input: TextToImageInput
): Promise<TextToImageOutput> {
  return textToImageFlow(input);
}

const textToImageFlow = ai.defineFlow(
  {
    name: 'textToImageFlow',
    inputSchema: TextToImageInputSchema,
    outputSchema: TextToImageOutputSchema,
  },
  async ({ prompt, style }) => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `${prompt}, in the style of ${style}`,
    });

    if (!media || !media.url) {
      throw new Error('The AI failed to generate an image.');
    }

    return { imageUri: media.url };
  }
);
