import { db } from "../db";
import { users, sessions } from "../db/schema";
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

export async function loginUser(payload: typeof users.$inferInsert) {
  // 1. Find user by email
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, payload.email));

  if (existingUsers.length === 0) {
    throw new Error("email atau password salah");
  }

  const user = existingUsers[0];

  // 2. Verify password
  const isPasswordValid = await Bun.password.verify(payload.password, user.password);
  if (!isPasswordValid) {
    throw new Error("email atau password salah");
  }

  // 3. Generate UUID token
  const token = crypto.randomUUID();

  // 4. Save session in DB
  await db.insert(sessions).values({
    token: token,
    userId: user.id,
  });

  return { success: true, token };
}

export async function getCurrentUser(token: string) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      created_at: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token));

  if (result.length === 0) {
    throw new Error("Unauthorized");
  }

  return result[0];
}

export async function logoutUser(token: string) {
  const existingSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token));

  if (existingSessions.length === 0) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(sessions)
    .where(eq(sessions.token, token));

  return { success: true };
}
