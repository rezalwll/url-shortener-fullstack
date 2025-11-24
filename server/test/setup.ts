import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./prisma/test.db";
}
