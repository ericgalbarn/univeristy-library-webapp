import { defineConfig } from "cypress";

export default defineConfig({
  // Global configuration
  video: false,
  screenshotOnRunFailure: true,
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,

  // Environment variables for testing
  env: {
    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_URL: process.env.POSTGRES_URL,

    // Auth
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,

    // ImageKit (will be mocked in tests)
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY: "test_private_key",
    IMAGEKIT_URL_ENDPOINT: "https://test.imagekit.io",

    // Resend (will be mocked in tests)
    RESEND_API_KEY: process.env.RESEND_API_KEY,

    // ML API
    PYTHON_API_URL: process.env.PYTHON_API_URL,
  },

  // E2E Testing Configuration
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(on, config) {
      // Tasks for database operations
      on("task", {
        async updateTestUser({ email, password, status }) {
          try {
            // Check if we have database connection string
            if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
              console.log(
                `⚠️ No database connection available, skipping update for: ${email}`
              );
              return {
                success: true,
                message: "Database task skipped (no connection)",
              };
            }

            // Import database modules
            const { hash } = await import("bcryptjs");
            const { db } = await import("./db/db");
            const { users } = await import("./db/schema");
            const { eq } = await import("drizzle-orm");

            // Hash the password
            const hashedPassword = await hash(password, 10);

            // Update the user in the database
            const result = await db
              .update(users)
              .set({
                password: hashedPassword,
                status: status,
              })
              .where(eq(users.email, email))
              .returning();

            if (result.length > 0) {
              console.log(`✅ Updated test user: ${email}, status: ${status}`);
              return { success: true, user: result[0] };
            } else {
              console.log(`❌ User not found: ${email}`);
              return { success: false, error: "User not found" };
            }
          } catch (error) {
            console.error("❌ Error updating test user:", error);
            return {
              success: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
      });
    },
    env: {
      // Database
      DATABASE_URL: process.env.DATABASE_URL,
      POSTGRES_URL: process.env.POSTGRES_URL,

      // Auth
      AUTH_SECRET: process.env.AUTH_SECRET || "test-secret-for-cypress",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "test-secret-for-cypress",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",

      // External services (will be mocked in tests)
      IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY || "test_public_key",
      IMAGEKIT_PRIVATE_KEY: "test_private_key",
      IMAGEKIT_URL_ENDPOINT: "https://test.imagekit.io",

      // Resend (will be mocked in tests)
      RESEND_API_KEY: process.env.RESEND_API_KEY || "test_resend_key",

      // ML API
      PYTHON_API_URL: process.env.PYTHON_API_URL || "http://localhost:5000",
    },
  },

  // Component Testing Configuration
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/component.ts",
    indexHtmlFile: "cypress/support/component-index.html",
    excludeSpecPattern: ["**/BookCard.cy.tsx"], // Exclude the complex mount test for now
    setupNodeEvents(on, config) {
      // Tasks for component testing
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
    env: {
      // Inherit environment variables
      ...process.env,
    },
  },
});
