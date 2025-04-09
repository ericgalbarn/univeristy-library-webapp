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
CREATE TABLE IF NOT EXISTS "favorite_books" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "book_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "favorite_books_id_unique" UNIQUE("id")
);

ALTER TABLE "favorite_books" 
DROP CONSTRAINT IF EXISTS "favorite_books_user_id_users_id_fk";

ALTER TABLE "favorite_books" 
ADD CONSTRAINT "favorite_books_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "favorite_books" 
DROP CONSTRAINT IF EXISTS "favorite_books_book_id_books_id_fk";

ALTER TABLE "favorite_books" 
ADD CONSTRAINT "favorite_books_book_id_books_id_fk" 
FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE cascade ON UPDATE no action;
`;

try {
  // Write SQL to temp file
  fs.writeFileSync("migration.sql", sql);

  // Run PSQL command
  console.log("Running migration...");
  execSync(`psql "${dbUrl}" -f migration.sql`, { stdio: "inherit" });

  // Clean up
  fs.unlinkSync("migration.sql");

  console.log("Migration completed successfully");
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
}
