
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
    const {media} = await ai.generate({
      model: 'googleai/gemini-pro-vision',
      prompt: [
        {
          text: 'TASK: Isolate the main subject in the provided image. OBJECTIVE: Generate a new image of ONLY the main subject with a completely transparent background. The subject must not be altered in any way. The output must be a single PNG image with a transparent background, not text.',
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
