import { Page, TestInfo } from '@playwright/test';
import * as path from 'path';

/**
 * Captures a success screenshot for important validation steps and attaches it to the HTML report.
 * @param page - Playwright page object
 * @param testInfo - Playwright test info for report attachment
 * @param fileName - Base name for the screenshot file
 */
export async function captureSuccessScreenshot(page: Page, testInfo: TestInfo, fileName: string) {
    const screenshotName = `${fileName}-${Date.now()}.png`;
    const screenshotPath = path.join('screenshots', screenshotName);
    
    // Capture the screenshot as a buffer for embedding
    const screenshotBuffer = await page.screenshot();
    
    // Attach the screenshot buffer directly to the Playwright HTML report (Base64 embedding)
    await testInfo.attach(fileName, {
        body: screenshotBuffer,
        contentType: 'image/png',
    });

    console.log(`Success screenshot captured and embedded in report: ${fileName}`);
}
