import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

/**
 * Mendaftarkan user baru ke dalam database.
 * 
 * Fungsi ini melakukan:
 * 1. Pengecekan apakah email sudah digunakan oleh user lain.
 * 2. Enkripsi (hashing) password menggunakan algoritma bcrypt.
 * 3. Penyimpanan data user baru ke database.
 * 
 * @param payload Objek berisi data user (name, email, password) yang akan didaftarkan
 * @throws {Error} Jika email sudah terdaftar di database
 */
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

/**
 * Melakukan proses masuk log (login) user.
 * 
 * Fungsi ini melakukan:
 * 1. Pencarian data user berdasarkan email.
 * 2. Verifikasi kesesuaian password input dengan password hash di DB menggunakan bcrypt.
 * 3. Pembuatan token sesi baru (UUID).
 * 4. Penyimpanan token sesi ke tabel `sessions` dan mengembalikan token tersebut.
 * 
 * @param payload Objek berisi kredensial user (email, password)
 * @returns Token sesi yang baru dibuat untuk autentikasi rute lain
 * @throws {Error} Jika email tidak ditemukan atau password tidak cocok
 */
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

/**
 * Mengambil data profil user yang saat ini sedang aktif (login).
 * 
 * Fungsi ini mencari sesi berdasarkan token, lalu melakukan INNER JOIN
 * dengan tabel `users` untuk mengambil informasi profil user terkait.
 * 
 * @param token Token sesi yang dikirimkan oleh klien (melalui Header Bearer)
 * @returns Objek profil user (id, name, email, createdAt)
 * @throws {Error} Jika sesi tidak ditemukan atau token tidak valid (Unauthorized)
 */
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

/**
 * Melakukan proses keluar log (logout) user.
 * 
 * Fungsi ini menghapus data sesi aktif dari tabel `sessions` berdasarkan token.
 * Sesi yang dihapus akan membuat token tersebut tidak dapat digunakan lagi.
 * 
 * @param token Token sesi aktif yang ingin dihapus
 * @throws {Error} Jika token/sesi tidak ditemukan di database (Unauthorized)
 */
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
