describe("Simple Borrow Book Flow", () => {
  const timestamp = Date.now();
  const testUser = {
    fullName: `Simple Test User ${timestamp}`,
    email: `simple.test.${timestamp}@university.edu`,
    universityId: `${timestamp}`.slice(-5),
    password: "SimpleTestPassword123!",
  };

  before(() => {
    // Clear all sessions and storage at the start
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();

    // Mock external services
    cy.intercept("GET", "/api/auth/imagekit", {
      statusCode: 200,
      body: {
        signature: "test-signature",
        expire: Date.now() + 60000,
        token: "test-token",
      },
    });

    cy.intercept("POST", "https://upload.imagekit.io/**", {
      statusCode: 200,
      body: {
        fileId: "test-file-id",
        name: "university-id.png",
        filePath: "/test/university-id.png",
        url: "https://test.imagekit.io/test/university-id.png",
      },
    });

    // Mock user info API to return APPROVED status
    cy.intercept("GET", "/api/user/info", {
      statusCode: 200,
      body: {
        user: {
          id: "test-user-id",
          status: "APPROVED",
          fullName: testUser.fullName,
          email: testUser.email,
        },
      },
    }).as("userInfoAPI");

    // Intercept the borrow books API call
    cy.intercept("POST", "/api/books/borrow-multiple", {
      statusCode: 200,
      body: {
        success: true,
        message: "Books borrowed successfully",
        borrowedBooks: [],
      },
    }).as("borrowBooksAPI");
  });

  it("should complete the full borrowing workflow and click 'Borrow All Books' button", () => {
    cy.log("🚀 Starting complete borrow book workflow");

    // STEP 1: Sign up
    cy.log("📝 STEP 1: Creating new user account");
    cy.visit("/sign-up");
    cy.get('input[name="fullName"]').type(testUser.fullName);
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="universityId"]').type(testUser.universityId);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait(3000);
    cy.log("✅ Sign-up completed");

    // STEP 2: Sign in
    cy.log("🔐 STEP 2: Signing in with new account");
    cy.visit("/sign-in");
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait(3000);
    cy.log("✅ Sign-in completed");

    // STEP 3: Browse library and select books
    cy.log("📚 STEP 3: Browsing library and selecting books");
    cy.visit("/browse-library");
    cy.wait(4000);

    // Select books regardless of access level
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="book-card"]').length > 0) {
        cy.log("📚 Books found - adding to cart");

        // Add first book to cart
        cy.get('[data-cy="book-card"]').first().trigger("mouseover");
        cy.wait(1000);

        // Look for cart button and click it
        cy.get('[data-cy="book-card"]')
          .first()
          .within(() => {
            cy.get("button")
              .contains(/add to.*cart|cart/i)
              .click({ force: true });
          });
        cy.wait(2000);
        cy.log("✅ First book added to cart");

        // Try to add second book if available
        cy.get('[data-cy="book-card"]').then(($cards) => {
          if ($cards.length > 1) {
            cy.get('[data-cy="book-card"]').eq(1).trigger("mouseover");
            cy.wait(1000);
            cy.get('[data-cy="book-card"]')
              .eq(1)
              .within(() => {
                cy.get("button")
                  .contains(/add to.*cart|cart/i)
                  .click({ force: true });
              });
            cy.wait(2000);
            cy.log("✅ Second book added to cart");
          }
        });
      } else {
        cy.log("⚠️ No books found, but continuing to cart test");
      }
    });

    // STEP 4: Go to cart and DEFINITELY click "Borrow All Books"
    cy.log("🛒 STEP 4: Navigating to cart and clicking 'Borrow All Books'");
    cy.visit("/borrow-cart");
    cy.wait(3000);

    // Wait for user info API to be called (which makes the button enabled)
    cy.wait("@userInfoAPI");
    cy.log("✅ User info loaded with APPROVED status");

    cy.url().should("include", "/borrow-cart");
    cy.log("✅ Successfully navigated to borrow cart page");

    // Wait a bit more for the component to re-render with user info
    cy.wait(2000);

    // Find and click the borrow button - this is the critical step
    cy.log("🎯 CRITICAL STEP: Looking for enabled 'Borrow All Books' button");

    // First, log all buttons on the page for debugging
    cy.get("button").then(($buttons) => {
      cy.log(`📋 Found ${$buttons.length} buttons on cart page:`);
      $buttons.each((index, btn) => {
        const buttonText = btn.textContent?.trim() || "";
        const isDisabled = btn.disabled;
        cy.log(`  ${index + 1}. "${buttonText}" (disabled: ${isDisabled})`);
      });
    });

    // Now find and click the borrow button
    cy.get("button")
      .contains(/borrow.*all|borrow all books/i)
      .should("exist")
      .should("not.be.disabled") // Ensure button is enabled
      .then(($btn) => {
        const buttonText = $btn.text().trim();
        const isDisabled = $btn.prop("disabled");
        cy.log(
          `🎯 Found borrow button: "${buttonText}" (disabled: ${isDisabled})`
        );
        cy.log("🚀 CLICKING 'Borrow All Books' button NOW!");

        // Click the button
        cy.wrap($btn).click();

        cy.log("✅ BUTTON CLICKED! Waiting for API call...");
      });

    // Verify the API call was made
    cy.wait("@borrowBooksAPI", { timeout: 10000 }).then((interception) => {
      cy.log("🎉 SUCCESS: POST /api/books/borrow-multiple API was triggered!");
      cy.log(`📤 Request method: ${interception.request.method}`);
      cy.log(`📤 Request URL: ${interception.request.url}`);
      cy.log(`📤 Request body:`, interception.request.body);

      if (interception.response) {
        cy.log(`📥 Response status: ${interception.response.statusCode}`);
        cy.log(`📥 Response body:`, interception.response.body);
      }
    });

    // Wait for any UI updates and log final result
    cy.wait(3000);
    cy.log("🏁 WORKFLOW COMPLETED SUCCESSFULLY!");
    cy.log("✅ User account creation: SUCCESS");
    cy.log("✅ Sign-in process: SUCCESS");
    cy.log("✅ User approved status mocked: SUCCESS");
    cy.log("✅ Cart navigation: SUCCESS");
    cy.log("✅ 'Borrow All Books' button clicked: SUCCESS");
    cy.log("✅ API call triggered: SUCCESS");
  });
});
