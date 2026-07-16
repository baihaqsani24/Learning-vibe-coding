import { db } from "./src/db";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  try {
    const result = await db.select().from(users);
    console.log("Success:", result);
  } catch (e: any) {
    console.error("Error:", e);
    if (e.cause) console.error("Cause:", e.cause);
  }
  process.exit(0);
}
main();
