import { type NeonQueryFunction, neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as fileSchema from "@/entities/file/model/schema";
import * as userSchema from "@/entities/user/model/schema";

const schema = { ...userSchema, ...fileSchema };

let sql: NeonQueryFunction<false, false>;
let db: NeonHttpDatabase<typeof schema>;

if (process.env.DATABASE_URL) {
  sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
}

export { db };
