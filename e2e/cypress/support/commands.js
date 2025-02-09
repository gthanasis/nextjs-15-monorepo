// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// 1. Disable Cypress uncaught exception failures from React hydration errors
Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("Minified React error #418") ||
    err.message.includes("Error: Minified React error #423")
  ) {
    return false;
  }
  // Enable uncaught exception failures for other errors
});

Cypress.Commands.add("stubLogin", (url = "/") => {
  cy.intercept("/api/auth/session", { fixture: "auth-session.json" }).as(
    "session",
  );

  cy.setCookie(
    "next-auth.session-token",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImlkIjoiNjc5MDI2MGVmYTBkMGJhMGRhMGZiZGNiIiwiZXhwIjoxNzM5Mzg0ODUxLCJpc3MiOiJjb250cm9sLW1zYyIsImlhdCI6MTczNzY1Njg1MX0.Q0v0OIbdGmlWC8C0y9nbDPDbEbZk9U8vMdSycx_AHmc",
  );
  // cy.preserveCookieOnce('next-auth.session-token') // works without this, for now
  cy.visit(url);
  cy.wait("@session");
});
