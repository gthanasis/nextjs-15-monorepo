describe("Dashboard", () => {
  beforeEach(() => {
    cy.visit(
      `${Cypress.env("BACKEND")}auth/login/demo?userID=6463a85ae23ac02c4ad26b31`,
    );
    cy.visit("/dashboard");
  });

  it("Should contain dashboard", () => {
    cy.viewport(1280, 720);
    cy.contains("Dashboard");
  });
});
