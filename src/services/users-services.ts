import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function registerUser(payload: typeof users.$inferInsert) {
  // 1. Check if email already exists
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, payload.email));

  if (existingUsers.length > 0) {
    throw new Error("email sudah terdaftar");
  }

  // 2. Hash password
  const hashedPassword = await Bun.password.hash(payload.password, "bcrypt");

  // 3. Insert user into DB
  await db.insert(users).values({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
  });

  return { success: true };
}
