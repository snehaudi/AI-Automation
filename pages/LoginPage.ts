import { Page, expect, TestInfo, test } from '@playwright/test';
import { LoginLocators } from '../locators/LoginLocators';
import { captureSuccessScreenshot } from '../utils/screenshotHelper';

export class LoginPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigate(url: string) {
        await test.step(`Action: Navigate to the application URL: "${url}"`, async () => {
            await this.page.goto(url, { waitUntil: 'domcontentloaded' });
        });
    }

    async login(username: string, password: string) {
        // Wait for the login page to fully load
        await this.page.waitForLoadState('networkidle').catch(() => {});

        // Step 1: Handle account picker if shown
        await test.step('Action: Handle account picker if visible', async () => {
            const useAnother = this.page.locator(LoginLocators.useAnotherAccount).first();
            const emailInput = this.page.locator(LoginLocators.usernameInput);

            // Wait for either the account picker or the email input to appear
            await Promise.race([
                useAnother.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
                emailInput.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {})
            ]);

            if (await useAnother.isVisible().catch(() => false)) {
                await useAnother.click();
                console.log('Clicked "Use another account"');
                await this.page.waitForLoadState('networkidle').catch(() => {});
            } else {
                console.log('No account picker shown, proceeding...');
            }
        });

        // Step 2: Enter username
        await test.step(`Action: Enter username: ${username}`, async () => {
            const emailInput = this.page.locator(LoginLocators.usernameInput);
            await emailInput.waitFor({ state: 'visible', timeout: 15000 });
            console.log('Email input visible. Filling username...');

            await emailInput.click();
            await emailInput.fill(username);

            // Verify value was set
            const value = await emailInput.inputValue();
            console.log(`Email field value: "${value}"`);
            if (value !== username) {
                console.log('fill() did not work. Trying keyboard input...');
                await emailInput.clear();
                await emailInput.type(username, { delay: 50 });
            }

            // Click Next button
            const nextBtn = this.page.locator(LoginLocators.nextButton);
            await nextBtn.click();
            console.log('Clicked Next button');
            await this.page.waitForLoadState('networkidle').catch(() => {});
        });

        // Step 3: Enter password
        await test.step('Action: Enter password and sign in', async () => {
            const passwordInput = this.page.locator(LoginLocators.passwordInput);
            await passwordInput.waitFor({ state: 'visible', timeout: 15000 });
            console.log('Password input visible. Filling password...');

            await passwordInput.click();
            await passwordInput.fill(password);

            // Click Sign in button
            const signInBtn = this.page.locator(LoginLocators.signInButton);
            await signInBtn.click();
            console.log('Clicked Sign in button');
            await this.page.waitForLoadState('networkidle').catch(() => {});
        });

        // Step 4: Handle "Stay signed in?" prompt
        await test.step('Action: Handle "Stay signed in?" prompt', async () => {
            const staySignedInText = this.page.locator(LoginLocators.staySignedInPrompt);
            try {
                await staySignedInText.waitFor({ state: 'visible', timeout: 10000 });
                const yesBtn = this.page.locator(LoginLocators.staySignedInYes);
                await yesBtn.click();
                console.log('Clicked Yes on "Stay signed in?" prompt');
            } catch {
                console.log('No "Stay signed in?" prompt shown, continuing...');
            }
            await this.page.waitForLoadState('networkidle').catch(() => {});
        });

        // Step 5: Wait for app shell (Home page)
        await test.step('Action: Wait for Home page to be ready', async () => {
            await expect(
                this.page.getByRole('link', { name: 'Home' }).first()
            ).toBeVisible({ timeout: 30000 });
            console.log('Home page loaded successfully!');
        });
    }

    async verifyHomePage(testInfo: TestInfo, expectedUser: string) {
        const span1 = this.page.locator(LoginLocators.welcomeSpan1);
        const span2 = this.page.locator(LoginLocators.welcomeSpan2);

        await test.step('Action: Verify welcome message on Home Page', async () => {
            await expect(span1).toBeVisible({ timeout: 10000 });
            await expect(span1).toContainText('Welcome to');
            await expect(span2).toBeVisible({ timeout: 10000 });
            await expect(span2).toContainText('Addovation Cloud');
        });

        const expectedUserButton = this.page.getByRole('button', { name: expectedUser }).first();
        const loggedInUserFallback = this.page.locator(LoginLocators.loggedInUser).first();

        const userButtonVisible = await expectedUserButton.isVisible().catch(() => false);
        if (userButtonVisible) {
            await test.step(`Action: Confirm logged-in user: ${expectedUser}`, async () => {
                await expect(expectedUserButton).toBeVisible();
            });
        } else {
            const fallbackVisible = await loggedInUserFallback.isVisible().catch(() => false);
            if (fallbackVisible) {
                await test.step(`Action: Confirm logged-in user: ${expectedUser}`, async () => {
                    await expect(loggedInUserFallback).toContainText(expectedUser, { timeout: 10000 });
                });
            }
        }

        await captureSuccessScreenshot(this.page, testInfo, 'login-success-cloudportal');
    }
}
