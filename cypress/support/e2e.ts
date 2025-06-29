// Import commands.js using ES2015 syntax:
import "./commands";
import "@testing-library/cypress/add-commands";
import "cypress-real-events";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on("uncaught:exception", (err, runnable) => {
  // Prevent Cypress from failing on unhandled promise rejections
  // that might occur during development
  if (err.message.includes("ResizeObserver loop limit exceeded")) {
    return false;
  }
  if (err.message.includes("Script error")) {
    return false;
  }
  return true;
});

// Before each test
beforeEach(() => {
  // Clear any existing sessions
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.clearAllSessionStorage();
});

// Add custom viewport commands
Cypress.Commands.add("setMobileViewport", () => {
  cy.viewport(375, 667); // iPhone SE
});

Cypress.Commands.add("setTabletViewport", () => {
  cy.viewport(768, 1024); // iPad
});

Cypress.Commands.add("setDesktopViewport", () => {
  cy.viewport(1280, 720); // Desktop
});
