import { test, expect, Page, TestInfo } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';
import { CustomerPage } from '../pages/CustomerPage';
import { UserPage } from '../pages/UserPage';
import { SubscriptionPage } from '../pages/SubscriptionPage';

export async function runLoginFlow(page: Page, testInfo: TestInfo, data: any) {
    const loginPage = new LoginPage(page);
    
    await test.step('Step 1: Open the Cloud Portal Application', async () => {
        await loginPage.navigate(data.url);
    });

    await test.step('Step 2: Authenticate with valid Skyforce credentials', async () => {
        await loginPage.login(data.username, data.password);
    });

    await test.step('Step 3: Verify successful login and home page dashboard display', async () => {
        await loginPage.verifyHomePage(testInfo, data.expectedUser);
    });

    await test.step('Step 4: Securely save the authenticated session for subsequent operations', async () => {
        await page.context().storageState({ path: 'storageState.json' });
    });
}

export async function runProductCreationFlow(page: Page, testInfo: TestInfo, data: any) {
    const productPage = new ProductPage(page);
    
    await test.step('Step 1: Navigate to the Products administration area', async () => {
        await productPage.navigateToProducts(testInfo);
    });

    await test.step('Step 2: Ensure a clean environment by removing any existing product with the same name', async () => {
        await productPage.deleteProductIfExists(data.productName, testInfo);
    });

    await test.step('Step 3: Start new product creation and provide general details and branding', async () => {
        await productPage.clickAddProduct(testInfo);
        await productPage.enterGeneralDetails(data.productName, data.description, 'test-data/logo.svg', testInfo);
    });

    await test.step('Step 4: Select and associate the required API from the API Explorer', async () => {
        await productPage.navigateToApiExplorer(testInfo);
        await productPage.addApi(data.apiName, testInfo);
    });

    await test.step('Step 5: Configure API Database connectivity and Settings Schema', async () => {
        await productPage.configureApiSettings(data.apiName, data, data.schema, testInfo);
    });

    await test.step('Step 6: Finalize the creation process and confirm product registration', async () => {
        await productPage.verifyCreationAndClose(data.productName, testInfo);
    });

    await test.step('Step 7: Search for the newly created product in the global product list', async () => {
        await productPage.searchAndVerifyProduct(data.productName, data.description, testInfo);
    });

    await test.step('Step 8: Open the product details and verify general information', async () => {
        await productPage.openProductCard(data.productName);
        await productPage.verifyProductInfo(data.productName, data.description, testInfo);
    });

    await test.step('Step 9: Verify configured API details and settings schema integrity', async () => {
        await productPage.verifyApiDetails(data.apiName, data, testInfo);
        await productPage.verifySettingSchema(data.schema, testInfo);
    });
}

export async function runCustomerCreationFlow(page: Page, testInfo: TestInfo, customer: any) {
    const customerPage = new CustomerPage(page);
    
    await test.step('Step 1: Access the Customers management section', async () => {
        await customerPage.navigateToCustomers(testInfo);
    });

    await test.step('Step 2: Initiate the creation of a new customer profile', async () => {
        await customerPage.clickCreateNewCustomer(testInfo);
    });

    await test.step('Step 3: Provide comprehensive Customer and Tenant configuration details', async () => {
        await customerPage.fillCustomerDetails(customer, testInfo);
    });

    await test.step('Step 4: Submit and confirm the customer creation request', async () => {
        await customerPage.submitCreation(testInfo);
    });

    await test.step('Step 5: Locate and verify the new customer in the searchable customer directory', async () => {
        await customerPage.searchAndVerifyCustomer(customer.name, customer.keyAccountManager, customer.kamPhone, customer.logoImageUrl, testInfo);
    });

    await test.step('Step 6: Open the customer profile to verify Overview and Tenant mappings', async () => {
        await customerPage.openCustomerCard(customer.name);
        await customerPage.verifyCustomerOverview(customer, testInfo);
        await customerPage.verifyTenants(customer.tenantId, customer.tenantDomain, testInfo);
    });
}

export async function runUserCreationFlow(page: Page, testInfo: TestInfo, user: any, customerName: string, expectedTenant: string) {
    const userPage = new UserPage(page);
    const customerPage = new CustomerPage(page);
    const targetCustomerName = user.customerName ?? customerName;

    await test.step('Step 1: Access the User Management tab for the target Customer', async () => {
        await customerPage.navigateToCustomers(testInfo);
        await customerPage.searchAndVerifyCustomer(targetCustomerName, '', '', '', testInfo);
        await customerPage.openCustomerCard(targetCustomerName);
        await userPage.navigateToUsersTab(testInfo);
    });

    await test.step('Step 2: Create a new User account and submit registration', async () => {
        await userPage.openFillAndSubmitUser(user, targetCustomerName, testInfo);
    });

    await test.step('Step 3: Verify the User is correctly listed in the Customer\'s user directory', async () => {
        await userPage.refreshUsersPage(testInfo);
        await userPage.verifyUserInList(user, expectedTenant, testInfo);
    });

    await test.step('Step 4: Validate the User account presence in Global Administration', async () => {
        await userPage.navigateToAdministration(testInfo);
        await userPage.verifyUserInAdministration(user, expectedTenant, testInfo);
    });
}

export async function runSubscriptionCreationFlow(page: Page, testInfo: TestInfo, data: any) {
    const customerPage = new CustomerPage(page);
    const productPage = new ProductPage(page);
    const subscriptionPage = new SubscriptionPage(page);

    await test.step('Step 1: Access the Subscriptions area for the selected Customer', async () => {
        await customerPage.navigateToCustomers(testInfo);
        await customerPage.searchAndVerifyCustomer(data.customerName, 'John Test', '123456', '', testInfo);
        await customerPage.openCustomerCard(data.customerName);
        await subscriptionPage.navigateToSubscriptionsTab(testInfo);
    });

    await test.step('Step 2: Create and configure a new Subscription for the Customer', async () => {
        await subscriptionPage.deleteSubscriptionIfExists(data.subscriptionName, testInfo);
        await subscriptionPage.clickAddSubscription(data.customerName, testInfo);
        await subscriptionPage.fillSubscriptionDetails(data, testInfo);
        await subscriptionPage.submitCreation(testInfo);
        await subscriptionPage.closePopup(testInfo);
    });

    await test.step('Step 3: Verify the new Subscription within the Customer\'s profile view', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        await subscriptionPage.navigateToSubscriptionsTab(testInfo);
        await subscriptionPage.verifySubscriptionInList(data.subscriptionName, testInfo);
        await subscriptionPage.openSubscriptionCard(data.subscriptionName);
        await subscriptionPage.verifySubscriptionDetails(data, testInfo);
    });

    await test.step('Step 4: Verify Subscription cross-reference within the Product\'s view', async () => {
        await productPage.navigateToProducts(testInfo);
        
        await test.step(`Action: Locate and open product: ${data.product}`, async () => {
            await page.locator('input[placeholder="Search"]').fill(data.product);
            await page.keyboard.press('Enter');
            await expect(page.locator(`strong:text-is("${data.product}")`).first()).toBeVisible({ timeout: 20000 });
            await page.click(`strong:text-is("${data.product}")`);
            await page.waitForLoadState('networkidle');
        });

        await subscriptionPage.navigateToSubscriptionsTab(testInfo);
        await subscriptionPage.verifySubscriptionInProductList(data.subscriptionName, data.customerName, testInfo);
    });

    await test.step('Step 5: Verify the Subscription status on the Home Dashboard', async () => {
        await subscriptionPage.navigateToHome();
        await subscriptionPage.verifySubscriptionInHome(data.customerName, data.subscriptionName, testInfo);
    });
}
