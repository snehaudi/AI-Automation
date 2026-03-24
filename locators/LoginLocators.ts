export const LoginLocators = {
    // Microsoft Login
    usernameInput: '#i0116',
    nextButton: '#idSIButton9',
    passwordInput: '#i0118',
    signInButton: '#idSIButton9',
    staySignedInYes: '#idSIButton9',
    staySignedInPrompt: 'text=Stay signed in?',
    useAnotherAccount: '#otherTile, #otherTileText',
    existingAccount: (username: string) => `[data-test-id="${username}"]`,

    // Cloud Portal Home
    welcomeSpan1: '#appBodyOuter div span span:has-text("Welcome to")',
    welcomeSpan2: '#appBodyOuter div span span:has-text("Addovation Cloud")',
    homeLink: 'a[href="/#"] button',
    customersLink: 'a[href="/#customers"] button',
    unauthorizedMessage: 'text=User not authorized.',
    
    // Logged in user name locator (usually in the header/footer)
    loggedInUser: '.user-name' 
};
