
'use server';

/**
 * @fileOverview An AI flow for enhancing the quality of a photo.
 *
 * - enhancePhoto - A function that improves photo resolution, clarity, and lighting.
 * - EnhancePhotoInput - The input type for the enhancePhoto function.
 * - EnhancePhotoOutput - The return type for the enhancePhoto function.
 */

import {ai} from '@/ai/genkit';
import {
  EnhancePhotoInputSchema,
  EnhancePhotoOutputSchema,
  type EnhancePhotoInput,
  type EnhancePhotoOutput,
} from '@/lib/types';

export async function enhancePhoto(
  input: EnhancePhotoInput
): Promise<EnhancePhotoOutput> {
  return enhancePhotoFlow(input);
}

const enhancePhotoFlow = ai.defineFlow(
  {
    name: 'enhancePhotoFlow',
    inputSchema: EnhancePhotoInputSchema,
    outputSchema: EnhancePhotoOutputSchema,
  },
  async ({photoUri}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {
          text:
            'Enhance this photo. Improve resolution, clarity, lighting, and color balance to make it look professional. Preserve original framing and composition; do not crop, zoom, or change the aspect ratio. Keep output dimensions the same as the input. Do not add or remove content.',
        },
        { media: { url: photoUri } },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('The AI failed to enhance the photo.');
    }

    return {enhancedPhotoUri: media.url};
  }
);
