module.exports = {
  e2e: {
    experimentalRunAllSpecs: true,
    specPattern: "**/*.cy.js",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    "blockHosts": [
      "*.google-analytics.com",
      "*.plausible.io",
      "*.datadoghq.eu", // Adjust according to the specific Datadog domains used
      "*.logs.datadoghq.eu"
    ]
  },
};
