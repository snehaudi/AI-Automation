import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { CustomerPage } from '../../pages/CustomerPage';
import { UserPage } from '../../pages/UserPage';
import * as loginData from '../../test-data/loginData.json';
import * as customerData from '../../test-data/customerData.json';
import * as userData from '../../test-data/userData.json';
import { handleFailureArtifacts } from '../../utils/failureHelper';
import { generateUniqueName } from '../../utils/testDataHelper';

test.describe('Regression - User Creation', () => {
    test.describe.configure({ mode: 'serial' });
    let loginPage: LoginPage;
    let customerPage: CustomerPage;
    let userPage: UserPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        customerPage = new CustomerPage(page);
        userPage = new UserPage(page);
    });

    test.afterEach(async ({ page }, testInfo) => {
        await handleFailureArtifacts(page, testInfo, 'TC-USER-01');
    });

    test('TC-USER-01 Create a User for Customer', async ({ page }, testInfo) => {
        const baseUser = userData['TC-USER-01'];
        const uniqueSuffix = Date.now();
        const user = {
            ...baseUser,
            name: generateUniqueName('TestUser'),
            account: `user_${uniqueSuffix}@skyforce.no`,
            email: `user_${uniqueSuffix}@skyforce.no`
        };
        
        const customerName = "TestCustomer_0002"; // Using a stable regression customer
        const expectedTenant = "skyforce.no";

        // Step 1: Navigate to the "Customers" tab
        await test.step('Step 1: Navigate to the "Customers" tab', async () => {
            await customerPage.navigateToCustomers(testInfo);
        });

        // Step 2 & 3: Search the customer and Open customer card
        await test.step('Step 2 & 3: Search the customer and Open customer card', async () => {
            await customerPage.searchAndVerifyCustomer(customerName, '', '', '', testInfo);
            await customerPage.openCustomerCard(customerName);
        });

        // Step 4: Navigate to the "Users" tab
        await test.step('Step 4: Navigate to the "Users" tab', async () => {
            await userPage.navigateToUsersTab(testInfo);
        });

        // Steps 5 to 13: Open popup, fill all details, and submit in one uninterrupted flow
        await test.step('Step 5 to 13: Open Create User popup, enter details, and submit', async () => {
            await userPage.openFillAndSubmitUser(user, customerName, testInfo);
        });

        await test.step('Step 14: Refresh Users page after creation', async () => {
            await userPage.refreshUsersPage(testInfo);
        });

        // Step 15: Verify the created user appears in the Users list
        await test.step('Step 15: Verify user in Users list', async () => {
            await userPage.verifyUserInList(user, expectedTenant, testInfo);
        });

        // Step 16: Navigate to the "Administration" tab
        await test.step('Step 16: Navigate to the "Administration" tab', async () => {
            await userPage.navigateToAdministration(testInfo);
        });

        // Step 17: Search and Verify the created user in Administration list
        await test.step('Step 17: Verify user in Administration list', async () => {
            await userPage.verifyUserInAdministration(user, expectedTenant, testInfo);
        });
    });
});
