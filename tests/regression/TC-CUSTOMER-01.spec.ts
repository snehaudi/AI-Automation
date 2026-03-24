import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { CustomerPage } from '../../pages/CustomerPage';
import * as loginData from '../../test-data/loginData.json';
import * as customerData from '../../test-data/customerData.json';
import { handleFailureArtifacts } from '../../utils/failureHelper';
import { generateUniqueName, generateUUID } from '../../utils/testDataHelper';

test.describe('Regression - Customer Cloud Portal', () => {
    test.describe.configure({ mode: 'serial' });
    let loginPage: LoginPage;
    let customerPage: CustomerPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        customerPage = new CustomerPage(page);
    });

    test.afterEach(async ({ page }, testInfo) => {
        await handleFailureArtifacts(page, testInfo, 'TC-CUSTOMER-01');
    });

    test('TC-CUSTOMER-01 Create a Customer', async ({ page }, testInfo) => {
        const login = loginData.cloudPortal;
        const uniqueName = generateUniqueName('TestCustomer');
        
        const customer = {
            ...customerData.customer,
            name: uniqueName,
            referenceId: generateUniqueName('REF')
        };

        // Test Steps:
        await test.step('Step 1: Go to Customers tab', async () => {
            await customerPage.navigateToCustomers(testInfo);
        });

        await test.step('Step 2: Initiate customer creation', async () => {
            await customerPage.clickCreateNewCustomer(testInfo);
        });

        await test.step('Step 3: Fill customer and tenant information', async () => {
            await customerPage.fillCustomerDetails(customer, testInfo);
        });

        await test.step('Step 4: Submit and confirm creation', async () => {
            await customerPage.submitCreation(testInfo);
        });

        await test.step('Step 5: Verify customer in search list', async () => {
            await customerPage.searchAndVerifyCustomer(customer.name, customer.keyAccountManager, customer.kamPhone, customer.logoImageUrl, testInfo);
        });

        await test.step('Step 6: Verify customer overview details', async () => {
            await customerPage.openCustomerCard(customer.name);
            await customerPage.verifyCustomerOverview(customer, testInfo);
        });

        await test.step('Step 7: Verify tenant information', async () => {
            await customerPage.verifyTenants(customer.tenantId, customer.tenantDomain, testInfo);
        });
    });
});
