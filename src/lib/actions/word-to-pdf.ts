
'use server';

import type { WordToPdfInput, WordToPdfOutput } from '@/lib/types';
import puppeteer from 'puppeteer';

export async function wordToPdf(
  input: WordToPdfInput
): Promise<WordToPdfOutput> {
  const { htmlContent } = input;
  let browser = null;

  try {
    browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // The HTML from docx-preview contains all the necessary styles inline
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
    });
    
    const pdfUri = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
    
    return { pdfUri };

  } catch (error: any) {
    console.error("Failed to convert HTML to PDF:", error);
    throw new Error(`Could not convert the document. Reason: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
