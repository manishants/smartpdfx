
'use server';

/**
 * @fileOverview A flow for trimming a video file.
 *
 * - trimVideo - Trims a video to a specified start and end time.
 */

import {
  TrimVideoInputSchema,
  TrimVideoOutputSchema,
  type TrimVideoInput,
  type TrimVideoOutput,
} from '@/lib/types';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function trimVideo(
  input: TrimVideoInput
): Promise<TrimVideoOutput> {
    const { videoUri, startTime, endTime } = input;
    return new Promise((resolve, reject) => {
      const videoBuffer = Buffer.from(
        videoUri.substring(videoUri.indexOf(',') + 1),
        'base64'
      );
      
      const tempId = `temp-${Date.now()}`;
      const tempInputPath = path.join(os.tmpdir(), `${tempId}-input.mp4`);
      const tempOutputPath = path.join(os.tmpdir(), `${tempId}-output.mp4`);
      
      fs.writeFileSync(tempInputPath, videoBuffer);
      
      ffmpeg(tempInputPath)
        .setStartTime(startTime)
        .setDuration(calculateDuration(startTime, endTime))
        .output(tempOutputPath)
        .on('end', async () => {
          try {
            const outputBuffer = fs.readFileSync(tempOutputPath);
            const trimmedVideoUri = `data:video/mp4;base64,${outputBuffer.toString('base64')}`;

            // Clean up temporary files
            fs.unlinkSync(tempInputPath);
            fs.unlinkSync(tempOutputPath);

            resolve({ trimmedVideoUri });
          } catch(err) {
            reject(new Error('Failed to read or encode the trimmed video file.'));
          }
        })
        .on('error', (err) => {
          console.error('FFMPEG Error:', err);
          // Clean up temp input file on error
          if(fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
          if(fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
          reject(new Error(`Failed to trim video: ${err.message}`));
        })
        .run();
    });
}


function timeToSeconds(time: string): number {
    const [h, m, s] = time.split(':').map(Number);
    return h * 3600 + m * 60 + s;
}

function calculateDuration(start: string, end: string): number {
    const startSeconds = timeToSeconds(start);
    const endSeconds = timeToSeconds(end);
    const duration = endSeconds - startSeconds;
    return duration > 0 ? duration : 0;
}
