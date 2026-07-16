import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-services";

export const usersRoutes = new Elysia({ prefix: "/api" })
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
    })
  })
  .post("/users/login", async ({ body, set }) => {
    try {
      await loginUser(body);
      return { data: "Berhasil" };
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
    })
  })
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
    }
  })
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
    }
  });
