
'use server';

import type {
  CompressImageInput,
  CompressImageOutput,
} from '@/lib/types';
import sharp from 'sharp';

/**
 * @fileOverview A server action for compressing an image to a specific file size.
 *
 * - compressImageToSize - Compresses an image to be under a target size in KB.
 */

interface CompressImageToSizeInput extends CompressImageInput {
    targetSizeKB: number;
}

export async function compressImageToSize(
  input: CompressImageToSizeInput
): Promise<CompressImageOutput> {
    const { imageUri, targetSizeKB } = input;
    const TARGET_SIZE_BYTES = targetSizeKB * 1024;

    const imageBuffer = Buffer.from(
      imageUri.substring(imageUri.indexOf(',') + 1),
      'base64'
    );
    const originalSize = imageBuffer.length;
    const originalImage = sharp(imageBuffer);

    if (originalSize <= TARGET_SIZE_BYTES) {
        return {
            compressedImageUri: imageUri,
            originalSize: originalSize,
            compressedSize: originalSize,
        };
    }
    
    let quality = 90;
    let compressedBuffer: Buffer | null = null;
    
    // Try to compress as JPEG first
    while (quality >= 2) {
      const currentBuffer = await originalImage.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
      if (currentBuffer.length <= TARGET_SIZE_BYTES) {
        const compressedImageUri = `data:image/jpeg;base64,${currentBuffer.toString('base64')}`;
        return {
          compressedImageUri,
          originalSize,
          compressedSize: currentBuffer.length,
        };
      }
      compressedBuffer = currentBuffer;
      quality -= 5;
    }
    
    // If JPEG compression is not enough, try WEBP
    quality = 90;
     while (quality >= 2) {
      const currentBuffer = await originalImage.clone().webp({ quality }).toBuffer();
       if (currentBuffer.length <= TARGET_SIZE_BYTES) {
        const compressedImageUri = `data:image/webp;base64,${currentBuffer.toString('base64')}`;
        return {
          compressedImageUri,
          originalSize,
          compressedSize: currentBuffer.length,
        };
      }
      compressedBuffer = currentBuffer;
      quality -= 5;
    }

    // If still too large, return the smallest buffer we generated as a last resort.
    // This will be the one with the lowest quality (quality=2 from the webp loop).
    const finalBuffer = compressedBuffer || await originalImage.clone().webp({ quality: 2 }).toBuffer();
    const compressedImageUri = `data:image/webp;base64,${finalBuffer.toString('base64')}`;
     return {
        compressedImageUri,
        originalSize,
        compressedSize: finalBuffer.length,
    };
}
