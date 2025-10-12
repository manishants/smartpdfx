
'use server';

/**
 * @fileOverview An AI flow for removing the background from a photo.
 *
 * - removeBackground - A function that removes the background, leaving the subject.
 * - RemoveBackgroundInput - The input type for the removeBackground function.
 * - RemoveBackgroundOutput - The return type for the removeBackground function.
 */

import {ai} from '@/ai/genkit';
import {
  RemoveBackgroundInputSchema,
  RemoveBackgroundOutputSchema,
  type RemoveBackgroundInput,
  type RemoveBackgroundOutput,
} from '@/lib/types';

export async function removeBackground(
  input: RemoveBackgroundInput
): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}

const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async ({photoUri}) => {
    const {text, media} = await ai.generate({
      model: 'googleai/gemini-pro-vision',
      prompt: [
        {
          text: 'Remove the background from this image. The output should only be the main subject with a transparent background. Do not add any new background. The output should be a single image, not text.',
        },
        {media: {url: photoUri}},
      ],
    });

    if (!media || !media.url) {
      throw new Error('The AI failed to remove the background.');
    }

    return {resultUri: media.url};
  }
);
