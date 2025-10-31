
'use server';

import {PDFDocument, PageSizes} from 'pdf-lib';
import type {
  ConvertImagesToPdfInput,
  ConvertImagesToPdfOutput,
} from '@/lib/types';
import sharp from 'sharp';

/**
 * @fileOverview A flow for converting images to a PDF document.
 *
 * - convertImagesToPdf - Converts a list of image data URIs to a single PDF.
 */

export async function convertImagesToPdf(
  input: ConvertImagesToPdfInput
): Promise<ConvertImagesToPdfOutput> {
    const pdfDoc = await PDFDocument.create();

    for (const imageUri of input.imageUris) {
      try {
        let imageBytes = Buffer.from(
          imageUri.substring(imageUri.indexOf(',') + 1),
          'base64'
        );

        let image;
        
        if (imageUri.startsWith('data:image/webp')) {
          // Convert WEBP to PNG using sharp
          const pngBuffer = await sharp(imageBytes).png().toBuffer();
          image = await pdfDoc.embedPng(pngBuffer);
        } else if (imageUri.startsWith('data:image/png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (
          imageUri.startsWith('data:image/jpeg') ||
          imageUri.startsWith('data:image/jpg')
        ) {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          console.warn(
            `Unsupported image type for: ${imageUri.substring(
              0,
              30
            )}... Skipping.`
          );
          continue;
        }
        
        const page = pdfDoc.addPage(PageSizes.A4);
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        const imageDims = image.scaleToFit(pageWidth, pageHeight);

        page.drawImage(image, {
          x: (pageWidth - imageDims.width) / 2,
          y: (pageHeight - imageDims.height) / 2,
          width: imageDims.width,
          height: imageDims.height,
        });

      } catch (e) {
        console.error(`Failed to process an image: ${e}`);
        continue;
      }
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    const pdfUri = `data:application/pdf;base64,${pdfBase64}`;

    return {pdfUri};
}
