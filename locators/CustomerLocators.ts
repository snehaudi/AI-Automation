export const CustomerLocators = {
    // Menu
    customersTab: 'a[href="/#customers"]',
    customersMenuButton: 'a[href="/#customers"] button',

    // Customer List
    addNewCustomerBtn: 'button[aria-label="Add new customer"]',
    searchInput: 'input[placeholder="Search"]',
    customerCard: (customerName: string) => `strong:text-is("${customerName}") >> xpath=ancestor::div[2]`,
    customerLogoInCard: (customerName: string) => `strong:text-is("${customerName}") >> xpath=ancestor::div[2] >> img[alt="Avatar"]`,
    customerNameInCard: (customerName: string) => `strong:text-is("${customerName}")`,
    kamNameInCard: (customerName: string) => `strong:text-is("${customerName}") >> xpath=ancestor::div[2]//span[3]`,
    kamPhoneInCard: (customerName: string) => `strong:text-is("${customerName}") >> xpath=ancestor::div[2]//span[4]`,

    // Create Customer Popup
    createCustomerHeader: 'h2:has-text("Create New Customer")',
    nameInput: 'Name', // for getByRole('textbox', { name: 'Name' })
    referenceIdInput: 'Reference ID', 
    kamCombobox: 'Key Account Manager',
    kamOption: (kamName: string) => `text=${kamName}`, 
    
    addTenantBtn: 'button[aria-label="Add new tenant"]',
    tenantDomainInput: 'Domain',
    tenantIdInput: 'ID',
    addTenantSubmitBtn: 'button:text-is("Add")',
    
    customerSupportKeyInput: 'Customer Support Key',
    logoInput: 'Logo information',
    
    submitBtn: 'button:text-is("Submit")',
    closePopupBtn: 'button:has-text("Close")',

    // Customer Details / Overview
    overviewTab: 'button[role="tab"]:has-text("Overview")',
    tenantsTab: 'button[role="tab"]:has-text("Tenants")',
    
    detailsCustomerName: (customerName: string) => `div:text-is("${customerName}")`,
    detailsReferenceId: (refId: string) => `div:has-text("Reference ID:${refId}")`,
    detailsSupportKey: '.fui-Input input', 
    showSupportKeyBtn: '.fui-Input button', 
    eyeIcon: '.fui-Input button', 

    detailsKamName: 'span:text-is("Key Account Manager") >> xpath=preceding-sibling::span[1]',
    detailsKamEmail: (email: string) => `a[href="mailto:${email}"]`,
    detailsKamPhone: 'span:text-is("Key Account Manager") >> xpath=following-sibling::span[2]',

    // Tenants Tab Details
    tenantRow: (tenantId: string) => `div[role="row"]:has-text("${tenantId}")`,
    tenantIdCell: (tenantId: string) => `div[role="gridcell"]:has-text("${tenantId}")`,
    tenantDomainCell: (domain: string) => `div[role="gridcell"]:has-text("${domain}")`,
};
