
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
    
    let quality = 80;
    let compressedBuffer: Buffer;
    
    // Try to compress as JPEG first
    while (quality > 10) {
      compressedBuffer = await originalImage.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
      if (compressedBuffer.length <= TARGET_SIZE_BYTES) {
        const compressedImageUri = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        return {
          compressedImageUri,
          originalSize,
          compressedSize: compressedBuffer.length,
        };
      }
      quality -= 5;
    }
    
    // If JPEG compression is not enough, try WEBP
    quality = 80;
     while (quality > 10) {
      compressedBuffer = await originalImage.clone().webp({ quality }).toBuffer();
      if (compressedBuffer.length <= TARGET_SIZE_BYTES) {
        const compressedImageUri = `data:image/webp;base64,${compressedBuffer.toString('base64')}`;
        return {
          compressedImageUri,
          originalSize,
          compressedSize: compressedBuffer.length,
        };
      }
      quality -= 5;
    }

    // If still too large, return the smallest buffer we generated (last webp attempt)
    compressedBuffer = await originalImage.clone().webp({ quality: 10 }).toBuffer();
    const compressedImageUri = `data:image/webp;base64,${compressedBuffer.toString('base64')}`;
     return {
        compressedImageUri,
        originalSize,
        compressedSize: compressedBuffer.length,
    };
}
