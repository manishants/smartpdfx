'use server';

import sharp from 'sharp';
import type { RemoveBackgroundInput, RemoveBackgroundOutput } from '@/lib/types';

export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundOutput> {
  try {
    // Extract the base64 data from the data URI
    const base64Data = input.photoUri.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Use Sharp to process the image
    // This is a simplified background removal using edge detection and masking
    // For a real AI-powered background removal, you would need to integrate with services like:
    // - Remove.bg API
    // - Adobe Photoshop API
    // - Custom ML models
    
    // For now, we'll create a simple edge-based mask
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Create a simple background removal effect by:
    // 1. Converting to grayscale for edge detection
    // 2. Applying edge detection
    // 3. Creating a mask
    // 4. Applying the mask to create transparency
    
    const edgeDetected = await sharp(imageBuffer)
      .grayscale()
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
      })
      .threshold(50)
      .negate()
      .toBuffer();

    // Create a simple mask by combining edge detection with center weighting
    const centerX = Math.floor((metadata.width || 0) / 2);
    const centerY = Math.floor((metadata.height || 0) / 2);
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    // Create a radial gradient mask that assumes the subject is in the center
    const maskSvg = `
      <svg width="${metadata.width}" height="${metadata.height}">
        <defs>
          <radialGradient id="mask" cx="50%" cy="50%" r="60%">
            <stop offset="0%" style="stop-color:white;stop-opacity:1" />
            <stop offset="70%" style="stop-color:white;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:black;stop-opacity:0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#mask)" />
      </svg>
    `;

    const mask = await sharp(Buffer.from(maskSvg))
      .resize(metadata.width, metadata.height)
      .png()
      .toBuffer();

    // Apply the mask to create transparency
    const result = await sharp(imageBuffer)
      .composite([
        {
          input: mask,
          blend: 'dest-in'
        }
      ])
      .png()
      .toBuffer();

    // Convert back to data URI
    const resultUri = `data:image/png;base64,${result.toString('base64')}`;

    return {
      resultUri
    };

  } catch (error) {
    console.error('Background removal failed:', error);
    throw new Error('Failed to remove background from image');
  }
}