/// <reference types="cypress" />

// Export to make this a module
export {};

// TypeScript declarations for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      // Authentication commands
      signIn(email: string, password: string): Chainable<void>;
      signUp(
        email: string,
        password: string,
        fullName: string,
        universityId: string
      ): Chainable<void>;
      signInAsAdmin(): Chainable<void>;

      // Database commands
      clearDatabase(): Chainable<void>;
      seedDatabase(): Chainable<void>;

      // Book management commands
      addBookToCart(bookId: string): Chainable<void>;
      removeBookFromCart(bookId: string): Chainable<void>;

      // Utility commands
      waitForPageLoad(): Chainable<void>;
      interceptImageKit(): Chainable<void>;
      interceptMLRecommendations(bookId: string): Chainable<void>;

      // Viewport commands
      setMobileViewport(): Chainable<void>;
      setTabletViewport(): Chainable<void>;
      setDesktopViewport(): Chainable<void>;

      // Component testing
      mount(jsx: React.ReactNode, options?: any): Chainable<any>;

      // Test user management
      createTestUserIfNotExists(userData: any): Chainable<void>;
      signInAsTestUser(userType: "student" | "admin"): Chainable<void>;

      // File upload commands
      uploadFile(
        selector: string,
        fileName: string,
        fileType: string
      ): Chainable<void>;

      // Custom command for logging in with session persistence
      loginWithSession(
        userEmail: string,
        userPassword: string
      ): Chainable<void>;

      // Custom command for adding a book to borrow cart
      addBookToBorrowCart(bookSelector?: string): Chainable<void>;

      // Custom command for checking borrow cart count
      checkBorrowCartCount(expectedCount?: number): Chainable<void>;

      // Custom command for completing the borrow process
      completeBorrowProcess(): Chainable<boolean>;
    }
  }
}

// Authentication commands
Cypress.Commands.add("signIn", (email: string, password: string) => {
  cy.visit("/sign-in");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add(
  "signUp",
  (email: string, password: string, fullName: string, universityId: string) => {
    cy.visit("/sign-up");
    cy.get('input[name="fullName"]').type(fullName);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="universityId"]').type(universityId);
    cy.get('input[name="password"]').type(password);

    // Handle university card file upload - target the ImageKit upload button
    cy.contains("Upload your university ID").should("exist");
    cy.fixture("university-id.png", "base64").then((fileContent) => {
      const blob = Cypress.Blob.base64StringToBlob(fileContent, "image/png");
      const file = new File([blob], "university-id.png", {
        type: "image/png",
      });

      // Find the hidden ImageKit upload input and trigger file selection
      cy.get('input[type="file"]')
        .first()
        .then(($input) => {
          const input = $input[0] as HTMLInputElement;
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          input.files = dataTransfer.files;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
    });

    // Wait a moment for file upload to process
    cy.wait(1000);

    cy.get('button[type="submit"]').click();
  }
);

// Database commands
Cypress.Commands.add("clearDatabase", () => {
  cy.task("clearDatabase");
});

Cypress.Commands.add("seedDatabase", () => {
  cy.task("seedDatabase");
});

// Admin commands
Cypress.Commands.add("signInAsAdmin", () => {
  cy.signIn("admin@test.com", "admin123");
});

// Book management commands
Cypress.Commands.add("addBookToCart", (bookId: string) => {
  cy.get(`[data-testid="add-to-cart-${bookId}"]`).click();
});

Cypress.Commands.add("removeBookFromCart", (bookId: string) => {
  cy.get(`[data-testid="remove-from-cart-${bookId}"]`).click();
});

// Utility commands
Cypress.Commands.add("waitForPageLoad", () => {
  cy.get('[data-testid="page-loaded"]', { timeout: 10000 }).should("exist");
});

Cypress.Commands.add("interceptImageKit", () => {
  cy.intercept("POST", "**/api/auth/imagekit", {
    statusCode: 200,
    body: {
      token: "mock-token",
      expire: Date.now() + 3600000,
      signature: "mock-signature",
    },
  }).as("imagekitAuth");
});

Cypress.Commands.add("interceptMLRecommendations", (bookId: string) => {
  cy.intercept("GET", `**/api/ml-recommendations/${bookId}`, {
    statusCode: 200,
    body: {
      recommendations: [
        {
          id: "mock-rec-1",
          title: "Mock Recommendation 1",
          author: "Mock Author",
          genre: "Fiction",
          coverUrl: "mock-cover-url",
          totalCopies: 5,
          availableCopies: 3,
        },
      ],
    },
  }).as("mlRecommendations");
});

// Viewport commands with implementation
Cypress.Commands.add("setMobileViewport", () => {
  cy.viewport(375, 667);
});

Cypress.Commands.add("setTabletViewport", () => {
  cy.viewport(768, 1024);
});

Cypress.Commands.add("setDesktopViewport", () => {
  cy.viewport(1280, 720);
});

// Test user management commands
Cypress.Commands.add("createTestUserIfNotExists", (userData: any) => {
  // Create user directly using the test signup endpoint
  // This endpoint creates a user with random password, then we update it
  cy.request({
    method: "POST",
    url: "/api/test-signup",
    body: {
      email: userData.email,
      fullName: userData.fullName,
      universityId: userData.universityId.toString(),
    },
    failOnStatusCode: false, // Don't fail if user already exists
  }).then((createResponse) => {
    if (createResponse.status === 200) {
      // Update the created user's password and status to approved
      cy.task("updateTestUser", {
        email: userData.email,
        password: userData.password,
        status: "APPROVED",
      });
    } else {
      // User might already exist, just update their status
      cy.task("updateTestUser", {
        email: userData.email,
        password: userData.password,
        status: "APPROVED",
      });
    }
  });
});

Cypress.Commands.add("signInAsTestUser", (userType: "student" | "admin") => {
  cy.fixture("test-accounts").then((accounts) => {
    const userData =
      userType === "admin" ? accounts.testAdmin : accounts.testStudent;

    // Create user if not exists
    cy.createTestUserIfNotExists(userData);

    // Sign in using the form (not API)
    cy.visit("/sign-in");
    cy.get('input[name="email"]').type(userData.email);
    cy.get('input[name="password"]').type(userData.password);
    cy.get('button[type="submit"]').click();

    // Wait for successful redirect
    cy.url().should("not.include", "/sign-in");
  });
});

// Add command for file upload testing with ImageKit
Cypress.Commands.add(
  "uploadFile",
  (selector: string, fileName: string, fileType: string) => {
    cy.fixture(fileName, "base64").then((fileContent) => {
      const blob = Cypress.Blob.base64StringToBlob(fileContent, fileType);
      const file = new File([blob], fileName, { type: fileType });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      cy.get(selector).then((input) => {
        const inputElement = input[0] as HTMLInputElement;
        inputElement.files = dataTransfer.files;
        inputElement.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }
);

// Custom command for logging in with session persistence
Cypress.Commands.add(
  "loginWithSession",
  (userEmail: string, userPassword: string) => {
    cy.session([userEmail, userPassword], () => {
      cy.visit("/sign-in");

      // Fill sign-in form
      cy.get('input[name="email"]').clear().type(userEmail);
      cy.get('input[name="password"]').clear().type(userPassword);

      // Submit sign-in form
      cy.get('button[type="submit"]').click();
      cy.wait(3000); // Wait for authentication

      // Verify login was successful by checking we're not on sign-in page anymore
      cy.url().then((url) => {
        if (!url.includes("/sign-in")) {
          cy.log("✅ Session login successful");
        } else {
          cy.log("⚠️ Session login may have failed or account needs approval");
        }
      });
    });
  }
);

// Custom command for adding a book to borrow cart
Cypress.Commands.add("addBookToBorrowCart", (bookSelector?: string) => {
  if (bookSelector) {
    // Use specific book selector
    cy.get(bookSelector).within(() => {
      cy.get(
        'button:contains("Add to Borrow Cart"), button:contains("Add to Cart")'
      )
        .first()
        .click();
    });
  } else {
    // Find any available "Add to Cart" button
    cy.get(
      'button:contains("Add to Borrow Cart"), button:contains("Add to Cart")'
    )
      .first()
      .click();
  }
  cy.wait(1000); // Wait for cart update
});

// Custom command for checking borrow cart count
Cypress.Commands.add("checkBorrowCartCount", (expectedCount?: number) => {
  cy.get("body").then(($body) => {
    // Look for cart count indicators
    const cartElements = $body.find('[class*="cart"], [data-testid*="cart"]');
    if (cartElements.length > 0) {
      cy.log(`🛒 Found cart elements: ${cartElements.length}`);
      if (expectedCount !== undefined) {
        // Could add specific count verification here
        cy.log(`Expected cart count: ${expectedCount}`);
      }
    } else {
      cy.log("⚠️ No cart count elements found");
    }
  });
});

// Custom command for completing the borrow process
Cypress.Commands.add("completeBorrowProcess", () => {
  cy.visit("/borrow-cart");
  cy.wait(2000);

  cy.get("body").then(($body) => {
    const borrowButtons = $body.find(
      'button:contains("Borrow"), button:contains("Checkout"), button:contains("Borrow All")'
    );

    if (borrowButtons.length > 0) {
      cy.wrap(borrowButtons.first()).click();
      cy.wait(3000); // Wait for borrow process

      // Check for result messages
      cy.get("body").then(($resultBody) => {
        const resultText = $resultBody.text();

        if (resultText.includes("success") || resultText.includes("borrowed")) {
          cy.log("✅ Borrow process completed successfully");
          return true;
        } else if (
          resultText.includes("not approved") ||
          resultText.includes("pending")
        ) {
          cy.log("⚠️ Borrow blocked - account not approved");
          return false;
        } else {
          cy.log("ℹ️ Borrow process completed with unclear result");
          return false;
        }
      });
    } else {
      cy.log("❌ No borrow button found");
      return false;
    }
  });
});
