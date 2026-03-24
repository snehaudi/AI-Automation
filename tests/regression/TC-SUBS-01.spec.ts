import { test, expect } from '@playwright/test';
import { CustomerPage } from '../../pages/CustomerPage';
import { ProductPage } from '../../pages/ProductPage';
import { SubscriptionPage } from '../../pages/SubscriptionPage';
import { SubscriptionLocators } from '../../locators/SubscriptionLocators';
import { CustomerLocators } from '../../locators/CustomerLocators';
import * as subscriptionData from '../../test-data/subscriptionData.json';
import { handleFailureArtifacts } from '../../utils/failureHelper';
import { generateUniqueName } from '../../utils/testDataHelper';

test.describe('Regression - Subscription Cloud Portal', () => {
    test.describe.configure({ mode: 'serial' });
    let customerPage: CustomerPage;
    let productPage: ProductPage;
    let subscriptionPage: SubscriptionPage;

    test.beforeEach(async ({ page }) => {
        customerPage = new CustomerPage(page);
        productPage = new ProductPage(page);
        subscriptionPage = new SubscriptionPage(page);
    });

    test.afterEach(async ({ page }, testInfo) => {
        await handleFailureArtifacts(page, testInfo, 'TC-SUBS-01');
    });

    test('TC-SUBS-01 Create a Subscription', async ({ page }, testInfo) => {
        const stableCustomer = "TestCustomer_0002";
        const uniqueSubName = generateUniqueName('TestSub');
        const data = {
            ...subscriptionData.subscription,
            customerName: stableCustomer,
            subscriptionName: uniqueSubName
        };
        
        // Ensure we are on the base URL first if needed, though navigateToCustomers handles it
        await page.goto('https://addocloudplatformdemoapp2.azurewebsites.net/');

        await test.step('Step 1: Go to Customers tab', async () => {
            await customerPage.navigateToCustomers(testInfo);
        });

        await test.step('Step 2: Open customer details', async () => {
            // Using existing customer for subscription regression
            await customerPage.searchAndVerifyCustomer(data.customerName, "", "", "", testInfo);
            await customerPage.openCustomerCard(data.customerName);
            await expect(page.locator(SubscriptionLocators.subscriptionsTab)).toBeVisible({ timeout: 15000 });
        });

        await test.step('Step 3: Navigate to Subscriptions tab', async () => {
            await subscriptionPage.navigateToSubscriptionsTab(testInfo);
        });

        await test.step('Step 4: Initiate subscription creation', async () => {
            await subscriptionPage.clickAddSubscription(data.customerName, testInfo);
        });

        await test.step('Step 5: Fill subscription details', async () => {
            await subscriptionPage.fillSubscriptionDetails(data, testInfo);
        });

        await test.step('Step 6: Submit and confirm creation', async () => {
            await subscriptionPage.submitCreation(testInfo);
            await subscriptionPage.closePopup(testInfo);
        });

        await test.step('Step 7: Verify subscription in list', async () => {
            await page.reload();
            await page.waitForLoadState('networkidle');
            await subscriptionPage.navigateToSubscriptionsTab(testInfo);
            await subscriptionPage.verifySubscriptionInList(data.subscriptionName, testInfo);
        });

        await test.step('Step 8: Verify subscription card details', async () => {
            await subscriptionPage.openSubscriptionCard(data.subscriptionName);
            await subscriptionPage.verifySubscriptionDetails(data, testInfo);
        });

        await test.step('Step 9: Verify subscription in Product view', async () => {
            await productPage.navigateToProducts(testInfo);
            await page.locator('input[placeholder="Search"]').fill(data.product);
            await page.keyboard.press('Enter');
            await expect(page.locator(`strong:text-is("${data.product}")`).first()).toBeVisible({ timeout: 20000 });
            await page.click(`strong:text-is("${data.product}")`);
            await page.waitForLoadState('networkidle');
            await subscriptionPage.navigateToSubscriptionsTab(testInfo);
            await subscriptionPage.verifySubscriptionInProductList(data.subscriptionName, data.customerName, testInfo);
        });

        await test.step('Step 10: Verify subscription on Home dashboard', async () => {
            await subscriptionPage.navigateToHome();
            await subscriptionPage.verifySubscriptionInHome(data.customerName, data.subscriptionName, testInfo);
        });
    });
});
