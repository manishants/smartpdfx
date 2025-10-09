
'use server';

/**
 * @fileOverview A flow for detecting and removing a watermark from a video.
 *
 * - removeWatermarkInVideo - Detects and removes a watermark from a video file.
 */

import { ai } from '@/ai/genkit';
import {
  RemoveWatermarkInputSchema,
  RemoveWatermarkOutputSchema,
  type RemoveWatermarkInput,
  type RemoveWatermarkOutput,
} from '@/lib/types';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { z } from 'zod';

const WatermarkLocationSchema = z.object({
  x: z.number().describe('The x-coordinate of the top-left corner of the watermark.'),
  y: z.number().describe('The y-coordinate of the top-left corner of the watermark.'),
  width: z.number().describe('The width of the watermark.'),
  height: z.number().describe('The height of the watermark.'),
});

const locateWatermarkPrompt = ai.definePrompt({
  name: 'locateWatermarkPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { schema: z.object({ imageUri: z.string() }) },
  output: { schema: WatermarkLocationSchema },
  prompt: `You are an expert at finding watermarks or logos in images. Find the bounding box of the most prominent watermark in the image. Provide the exact pixel coordinates (x, y, width, height) for the bounding box. If you do not find a watermark, return coordinates for a 1x1 pixel box at the top-left corner (x:0, y:0, width:1, height:1).
  
Image: {{media url=imageUri}}`,
});

export async function removeWatermarkInVideo(
  input: RemoveWatermarkInput
): Promise<RemoveWatermarkOutput> {
  return removeWatermarkFlow(input);
}

const removeWatermarkFlow = ai.defineFlow(
  {
    name: 'removeWatermarkFlow',
    inputSchema: RemoveWatermarkInputSchema,
    outputSchema: RemoveWatermarkOutputSchema,
  },
  async ({ videoUri }) => {
    const tempId = `temp-watermark-${Date.now()}`;
    const tempInputPath = path.join(os.tmpdir(), `${tempId}-input.mp4`);
    const tempFramePath = path.join(os.tmpdir(), `${tempId}-frame.png`);
    const tempOutputPath = path.join(os.tmpdir(), `${tempId}-output.mp4`);

    try {
      // 1. Write video to temp file
      const videoBuffer = Buffer.from(videoUri.substring(videoUri.indexOf(',') + 1), 'base64');
      fs.writeFileSync(tempInputPath, videoBuffer);

      // 2. Extract a frame for analysis
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInputPath)
          .screenshots({
            count: 1,
            timemarks: ['00:00:01'],
            filename: path.basename(tempFramePath),
            folder: path.dirname(tempFramePath),
          })
          .on('end', resolve)
          .on('error', (err) => reject(new Error(`Frame extraction failed: ${err.message}`)));
      });

      // 3. Analyze the frame to find the watermark
      const frameBuffer = fs.readFileSync(tempFramePath);
      const frameUri = `data:image/png;base64,${frameBuffer.toString('base64')}`;
      const { output: watermarkLocation } = await locateWatermarkPrompt({ imageUri: frameUri });

      if (!watermarkLocation) {
        throw new Error('AI model failed to return a location for the watermark.');
      }
      
      if (watermarkLocation.width <= 1 && watermarkLocation.height <= 1) {
          throw new Error('AI could not detect a watermark in the video.');
      }

      // 4. Use ffmpeg to remove the watermark
      await new Promise<void>((resolve, reject) => {
        const { x, y, width, height } = watermarkLocation;
        ffmpeg(tempInputPath)
          .videoFilters(`delogo=x=${Math.round(x)}:y=${Math.round(y)}:w=${Math.round(width)}:h=${Math.round(height)}`)
          .output(tempOutputPath)
          .on('end', resolve)
          .on('error', (err) => reject(new Error(`Watermark removal failed: ${err.message}`)));
      });

      // 5. Read the processed video and return as data URI
      const outputBuffer = fs.readFileSync(tempOutputPath);
      const processedVideoUri = `data:video/mp4;base64,${outputBuffer.toString('base64')}`;
      
      return { processedVideoUri };

    } finally {
      // 6. Clean up all temporary files
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      if (fs.existsSync(tempFramePath)) fs.unlinkSync(tempFramePath);
      if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
    }
  }
);
