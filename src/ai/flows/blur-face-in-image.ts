
'use server';

/**
 * @fileOverview A flow for detecting and blurring faces in an image.
 *
 * - blurFaceInImage - A function that handles blurring faces in an image.
 * - BlurFaceInImageInput - The input type for the blurFaceIn-Image function.
 * - BlurFaceInImageOutput - The return type for the blurFaceInImage function.
 */

import {ai} from '@/ai/genkit';
import {
  BlurFaceInImageInputSchema,
  BlurFaceInImageOutputSchema,
  type BlurFaceInImageInput,
  type BlurFaceInImageOutput,
} from '@/lib/types';
import sharp from 'sharp';
import {z} from 'zod';

const BoundingBoxSchema = z.object({
  x: z.number().describe('The x-coordinate of the top-left corner.'),
  y: z.number().describe('The y-coordinate of the top-left corner.'),
  width: z.number().describe('The width of the bounding box.'),
  height: z.number().describe('The height of the bounding box.'),
});

const FaceLocationsSchema = z.array(BoundingBoxSchema);

export async function blurFaceInImage(
  input: BlurFaceInImageInput
): Promise<BlurFaceInImageOutput> {
  return blurFaceInImageFlow(input);
}

const locateFacesPrompt = ai.definePrompt({
  name: 'locateFacesPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: z.object({imageUri: z.string()})},
  output: {schema: FaceLocationsSchema},
  prompt: `You are an expert at finding human faces in images. Find the bounding box of every face in the image. Provide the exact pixel coordinates (x, y, width, height) for each bounding box, ensuring the box covers the entire face. If you do not find any faces, return an empty array.
  
Image: {{media url=imageUri}}`,
});

const blurFaceInImageFlow = ai.defineFlow(
  {
    name: 'blurFaceInImageFlow',
    inputSchema: BlurFaceInImageInputSchema,
    outputSchema: BlurFaceInImageOutputSchema,
  },
  async input => {
    const {imageUri} = input;
    const {output: faceLocations} = await locateFacesPrompt({imageUri});

    if (!faceLocations || faceLocations.length === 0) {
      return {
        blurredImageUri: imageUri,
        faceCount: 0,
      };
    }

    const imageBuffer = Buffer.from(
      imageUri.substring(imageUri.indexOf(',') + 1),
      'base64'
    );
    let image = sharp(imageBuffer);

    // To prevent issues with compositing on formats without alpha, convert to png first
    const pngImageBuffer = await image.png().toBuffer();
    image = sharp(pngImageBuffer);

    const composites = await Promise.all(
      faceLocations.map(async loc => {
        const region = {
          left: Math.round(loc.x),
          top: Math.round(loc.y),
          width: Math.round(loc.width),
          height: Math.round(loc.height),
        };

        // Extract the face region and blur it
        const blurredFaceBuffer = await image
          .clone()
          .extract(region)
          .blur(50) 
          .toBuffer();

        // Create a circular/elliptical mask
        const rx = region.width / 2;
        const ry = region.height / 2;
        const ellipseSvg = `<svg><ellipse cx="${rx}" cy="${ry}" rx="${rx}" ry="${ry}"/></svg>`;
        const maskBuffer = Buffer.from(ellipseSvg);
        
        // Composite the blurred face with the circular mask
        const maskedBlurredFace = await sharp(blurredFaceBuffer)
          .composite([
            {
              input: maskBuffer,
              blend: 'in', // This applies the mask, keeping only the elliptical part of the blurred face
            },
          ])
          .png() // Ensure output is PNG to support transparency
          .toBuffer();
        
        return {
          input: maskedBlurredFace,
          top: region.top,
          left: region.left,
        };
      })
    );

    const blurredImageBuffer = await image
      .composite(composites)
      .toBuffer();

    const blurredImageUri = `data:image/png;base64,${blurredImageBuffer.toString(
      'base64'
    )}`;
    return {
      blurredImageUri,
      faceCount: faceLocations.length,
    };
  }
);
