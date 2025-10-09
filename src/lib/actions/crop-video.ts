
'use server';

/**
 * @fileOverview A flow for cropping a video file.
 *
 * - cropVideo - Crops a video to a specified dimension and position.
 */

import {
  CropVideoInputSchema,
  CropVideoOutputSchema,
  type CropVideoInput,
  type CropVideoOutput,
} from '@/lib/types';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function cropVideo(
  input: CropVideoInput
): Promise<CropVideoOutput> {
    const { videoUri, width, height, x, y } = input;
    return new Promise((resolve, reject) => {
      const videoBuffer = Buffer.from(
        videoUri.substring(videoUri.indexOf(',') + 1),
        'base64'
      );
      
      const tempId = `temp-crop-${Date.now()}`;
      const tempInputPath = path.join(os.tmpdir(), `${tempId}-input.mp4`);
      const tempOutputPath = path.join(os.tmpdir(), `${tempId}-output.mp4`);
      
      fs.writeFileSync(tempInputPath, videoBuffer);
      
      ffmpeg(tempInputPath)
        .videoFilters(`crop=${width}:${height}:${x}:${y}`)
        .output(tempOutputPath)
        .on('end', async () => {
          try {
            const outputBuffer = fs.readFileSync(tempOutputPath);
            const croppedVideoUri = `data:video/mp4;base64,${outputBuffer.toString('base64')}`;

            // Clean up temporary files
            fs.unlinkSync(tempInputPath);
            fs.unlinkSync(tempOutputPath);

            resolve({ croppedVideoUri });
          } catch(err) {
            reject(new Error('Failed to read or encode the cropped video file.'));
          }
        })
        .on('error', (err) => {
          console.error('FFMPEG Error:', err);
          // Clean up temp input file on error
          if(fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
          if(fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
          reject(new Error(`Failed to crop video: ${err.message}`));
        })
        .run();
    });
}
