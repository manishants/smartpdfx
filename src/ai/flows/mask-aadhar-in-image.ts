'use server';

/**
 * @fileOverview A flow for masking Aadhar numbers within an image.
 *
 * - maskAadharInImage - A function that handles masking an image.
 * - MaskAadharInImageInput - The input type for the maskAadharInImage function.
 * - MaskAadharInImageOutput - The return type for the maskAadharInImage function.
 */

import {ai} from '@/ai/genkit';
import {
  MaskAadharInImageInputSchema,
  MaskAadharInImageOutputSchema,
  type MaskAadharInImageInput,
  type MaskAadharInImageOutput,
} from '@/lib/types';
import sharp from 'sharp';
import {z} from 'zod';

const BoundingBoxSchema = z.object({
  x: z.number().describe('The x-coordinate of the top-left corner.'),
  y: z.number().describe('The y-coordinate of the top-left corner.'),
  width: z.number().describe('The width of the bounding box.'),
  height: z.number().describe('The height of the bounding box.'),
});

const AadharLocationSchema = z.object({
  box: BoundingBoxSchema,
});
const AadharLocationsSchema = z.array(AadharLocationSchema);

export async function maskAadharInImage(
  input: MaskAadharInImageInput
): Promise<MaskAadharInImageOutput> {
  return maskAadharInImageFlow(input);
}

const locateAadharPrompt = ai.definePrompt({
  name: 'locateAadharPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: z.object({imageUri: z.string()})},
  output: {schema: AadharLocationsSchema},
  prompt: `You are an expert at finding Aadhar numbers in images. Find the bounding box of the full 12-digit Aadhar number in the image. The number is usually in the format XXXX XXXX XXXX. Provide the exact pixel coordinates (x, y, width, height) for the bounding box of the entire 12-digit number. If you do not find a number, return an empty array.
  
Image: {{media url=imageUri}}`,
});

const maskAadharInImageFlow = ai.defineFlow(
  {
    name: 'maskAadharInImageFlow',
    inputSchema: MaskAadharInImageInputSchema,
    outputSchema: MaskAadharInImageOutputSchema,
  },
  async input => {
    const {imageUri} = input;
    const {output} = await locateAadharPrompt({imageUri});

    if (!output || output.length === 0) {
      throw new Error(
        'Could not detect an Aadhar number in the provided image.'
      );
    }

    const imageBuffer = Buffer.from(
      imageUri.substring(imageUri.indexOf(',') + 1),
      'base64'
    );
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const composites = output.map(loc => {
      // Calculate width for the first 8 digits (2/3 of the total width)
      const maskedWidth = Math.round((loc.box.width / 12) * 8.5); // 8.5 to cover space

      // Add a small buffer to the mask to ensure full coverage vertically
      const bufferY = Math.round(loc.box.height * 0.1);
      const top = Math.max(0, Math.round(loc.box.y) - bufferY);
      const left = Math.round(loc.box.x);
      const height = Math.round(loc.box.height) + bufferY * 2;

      return {
        input: {
          create: {
            width: maskedWidth,
            height: height,
            channels: 4,
            background: {r: 0, g: 0, b: 0, alpha: 1},
          },
        },
        top: top,
        left: left,
      };
    });

    const maskedImageBuffer = await image
      .composite(composites)
      .toFormat(metadata.format || 'png')
      .toBuffer();

    const maskedImageUri = `data:image/${
      metadata.format || 'png'
    };base64,${maskedImageBuffer.toString('base64')}`;
    return {maskedImageUri};
  }
);
