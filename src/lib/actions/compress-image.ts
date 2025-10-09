
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
  input: CompressImageInput
): Promise<CompressImageOutput> {
    const { imageUri } = input;
    const imageBuffer = Buffer.from(
      imageUri.substring(imageUri.indexOf(',') + 1),
      'base64'
    );
    const originalSize = imageBuffer.length;
    
    // Target an 80% reduction, so target size is 20% of original
    const targetSize = originalSize * 0.2; 

    let quality = 80;
    let compressedBuffer: Buffer;
    
    let bestAttemptBuffer = imageBuffer;
    
    // Try to compress as JPEG first
    while (quality > 10) {
      const image = sharp(imageBuffer); // Re-initialize sharp for each attempt
      compressedBuffer = await image.jpeg({ quality, mozjpeg: true }).toBuffer();
      bestAttemptBuffer = compressedBuffer;
      if (compressedBuffer.length <= targetSize) {
        break; // Stop if we hit the target
      }
      quality -= 10;
    }
    
    // If we are still above target, use the best attempt
    const compressedImageUri = `data:image/jpeg;base64,${bestAttemptBuffer.toString('base64')}`;
    return {
      compressedImageUri,
      originalSize,
      compressedSize: bestAttemptBuffer.length,
    };
}
