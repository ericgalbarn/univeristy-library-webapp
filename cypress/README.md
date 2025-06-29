# Cypress Testing Setup

This directory contains the complete Cypress testing setup for the University Library Management System (Bookaholic).

## Directory Structure

```
cypress/
├── e2e/                    # End-to-end tests
├── component/              # Component tests
├── fixtures/               # Test data
└── support/                # Support files
```

## Getting Started

### Running Tests

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run all tests headless
npm run cypress:run

# Run component tests only
npm run test:component

# Run e2e tests only
npm run test:e2e
```

## Custom Commands

We've created custom commands for easier testing:

- `cy.signIn(email, password)` - Sign in user
- `cy.signUp(email, password, firstName, lastName)` - Register user
- `cy.signInAsAdmin()` - Quick admin login
- `cy.addBookToCart(bookId)` - Add book to cart
- `cy.setMobileViewport()` - Test mobile view
- `cy.interceptImageKit()` - Mock ImageKit API
- `cy.interceptMLRecommendations(bookId)` - Mock ML API

## Test Data

Use fixtures for consistent test data:

```typescript
cy.fixture("users").then((users) => {
  cy.signIn(users.student.email, users.student.password);
});
```

## Best Practices

1. Use data-testid attributes for element selection
2. Mock external services
3. Clean up state between tests
4. Test responsive behavior
5. Group related tests in describe blocks

## Writing Tests

### Component Test Example

```typescript
describe('BookCard', () => {
  it('should render book info', () => {
    cy.mount(<BookCard {...mockBook} />)
    cy.contains('Book Title').should('be.visible')
  })
})
```

### E2E Test Example

```typescript
describe("Book Borrowing", () => {
  it("should borrow a book", () => {
    cy.visit("/");
    cy.signIn("student@test.com", "password");
    cy.addBookToCart("book-id");
    cy.visit("/borrow-cart");
    cy.get('[data-testid="checkout"]').click();
  });
});
```

This setup provides comprehensive testing capabilities for your university library system.
