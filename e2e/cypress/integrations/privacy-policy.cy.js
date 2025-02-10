describe("Privacy policy page", () => {
  beforeEach(() => {
    cy.visit("/privacy");
  });

  it("Should display the privacy policy", () => {
    cy.viewport(1280, 720);
    cy.contains("Privacy");
  });
});
