import { Elysia } from "elysia";
import { db } from "./db";
import { usersRoutes } from "./routes/users-routes";
import { users } from "./db/schema";
import { swagger } from "@elysiajs/swagger";

export const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Belajar Vibe Coding API",
          version: "1.0.0",
          description: "Dokumentasi interaktif untuk Backend API Manajemen Pengguna"
        },
        components: {
          securitySchemes: {
            BearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "UUID"
            }
          }
        }
      }
    })
  )
  .get("/", () => "Hello Elysia")
  .use(usersRoutes)
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
