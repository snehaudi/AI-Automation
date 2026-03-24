import { Page, expect, TestInfo, test } from '@playwright/test';
import { ProductLocators } from '../locators/ProductLocators';
import { captureSuccessScreenshot } from '../utils/screenshotHelper';
import * as path from 'path';

export class ProductPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToProducts(testInfo: TestInfo) {
        await test.step('Action: Open the Products administration section from the navigation menu', async () => {
            const productsBtn = this.page.locator(ProductLocators.productsTab);
            if (await productsBtn.isVisible()) {
                await productsBtn.click();
            } else {
                await this.page.goto('https://addocloudplatformdemoapp2.azurewebsites.net/#products');
            }
            
            await this.waitForLoading();

            await expect(productsBtn).toHaveAttribute('aria-pressed', 'true', { timeout: 10000 });
            await captureSuccessScreenshot(this.page, testInfo, 'products-tab-highlighted');
        });
    }

    private async waitForLoading() {
        await test.step('Action: Wait for the interface to finish loading data', async () => {
            try {
                const loader = this.page.locator(ProductLocators.loadingIndicator);
                await expect(loader).toBeHidden({ timeout: 30000 });
            } catch (e) {
                console.log("Loading indicator did not disappear within timeout or wasn't present.");
            }
        });
    }

    async clickAddProduct(testInfo: TestInfo) {
        await test.step('Action: Click the "Add new product" button to open the creation dialog', async () => {
            console.log('Clicking "Add new product" button...');
            await this.page.click(ProductLocators.addNewProductBtn);

            console.log('Waiting for "Create New Product" header...');
            const header = this.page.locator(ProductLocators.createNewProductHeader);
            await expect(header).toBeVisible({ timeout: 45000 });
            await expect(header).toHaveText('Create New Product');
            await captureSuccessScreenshot(this.page, testInfo, 'create-product-popup-displayed');
        });
    }

    async enterGeneralDetails(name: string, description: string, logoPath: string, testInfo: TestInfo) {
        await test.step(`Action: Enter general product information: "${name}"`, async () => {
            await this.page.fill(ProductLocators.nameInput, name);
            await this.page.fill(ProductLocators.descriptionInput, description);
            
            const fullLogoPath = path.resolve(logoPath);
            await this.page.setInputFiles(ProductLocators.uploadLogoInput, fullLogoPath);
            
            await this.page.check(ProductLocators.publishedCheckbox);

            await captureSuccessScreenshot(this.page, testInfo, 'general-details-entered');
            await this.page.click(ProductLocators.nextBtn);
        });
    }

    async navigateToApiExplorer(testInfo: TestInfo) {
        await test.step('Action: Navigate to the API Explorer tab to select available APIs', async () => {
            await this.page.click(ProductLocators.nextBtn);
            await this.page.click(ProductLocators.apiExplorerTab);
            await captureSuccessScreenshot(this.page, testInfo, 'api-explorer-tab-navigated');
        });
    }

    async addApi(apiName: string, testInfo: TestInfo) {
        await test.step(`Action: Add the selected API "${apiName}" to the product configuration`, async () => {
            await this.page.click(ProductLocators.addApiBtn(apiName));
            
            await this.page.click(ProductLocators.productApisTab);
            await expect(this.page.locator(`text=${apiName}`)).toBeVisible();
            await captureSuccessScreenshot(this.page, testInfo, 'api-added-to-product');

            await this.page.click(ProductLocators.nextBtn);
        });
    }

    async configureApiSettings(apiName: string, dbData: any, schema: any, testInfo: TestInfo) {
        await test.step(`Action: Configure Database and Schema settings for API: "${apiName}"`, async () => {
            await this.page.click(ProductLocators.apiSelectCombobox);
            await this.page.click(ProductLocators.apiOption(apiName));
            
            await this.page.click(ProductLocators.plusIconAddSetting);
            await this.page.click(ProductLocators.setting1Btn);
            
            await this.page.fill(ProductLocators.databaseNameInput, dbData.databaseName);
            await this.page.fill(ProductLocators.databaseUriInput, dbData.databaseUri);
            await this.page.fill(ProductLocators.databaseContainerInput, dbData.databaseContainer);
            await this.page.fill(ProductLocators.databaseAccessKeyInput, dbData.databaseAccessKey);
            
            await this.page.fill(ProductLocators.settingsSchemaInput, JSON.stringify(schema, null, 2));
            
            await captureSuccessScreenshot(this.page, testInfo, 'api-settings-configured');
            await this.page.click(ProductLocators.saveBtn);
        });
    }

    async verifyCreationAndClose(productName: string, testInfo: TestInfo) {
        await test.step('Action: Confirm successful product registration and close the creation wizard', async () => {
            const doneProductName = this.page.locator(ProductLocators.productNameInDoneWindow(productName));
            await expect(doneProductName).toBeVisible({ timeout: 60000 });
            await captureSuccessScreenshot(this.page, testInfo, 'product-creation-done-validation');

            await this.page.click(ProductLocators.closeBtn);
        });
    }

    async searchAndVerifyProduct(productName: string, description: string, testInfo: TestInfo) {
        await test.step(`Action: Search for product "${productName}" and verify its presence in the list`, async () => {
            await this.page.fill(ProductLocators.searchInput, productName);
            await this.page.press(ProductLocators.searchInput, 'Enter');
            
            const card = this.page.locator(ProductLocators.productCard(productName));
            await expect(card).toBeVisible();
            
            const desc = this.page.locator(ProductLocators.productDescriptionInCard(productName));
            await expect(desc).toHaveText(description);
            
            const published = this.page.locator(ProductLocators.publishedBadge(productName));
            await expect(published).toBeVisible();
            
            await captureSuccessScreenshot(this.page, testInfo, 'product-verified-in-list');
        });
    }

    async openProductCard(productName: string) {
        await test.step(`Action: Open the details card for product: "${productName}"`, async () => {
            await this.page.click(ProductLocators.productCard(productName));
        });
    }

    async verifyProductInfo(name: string, description: string, testInfo: TestInfo) {
        await test.step(`Action: Verify general product information for: "${name}"`, async () => {
            await expect(this.page.locator(ProductLocators.productInfoName)).toHaveText(name);
            await expect(this.page.locator(ProductLocators.productInfoDescription)).toHaveText(description);
            await expect(this.page.locator(ProductLocators.productInfoPublishedCheckbox)).toBeChecked();
            await expect(this.page.locator(ProductLocators.productLogoImg)).toBeVisible();
            
            await captureSuccessScreenshot(this.page, testInfo, 'product-info-verified');
        });
    }

    async verifyApiDetails(apiName: string, dbData: any, testInfo: TestInfo) {
        await test.step(`Action: Verify Database connectivity details for API: "${apiName}"`, async () => {
            await expect(this.page.locator(ProductLocators.apiDetailsAccordion(apiName))).toBeVisible();
            await this.page.click(ProductLocators.dbAccessKeyEyeBtn);
            
            await expect(this.page.locator(ProductLocators.dbNameValue)).toHaveText(dbData.databaseName);
            await expect(this.page.locator(ProductLocators.dbUriValue)).toHaveText(dbData.databaseUri);
            await expect(this.page.locator(ProductLocators.dbContainerValue)).toHaveText(dbData.databaseContainer);
            
            const actualKey = await this.page.locator(ProductLocators.dbAccessKeyValue).inputValue();
            const expectedKey = dbData.databaseAccessKey.split('x')[0]; // Compare the real part before 'x'
            expect(actualKey).toContain(expectedKey);
            
            await captureSuccessScreenshot(this.page, testInfo, 'api-details-verified');
        });
    }

    async verifySettingSchema(expectedSchema: any, testInfo: TestInfo) {
        await test.step('Action: Validate the API settings schema integrity', async () => {
            await this.page.click(ProductLocators.expandSchemaBtn);
            
            const actualSchemaText = await this.page.locator(ProductLocators.schemaContent).innerText();
            const actualSchema = JSON.parse(actualSchemaText);
            expect(actualSchema).toEqual(expectedSchema);
            await captureSuccessScreenshot(this.page, testInfo, 'setting-schema-verified');
        });
    }

    async deleteProductIfExists(productName: string, testInfo: TestInfo) {
        await test.step(`Action: Check for and remove existing product: "${productName}"`, async () => {
            const searchBox = this.page.locator(ProductLocators.searchInput);
            
            try {
                await expect(searchBox).toBeVisible({ timeout: 10000 });
            } catch (e) {
                console.log('Search box not visible, skipping cleanup');
                return;
            }

            await searchBox.fill(productName);
            await searchBox.press('Enter');
            
            const card = this.page.locator(ProductLocators.productCard(productName));
            try {
                await expect(card).toBeVisible({ timeout: 5000 });
            } catch (e) {}
            
            if (await card.isVisible()) {
                await card.click();
                await expect(this.page.locator(ProductLocators.deleteProductBtn)).toBeVisible({ timeout: 15000 });
                await this.page.click(ProductLocators.deleteProductBtn);
                await this.page.click(ProductLocators.confirmDeleteBtn);
                await expect(card).toBeHidden({ timeout: 20000 });
            }
            
            await searchBox.fill('');
            await searchBox.press('Enter');
            await this.waitForLoading();
        });
    }
}
