import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("Lab 3 - Authenticated Requester Identity", () => {
  it("should use the authenticated requester when listing tickets", async () => {
    const agent = request.agent(app);

    const loginResponse = await agent
      .post("/api/auth/login")
      .send({
        email: "sarah.williams@example.com",
        password: "Password123!",
      });

    expect(loginResponse.status).toBe(200);

    const response = await agent.get("/api/tickets");

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();

    for (const ticket of response.body.data) {
      expect(ticket.requesterId).toBe(3);
    }
  });

  it("should reject unauthenticated access to my tickets", async () => {
    const response = await request(app).get("/api/tickets");

    expect(response.status).toBe(401);
  });

  it("should not allow a requester to impersonate another requester", async () => {
    const agent = request.agent(app);

    const loginResponse = await agent
      .post("/api/auth/login")
      .send({
        email: "sarah.williams@example.com",
        password: "Password123!",
      });

    expect(loginResponse.status).toBe(200);

    const response = await agent
      .get("/api/tickets")
      .query({
        requesterId: 1,
      });

    expect(response.status).toBe(200);

    for (const ticket of response.body.data) {
      expect(ticket.requesterId).toBe(3);
    }
  });
});

it("should use the authenticated requester when creating a ticket", async () => {
  const agent = request.agent(app);

  const loginResponse = await agent
    .post("/api/auth/login")
    .send({
      email: "sarah.williams@example.com",
      password: "Password123!",
    });

  expect(loginResponse.status).toBe(200);

  const response = await agent
    .post("/api/tickets")
    .send({
      categoryId: 1,
      relatedSystemId: 1,
      summary: "Cannot access email",
      description:
        "I am unable to access my university email account.",
      requestedPriority: "MEDIUM",
    });

  expect(response.status).toBe(201);
  expect(response.body.requesterId).toBe(3);
});