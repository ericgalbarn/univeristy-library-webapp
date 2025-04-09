import { db } from "./db";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function runMigration() {
  // Get the database URL from environment variable
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  try {
    // Create the favorite_books table directly
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "favorite_books" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "book_id" uuid NOT NULL,
        "created_at" timestamp with time zone DEFAULT now(),
        CONSTRAINT "favorite_books_id_unique" UNIQUE("id")
      );
    `);

    // Add foreign key constraints
    await db.execute(`
      ALTER TABLE "favorite_books" 
      ADD CONSTRAINT IF NOT EXISTS "favorite_books_user_id_users_id_fk" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
    `);

    await db.execute(`
      ALTER TABLE "favorite_books" 
      ADD CONSTRAINT IF NOT EXISTS "favorite_books_book_id_books_id_fk" 
      FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE cascade ON UPDATE no action;
    `);

    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
