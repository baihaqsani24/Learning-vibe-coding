import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-services";

export const usersRoutes = new Elysia({ prefix: "/api" })
  /**
   * Endpoint: POST /api/users
   * Kegunaan: Mendaftarkan user baru ke sistem.
   * Validasi: Memeriksa name, email, dan password (maksimal 255 karakter).
   */
  .post("/users", async ({ body, set }) => {
    try {
      await registerUser(body);
      return { data: "OK" };
    } catch (error: any) {
      set.status = 400;
      return { error: error.message || "Email sudah terdaftar" };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String()
    })
  })
  /**
   * Endpoint: POST /api/users/login
   * Kegunaan: Melakukan autentikasi user (login) dan mengembalikan token sesi.
   */
  .post("/users/login", async ({ body, set }) => {
    try {
      await loginUser(body);
      return { data: "Berhasil" };
    } catch (error: any) {
      set.status = 401;
      return { error: error.message || "email atau password salah" };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String()
    })
  })
  /**
   * Endpoint: GET /api/users/current
   * Kegunaan: Mengambil data profil user yang sedang login berdasarkan token sesi Bearer.
   */
  .get("/users/current", async ({ headers, set }) => {
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    
    const token = authHeader.split(" ")[1];
    
    try {
      const user = await getCurrentUser(token);
      return { data: user };
    } catch (error: any) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  })
  /**
   * Endpoint: DELETE /api/users/logout
   * Kegunaan: Mengakhiri sesi pengguna (logout) dengan menghapus token dari database.
   */
  .delete("/users/logout", async ({ headers, set }) => {
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    
    const token = authHeader.split(" ")[1];
    
    try {
      await logoutUser(token);
      return { data: "OK" };
    } catch (error: any) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  });
