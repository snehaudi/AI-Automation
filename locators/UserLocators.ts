export const UserLocators = {
    // Customer Card - Users Tab
    usersTab: 'button[role="tab"]:has-text("Users")',
    
    // User List Actions
    addNewUserBtn: 'button[aria-label="Add new user"]',
    userSearchInput: '#userSearchInput',
    
    // Create User Dialog (Fluent UI Dialog)
    createUserDialog: '[role="dialog"]:has(h2:has-text("Create New User"))',
    createUserHeader: 'h2:has-text("Create New User")',

    // Form field label names (used with getByLabel inside the dialog)
    nameLabel: 'Name',
    accountLabel: 'Account',
    emailLabel: 'Email',
    phoneLabel: 'Phone',

    // Fallback ID-based selectors (kept for reference)
    nameInput: '#name', 
    accountInput: '#azureUserId',
    customerInput: '#customerId', 
    roleDropdown: '#userRole',
    emailInput: '#emailAddress',
    phoneInput: '#phoneNumber',
submitBtn: 'button:text-is("Submit")',
    
    // User List Row Verification
    userRow: (userName: string) => `div[role="row"]:has-text("${userName}")`,
    userNameCell: (userName: string) => `div[role="gridcell"]:has-text("${userName}")`,
    accountCell: (account: string) => `div[role="gridcell"]:has-text("${account}")`,
    tenantCell: (tenant: string) => `div[role="gridcell"]:has-text("${tenant}")`,
    roleCell: (role: string) => `div[role="gridcell"]:has-text("${role}")`,
    superUserCell: (value: string) => `div[role="gridcell"]:has-text("${value}")`,
    activeCheckbox: (userName: string) => `div[role="row"]:has-text("${userName}") input[type="checkbox"]`,

    // Administration Page Navigation
    adminTab: 'a[href="/#administration"]',
    adminMenuButton: 'a[href="/#administration"] button',

    // Administration Page - User List
    adminSearchInput: 'input[placeholder="Search"]',
    adminUserRow: (userName: string) => `div[role="row"]:has-text("${userName}")`,
    adminActiveCheckbox: (userName: string) => `div[role="row"]:has-text("${userName}") input[type="checkbox"]`,
};
