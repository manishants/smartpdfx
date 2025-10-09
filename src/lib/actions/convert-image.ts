
'use server';

import type {
    ConvertImageInput,
    ConvertImageOutput,
} from '@/lib/types';
import sharp from 'sharp';

export async function convertImage(
  input: ConvertImageInput
): Promise<ConvertImageOutput> {
  const { imageUri, format } = input;

  const imageBuffer = Buffer.from(
    imageUri.substring(imageUri.indexOf(',') + 1),
    'base64'
  );

  let outputBuffer: Buffer;
  let mimeType: string;

  const image = sharp(imageBuffer);

  switch (format) {
    case 'jpeg':
      outputBuffer = await image.jpeg().toBuffer();
      mimeType = 'image/jpeg';
      break;
    case 'png':
      outputBuffer = await image.png().toBuffer();
      mimeType = 'image/png';
      break;
    case 'webp':
      outputBuffer = await image.webp().toBuffer();
      mimeType = 'image/webp';
      break;
    case 'gif':
      outputBuffer = await image.gif().toBuffer();
      mimeType = 'image/gif';
      break;
    case 'tiff':
       outputBuffer = await image.tiff().toBuffer();
       mimeType = 'image/tiff';
       break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
  
  const convertedImageUri = `data:${mimeType};base64,${outputBuffer.toString('base64')}`;
  
  return { convertedImageUri };
}
