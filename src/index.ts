import { Elysia } from "elysia";
import { db } from "./db";
import { usersRoutes } from "./routes/users-routes";
import { users } from "./db/schema";

export const app = new Elysia()
  /**
   * Endpoint: GET /
   * Kegunaan: Uji coba server aktif (Health Check).
   */
  .get("/", () => "Hello Elysia")
  // Menggunakan rute usersRoutes yang berisi endpoint API user management
  .use(usersRoutes)
  /**
   * Endpoint: GET /users
   * Kegunaan: Mengambil daftar seluruh user di database (Hanya untuk keperluan debugging).
   */
  .get("/users", async () => {
    try {
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (e) {
      console.error(e);
      return { error: "Failed to fetch users" };
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
