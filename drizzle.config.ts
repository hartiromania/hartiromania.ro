import { defineConfig } from "drizzle-kit";

// Migrations use the direct (unpooled) connection. Run with the local env file:
//   pnpm db:generate   →  writes SQL into drizzle/
//   pnpm db:migrate    →  applies it to the database
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "" },
});
