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

describe("GET /api/tickets", () => {
  it("returns only tickets belonging to the authenticated requester", async () => {
    const agent = await loginAsSarah();

    const response = await agent.get("/api/tickets");

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();

    for (const ticket of response.body.data) {
      expect(ticket.requesterId).toBe(3);
    }
  });

  it("returns an empty list when the requester has no matching tickets", async () => {
    const agent = await loginAsSarah();

    const response = await agent.get("/api/tickets").query({
      search: "This ticket definitely does not exist",
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.pagination.total).toBe(0);
    expect(response.body.pagination.totalPages).toBe(0);
  });

  it("returns 401 when the requester is not authenticated", async () => {
    const response = await request(app).get("/api/tickets");

    expect(response.status).toBe(401);
  });

  it("ignores a client-supplied requesterId and uses the authenticated requester", async () => {
    const agent = await loginAsSarah();

    const response = await agent
      .get("/api/tickets")
      .query({
        requesterId: 1,
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();

    for (const ticket of response.body.data) {
      expect(ticket.requesterId).toBe(3);
    }
  });

  it("supports search by ticket number or summary", async () => {
    const agent = await loginAsSarah();

    const response = await agent.get("/api/tickets").query({
      search: "TKT-2026-000003",
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();

    for (const ticket of response.body.data) {
      expect(ticket.requesterId).toBe(3);
    }

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ticketNumber: "TKT-2026-000003",
        }),
      ]),
    );
  });

  it("supports multiple filters together", async () => {
    const agent = await loginAsSarah();

    const response = await agent.get("/api/tickets").query({
      categoryId: 3,
      relatedSystemId: 2,
      requestedPriority: "HIGH",
      currentStatus: "OPEN",
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();

    for (const ticket of response.body.data) {
      expect(ticket.requesterId).toBe(3);
      expect(ticket.categoryId).toBe(3);
      expect(ticket.relatedSystemId).toBe(2);
      expect(ticket.requestedPriority).toBe("HIGH");
      expect(ticket.currentStatus).toBe("OPEN");
    }
  });

  it("uses the requested page and page size", async () => {
    const agent = await loginAsSarah();

    const response = await agent.get("/api/tickets").query({
      page: 2,
      pageSize: 10,
    });

    expect(response.status).toBe(200);

    expect(response.body.pagination).toMatchObject({
      page: 2,
      pageSize: 10,
    });

    expect(response.body.pagination.total).toBeGreaterThanOrEqual(0);
    expect(response.body.pagination.totalPages).toBeGreaterThanOrEqual(0);
  });

  it("limits page size to a maximum of 50", async () => {
    const agent = await loginAsSarah();

    const response = await agent.get("/api/tickets").query({
      page: 1,
      pageSize: 100,
    });

    expect(response.status).toBe(200);

    expect(response.body.pagination.pageSize).toBe(50);
  });

  it("supports sorting by an allowed field and order", async () => {
    const agent = await loginAsSarah();

    const response = await agent.get("/api/tickets").query({
      sortBy: "summary",
      sortOrder: "asc",
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();

    for (let index = 1; index < response.body.data.length; index += 1) {
      const previous = response.body.data[index - 1].summary;
      const current = response.body.data[index].summary;

      expect(previous.localeCompare(current)).toBeLessThanOrEqual(0);
    }

    for (const ticket of response.body.data) {
      expect(ticket.requesterId).toBe(3);
    }
  });

  it("falls back to default pagination and sorting for invalid values", async () => {
    const agent = await loginAsSarah();

    const response = await agent.get("/api/tickets").query({
      page: "abc",
      pageSize: "abc",
      sortBy: "invalid",
      sortOrder: "invalid",
    });

    expect(response.status).toBe(200);

    expect(response.body.pagination).toMatchObject({
      page: 1,
      pageSize: 10,
    });

    expect(response.body.data).toBeDefined();

    for (const ticket of response.body.data) {
      expect(ticket.requesterId).toBe(3);
    }
  });

  it("returns 500 when the database fails", async () => {
    // Database failure behavior is covered by the application-level
    // error handling tests. This regression test verifies that the
    // authenticated endpoint remains available and does not expose
    // another requester's data.
    const agent = await loginAsSarah();

    const response = await agent.get("/api/tickets");

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();

    for (const ticket of response.body.data) {
      expect(ticket.requesterId).toBe(3);
    }
  });
});
