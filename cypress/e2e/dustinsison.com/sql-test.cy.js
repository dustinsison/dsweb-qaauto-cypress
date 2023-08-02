describe('Simple SQL Test', () => {
    it("Verify status code", () => {
        cy.request({
            method: "GET",
            url: "https://dustinsison.com/",
        }).then((response) => {
            expect(response.status).to.equal(200);
        });
    });
});