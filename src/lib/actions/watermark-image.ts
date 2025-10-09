
'use server';

import type {
  WatermarkImageInput,
  WatermarkImageOutput,
} from '@/lib/types';
import sharp from 'sharp';

const getGravity = (position: string) => {
    switch (position) {
        case 'top-left': return 'northwest';
        case 'top-center': return 'north';
        case 'top-right': return 'northeast';
        case 'center-left': return 'west';
        case 'center': return 'center';
        case 'center-right': return 'east';
        case 'bottom-left': return 'southwest';
        case 'bottom-center': return 'south';
        case 'bottom-right': return 'southeast';
        default: return 'center';
    }
}

export async function watermarkImage(
  input: WatermarkImageInput
): Promise<WatermarkImageOutput> {
  const { imageUri, watermark } = input;

  const imageBuffer = Buffer.from(
    imageUri.substring(imageUri.indexOf(',') + 1),
    'base64'
  );

  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const imageWidth = metadata.width || 1;

  let watermarkBuffer: Buffer;
  
  if (watermark.type === 'text') {
    const textSvg = `
      <svg width="${imageWidth}" height="300">
        <text 
          x="50%" 
          y="50%" 
          dominant-baseline="middle" 
          text-anchor="middle" 
          fill="rgba(255,255,255,${watermark.opacity})" 
          font-size="${Math.round(imageWidth * 0.05 * watermark.scale)}" 
          font-family="sans-serif">
            ${watermark.content}
        </text>
      </svg>
    `;
    watermarkBuffer = Buffer.from(textSvg);
  } else {
    watermarkBuffer = Buffer.from(
        watermark.content.substring(watermark.content.indexOf(',') + 1),
       'base64'
    );
    // Resize watermark image
    const watermarkImage = sharp(watermarkBuffer);
    const watermarkMeta = await watermarkImage.metadata();
    const watermarkWidth = watermarkMeta.width || 1;
    const targetWidth = Math.round(imageWidth * watermark.scale);
    
    if (watermarkWidth > targetWidth) {
        watermarkBuffer = await watermarkImage.resize({ width: targetWidth }).toBuffer();
    }
  }

  const watermarkedBuffer = await image
    .composite([
      {
        input: watermarkBuffer,
        gravity: getGravity(watermark.position),
        blend: 'over',
      },
    ])
    .toBuffer();

  const watermarkedImageUri = `data:image/${metadata.format};base64,${watermarkedBuffer.toString('base64')}`;

  return { watermarkedImageUri };
}
