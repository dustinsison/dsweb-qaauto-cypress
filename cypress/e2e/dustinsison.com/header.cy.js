describe('Header element tests for dustinsison.com', () => {
    // Before each test case, open the browser to the homepage
    beforeEach(() => {
        cy.visit('http://dustinsison.com')
    })
    // Verify the header and all header links are present and visible
    it('Verify header links are present and visible', () => {
        cy.get('[id=masthead]').should('be.visible') // Verify the presence of the header
        cy.get('a[href*="https://dustinsison.com"]').contains('dustinsison.com').should('be.visible') // Verify the title links to the home page
        cy.get('a[href*="https://dustinsison.com/about-me"]').should('be.visible') // Verify the About Me link is visible
        cy.get('a[href*="/"]').contains('Projects').get('li')
            .get('a[href*="https://dustinsison.com/dustinsison-com"]').should('not.be.visible')
        // Verify the first project is present but not initially visible
        cy.get('a[href*="https://dustinsison.com/category/projects-log/"]').should('be.visible') // Verify the Projects Log link is visible
    })
})