import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Configure the database connection
const client = postgres(connectionString, {
  max: 1, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Timeout for establishing a connection
});

export const db = drizzle(client, { schema });
