
'use server';

import type {
  CompressImageInput,
  CompressImageOutput,
} from '@/lib/types';
import sharp from 'sharp';

/**
 * @fileOverview A server action for compressing an image by a percentage.
 *
 * - compressImage - Compresses an image, aiming for 80-90% size reduction.
 */

export async function compressImage(
  input: CompressImageInput & { quality?: number }
): Promise<CompressImageOutput> {
    const { imageUri, quality = 75 } = input;
    const imageBuffer = Buffer.from(
      imageUri.substring(imageUri.indexOf(',') + 1),
      'base64'
    );
    const originalSize = imageBuffer.length;
    
    const image = sharp(imageBuffer);
    const compressedBuffer = await image.jpeg({ quality, mozjpeg: true }).toBuffer();
    
    const compressedImageUri = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
    return {
      compressedImageUri,
      originalSize,
      compressedSize: compressedBuffer.length,
    };
}
