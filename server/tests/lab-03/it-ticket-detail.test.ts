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

describe("Lab 3 - IT Staff Ticket Detail API", () => {
  it("rejects unauthenticated users", async () => {
    const response = await request(app)
      .get("/api/it/tickets/1");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("UNAUTHENTICATED");
  });

  it("rejects Requester users", async () => {
    const cookies = await login(
      "sarah.williams@example.com",
    );

    const response = await request(app)
      .get("/api/it/tickets/1")
      .set("Cookie", cookies);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("FORBIDDEN");
  });

  it("allows IT Staff users to access ticket detail", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const response = await request(app)
      .get("/api/it/tickets/1")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);

    expect(response.body.ticketNumber).toBe(
      "TKT-2026-000001",
    );
    expect(response.body.requesterName).toBe(
      "Jennifer Anderson",
    );
    expect(response.body.categoryName).toBe(
      "Hardware",
    );
    expect(response.body.relatedSystemName).toBe(
      "Corporate Laptop",
    );
    expect(response.body.summary).toBe(
      "Corporate laptop cannot start",
    );
    expect(response.body.description).toBe(
      "The corporate laptop shows a black screen after pressing the power button.",
    );
    expect(response.body.requestedPriority).toBe(
      "HIGH",
    );
    expect(response.body.itPriority).toBe("HIGH");
    expect(response.body.currentStatus).toBe(
      "IN_PROGRESS",
    );

    expect(response.body.owner).toEqual({
      id: expect.any(Number),
      displayName: "Alex Carter",
      email: "it.alex@example.com",
    });
  });

  it("allows Admin users to access ticket detail", async () => {
    const cookies = await login(
      "admin@example.com",
    );

    const response = await request(app)
      .get("/api/it/tickets/1")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);
    expect(response.body.ticketNumber).toBe(
      "TKT-2026-000001",
    );
  });

  it("returns ticket messages including public comments and internal notes", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const response = await request(app)
      .get("/api/it/tickets/1")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);

    expect(response.body.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "COMMENT",
          body: "The laptop is still showing a black screen.",
        }),
        expect.objectContaining({
          type: "INTERNAL_NOTE",
          body: "Check the power adapter and perform hardware diagnostics.",
        }),
      ]),
    );
  });

  it("returns 404 when the ticket does not exist", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const response = await request(app)
      .get("/api/it/tickets/999999")
      .set("Cookie", cookies);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      "TICKET_NOT_FOUND",
    );
  });

  it("returns ticket detail for another existing ticket", async () => {
    const cookies = await login(
      "it.jordan@example.com",
    );

    const response = await request(app)
      .get("/api/it/tickets/2")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);

    expect(response.body.ticketNumber).toBe(
      "TKT-2026-000002",
    );
    expect(response.body.requesterName).toBe(
      "Michael Brown",
    );
    expect(response.body.categoryName).toBe(
      "Software",
    );
    expect(response.body.relatedSystemName).toBe(
      "LEB2 App",
    );
    expect(response.body.currentStatus).toBe(
      "WAITING_FOR_REQUESTER",
    );

    expect(response.body.owner).toEqual({
      id: expect.any(Number),
      displayName: "Jordan Lee",
      email: "it.jordan@example.com",
    });
  });
});
