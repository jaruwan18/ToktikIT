import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

const loginAsSarah = async () => {
  const agent = request.agent(app);

  const loginResponse = await agent
    .post("/api/auth/login")
    .send({
      email: "sarah.williams@example.com",
      password: "Password123!",
    });

  expect(loginResponse.status).toBe(200);

  return agent;
};

describe("POST /api/tickets", () => {
  it("creates a ticket successfully", async () => {
    const agent = await loginAsSarah();

    const response = await agent.post("/api/tickets").send({
      categoryId: 1,
      relatedSystemId: 1,
      summary: "Cannot access email",
      description:
        "I am unable to access my university email account.",
      requestedPriority: "MEDIUM",
    });

    expect(response.status).toBe(201);

    expect(response.body).toMatchObject({
      requesterId: 3,
      categoryId: 1,
      relatedSystemId: 1,
      summary: "Cannot access email",
      description:
        "I am unable to access my university email account.",
      requestedPriority: "MEDIUM",
      currentStatus: "NEW",
    });

    expect(response.body.ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
  });

  it("rejects a request with an invalid requester identity", async () => {
    const agent = await loginAsSarah();

    const response = await agent
      .post("/api/tickets")
      .set("X-Requester-Id", "999999")
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

  it("rejects an invalid summary", async () => {
    const agent = await loginAsSarah();

    const response = await agent.post("/api/tickets").send({
      categoryId: 1,
      relatedSystemId: 1,
      summary: "Bad",
      description:
        "I am unable to access my university email account.",
      requestedPriority: "MEDIUM",
    });

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      error: "VALIDATION_ERROR",
    });

    expect(response.body.fields).toHaveProperty("summary");
  });

  it("rejects an invalid description", async () => {
    const agent = await loginAsSarah();

    const response = await agent.post("/api/tickets").send({
      categoryId: 1,
      relatedSystemId: 1,
      summary: "Cannot access email",
      description: "Too short",
      requestedPriority: "MEDIUM",
    });

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      error: "VALIDATION_ERROR",
    });

    expect(response.body.fields).toHaveProperty("description");
  });

  it("rejects an invalid category", async () => {
    const agent = await loginAsSarah();

    const response = await agent.post("/api/tickets").send({
      categoryId: 999999,
      relatedSystemId: 1,
      summary: "Cannot access email",
      description:
        "I am unable to access my university email account.",
      requestedPriority: "MEDIUM",
    });

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      error: "INVALID_REFERENCE",
    });
  });

  it("rejects an invalid requested priority", async () => {
    const agent = await loginAsSarah();

    const response = await agent.post("/api/tickets").send({
      categoryId: 1,
      relatedSystemId: 1,
      summary: "Cannot access email",
      description:
        "I am unable to access my university email account.",
      requestedPriority: "URGENT",
    });

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      error: "VALIDATION_ERROR",
    });

    expect(response.body.fields).toHaveProperty("requestedPriority");
  });
});
