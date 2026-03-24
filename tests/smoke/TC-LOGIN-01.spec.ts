import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import * as loginData from '../../test-data/loginData.json';
import { handleFailureArtifacts } from '../../utils/failureHelper';

test.describe('Smoke - Login Cloud Portal', () => {
    let loginPage: LoginPage;

    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
    });

    test.afterEach(async ({ page }, testInfo) => {
        await handleFailureArtifacts(page, testInfo, 'TC-LOGIN-01');
    });

    test('TC-LOGIN-01 Login with Skyforce Account', async ({ page }, testInfo) => {
        const data = loginData.cloudPortal;

        await test.step('Step 1: Open Cloud Portal URL', async () => {
            await loginPage.navigate(data.url);
        });

        await test.step('Step 2: Sign in with valid Skyforce credentials', async () => {
            await loginPage.login(data.username, data.password);
        });

        await test.step('Step 3: Verify home page and logged-in user', async () => {
            await loginPage.verifyHomePage(testInfo, data.expectedUser);
        });

        await test.step('Step 4: Save authenticated session state', async () => {
            await page.context().storageState({ path: 'storageState.json' });
        });
    });
});
