import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("Lab 3 - Authentication API", () => {
  it("should reject login when email is missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        password: "Password123!",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("VALIDATION_ERROR");
  });

  it("should reject login when password is missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("VALIDATION_ERROR");
  });

  it("should reject login with incorrect credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "WrongPassword123!",
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("INVALID_CREDENTIALS");
  });

  it("should login with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "Password123!",
      });

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(
      "admin@example.com",
    );
    expect(response.body.user.role).toBe("ADMIN");
    expect(response.headers["set-cookie"]).toBeDefined();
  });
});