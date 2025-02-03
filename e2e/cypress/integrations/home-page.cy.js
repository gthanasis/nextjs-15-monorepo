describe("Home page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Menu items should work", () => {
    cy.viewport(1280, 720);
    cy.contains("Your App");
  });
});
