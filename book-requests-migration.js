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
-- Add status enum type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
        CREATE TYPE status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;
END$$;

-- Create book_requests table
CREATE TABLE IF NOT EXISTS "book_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "author" varchar(255) NOT NULL,
  "genre" text NOT NULL,
  "rating" integer NOT NULL,
  "cover_url" text NOT NULL,
  "cover_color" varchar(7) NOT NULL,
  "description" text NOT NULL,
  "total_copies" integer DEFAULT 1 NOT NULL,
  "available_copies" integer DEFAULT 0 NOT NULL,
  "video_url" text NOT NULL,
  "summary" varchar NOT NULL,
  "status" status DEFAULT 'PENDING' NOT NULL,
  "review_note" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "book_requests_id_unique" UNIQUE("id")
);

-- Add foreign key constraint
ALTER TABLE "book_requests" 
DROP CONSTRAINT IF EXISTS "book_requests_user_id_users_id_fk";

ALTER TABLE "book_requests" 
ADD CONSTRAINT "book_requests_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
`;

try {
  // Write SQL to temp file
  fs.writeFileSync("book-requests-migration.sql", sql);

  // Run PSQL command
  console.log("Running book requests migration...");
  execSync(`psql "${dbUrl}" -f book-requests-migration.sql`, {
    stdio: "inherit",
  });

  // Clean up
  fs.unlinkSync("book-requests-migration.sql");

  console.log("Book requests migration completed successfully");
} catch (error) {
  console.error("Book requests migration failed:", error);
  process.exit(1);
}
