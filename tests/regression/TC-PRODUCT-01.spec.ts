import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { ProductPage } from '../../pages/ProductPage';
import * as loginData from '../../test-data/loginData.json';
import * as productData from '../../test-data/productData.json';
import { handleFailureArtifacts } from '../../utils/failureHelper';
import { generateUniqueName } from '../../utils/testDataHelper';

test.describe('Regression - Product Creation', () => {
    test.describe.configure({ mode: 'serial' });
    let loginPage: LoginPage;
    let productPage: ProductPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        productPage = new ProductPage(page);
    });

    test.afterEach(async ({ page }, testInfo) => {
        await handleFailureArtifacts(page, testInfo, 'TC-PRODUCT-01');
    });

    test('TC-PRODUCT-01 Create a Product', async ({ page }, testInfo) => {
        const login = loginData.cloudPortal;
        const baseData = productData['TC-PRODUCT-01'];
        const data = {
            ...baseData,
            databaseAccessKey: "QfwOogbnlM3mUBZR62uZYiAb08kQZTD6lvoYnqxJfcmIlniQ0TmNXQhx6KmeX0BmRnjLsFf9Vo0JrKba8xzkAA==xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        };
        const uniqueProductName = generateUniqueName('TestProduct');

        await test.step('Step 1: Go to Products tab', async () => {
            await productPage.navigateToProducts(testInfo);
        });

        await test.step('Step 2: Initiate product creation', async () => {
            await productPage.clickAddProduct(testInfo);
        });

        await test.step('Step 3: Fill general product details', async () => {
            await productPage.enterGeneralDetails(
                uniqueProductName, 
                data.description, 
                'test-data/logo.svg', 
                testInfo
            );
        });

        await test.step('Step 4: Navigate to API Explorer', async () => {
            await productPage.navigateToApiExplorer(testInfo);
        });

        await test.step('Step 5: Add API to the product', async () => {
            await productPage.addApi(data.apiName, testInfo);
        });

        await test.step('Step 6: Configure API settings', async () => {
            await productPage.configureApiSettings(data.apiName, data, data.schema, testInfo);
        });

        await test.step('Step 7: Confirm and close product creation', async () => {
            await productPage.verifyCreationAndClose(uniqueProductName, testInfo);
        });

        await test.step('Step 8: Verify product in the list', async () => {
            await productPage.searchAndVerifyProduct(uniqueProductName, data.description, testInfo);
        });

        await test.step('Step 9: Open product card and verify details', async () => {
            await productPage.openProductCard(uniqueProductName);
            await productPage.verifyProductInfo(uniqueProductName, data.description, testInfo);
        });

        await test.step('Step 10: Verify API details and schema', async () => {
            await productPage.verifyApiDetails(data.apiName, data, testInfo);
            await productPage.verifySettingSchema(data.schema, testInfo);
        });
    });
});
