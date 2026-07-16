import { beforeEach } from "bun:test";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";

beforeEach(async () => {
  // Menghapus data dari tabel sessions dan users sebelum setiap test
  // Perhatikan bahwa karena sessions me-reference users, hapus sessions terlebih dahulu
  await db.delete(sessions);
  await db.delete(users);
});
