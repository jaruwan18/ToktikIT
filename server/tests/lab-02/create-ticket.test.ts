import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("POST /api/tickets", () => {
  it("creates a ticket successfully", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .set("X-Requester-Id", "3")
      .send({
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
      requestedPriority: "MEDIUM",
      currentStatus: "NEW",
    });

    expect(response.body.ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
  });

  it("rejects a request with an invalid requester", async () => {
    const response = await request(app)
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

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      error: "INVALID_REQUESTER",
    });
  });

  it("rejects an invalid summary", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .set("X-Requester-Id", "3")
      .send({
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
});
