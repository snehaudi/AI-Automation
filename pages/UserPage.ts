import { Page, expect, TestInfo, test } from '@playwright/test';
import { UserLocators } from '../locators/UserLocators';
import { captureSuccessScreenshot } from '../utils/screenshotHelper';

export class UserPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private async pause(ms: number) {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }

    async navigateToUsersTab(testInfo: TestInfo) {
        await test.step('Action: Open the Users management tab for the selected customer', async () => {
            await this.page.click(UserLocators.usersTab);
            await captureSuccessScreenshot(this.page, testInfo, 'users-tab-navigated');
        });
    }

    async clickCreateNewUser(testInfo: TestInfo) {
        await test.step('Action: Click the "Add new user" button to initiate account creation', async () => {
            await captureSuccessScreenshot(this.page, testInfo, 'before-create-user-click');
            await this.page.locator(UserLocators.addNewUserBtn).click();
            // Wait for dialog to be attached to DOM
            await this.page.waitForTimeout(1000);
            const header = this.page.locator(UserLocators.createUserHeader);
            await expect(header).toBeVisible({ timeout: 20000 });
        });
    }

    async openFillAndSubmitUser(user: any, customerName: string, testInfo: TestInfo) {
        await test.step(`Action: Create and register a new user: "${user.name}"`, async () => {
            await captureSuccessScreenshot(this.page, testInfo, 'before-create-user-click');

            await test.step('Action: Open the "Create User" dialog and provide profile details', async () => {
                const addButton = this.page.locator(UserLocators.addNewUserBtn);
                const getDialog = () => this.page.locator(UserLocators.createUserDialog).first();

                const openDialog = async () => {
                    await expect(addButton).toBeVisible({ timeout: 15000 });
                    await expect(addButton).toBeEnabled({ timeout: 15000 });
                    await addButton.click();
                    await expect(getDialog().getByRole('textbox', { name: 'Name' }).first()).toBeVisible({ timeout: 20000 });
                };

                await openDialog();

                const fillField = async (label: string, value: string) => {
                    await test.step(`Action: Fill the "${label}" field with: "${value}"`, async () => {
                        for (let attempt = 1; attempt <= 2; attempt++) {
                            try {
                                const dialog = getDialog();
                                const textbox = dialog.getByRole('textbox', { name: label }).first();
                                await textbox.fill(value, { timeout: 8000 });
                                return;
                            } catch (error) {
                                if (attempt === 2) throw error;
                                await this.page.keyboard.press('Escape').catch(() => undefined);
                                await openDialog();
                                if (label !== 'Name') {
                                    await getDialog().getByRole('textbox', { name: 'Name' }).first().fill(user.name, { timeout: 8000 });
                                }
                            }
                        }
                    });
                };

                // Wait for Name field to be visible before filling
                await this.page.waitForTimeout(1000);
                await fillField('Name', user.name);
                // Wait for Account field to be visible before filling
                await this.page.waitForTimeout(1000);
                await fillField('Account', user.account);

                await test.step('Action: Trigger automatic customer mapping lookup', async () => {
                    const accountInput = getDialog().getByRole('textbox', { name: 'Account' }).first();
                    await accountInput.press('Tab').catch(() => undefined);
                });

                await test.step('Action: Wait for the Customer mapping system to synchronize', async () => {
                    const timeoutMs = 90000;
                    const deadline = Date.now() + timeoutMs;
                    while (Date.now() < deadline) {
                        const dialog = getDialog();
                        const isDialogVisible = await dialog.isVisible().catch(() => false);
                        if (!isDialogVisible) {
                            console.log('DEBUG: Dialog not visible, waiting...');
                            await this.pause(1000);
                            continue;
                        }

                        const customerCombo = dialog.getByRole('combobox', { name: 'Customer' }).first();
                        if (!(await customerCombo.isVisible().catch(() => false))) {
                            console.log('DEBUG: Customer combo not visible, waiting...');
                            await this.pause(500);
                            continue;
                        }
                        const isLoading = await customerCombo.locator('[role="progressbar"]').first().isVisible().catch(() => false);
                        const customerText = (await customerCombo.textContent())?.toLowerCase() ?? '';
                        console.log(`DEBUG: isLoading=${isLoading}, customerText="${customerText}", target="${customerName.toLowerCase()}"`);
                        
                        if (!isLoading) {
                            if (customerText.includes('no available customer')) throw new Error('No customer mapping found');
                            if (customerText.includes(customerName.toLowerCase()) || customerText.includes('customer')) {
                                console.log('DEBUG: Customer mapping found or matched "customer" keyword');
                                return;
                            }
                        }
                        await this.pause(750);
                    }
                    throw new Error('Customer mapping timeout');
                });

                await fillField('E-mail', user.email);
                await fillField('Phone number', user.phone);

                await test.step('Action: Submit the user creation request and wait for confirmation', async () => {
                    await expect.poll(
                        async () => await getDialog().getByRole('button', { name: 'Submit' }).first().isEnabled().catch(() => false),
                        { timeout: 20000 }
                    ).toBe(true);
                    
                    await getDialog().getByRole('button', { name: 'Submit' }).first().click();
                    await expect(this.page.locator(UserLocators.createUserHeader)).toBeHidden({ timeout: 45000 });
                });
            });

            await captureSuccessScreenshot(this.page, testInfo, 'user-created');
        });
    }

    async refreshUsersPage(testInfo: TestInfo) {
        await test.step('Action: Refresh the Users section to synchronize data', async () => {
            await this.page.reload({ waitUntil: 'networkidle' });
            await expect(this.page.locator(UserLocators.addNewUserBtn)).toBeVisible({ timeout: 20000 });
            await captureSuccessScreenshot(this.page, testInfo, 'users-page-refreshed');
        });
    }

    async verifyUserInList(user: any, expectedTenant: string, testInfo: TestInfo) {
        await test.step(`Action: Locate and verify user "${user.name}" in the Customer user directory`, async () => {
            const searchInput = this.page.locator(UserLocators.userSearchInput);
            if (await searchInput.isVisible().catch(() => false)) {
                await searchInput.fill(user.name);
                await searchInput.press('Enter');
            }
            
            const row = this.page.locator(UserLocators.userRow(user.name));
            await expect(row).toBeVisible({ timeout: 15000 });
            
            await test.step('Action: Verify displayed user profile details (Account, Tenant, Type)', async () => {
                await expect(row).toContainText(user.name);
                await expect(row).toContainText(user.account);
                await expect(row).toContainText(expectedTenant);
                await expect(row).toContainText('Customer');
                await expect(row).toContainText(/no/i);
            });
            
            await expect(this.page.locator(UserLocators.activeCheckbox(user.name))).toBeChecked();
            await captureSuccessScreenshot(this.page, testInfo, 'user-verified-in-list');
        });
    }

    async navigateToAdministration(testInfo: TestInfo) {
        await test.step('Action: Navigate to the Global Administration panel', async () => {
            await this.page.click(UserLocators.adminTab);
            await this.page.waitForLoadState('networkidle');
            await captureSuccessScreenshot(this.page, testInfo, 'administration-navigated');
        });
    }

    async verifyUserInAdministration(user: any, expectedTenant: string, testInfo: TestInfo) {
        await test.step(`Action: Confirm user "${user.name}" visibility in the Global Administration user list`, async () => {
            const searchInput = this.page.locator(UserLocators.adminSearchInput);
            await expect(searchInput).toBeVisible({ timeout: 15000 });
            await searchInput.fill(user.name);

            const row = this.page.locator(UserLocators.adminUserRow(user.name));
            await expect(row).toBeVisible({ timeout: 15000 });

            await test.step('Action: Validate global profile consistency (Account, Tenant, Mapping)', async () => {
                await expect(row).toContainText(user.name);
                await expect(row).toContainText(user.account);
                await expect(row).toContainText(expectedTenant);
                await expect(row).toContainText('Customer');
                await expect(row).toContainText(/no/i);
                await expect(this.page.locator(UserLocators.adminActiveCheckbox(user.name))).toBeChecked();
            });

            await captureSuccessScreenshot(this.page, testInfo, 'user-verified-in-administration');
        });
    }
}
