describe('Home page tests for dustinsison.com', () => {
    // Before each test case, open the browser to the homepage
    beforeEach( () => {
        cy.visit('http://dustinsison.com')
    })
    // Test Case 1: Verify that the home page loads as expected, by verifying the presence of critical components
    it('Verify page title and URL', () => {
        cy.get('h1').contains('Welcome')
        cy.location('pathname').should(
            "eq",
            "/"
        )
    })
    // Test Case 2: Verify that the home page video appears
    it('Verify home page video appears', () => {
        cy.get('iframe[id="wp-custom-header-video"]').should('exist')
    })
    // Test Case 3: Verify home page links (Only the 'About me' link, since current projects can change)
    it('Verify home page links', () => {
        cy.get('a[href="/about-me"]').contains('About Me')
    })
})