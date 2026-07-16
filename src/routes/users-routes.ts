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
    detail: {
      tags: ['Users'],
      summary: 'Daftarkan akun pengguna baru',
      description: 'Menerima masukan name, email, dan password untuk membuat akun baru.'
    },
    body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ maxLength: 255 }),
      password: t.String({ maxLength: 255 })
    }),
    response: {
      200: t.Object({
        data: t.String({ default: "OK" })
      }, { description: "Registrasi Berhasil" }),
      400: t.Object({
        error: t.String({ default: "email sudah terdaftar" })
      }, { description: "Email sudah digunakan" }),
      422: t.Object({
        error: t.String()
      }, { description: "Validasi Gagal (misal nama > 255 karakter)" })
    }
  })
  /**
   * Endpoint: POST /api/users/login
   * Kegunaan: Melakukan autentikasi user (login) dan mengembalikan token sesi.
   */
  .post("/users/login", async ({ body, set }) => {
    try {
      const result = await loginUser(body);
      return { data: { token: result.token } };
    } catch (error: any) {
      set.status = 401;
      return { error: error.message || "email atau password salah" };
    }
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Masuk log (Login)',
      description: 'Verifikasi kredensial pengguna dan mengembalikan token autentikasi.'
    },
    body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ maxLength: 255 }),
      password: t.String({ maxLength: 255 })
    }),
    response: {
      200: t.Object({
        data: t.String({ default: "Berhasil" })
      }, { description: "Login Berhasil" }),
      401: t.Object({
        error: t.String({ default: "email atau password salah" })
      }, { description: "Kredensial salah" }),
      422: t.Object({
        error: t.String()
      }, { description: "Validasi Gagal" })
    }
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
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Dapatkan profil pengguna saat ini',
      description: 'Mengambil data profil pengguna berdasarkan token aktif di header Authorization.',
      security: [{ BearerAuth: [] }]
    },
    response: {
      200: t.Object({
        data: t.Object({
          id: t.Numeric({ default: 1 }),
          name: t.String({ default: "Nama User" }),
          email: t.String({ default: "user@example.com" }),
          created_at: t.Union([t.Date(), t.Null()])
        })
      }, { description: "Data Profil Berhasil Diambil" }),
      401: t.Object({
        error: t.String({ default: "Unauthorized" })
      }, { description: "Token Sesi Tidak Valid atau Kedaluwarsa" })
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
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Keluar log (Logout)',
      description: 'Menghapus sesi aktif pengguna berdasarkan token yang dikirimkan.',
      security: [{ BearerAuth: [] }]
    },
    response: {
      200: t.Object({
        data: t.String({ default: "OK" })
      }, { description: "Logout Berhasil" }),
      401: t.Object({
        error: t.String({ default: "Unauthorized" })
      }, { description: "Token Sesi Tidak Valid" })
    }
  });
