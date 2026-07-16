import { describe, expect, it } from "bun:test";
import { app } from "../src/index";

const validUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123"
};

describe("Users API", () => {
  describe("POST /api/users", () => {
    it("should successfully register a valid user", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validUser),
        })
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ data: "OK" });
    });

    it("should fail when registering with an existing email", async () => {
      // First registration
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validUser),
        })
      );
      
      // Duplicate registration
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validUser),
        })
      );
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("email sudah terdaftar");
    });

    it("should fail when registering with name length > 255", async () => {
      const longNameUser = { ...validUser, name: "A".repeat(300) };
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(longNameUser),
        })
      );
      // Elysia validation returns 422
      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/users/login", () => {
    it("should successfully login with valid credentials", async () => {
      // Register first
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validUser),
        })
      );

      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: validUser.name, // login route expects name due to current payload schema
            email: validUser.email,
            password: validUser.password
          }),
        })
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty("token");
    });

    it("should fail to login with wrong credentials", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: validUser.name,
            email: "wrong@example.com",
            password: "wrongpassword"
          }),
        })
      );
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("email atau password salah");
    });

    it("should fail to login with invalid input length", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: validUser.name,
            email: "A".repeat(300),
            password: validUser.password
          }),
        })
      );
      expect(response.status).toBe(422);
    });
  });

  describe("GET /api/users/current", () => {
    it("should return current user with valid token", async () => {
      // Register
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validUser),
        })
      );
      // Login
      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validUser),
        })
      );
      const loginData = await loginRes.json();
      const token = loginData.data.token;

      // Get Current User
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.name).toBe(validUser.name);
      expect(data.data.email).toBe(validUser.email);
    });

    it("should fail without token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET"
        })
      );
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should fail with invalid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            "Authorization": "Bearer invalid_token"
          }
        })
      );
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("DELETE /api/users/logout", () => {
    it("should successfully logout with valid token", async () => {
      // Register & Login
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validUser),
        })
      );
      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validUser),
        })
      );
      const loginData = await loginRes.json();
      const token = loginData.data.token;

      // Logout
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ data: "OK" });

      // Verify token is no longer usable
      const verifyRes = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
      );
      expect(verifyRes.status).toBe(401);
    });

    it("should fail without token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE"
        })
      );
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should fail with invalid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            "Authorization": "Bearer invalid_token"
          }
        })
      );
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });
  });
});
