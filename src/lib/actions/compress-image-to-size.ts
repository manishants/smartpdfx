
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

    if (originalSize <= TARGET_SIZE_BYTES) {
        return {
            compressedImageUri: imageUri,
            originalSize: originalSize,
            compressedSize: originalSize,
        };
    }
    
    let currentImage = sharp(imageBuffer);
    let currentBuffer = imageBuffer;
    let quality = 80;
    let scale = 1.0;

    // Iteratively reduce quality and then size until the target is met
    while (currentBuffer.length > TARGET_SIZE_BYTES && (quality > 5 || scale > 0.5)) {
        if (quality > 5) {
            // First, try reducing quality
            quality -= 5;
        } else if (scale > 0.5) {
            // If quality is at minimum, start reducing size
            scale -= 0.1;
            const metadata = await sharp(imageBuffer).metadata();
            const newWidth = Math.round(metadata.width! * scale);
            currentImage = sharp(imageBuffer).resize(newWidth);
            quality = 75; // Reset quality for the new size
        }

        currentBuffer = await currentImage.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
    }
    
    // If it's still too large, one final aggressive attempt with WEBP
    if (currentBuffer.length > TARGET_SIZE_BYTES) {
        currentBuffer = await currentImage.clone().webp({ quality: 50, effort: 6 }).toBuffer();
    }

    const compressedImageUri = `data:image/jpeg;base64,${currentBuffer.toString('base64')}`;
     return {
        compressedImageUri,
        originalSize,
        compressedSize: currentBuffer.length,
    };
}
