describe.only("Home page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Should display the title", () => {
    cy.viewport(1280, 720);
    cy.contains("Next.js 15 Monorepo");
  });

  it("Should display the subtitle", () => {
    cy.viewport(1280, 720);
    cy.contains("A simple, kickstart app with Authentication included.");
  });

  it("Should display the Get Started button", () => {
    cy.viewport(1280, 720);
    cy.contains("Get Started");
  });

  it("Get Started button should link to public page", () => {
    cy.viewport(1280, 720);
    cy.contains("Get Started").click();
    cy.url().should("include", "/public");
  });
});
