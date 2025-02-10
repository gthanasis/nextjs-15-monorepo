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
    err.message.includes("Hydration failed") ||
    err.message.includes("Minified React error #418") ||
    err.message.includes("Minified React error #423")
  ) {
    return false; // Ignore hydration errors in Cypress
  }
});

Cypress.Commands.add("stubLogin", (url = "/") => {
  cy.intercept("/api/auth/session", { fixture: "auth-session.json" }).as(
    "session",
  );

  cy.setCookie(
    "authjs.session-token",
    "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiOFdIMFZGWUJBanhCeGJHTHdqVVJWT016WE0zR090UlR5QUg2aWlHcW1LLTZXblVLQnJiQW8tNkhLajJXSU5QQWVORkNIb1QwaS1rNUJKWTJKM0d4WGcifQ..CIPh3CID-4cq6hlBuUekXg._ygiU5dIeJrCizjn6-dbXjvxKq2fBDxJsaPo8EIGz4F9v733iqwfGAVvmq7P4vQQPU9Bt09btua4EszE4bB-GBuxF1C2AbQTFP8rrhjEcwH75vq88H00UGa8XAii9FI7_5O4d1LYUZjbnu6YIfgnYYwCMskCKeMnvptAEoAvNRizNgHspsYiGdLyPiF7NLfKXuIaXQZx0TwJ_xcsmieib2oCSvq0ITVUpy0cg83dvsyVGPUTKyzJtZBNn7KlXekA9nHjg8SJLIeE7j9VDjfiJ8eC0SBCV8Halzl2Gliw7tx_ObbRzrkYNvdRZNeNSroju2bQHRSsrKtlpLc1c6VciRf3eKDQtz_0941VpbGVOBiEwt1IQM2HgCVaHcRLA498cT5hE8kfIr4khlp5J3hYmN_6V6yc7ne2dPcriI3v5gFuftuEYPsjgcwv-WgKUhad9Ot8LPWpqiwRUyJXki__s8MSEG8DgARke9PIGSgwIQGnRv_IzhMPwVrIL4ae4B-0IkAsPjU5PuFjxYaopjDSQiAm_Dji1be1SN35ZsUfbpZqne-PGNiITDbyWnvklsMEDApGSTSP_WOcYoedXa6319hbHYT4Z-cNdNokMc7SOqLyhz-PsMftHsC-6S0xHzG_wYO5vjfBCLmbnMIQpT2Q6WKu92Y7Y_rvzRXno4ZHJvxFRe0bBk9oc6lZK1ijJH2fnAebS_j1QEcR30PHlHMCzp5LlGKQoW6Kiv_PbuSgfYpEzqvzly90ZLeuCqBIyrwAJ8NJFS1TnIEntCyyvfM-vRU6uLetpGxYL03tL2AK58FjskmExYLPL6PtO1rijIrgklW93VJYJoXNoGBDJcyJmkUhi_kAgmxgE9y6DMIiswoxL_b0L8b2Ai0E1lKIN9gQAorHLNJKwJVLVsv56ZUyRNtssHQQ5UcXkzVcdKja-pkcnD5lfLG_qnYjqwFCgI1x8XB0Ahvk9fx6X3pK5io0l3g61IwUXW9L6-IHOiLw2uM.P_Xq0nH_DpDU7sOXXmF4NwUkfs9ut8SADL2hVpncCaY",
  );
  // cy.preserveCookieOnce('next-auth.session-token') // works without this, for now
  cy.visit(url);
  cy.wait("@session");
});
