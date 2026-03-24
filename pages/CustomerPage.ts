import { Page, expect, TestInfo, test } from '@playwright/test';
import { CustomerLocators } from '../locators/CustomerLocators';
import { captureSuccessScreenshot } from '../utils/screenshotHelper';

export class CustomerPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToCustomers(testInfo: TestInfo) {
        await test.step('Action: Open the Customers management section from the navigation menu', async () => {
            const customersBtn = this.page.locator(CustomerLocators.customersTab);
            if (await customersBtn.isVisible()) {
                await customersBtn.click();
            } else {
                await this.page.goto('https://addocloudplatformdemoapp2.azurewebsites.net/#customers');
            }
            await this.page.waitForLoadState('networkidle');
            
            await expect(this.page.locator(CustomerLocators.customersMenuButton)).toHaveAttribute('aria-pressed', 'true');
            await captureSuccessScreenshot(this.page, testInfo, 'customers-tab-navigated');
        });
    }

    async clickCreateNewCustomer(testInfo: TestInfo) {
        await test.step('Action: Click the "Add new customer" button to open the registration form', async () => {
            await this.page.click(CustomerLocators.addNewCustomerBtn);
            
            await expect(this.page.locator(CustomerLocators.createCustomerHeader)).toBeVisible();
            await expect(this.page.locator(CustomerLocators.createCustomerHeader)).toHaveText('Create New Customer');
            
            await captureSuccessScreenshot(this.page, testInfo, 'create-customer-popup-displayed');
        });
    }

    async fillCustomerDetails(customer: any, testInfo: TestInfo) {
        await test.step(`Action: Provide comprehensive details for customer: "${customer.name}"`, async () => {
            await test.step('Action: Enter basic customer information (Name and Reference ID)', async () => {
                await this.page.getByRole('textbox', { name: CustomerLocators.nameInput, exact: true }).fill(customer.name);
                await this.page.getByRole('textbox', { name: CustomerLocators.referenceIdInput, exact: true }).fill(customer.referenceId);
            });
            
            await test.step(`Action: Assign the Key Account Manager (KAM): "${customer.keyAccountManager}"`, async () => {
                const kamCombobox = this.page.locator('#keyAccountManager').first();
                await expect(kamCombobox).toBeVisible({ timeout: 10000 });
                
                const kamNameOnly = customer.keyAccountManager.split('(')[0].trim();
                
                // Try multiple ways to expand the dropdown
                let isExpanded = false;
                for (let i = 0; i < 3; i++) {
                    await kamCombobox.click();
                    await this.page.waitForTimeout(1000);
                    
                    if (await this.page.locator('[role="option"]').filter({ hasText: kamNameOnly }).first().isVisible().catch(() => false)) {
                        isExpanded = true;
                        break;
                    }
                    
                    await kamCombobox.focus();
                    await this.page.keyboard.press('ArrowDown');
                    await this.page.waitForTimeout(1000);
                    
                    if (await this.page.locator('[role="option"]').filter({ hasText: kamNameOnly }).first().isVisible().catch(() => false)) {
                        isExpanded = true;
                        break;
                    }
                }

                const kamOption = this.page.locator('[role="option"]').filter({ hasText: kamNameOnly }).first();
                await expect(kamOption).toBeVisible({ timeout: 15000 });
                await kamOption.click();
            });
            
            await test.step(`Action: Configure Tenant information (Domain: "${customer.tenantDomain}")`, async () => {
                await this.page.click(CustomerLocators.addTenantBtn);
                
                // Use more specific locators for tenant fields as they have duplicate IDs/names
                const tenantDomainInput = this.page.locator('input[placeholder="contoso.com"]').first();
                const tenantIdInput = this.page.locator('input[placeholder="a1bb2ccc-3333-444e-5fff-ggg66h777777"]').first();
                
                await expect(tenantDomainInput).toBeVisible({ timeout: 10000 });
                
                // Focus and type to ensure events are triggered properly
                await tenantDomainInput.click();
                await tenantDomainInput.fill(customer.tenantDomain);
                
                await tenantIdInput.click();
                await tenantIdInput.fill(customer.tenantId);
                
                // Small delay to ensure validation state updates
                await this.page.waitForTimeout(1000);
                
                const tenantAddBtn = this.page.locator('button').filter({ hasText: /^Add$/ }).first();
                await expect(tenantAddBtn).toBeEnabled();
                await tenantAddBtn.click();
                
                // Wait for the inline form to close (the Domain input should disappear)
                await expect(tenantDomainInput).toBeHidden({ timeout: 15000 });
                
                // Verify the tenant is now listed in the tenants combobox/list
                const tenantTag = this.page.getByText(customer.tenantDomain, { exact: true }).first();      
                await expect(tenantTag).toBeVisible({ timeout: 10000 });

            });
            
            await test.step('Action: Provide support contact details and branding logo URL', async () => {
                await this.page.getByRole('textbox', { name: CustomerLocators.customerSupportKeyInput, exact: true }).fill(customer.customerSupportKey);
                await this.page.getByRole('textbox', { name: CustomerLocators.logoInput, exact: true }).fill(customer.logoImageUrl);
            });
            
            await captureSuccessScreenshot(this.page, testInfo, 'customer-details-filled');
        });
    }

    async submitCreation(testInfo: TestInfo) {
        await test.step('Action: Submit the customer registration and confirm processing', async () => {
            const submitBtn = this.page.locator(CustomerLocators.submitBtn);
            await expect(submitBtn).toBeEnabled({ timeout: 15000 });
            await submitBtn.click();
            await expect(this.page.locator(CustomerLocators.createCustomerHeader)).toBeHidden({ timeout: 20000 });
            
            // Small buffer for grid refresh instead of full network idle
            await this.page.waitForTimeout(2000);
            
            await captureSuccessScreenshot(this.page, testInfo, 'customer-created');
        });
    }

    async searchAndVerifyCustomer(customerName: string, kamName: string, kamPhone: string, expectedLogoUrl: string, testInfo: TestInfo) {
        await test.step(`Action: Search for customer "${customerName}" and verify directory listing`, async () => {
            const searchInput = this.page.locator(CustomerLocators.searchInput);
            await test.step(`Action: Filter customers by name: "${customerName}"`, async () => {
                await expect(searchInput).toBeVisible({ timeout: 15000 });
                await searchInput.click();
                await searchInput.fill(''); // Clear any existing text
                await this.page.keyboard.type(customerName, { delay: 50 });
                await this.page.keyboard.press('Enter');
                
                // Wait for the UI to filter
                await this.page.waitForTimeout(2000);
            });
            
            const card = this.page.locator(CustomerLocators.customerCard(customerName));
            await expect(card).toBeVisible({ timeout: 15000 });
            
            await test.step('Action: Verify displayed customer card information and branding', async () => {
                const kamNameOnly = kamName.split('(')[0].trim();
                await expect(card).toContainText(customerName);
                if (kamNameOnly) await expect(card).toContainText(kamNameOnly);
                if (kamPhone) await expect(card).toContainText(kamPhone);

                if (expectedLogoUrl) {
                    const logo = this.page.locator(CustomerLocators.customerLogoInCard(customerName));
                    await expect(logo).toBeVisible();
                    await expect(logo).toHaveAttribute('src', expectedLogoUrl);
                }
            });
            
            await captureSuccessScreenshot(this.page, testInfo, 'customer-verified-in-list');
        });
    }

    async openCustomerCard(customerName: string) {
        await test.step(`Action: Open the profile details for customer: "${customerName}"`, async () => {
            await this.page.click(CustomerLocators.customerCard(customerName));
            await this.page.waitForLoadState('networkidle');
        });
    }

    async verifyCustomerOverview(customer: any, testInfo: TestInfo) {
        await test.step(`Action: Verify the detailed Overview section for customer: "${customer.name}"`, async () => {
            await this.page.click(CustomerLocators.overviewTab);
            await expect(this.page.locator(`text=${customer.name}`).first()).toBeVisible();
            await expect(this.page.locator(`text=Reference ID:${customer.referenceId}`)).toBeVisible();
            
            await test.step('Action: Reveal and validate the secure customer support key', async () => {
                const eyeBtn = this.page.locator(CustomerLocators.eyeIcon).first();
                await expect(eyeBtn).toBeVisible({ timeout: 10000 });
                await eyeBtn.click();
                await expect(this.page.locator(CustomerLocators.detailsSupportKey)).toHaveValue(customer.customerSupportKey);
            });
            
            await test.step('Action: Verify the Key Account Manager (KAM) contact details', async () => {
                const kamNameOnly = customer.keyAccountManager.split('(')[0].trim();
                await expect(this.page.locator(CustomerLocators.detailsKamName)).toContainText(kamNameOnly);
                await expect(this.page.locator(CustomerLocators.detailsKamEmail(customer.kamEmail))).toBeVisible();
                await expect(this.page.locator(CustomerLocators.detailsKamPhone)).toContainText(customer.kamPhone);
            });
            
            await captureSuccessScreenshot(this.page, testInfo, 'customer-overview-verified');
        });
    }

    async verifyTenants(tenantId: string, tenantDomain: string, testInfo: TestInfo) {
        await test.step(`Action: Verify assigned Tenant configuration (Domain: "${tenantDomain}")`, async () => {
            await this.page.click(CustomerLocators.tenantsTab);
            await expect(this.page.locator(CustomerLocators.tenantIdCell(tenantId))).toBeVisible();
            await expect(this.page.locator(CustomerLocators.tenantDomainCell(tenantDomain))).toBeVisible();
            await captureSuccessScreenshot(this.page, testInfo, 'tenant-info-verified');
        });
    }
}
