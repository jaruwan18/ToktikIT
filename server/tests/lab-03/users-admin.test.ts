import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

const INITIAL_PASSWORD = "Password123!";

async function login(
  email: string,
  password = INITIAL_PASSWORD,
) {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password,
    });

  expect(response.status).toBe(200);

  return response.headers["set-cookie"];
}

describe("Lab 3 - Administrator User Management API", () => {
  it("rejects unauthenticated users", async () => {
    const response = await request(app)
      .get("/api/admin/users");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("UNAUTHENTICATED");
  });

  it("rejects Requester users", async () => {
    const cookies = await login(
      "sarah.williams@example.com",
    );

    const response = await request(app)
      .get("/api/admin/users")
      .set("Cookie", cookies);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("FORBIDDEN");
  });

  it("rejects IT Staff users", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const response = await request(app)
      .get("/api/admin/users")
      .set("Cookie", cookies);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("FORBIDDEN");
  });

  it("allows Admin users to list users", async () => {
    const cookies = await login(
      "admin@example.com",
    );

    const response = await request(app)
      .get("/api/admin/users")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.users)).toBe(true);
  });

  it("supports searching users by name or email", async () => {
    const cookies = await login(
      "admin@example.com",
    );

    const response = await request(app)
      .get("/api/admin/users")
      .query({
        search: "Sarah",
      })
      .set("Cookie", cookies);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.users)).toBe(true);

    expect(
      response.body.users.some(
        (user: { email: string }) =>
          user.email === "sarah.williams@example.com",
      ),
    ).toBe(true);
  });

  it("allows Admin to create a user with one role", async () => {
    const cookies = await login(
      "admin@example.com",
    );

    const email = `lab3-user-${Date.now()}@example.com`;

    const response = await request(app)
      .post("/api/admin/users")
      .set("Cookie", cookies)
      .send({
        displayName: "Lab 3 Test User",
        email,
        role: "REQUESTER",
        password: INITIAL_PASSWORD,
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(email);
    expect(response.body.user.role).toBe("REQUESTER");
  });

  it("rejects duplicate email addresses", async () => {
    const cookies = await login(
      "admin@example.com",
    );

    const response = await request(app)
      .post("/api/admin/users")
      .set("Cookie", cookies)
      .send({
        displayName: "Duplicate Test User",
        email: "sarah.williams@example.com",
        role: "REQUESTER",
        password: INITIAL_PASSWORD,
      });

    expect(response.status).toBe(409);
  });

  it("allows Admin to edit basic account information and role", async () => {
    const cookies = await login(
      "admin@example.com",
    );

    const email = `lab3-edit-${Date.now()}@example.com`;

    const createResponse = await request(app)
      .post("/api/admin/users")
      .set("Cookie", cookies)
      .send({
        displayName: "Before Edit",
        email,
        role: "REQUESTER",
        password: INITIAL_PASSWORD,
      });

    expect(createResponse.status).toBe(201);

    const userId = createResponse.body.user.id;

    const response = await request(app)
      .patch(`/api/admin/users/${userId}`)
      .set("Cookie", cookies)
      .send({
        displayName: "After Edit",
        email,
        role: "IT_STAFF",
      });

    expect(response.status).toBe(200);
    expect(response.body.user.displayName).toBe("After Edit");
    expect(response.body.user.role).toBe("IT_STAFF");
  });

  it("allows Admin to deactivate and reactivate a user", async () => {
    const cookies = await login(
      "admin@example.com",
    );

    const email = `lab3-active-${Date.now()}@example.com`;

    const createResponse = await request(app)
      .post("/api/admin/users")
      .set("Cookie", cookies)
      .send({
        displayName: "Activation Test User",
        email,
        role: "REQUESTER",
        password: INITIAL_PASSWORD,
      });

    expect(createResponse.status).toBe(201);

    const userId = createResponse.body.user.id;

    const deactivateResponse = await request(app)
      .patch(`/api/admin/users/${userId}`)
      .set("Cookie", cookies)
      .send({
        isActive: false,
      });

    expect(deactivateResponse.status).toBe(200);
    expect(deactivateResponse.body.user.isActive).toBe(false);

    const reactivateResponse = await request(app)
      .patch(`/api/admin/users/${userId}`)
      .set("Cookie", cookies)
      .send({
        isActive: true,
      });

    expect(reactivateResponse.status).toBe(200);
    expect(reactivateResponse.body.user.isActive).toBe(true);
  });

  it("allows Admin to set a new initial password", async () => {
    const cookies = await login(
      "admin@example.com",
    );

    const email = `lab3-password-${Date.now()}@example.com`;
    const newPassword = "NewPassword123!";

    const createResponse = await request(app)
      .post("/api/admin/users")
      .set("Cookie", cookies)
      .send({
        displayName: "Password Test User",
        email,
        role: "REQUESTER",
        password: INITIAL_PASSWORD,
      });

    expect(createResponse.status).toBe(201);

    const userId = createResponse.body.user.id;

    const response = await request(app)
      .post(`/api/admin/users/${userId}/initial-password`)
      .set("Cookie", cookies)
      .send({
        password: newPassword,
      });

    expect(response.status).toBe(200);
    expect(response.body.user.mustChangePassword).toBe(true);
  });

  it("prevents an Admin from deactivating their own account", async () => {
    const cookies = await login(
      "admin@example.com",
    );

    const meResponse = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookies);

    expect(meResponse.status).toBe(200);

    const adminId = meResponse.body.user.id;

    const response = await request(app)
      .patch(`/api/admin/users/${adminId}`)
      .set("Cookie", cookies)
      .send({
        isActive: false,
      });

    expect(response.status).toBe(403);
  });

  it("prevents deactivation of the last active Administrator", async () => {
    const cookies = await login(
      "admin@example.com",
    );

    const adminId = (
      await request(app)
        .get("/api/auth/me")
        .set("Cookie", cookies)
    ).body.user.id;

    const response = await request(app)
      .patch(`/api/admin/users/${adminId}`)
      .set("Cookie", cookies)
      .send({
        isActive: false,
      });

    expect(response.status).toBe(403);
  });
});