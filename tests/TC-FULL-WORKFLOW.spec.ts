import { test, Page } from '@playwright/test';
import { runLoginFlow, runProductCreationFlow, runCustomerCreationFlow, runSubscriptionCreationFlow, runUserCreationFlow } from './reusable-steps';
import * as loginData from '../test-data/loginData.json';
import * as productData from '../test-data/productData.json';
import * as customerData from '../test-data/customerData.json';
import * as subscriptionData from '../test-data/subscriptionData.json';
import * as userData from '../test-data/userData.json';
import { handleFailureArtifacts } from '../utils/failureHelper';

test.describe('Regression - Full Workflow (Independent)', () => {
    // Using serial mode for the combined workflow file to share the same browser state
    test.describe.configure({ mode: 'serial' });
    test.setTimeout(600000);

    // Force this test file to NOT use the global storageState from playwright.config.ts
    // This ensures the Microsoft login UI is always included in the run.
    test.use({ storageState: { cookies: [], origins: [] } });

    let sharedPage: Page;

    // Stable data for tests that require existing entities
    const STABLE_CUSTOMER = "TestCustomer_0002";
    const STABLE_PRODUCT = "TestProduct_001";
    const STABLE_TENANT = "skyforce.no";

    // Helper to generate unique identifiers for creation tests
    const getUniqueId = () => Date.now() + Math.floor(Math.random() * 1000);

    test.beforeAll(async ({ browser }, testInfo) => {
        // Create a completely clean context to ensure Microsoft login UI is triggered
        const context = await browser.newContext({ storageState: undefined });
        sharedPage = await context.newPage();
        
        // Authenticate once at the beginning of the suite using the full UI flow
        await runLoginFlow(sharedPage, testInfo, loginData.cloudPortal);
    });

    test.afterAll(async () => {
        if (sharedPage) {
            await sharedPage.close();
        }
    });

    test.afterEach(async ({}, testInfo) => {
        // Use the sharedPage for failure artifacts
        await handleFailureArtifacts(sharedPage, testInfo, 'TC-FULL-WORKFLOW');
    });

    test('TC-WF-01 Login with Skyforce Account', async ({}, testInfo) => {
        // The beforeAll handles the login; this test confirms the entry point is valid.
        const page = sharedPage;
        await test.step('Action: Verify Home Page welcome message', async () => {
            const loginPage = new (require('../pages/LoginPage').LoginPage)(page);
            await loginPage.verifyHomePage(testInfo, loginData.cloudPortal.expectedUser);
        });
    });

    test('TC-WF-02 Create a Product', async ({}, testInfo) => {
        const page = sharedPage;
        const id = getUniqueId();
        const product = {
            ...productData['TC-PRODUCT-01'],
            productName: `Product_WF_${id}`
        };
        await runProductCreationFlow(page, testInfo, product);
    });

    test('TC-WF-03 Create a Customer', async ({}, testInfo) => {
        const page = sharedPage;
        const id = getUniqueId();
        const customer = {
            ...customerData.customer,
            name: `Customer_WF_${id}`
        };
        await runCustomerCreationFlow(page, testInfo, customer);
    });

    test('TC-WF-04 Create a Subscription', async ({}, testInfo) => {
        const page = sharedPage;
        const id = getUniqueId();
        const subscription = {
            ...subscriptionData.subscription,
            customerName: STABLE_CUSTOMER,
            subscriptionName: `Sub_WF_${id}`,
            product: STABLE_PRODUCT,
            tenant: STABLE_TENANT
        };
        // This test uses a stable product to focus on the subscription lifecycle
        await runSubscriptionCreationFlow(page, testInfo, subscription);
    });

    test('TC-WF-05 Create a User for Customer', async ({}, testInfo) => {
        const page = sharedPage;
        const id = getUniqueId();
        const user = {
            ...userData['TC-USER-01'],
            name: `User_WF_${id}`,
            account: `user_wf_${id}@skyforce.no`,
            email: `user_wf_${id}@skyforce.no`
        };
        // This test uses a stable customer to focus on user provisioning
        await runUserCreationFlow(page, testInfo, user, STABLE_CUSTOMER, STABLE_TENANT);
    });
});
