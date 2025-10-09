
'use server';

import type { GetWebsiteScreenshotInput, GetWebsiteScreenshotOutput } from '@/lib/types';
import puppeteer from 'puppeteer';

export async function getWebsiteScreenshot(
  input: GetWebsiteScreenshotInput
): Promise<GetWebsiteScreenshotOutput> {
  const { url } = input;
  let browser = null;

  try {
    browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle2' });

    const screenshotBuffer = await page.screenshot({ type: 'png' });
    const screenshotUri = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
    
    return { screenshotUri };

  } catch (error: any) {
    console.error("Failed to capture website screenshot:", error);
    throw new Error(`Could not take a screenshot of the URL. Reason: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

    