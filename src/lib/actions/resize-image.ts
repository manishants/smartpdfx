
'use server';

import type { ResizeImageInput, ResizeImageOutput } from '@/lib/types';
import sharp from 'sharp';

export async function resizeImage(
  input: ResizeImageInput
): Promise<ResizeImageOutput> {
  const { imageUri, width, height, percentage } = input;
  const imageBuffer = Buffer.from(
    imageUri.substring(imageUri.indexOf(',') + 1),
    'base64'
  );

  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  let newWidth: number | undefined = width;
  let newHeight: number | undefined = height;

  if (percentage && metadata.width && metadata.height) {
    newWidth = Math.round(metadata.width * (percentage / 100));
    newHeight = Math.round(metadata.height * (percentage / 100));
  }
  
  const resizedBuffer = await image
    .resize(newWidth, newHeight, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
    
  const resizedImageUri = `data:${metadata.format};base64,${resizedBuffer.toString(
    'base64'
  )}`;
  
  return { resizedImageUri };
}
