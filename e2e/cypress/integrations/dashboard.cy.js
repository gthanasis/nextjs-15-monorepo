describe("Dashboard page", () => {
  beforeEach(() => {
    cy.visit("/dashboard");
  });

  it("Should be redirected to not-allowed when land authenticated", () => {
    cy.viewport(1280, 720);
    cy.contains("You aren't allowed to access this page");
    cy.url().should("include", "/not-allowed");
  });
});
