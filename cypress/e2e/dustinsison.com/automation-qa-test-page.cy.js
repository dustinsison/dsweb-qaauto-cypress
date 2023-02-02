describe('Automation QA Test Page Tests', () => {
    // Before each test case, open the browser to the test page
    beforeEach( () => {
        cy.visit('https://dustinsison.com/automated-qa-test-page/')
    })
    // Test Case 1: Enter text into the input element, verify text is present afterwards
    it('Enter text into the text input field', () => {
        cy.get('input[id*=input_field]') // Select the test input field
            .type('test') // Type 'test' into input field
            .should('have.value', 'test') // Verify 'test' is in the input field
    })
    // Test Case 2: Highlight a single element from the single-selection field
    it('Highlight a single element from the single-selection field', () => {
        cy.get('select[id*=single_sel_field]') // Select the single-selection field
            .select('option_2') // Select the second option
        cy.get("option[value*='option_2']")
            .should('have.selected','true') // Confirm second option is selected
    })
    //Test Case 3: Highlight several selections from the multiple-selection field
    it('Highlight several selections from the multiple-selection field', () => {
        cy.get('select[id*=multi_sel_field]') // Select the multi-selection field
            .select(['option_2', 'option_3', 'option_4'])
        cy.get("option[value*='option_2']")
            .should('have.selected','true') // Confirm second option is selected
        cy.get("option[value*='option_3']")
            .should('have.selected','true') // Confirm second option is selected
        cy.get("option[value*='option_4']")
            .should('have.selected','true') // Confirm second option is selected
    })
    //Test Case 4: Verify button press and message
    it('Verify button press and message',() => {
        cy.get('button').click() // Click the button to show browser alert pop-up
        cy.on('window:alert',(txt)=>{
            expect(txt).to.contains('Button clicked') // Verify pop-up message
        })
    })
    //Test Case 5: Verify datalist selection
    it('Verify datalist selection', () => {
        cy.get('datalist[id*="dropdown"]')
            .invoke('attr','style','display: block').click()
            .find("option[value*='dropdown_three']").click()
        cy.get("input[list*='dropdown']")
            .should('have.value', 'dropdown_three')
    })
})