export const ProductLocators = {
    // Menu
    productsTab: 'button:has-text("Products")',
    loadingIndicator: 'text=loading...',

    // Product List
    addNewProductBtn: 'button[aria-label="Add new product"]',
    plusIconCreateProduct: 'button[aria-label="Add new product"]', // Assuming + icon might have this label
    searchInput: 'input[placeholder="Search"]',
    productCard: (productName: string) => `strong:text-is("${productName}") >> xpath=ancestor::div[2]`,
    productDescriptionInCard: (productName: string) => `strong:text-is("${productName}") >> xpath=ancestor::div[2] >> strong >> nth=1`,
    publishedBadge: (productName: string) => `strong:text-is("${productName}") >> xpath=ancestor::div[2] >> div:text-is("Published")`,

    // Create Product Popup - General
    createNewProductHeader: 'h2:has-text("Create New Product")',
    nameInput: 'input[name="name"]',
    descriptionInput: 'input[name="description"]',
    uploadLogoInput: 'input[type="file"]',
    publishedCheckbox: 'input[name="isPublished"]',
    nextBtn: 'button:has-text("Next")',

    // Create Product Popup - APIs
    apiExplorerTab: 'button[role="tab"]:has-text("API Explorer")',
    addApiBtn: (apiName: string) => `//div[@role="row" and contains(., "${apiName}")]//button[contains(., "Add")]`,
    productApisTab: 'button[role="tab"]:has-text("Product APIs")',

    // Create Product Popup - Settings
    apiSelectCombobox: 'button[role="combobox"]',
    apiOption: (apiName: string) => `div[role="option"]:has-text("${apiName}")`,
    addCustomerSettingBtn: 'button[aria-label="Add new customer setting"]', // Often a + icon has an aria-label
    plusIconAddSetting: 'button[aria-label="Add new customer setting"]', // Match the aria-label found
    setting1Btn: 'button:has-text("Setting 1")',
    databaseNameInput: 'input[name="settingsDbName"]',
    databaseUriInput: 'input[name="settingsDbUri"]',
    databaseContainerInput: 'input[name="settingsDbContainer"]',
    databaseAccessKeyInput: 'input[name="settingsAccessKey"]',
    settingsSchemaInput: 'textarea[name="settingsSchemaObject"]',
    saveBtn: 'button:has-text("Save")',

    // Done window
    doneWindow: '.fui-DialogSurface',
    productNameInDoneWindow: (productName: string) => `.fui-DialogSurface label:has-text("${productName}")`,
    closeBtn: 'button:has-text("Close")',

    // Product Overview / Card Details
    productInfoSection: '//div[contains(text(), "Product Information")]',
    productInfoName: '(//div[contains(text(), "Product Information")]/following-sibling::div//label)[1]',
    productInfoDescription: '(//div[contains(text(), "Product Information")]/following-sibling::div//label)[2]',
    productInfoPublishedCheckbox: '//label[contains(text(), "Published:")]/following-sibling::span//input',
    productLogoImg: '//img[@alt="ProductLogo"]',

    apiDetailsSection: '//div[contains(text(), "API Details")]',
    apiDetailsAccordion: (apiName: string) => `//div[contains(text(), "API Details")]/following-sibling::div//span[contains(text(), "${apiName}")]`,
    dbNameValue: '//div[text()="Database"]/following-sibling::div',
    dbUriValue: '//div[text()="Database URI"]/following-sibling::div',
    dbContainerValue: '//div[text()="Database Container"]/following-sibling::div',
    dbAccessKeyValue: '//div[text()="Database Access Key"]/following-sibling::div//input',
    dbAccessKeyEyeBtn: '//div[text()="Database Access Key"]/following-sibling::div//button',

    expandSchemaBtn: 'button:has-text("Setting Schema")',
    schemaContent: '//button[contains(text(), "Setting Schema")]/ancestor::div[1]/following-sibling::div//pre',

    // Actions
    deleteProductBtn: 'button[aria-label="Delete product"]',
    confirmDeleteBtn: 'div[role="dialog"] button:has-text("Delete")',
};
