describe.only("Home page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Should display the welcome message", () => {
    cy.viewport(1280, 720);
    cy.contains("Welcome to Your App");
  });

  it("Should display the login button", () => {
    cy.viewport(1280, 720);
    cy.contains("Login");
  });

  it.skip("Login button should open popup", () => {
    cy.viewport(1280, 720);
    cy.contains("Login").click();
    cy.get('[data-test*="login-form]').should("exist");
  });
});
