// Import commands
import "./commands";
import "@testing-library/cypress/add-commands";
import "cypress-real-events";

// Component testing setup
// Note: React 19 mount support is handled by Cypress automatically

// Global configuration for component tests
Cypress.on("uncaught:exception", (err, runnable) => {
  // Handle React 19 specific errors that might occur during component testing
  if (err.message.includes("ResizeObserver loop limit exceeded")) {
    return false;
  }
  if (err.message.includes("Script error")) {
    return false;
  }
  return true;
});

// Mock Next.js router for component tests
beforeEach(() => {
  // Mock useRouter
  cy.window().then((win: any) => {
    win.next = {
      router: {
        push: cy.stub(),
        replace: cy.stub(),
        prefetch: cy.stub(),
        back: cy.stub(),
        forward: cy.stub(),
        refresh: cy.stub(),
        pathname: "/",
        route: "/",
        query: {},
        asPath: "/",
        isFallback: false,
        events: {
          on: cy.stub(),
          off: cy.stub(),
          emit: cy.stub(),
        },
      },
    };
  });
});
