
'use server';

/**
 * @fileOverview An action for generating a favicon from an image.
 *
 * - generateFavicon - Creates an ICO file from an image.
 */

import {
  GenerateFaviconInputSchema,
  GenerateFaviconOutputSchema,
  type GenerateFaviconInput,
  type GenerateFaviconOutput,
} from '@/lib/types';
import sharp from 'sharp';
import toIco from 'to-ico';

export async function generateFavicon(
  input: GenerateFaviconInput
): Promise<GenerateFaviconOutput> {
  const { imageUri } = input;

  const imageBuffer = Buffer.from(
    imageUri.substring(imageUri.indexOf(',') + 1),
    'base64'
  );

  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map(size =>
      sharp(imageBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  );
  
  const icoBuffer = await toIco(pngBuffers);

  const faviconUri = `data:image/x-icon;base64,${icoBuffer.toString('base64')}`;

  return { faviconUri };
}
