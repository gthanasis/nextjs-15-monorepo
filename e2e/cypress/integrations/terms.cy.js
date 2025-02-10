describe("Terms page", () => {
  beforeEach(() => {
    cy.visit("/terms");
  });

  it("Should display the terms", () => {
    cy.viewport(1280, 720);
    cy.contains("Terms");
  });
});
