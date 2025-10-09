
'use server';

/**
 * @fileOverview A flow for detecting and blurring faces in a video.
 *
 * - blurFaceInVideo - Detects and blurs faces in a video file.
 */

import { ai } from '@/ai/genkit';
import {
  BlurFaceInVideoInputSchema,
  BlurFaceInVideoOutputSchema,
  type BlurFaceInVideoInput,
  type BlurFaceInVideoOutput,
} from '@/lib/types';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { z } from 'zod';

// Schema for face location detection, reused from image blurring
const BoundingBoxSchema = z.object({
  x: z.number().describe('The x-coordinate of the top-left corner.'),
  y: z.number().describe('The y-coordinate of the top-left corner.'),
  width: z.number().describe('The width of the bounding box.'),
  height: z.number().describe('The height of the bounding box.'),
});
const FaceLocationsSchema = z.array(BoundingBoxSchema);

const locateFacesPrompt = ai.definePrompt({
  name: 'locateFacesInVideoPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { schema: z.object({ imageUri: z.string() }) },
  output: { schema: FaceLocationsSchema },
  prompt: `You are an expert at finding human faces in images. Find the bounding box of every face in the image. Provide the exact pixel coordinates (x, y, width, height) for each bounding box, ensuring the box covers the entire face. If you do not find any faces, return an empty array.
  
Image: {{media url=imageUri}}`,
});

export async function blurFaceInVideo(
  input: BlurFaceInVideoInput
): Promise<BlurFaceInVideoOutput> {
  return blurFaceInVideoFlow(input);
}

const blurFaceInVideoFlow = ai.defineFlow(
  {
    name: 'blurFaceInVideoFlow',
    inputSchema: BlurFaceInVideoInputSchema,
    outputSchema: BlurFaceInVideoOutputSchema,
  },
  async ({ videoUri }) => {
    const tempId = `temp-blur-${Date.now()}`;
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

      // 3. Analyze the frame to find face locations
      const frameBuffer = fs.readFileSync(tempFramePath);
      const frameUri = `data:image/png;base64,${frameBuffer.toString('base64')}`;
      const { output: faceLocations } = await locateFacesPrompt({ imageUri: frameUri });

      if (!faceLocations) {
        throw new Error('AI model failed to return face locations.');
      }
      
      // If no faces are found, return the original video
      if (faceLocations.length === 0) {
        return { processedVideoUri: videoUri, faceCount: 0 };
      }

      // 4. Use ffmpeg to blur all detected faces
      await new Promise<void>((resolve, reject) => {
        let filterComplex = '';
        let lastStream = '[0:v]'; // Start with the original video stream

        faceLocations.forEach((loc, i) => {
            const x = Math.round(loc.x);
            const y = Math.round(loc.y);
            const w = Math.round(loc.width);
            const h = Math.round(loc.height);
            
            // For each face, create a blurred crop and then overlay it.
            // Chain the overlays together.
            filterComplex += `${lastStream}crop=${w}:${h}:${x}:${y},boxblur=50[b${i}];`;
            filterComplex += `[${i === 0 ? '0:v' : `v${i-1}`}]` // Use original video for first overlay, then the result of the previous overlay
            filterComplex += `[b${i}]overlay=${x}:${y}[v${i}];`;
            lastStream = `[v${i}]`; // The output of this overlay is the input for the next
        });
        
        // The final stream must be mapped to the output.
        // We remove the trailing semicolon from the last command.
        filterComplex = filterComplex.slice(0, -1);

        ffmpeg(tempInputPath)
          .complexFilter(filterComplex)
          .outputOptions([`-map`, `${lastStream}`]) // Map the final video stream to the output
          .output(tempOutputPath)
          .on('end', resolve)
          .on('error', (err) => reject(new Error(`Video blurring failed: ${err.message}`)));
      });

      // 5. Read the processed video and return as data URI
      const outputBuffer = fs.readFileSync(tempOutputPath);
      const processedVideoUri = `data:video/mp4;base64,${outputBuffer.toString('base64')}`;
      
      return { processedVideoUri, faceCount: faceLocations.length };

    } finally {
      // 6. Clean up all temporary files
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      if (fs.existsSync(tempFramePath)) fs.unlinkSync(tempFramePath);
      if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
    }
  }
);
