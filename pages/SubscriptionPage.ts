import { Page, expect, TestInfo, test } from '@playwright/test';
import { SubscriptionLocators } from '../locators/SubscriptionLocators';
import { CustomerLocators } from '../locators/CustomerLocators';
import { ProductLocators } from '../locators/ProductLocators';
import { captureSuccessScreenshot } from '../utils/screenshotHelper';

export class SubscriptionPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToSubscriptionsTab(testInfo: TestInfo) {
        await test.step('Action: Open the Subscriptions tab for the current entity', async () => {
            console.log('Navigating to Subscriptions tab...');
            await this.page.click(SubscriptionLocators.subscriptionsTab);
            await captureSuccessScreenshot(this.page, testInfo, 'subscriptions-tab-navigated');
        });
    }

    async clickAddSubscription(customerName: string, testInfo: TestInfo) {
        await test.step(`Action: Initiate new subscription creation for customer: "${customerName}"`, async () => {
            console.log('Clicking "+" to add a new subscription...');

            const dialog = this.page.getByRole('dialog');
            const header = this.page.locator(SubscriptionLocators.createSubscriptionHeader);

            // Robust click with retry
            let dialogOpened = false;
            for (let i = 0; i < 3; i++) {
                await this.page.click(SubscriptionLocators.addSubscriptionBtn);
                // Explicit wait for dialog to be attached to DOM
                await this.page.waitForTimeout(500); // Wait 500ms after click
                try {
                    await expect(dialog).toBeVisible({ timeout: 5000 });
                    await expect(header).toBeVisible({ timeout: 5000 });
                    dialogOpened = true;
                    break;
                } catch (e) {
                    console.log(`Dialog did not open (attempt ${i + 1}), retrying click...`);
                }
            }

            if (!dialogOpened) {
                throw new Error("Failed to open 'New subscription' dialog after multiple attempts.");
            }

            // Extra wait to ensure dialog is fully rendered
            await this.page.waitForTimeout(500);
            await expect(header).toContainText('New subscription', { timeout: 10000 });

            console.log(`Checking for customer name "${customerName}" in dialog...`);
            const customerCombobox = this.page.getByRole('combobox', { name: SubscriptionLocators.customerCombobox });
            const isCustomerComboboxVisible = await customerCombobox.isVisible().catch(() => false);

            if (isCustomerComboboxVisible) {
                console.log('Customer combobox found. Checking selection...');
                const currentSelection = await customerCombobox.textContent();
                console.log(`Current selection in combobox: "${currentSelection}"`);
                if (!currentSelection || !currentSelection.includes(customerName)) {
                    console.log(`Customer "${customerName}" not pre-selected. Selecting manually...`);
                    await customerCombobox.click();
                    await this.page.locator('[role="option"]').filter({ hasText: customerName }).first().click();
                }
            } else {
                console.log('Customer combobox not visible. Verifying customer name in dialog context...');

                const headerText = await header.innerText().catch(() => '');
                const dialogText = await dialog.innerText().catch(() => '');
                const dialogAriaLabel = await dialog.getAttribute('aria-label').catch(() => '');

                const nameFound = headerText.includes(customerName) ||
                                 dialogText.includes(customerName) ||
                                 (dialogAriaLabel && dialogAriaLabel.includes(customerName));

                if (nameFound) {
                    console.log(`Confirmed: Customer name "${customerName}" found in dialog.`);
                } else {
                    console.log(`Warning: Customer name "${customerName}" not found in dialog text or attributes.`);
                    console.log(`Current Header: "${headerText}"`);
                    // If we navigated here from a specific customer page, we continue even if the name isn't explicitly in the dialog body.
                }
            }
            
            await captureSuccessScreenshot(this.page, testInfo, 'create-subscription-popup-displayed');
        });
    }

    async fillSubscriptionDetails(subscription: any, testInfo: TestInfo) {
        await test.step(`Action: Enter configuration details for subscription: "${subscription.subscriptionName}"`, async () => {
            await this.page.getByRole('textbox', { name: SubscriptionLocators.subscriptionNameInput, exact: true }).fill(subscription.subscriptionName);
            
            await test.step(`Action: Select target Tenant: "${subscription.tenant}"`, async () => {
                const tenantCombobox = this.page.getByRole('combobox', { name: SubscriptionLocators.tenantCombobox });
                await tenantCombobox.click();
                // Wait for dropdown options to load (increased to 3 seconds)
                await this.page.waitForTimeout(3000);
                const tenantOption = this.page.locator('[role="option"]').filter({ hasText: subscription.tenant }).first();
                await tenantOption.waitFor({ state: 'visible', timeout: 10000 });
                await tenantOption.click();
            });
            
            await test.step(`Action: Associate Product: "${subscription.product}"`, async () => {
                const productCombobox = this.page.getByRole('combobox', { name: SubscriptionLocators.productCombobox });
                await productCombobox.click();
                const productOption = this.page.locator('[role="option"]').filter({ hasText: subscription.product }).first();
                await productOption.waitFor({ state: 'visible', timeout: 10000 });
                await productOption.click();
            });
            
            await test.step('Action: Set the Subscription Start Date to today', async () => {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const formattedDate = `${yyyy}-${mm}-${dd}`;
                await this.page.getByRole('textbox', { name: SubscriptionLocators.startDateInput, exact: true }).fill(formattedDate);
                await this.page.keyboard.press('Tab');
            });

            await test.step('Action: Configure usage limits (Duration, Quota, Rate) and warning thresholds', async () => {
                await this.page.getByRole('spinbutton', { name: SubscriptionLocators.durationInput, exact: true }).fill(subscription.duration);
                await this.page.getByRole('spinbutton', { name: SubscriptionLocators.quotaLimitInput, exact: true }).fill(subscription.quotaLimit);
                await this.page.getByRole('spinbutton', { name: SubscriptionLocators.rateLimitInput, exact: true }).fill(subscription.rateLimit);
                await this.page.getByRole('spinbutton', { name: SubscriptionLocators.gracePeriodInput, exact: true }).fill(subscription.gracePeriod);
                await this.page.getByRole('spinbutton', { name: SubscriptionLocators.expirationWarningInput, exact: true }).fill(subscription.expirationWarning);
                await this.page.getByRole('spinbutton', { name: SubscriptionLocators.requestCountWarningInput, exact: true }).fill(subscription.requestCountWarning);
            });
            
            await captureSuccessScreenshot(this.page, testInfo, 'subscription-details-filled');
        });
    }

    async submitCreation(testInfo: TestInfo) {
        await test.step('Action: Submit the subscription and wait for backend processing to complete', async () => {
            const submitBtn = this.page.locator(SubscriptionLocators.submitBtn);
            await expect(submitBtn).toBeEnabled({ timeout: 10000 });
            await submitBtn.click();
            
            const processingMessage = this.page.locator('text=This may take a few minutes...');
            await expect(processingMessage).toBeVisible({ timeout: 10000 });
            await expect(processingMessage).toBeHidden({ timeout: 60000 }); 
            
            const closeBtn = this.page.locator(SubscriptionLocators.closeBtn);
            await expect(closeBtn).toBeEnabled({ timeout: 10000 });
            
            await captureSuccessScreenshot(this.page, testInfo, 'subscription-created');
        });
    }

    async closePopup(testInfo: TestInfo) {
        await test.step('Action: Close the subscription creation dialog', async () => {
            await this.page.click(SubscriptionLocators.closeBtn);
            await expect(this.page.locator(SubscriptionLocators.createSubscriptionHeader)).toBeHidden({ timeout: 10000 });
        });
    }

    async verifySubscriptionInList(subscriptionName: string, testInfo: TestInfo) {
        await test.step(`Action: Confirm that subscription "${subscriptionName}" appears correctly in the list`, async () => {
            await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

            const cardName = this.page.locator(`strong:text-is("${subscriptionName}")`).first();
            await expect(cardName).toBeVisible({ timeout: 15000 });
            
            const card = cardName.locator('xpath=ancestor::div[contains(@class, "fui-Card")] | ancestor::div[2]').first();
            const endDate = card.locator('text=End date');
            await expect(endDate).toBeVisible();
            
            await captureSuccessScreenshot(this.page, testInfo, 'subscription-verified-in-list');
        });
    }

    async openSubscriptionCard(subscriptionName: string) {
        await test.step(`Action: Open the details view for subscription: "${subscriptionName}"`, async () => {
            await this.page.locator(`strong:text-is("${subscriptionName}")`).first().click();
            await this.page.waitForLoadState('networkidle');
        });
    }

    async verifySubscriptionDetails(subscription: any, testInfo: TestInfo) {
        await test.step(`Action: Verify the detailed configuration and active status for: "${subscription.subscriptionName}"`, async () => {
            await expect(this.page.locator(SubscriptionLocators.basicInfoSection)).toBeVisible();
            await expect(this.page.locator(`text=${subscription.subscriptionName}`).first()).toBeVisible();
            await expect(this.page.locator(`text=${subscription.customerName}`).first()).toBeVisible();
            await expect(this.page.locator(`text=${subscription.tenant}`).first()).toBeVisible();
            await expect(this.page.locator(`text=${subscription.product}`).first()).toBeVisible();
            
            await expect(this.page.locator(SubscriptionLocators.subscriptionDetailsSection)).toBeVisible();
            await expect(this.page.locator(SubscriptionLocators.detailValue(SubscriptionLocators.startDateLabel))).toBeVisible();
            await expect(this.page.locator(SubscriptionLocators.detailValue(SubscriptionLocators.endDateLabel))).toBeVisible();
            
            const primaryKey = this.page.locator(SubscriptionLocators.detailValue('Primary Key')).locator('input');
            const secondaryKey = this.page.locator(SubscriptionLocators.detailValue('Secondary Key')).locator('input');
            await expect(primaryKey).toBeVisible();
            await expect(secondaryKey).toBeVisible();
            
            await expect(this.page.locator(SubscriptionLocators.detailValue(SubscriptionLocators.quotaLimitLabel))).toContainText(subscription.quotaLimit);
            await expect(this.page.locator(SubscriptionLocators.detailValue(SubscriptionLocators.rateLimitLabel))).toContainText(subscription.rateLimit);
            await expect(this.page.locator(SubscriptionLocators.detailValue(SubscriptionLocators.expirationWarningLabel))).toContainText(subscription.expirationWarning);
            await expect(this.page.locator(SubscriptionLocators.detailValue(SubscriptionLocators.requestCountWarningLabel))).toContainText(subscription.requestCountWarning);
            await expect(this.page.locator(SubscriptionLocators.detailValue(SubscriptionLocators.graceDaysLabel))).toContainText(subscription.gracePeriod);
            
            const activeCheckbox = this.page.locator(SubscriptionLocators.activeCheckbox);
            await expect(activeCheckbox).toBeChecked();
            
            await captureSuccessScreenshot(this.page, testInfo, 'subscription-details-verified');
        });
    }

    async verifySubscriptionInProductList(subscriptionName: string, customerName: string, testInfo: TestInfo) {
        await test.step(`Action: Verify subscription "${subscriptionName}" is correctly cross-referenced in the Product subscriptions view`, async () => {
            await this.page.reload();
            await this.navigateToSubscriptionsTab(testInfo);

            const progressbar = this.page.getByRole('progressbar');
            try {
                await expect(progressbar).toBeVisible({ timeout: 2000 });
                await expect(progressbar).toBeHidden({ timeout: 45000 });
            } catch (e) {}
            
            const row = this.page.locator(SubscriptionLocators.productSubscriptionRow(subscriptionName)).filter({ hasText: customerName });
            await expect(row).toBeVisible({ timeout: 45000 });
            await expect(row).toContainText(customerName);
            await expect(row).toContainText('Live');
            
            const activeCheckbox = row.locator('input[type="checkbox"]');
            await expect(activeCheckbox).toBeChecked();
            
            await captureSuccessScreenshot(this.page, testInfo, 'subscription-verified-in-product');
        });
    }

    async deleteSubscriptionIfExists(subscriptionName: string, testInfo: TestInfo) {
        await test.step(`Action: Check for and remove existing subscription: "${subscriptionName}" to ensure a clean state`, async () => {
            const cardName = this.page.locator(`strong:text-is("${subscriptionName}")`).first();
            await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

            if (await cardName.isVisible()) {
                await cardName.scrollIntoViewIfNeeded();
                await cardName.click();
                await this.page.waitForLoadState('networkidle');
                
                const deleteBtn = this.page.locator(SubscriptionLocators.deleteBtn);
                await expect(deleteBtn).toBeVisible({ timeout: 10000 });
                await deleteBtn.click();
                
                const confirmBtn = this.page.locator(SubscriptionLocators.confirmDeleteBtn);
                await expect(confirmBtn).toBeVisible({ timeout: 10000 });
                await confirmBtn.click();
                
                await expect(cardName).toBeHidden({ timeout: 20000 });
                await captureSuccessScreenshot(this.page, testInfo, 'subscription-deleted');
            }
        });
    }

    async navigateToHome() {
        await test.step('Action: Return to the Home page dashboard', async () => {
            await this.page.goto('https://addocloudplatformdemoapp2.azurewebsites.net/#home', { waitUntil: 'load', timeout: 60000 });
            const loading = this.page.getByRole('progressbar', { name: 'loading...' });
            try {
                if (await loading.isVisible({ timeout: 5000 })) {
                    await expect(loading).toBeHidden({ timeout: 60000 });
                }
            } catch (e) {}
        });
    }

    async verifySubscriptionInHome(customerName: string, subscriptionName: string, testInfo: TestInfo) {
        await test.step(`Action: Confirm subscription "${subscriptionName}" is visible on the Home Dashboard for customer "${customerName}"`, async () => {
            const expandBtn = this.page.locator(SubscriptionLocators.customerExpandBtn(customerName));
            await expandBtn.scrollIntoViewIfNeeded();
            await expandBtn.click();
            
            const subName = this.page.locator(SubscriptionLocators.homeSubscriptionName(subscriptionName));
            await expect(subName).toBeVisible({ timeout: 10000 });
            
            await captureSuccessScreenshot(this.page, testInfo, 'subscription-verified-on-home');
        });
    }
}
