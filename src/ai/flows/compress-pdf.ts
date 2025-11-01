
'use server';

/**
 * @fileOverview A flow for compressing a PDF document by rebuilding it from compressed images.
 *
 * - compressPdf - Compresses a single PDF file.
 * - CompressPdfInput - The input type for the compressPdf function.
 * - CompressPdfOutput - The return type for the compressPdf function.
 */

import { ai } from '@/ai/genkit';
import {
  CompressPdfInputSchema,
  CompressPdfOutputSchema,
  type CompressPdfInput,
  type CompressPdfOutput,
} from '@/lib/types';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import sharp from 'sharp';

// It's recommended to host this worker file yourself
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

async function convertPdfToImages(pdfBuffer: Buffer): Promise<Buffer[]> {
    const images: Buffer[] = [];
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const pngDataUrl = canvas.toDataURL('image/png');
            images.push(Buffer.from(pngDataUrl.split(',')[1], 'base64'));
        }
    }
    return images;
}

async function compressImage(imageBuffer: Buffer): Promise<Buffer> {
    return sharp(imageBuffer)
        .jpeg({ quality: 75, mozjpeg: true }) // Aggressive JPEG compression
        .toBuffer();
}

const compressPdfFlow = ai.defineFlow(
  {
    name: 'compressPdfFlow',
    inputSchema: CompressPdfInputSchema,
    outputSchema: CompressPdfOutputSchema,
  },
  async (input) => {
    const originalBuffer = Buffer.from(
      input.pdfUri.substring(input.pdfUri.indexOf(',') + 1),
      'base64'
    );
    const originalSize = originalBuffer.length;
    
    // 1. Convert PDF pages to images
    const pageImages = await convertPdfToImages(originalBuffer);
    if (pageImages.length === 0) {
        throw new Error("Could not extract any pages from the PDF.");
    }

    // 2. Compress each image
    const compressedImages = await Promise.all(pageImages.map(compressImage));

    // 3. Rebuild the PDF from the compressed images
    const newPdfDoc = await PDFDocument.create();
    for (const imgBuffer of compressedImages) {
        const jpgImage = await newPdfDoc.embedJpg(imgBuffer);
        const page = newPdfDoc.addPage([jpgImage.width, jpgImage.height]);
        page.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: jpgImage.width,
            height: jpgImage.height,
        });
    }
    
    const compressedPdfBytes = await newPdfDoc.save();
    const compressedBuffer = Buffer.from(compressedPdfBytes);
    const compressedUri = `data:application/pdf;base64,${compressedBuffer.toString('base64')}`;

    return {
      compressedPdfUri: compressedUri,
      originalSize,
      compressedSize: compressedBuffer.length,
    };
  }
);


export async function compressPdf(
  input: CompressPdfInput
): Promise<CompressPdfOutput> {
  // This is a complex flow that runs client-side logic, 
  // so we won't wrap it in a flow and call it directly from the client.
  // The client will orchestrate the steps. This file is not directly used
  // but kept for reference and potential future server-side implementation.
  // The actual logic is now implemented on the client page.
  throw new Error("This flow is not meant to be called directly from the server. See /app/compress-pdf/page.tsx for implementation.");
}
