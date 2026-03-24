import { test, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Moves and renames the failure video to the specified 'videos' folder.
 * @param page - Playwright page object
 * @param testInfo - Playwright test info
 * @param customName - Base name for the video file
 */
export async function handleFailureArtifacts(page: Page, testInfo: any, customName: string) {
    if (testInfo.status !== 'passed' && testInfo.status !== 'skipped') {
        const video = await page.video();
        if (video) {
            const videoPath = await video.path();
            const destinationDir = path.join(process.cwd(), 'videos');
            
            if (!fs.existsSync(destinationDir)) {
                fs.mkdirSync(destinationDir, { recursive: true });
            }

            const destinationPath = path.join(destinationDir, `${customName}-failed-${testInfo.project.name}.webm`);
            
            // Wait for video to finish saving
            await page.context().close();
            
            if (fs.existsSync(videoPath)) {
                fs.copyFileSync(videoPath, destinationPath);
                console.log(`Failure video saved to: ${destinationPath}`);
                await testInfo.attach('failure-video', { path: destinationPath, contentType: 'video/webm' });
            }
        }
    }
}
