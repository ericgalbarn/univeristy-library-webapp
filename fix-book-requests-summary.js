const { execSync } = require("child_process");
const fs = require("fs");
require("dotenv").config();

// Read DATABASE_URL from .env.local
const envContent = fs.readFileSync(".env.local", "utf8");
const match = envContent.match(/DATABASE_URL=(.+)/);
const dbUrl = match ? match[1] : null;

if (!dbUrl) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = `
-- Fix the summary field in book_requests table
ALTER TABLE "book_requests" 
ALTER COLUMN "summary" TYPE text;
`;

try {
  // Write SQL to temp file
  fs.writeFileSync("fix-summary-migration.sql", sql);

  // Run PSQL command
  console.log("Fixing summary field in book_requests table...");
  execSync(`psql "${dbUrl}" -f fix-summary-migration.sql`, {
    stdio: "inherit",
  });

  // Clean up
  fs.unlinkSync("fix-summary-migration.sql");

  console.log("Summary field fixed successfully");
} catch (error) {
  console.error("Migration to fix summary field failed:", error);
  process.exit(1);
}
