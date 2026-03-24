export const SubscriptionLocators = {
    // Tabs in Customer Details
    subscriptionsTab: 'button[role="tab"]:has-text("Subscriptions")',
    
    // Subscriptions List
    addSubscriptionBtn: 'button[aria-label="Add new subscription"]',
    subscriptionCard: (subName: string) => `strong:text-is("${subName}") >> xpath=ancestor::div[2]`,
    subscriptionNameInCard: (subName: string) => `strong:text-is("${subName}")`,
    subscriptionEndDateInCard: (subName: string) => `strong:text-is("${subName}") >> xpath=following-sibling::span`,

    // Create Subscription Popup
    createSubscriptionHeader: 'div[role="dialog"] h2',
    customerNameInHeader: (customerName: string) => `div[role="dialog"] h2:has-text("${customerName}")`,
    
    subscriptionNameInput: 'Name', // getByRole('textbox', { name: 'Name' })
    customerCombobox: 'Customer', // getByRole('combobox', { name: 'Customer' })
    tenantCombobox: 'Tenant', // getByRole('combobox', { name: 'Tenant' })
    productCombobox: 'Product', // getByRole('combobox', { name: 'Product' })
    
    startDateCalendarIcon: 'button[aria-label="Open Calendar"]',
    startDateInput: 'Start date',
    todayDateBtn: 'button[aria-selected="true"]', 
    
    durationInput: 'Subscription duration',
    quotaLimitInput: 'Quota limit',
    rateLimitInput: 'Rate limit',
    gracePeriodInput: 'Grace period',
    expirationWarningInput: 'Expiration warning',
    requestCountWarningInput: 'Request count warning',
    
    submitBtn: 'button:has-text("Submit")',
    closeBtn: 'button:has-text("Close")',

    // Subscription Details Card
    basicInfoSection: 'div:text-is("Basic Information")',
    subscriptionDetailsSection: 'div:text-is("Subscription Details")',
    
    primaryKeyInput: 'Primary Key', // getByRole('textbox', { name: 'Primary Key' })
    secondaryKeyInput: 'Secondary Key', // getByRole('textbox', { name: 'Secondary Key' })
    
    detailLabel: (label: string) => `text="${label}"`,
    detailValue: (label: string) => `text="${label}" >> xpath=following-sibling::*[1]`,
    
    // Specific Detail Labels for verification
    quotaLimitLabel: 'Quota Limit',
    rateLimitLabel: 'Rate Limit',
    expirationWarningLabel: 'Expiration warning',
    requestCountWarningLabel: 'Request count warning',
    graceDaysLabel: 'Grace days',
    startDateLabel: 'Start Date',
    endDateLabel: 'End Date',
    
    eyeIcon: 'button[aria-label="Toggle password visibility"]', // Common for eye icons
    
    activeCheckbox: 'input[type="checkbox"]', // Usually only one active checkbox in details
    
    // Product -> Subscriptions Tab
    productSubscriptionRow: (subName: string) => `div[role="row"]:has-text("${subName}")`,
    
    // Home Page
    customerExpandBtn: (customerName: string) => `button:has-text("${customerName}")`,
    homeSubscriptionName: (subName: string) => `strong:text-is("${subName}")`,

    // Actions
    deleteBtn: 'button[aria-label="Delete subscription"]',
    confirmDeleteBtn: 'button:has-text("Delete")',
};
