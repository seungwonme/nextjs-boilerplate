import { type NeonQueryFunction, neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

let sql: NeonQueryFunction<false, false>;
let db: NeonHttpDatabase;

if (process.env.DATABASE_URL) {
  sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql);
}

export { db };
