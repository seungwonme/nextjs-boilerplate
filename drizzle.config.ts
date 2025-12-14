import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/entities/*/model/schema.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: required for drizzle-kit CLI
    url: process.env.DATABASE_URL!,
  },
});
