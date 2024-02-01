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
            .should('have.selected','true') // Confirm third option is selected
        cy.get("option[value*='option_4']")
            .should('have.selected','true') // Confirm forth option is selected
    })
    //Test Case 4: Verify button press and message
    it('Verify button press and message',() => {
        cy.get('button').click() // Click the button to show browser alert pop-up
        cy.on('window:alert',(txt)=>{
            expect(txt).to.contains('Button clicked') // Verify pop-up message
        })
    })
    //Test Case 5: Verify datalist element selection
    it('Verify datalist selection', () => {
        cy.get('input[list="dropdown"]')
            .type('dropdown') // Type some text to get the list of options to appear
            .then(input => {
        // Use JavaScript to retrieve the datalist options
        const options = Array.from(input[0].list.options)
        .map(option => option.value);

        // Find the index of the desired option
        const optionIndex = options.indexOf('dropdown_three');

        // Use JavaScript to select the option
        input[0].value = options[optionIndex];

        // Trigger the input change event to update the selection
        input[0].dispatchEvent(new Event('input', { bubbles: true }));
        })
    })
    //Test Case 6: Verify output elements
    it('Verify output elements', () => {
        cy.get('input[type=range]').then(($input) => { // Selects the first output element, a slider, and moves it from 50 to 60
            $input[0].value = 60;
            $input.trigger('change');
        })
        cy.get('input[type=number]').invoke('val', '60').trigger('input')  // Enters 60 in the input field, replacing the default 50
        cy.get('output[name=x]').trigger('change').contains('120') // If both input changes were made, the accumulative value should be 120, not 110 or 100
    })
    //Test Case 7: Verify String is a palindrome
    it('Verify string is a palindrome', () => {
        cy.get('text[id=palindrome]').then(element => { // Grabs the string element and uses the custom command that checks if a string is a palindrome
            const str = element.text();
            cy.isPalindrome(str).should('be.true');
          });
    })
})