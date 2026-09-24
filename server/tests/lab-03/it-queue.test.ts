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

describe("Lab 3 - IT Staff Queue API", () => {
  it("rejects unauthenticated users", async () => {
    const response = await request(app)
      .get("/api/it/tickets");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("UNAUTHENTICATED");
  });

  it("rejects Requester users", async () => {
    const cookies = await login(
      "sarah.williams@example.com",
    );

    const response = await request(app)
      .get("/api/it/tickets")
      .set("Cookie", cookies);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("FORBIDDEN");
  });

  it("allows IT Staff users to access the queue", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const response = await request(app)
      .get("/api/it/tickets")
      .set("Cookie", cookies);

    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  });

  it("allows Admin users to access the queue", async () => {
    const cookies = await login(
      "admin@example.com",
    );

    const response = await request(app)
      .get("/api/it/tickets")
      .set("Cookie", cookies);

    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  });
});