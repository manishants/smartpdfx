
'use server';

/**
 * @fileOverview An AI flow for redesigning a room based on a photo and a style.
 *
 * - redesignRoom - A function that redesigns a room.
 * - RedesignRoomInput - The input type for the redesignRoom function.
 * - RedesignRoomOutput - The return type for the redesignRoom function.
 */

import {ai} from '@/ai/genkit';
import {
  RedesignRoomInputSchema,
  RedesignRoomOutputSchema,
  type RedesignRoomInput,
  type RedesignRoomOutput,
} from '@/lib/types';

export async function redesignRoom(
  input: RedesignRoomInput
): Promise<RedesignRoomOutput> {
  return redesignRoomFlow(input);
}

const redesignRoomFlow = ai.defineFlow(
  {
    name: 'redesignRoomFlow',
    inputSchema: RedesignRoomInputSchema,
    outputSchema: RedesignRoomOutputSchema,
  },
  async ({photoUri, style}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-pro-vision',
      prompt: [
        {
          text: `Redesign this room in a ${style} style. Keep the original room layout and architecture, but change the furniture, colors, and decorations to match the requested style. The output must be a single image only.`,
        },
        {media: {url: photoUri}},
      ],
    });

    if (!media || !media.url) {
      throw new Error('The AI failed to redesign the room.');
    }

    return {redesignedPhotoUri: media.url};
  }
);
