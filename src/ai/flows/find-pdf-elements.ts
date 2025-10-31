
'use server';

/**
 * @fileOverview An AI flow for finding all text and image elements in a PDF for editing.
 *
 * - findPdfElements - A function that returns the locations of text and images.
 * - FindPdfElementsInput - The input type for the flow.
 * - FindPdfElementsOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { FindPdfElementsInput, FindPdfElementsOutput } from '@/lib/types';


const BoundingBoxSchema = z.object({
  x: z.number().describe("The x-coordinate of the element's top-left corner.").optional(),
  y: z.number().describe("The y-coordinate of the element's top-left corner.").optional(),
  width: z.number().describe('The width of the element.').optional(),
  height: z.number().describe('The height of the element.').optional(),
});

const PdfElementSchema = z.object({
    type: z.enum(['text', 'image']).describe("The type of the element."),
    pageIndex: z.number().int().min(0).describe("The 0-based index of the page the element is on."),
    box: BoundingBoxSchema,
    content: z.string().describe("The text content, or for images, the base64 encoded image data."),
    text: z.string().optional().describe("The text content, if the element is of type 'text'."),
});

const findPdfElementsPrompt = ai.definePrompt({
  name: 'findPdfElementsPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { schema: z.object({ imageUri: z.string(), language: z.string().optional() }) },
  output: { schema: z.array(z.object({
      box: BoundingBoxSchema.optional(),
      text: z.string().describe("The OCR-detected text content.").optional(),
  })) },
  prompt: `You are an expert OCR system. Analyze the provided image of a document page in the specified language: {{{language}}}. Identify all text blocks. For each text block, provide its bounding box (x, y, width, height) and the exact text content. The origin (0,0) is the top-left corner of the page.
  
  Image: {{media url=imageUri}}`,
});

export async function findPdfElements(
  input: FindPdfElementsInput
): Promise<FindPdfElementsOutput> {
  
    const { imageUri, pageHeight, pageWidth, language } = input;
    
    if (!imageUri) {
        throw new Error("No image data provided for analysis.");
    }
    
    const { output: textElements } = await findPdfElementsPrompt({ imageUri, language: language || 'English' });

    if (!textElements) {
      throw new Error("AI model failed to detect any text elements in the PDF.");
    }
    
    // Filter out invalid elements that the model might have returned
    const validTextElements = textElements.filter(el => 
        el.text && el.box && el.box.x != null && el.box.y != null && el.box.width != null && el.box.height != null
    );

    // Add pageIndex and type to all returned elements
    const elementsWithMeta = validTextElements.map(el => ({ 
        ...el, 
        pageIndex: 0, 
        type: 'text' as const, 
        content: el.text!,
        box: el.box!
    }));
    
    const pageImageElement = {
        type: 'image' as const,
        pageIndex: 0,
        box: {x: 0, y: 0, width: pageWidth, height: pageHeight },
        content: imageUri.split(',')[1], // Just the base64 data
        text: 'Page Background'
    }

    return {
        elements: [...elementsWithMeta, pageImageElement],
        pageWidth: pageWidth,
        pageHeight: pageHeight,
    };
}
