describe('Footer element tests for dustinsison.com', () => {
    // Before each test case, open the browser to the homepage
    beforeEach(() => {
        cy.visit('http://dustinsison.com')
    })
    // Verify the footer and all footer links are present and visible
    it('Verify footer links are present and visible', () => {
        cy.get('footer').should('be.visible') // Verify the presence of the footer
        cy.get('a[href*="https://twitter.com/XMasterPrime"]').should('be.visible') // Verify the Twitter link
        cy.get('a[href*="https://github.com/dustinsison"]').should('be.visible') // Verify the GitHub link
        cy.get('a[href*="https://www.linkedin.com/in/dustin-sison/"]').should('be.visible') // Verify the LinkedIn profile link
        cy.get('a[href*="mailto:dsison34@gmail.com"]').should('be.visible') // Verify the email link
    })
})