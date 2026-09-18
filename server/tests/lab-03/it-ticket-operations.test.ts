import request from "supertest";
import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

const INITIAL_PASSWORD = "Password123!";

const TEST_NOTE =
  "Checked the laptop power adapter.";

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

async function getUserId(email: string) {
  const user = await getPrisma().user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  expect(user).not.toBeNull();

  return user!.id;
}

async function resetTicketOne() {
  const alexId = await getUserId(
    "it.alex@example.com",
  );

  await getPrisma().ticket.update({
    where: {
      id: 1,
    },
    data: {
      currentStatus: "IN_PROGRESS",
      itPriority: "HIGH",
      ownerId: alexId,
    },
  });

  await getPrisma().ticketMessage.deleteMany({
    where: {
      ticketId: 1,
      body: TEST_NOTE,
      type: "INTERNAL_NOTE",
    },
  });
}

afterEach(async () => {
  await resetTicketOne();
});

describe("Lab 3 - IT Staff Ticket Operations API", () => {
  // ---------------------------------------------------------------------------
  // Status
  // ---------------------------------------------------------------------------

  it("rejects unauthenticated users from changing ticket status", async () => {
    const response = await request(app)
      .patch("/api/tickets/1/status")
      .send({
        status: "OPEN",
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      "UNAUTHENTICATED",
    );
  });

  it("rejects Requester users from changing ticket status", async () => {
    const cookies = await login(
      "sarah.williams@example.com",
    );

    const response = await request(app)
      .patch("/api/tickets/1/status")
      .set("Cookie", cookies)
      .send({
        status: "OPEN",
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe(
      "FORBIDDEN",
    );
  });

  it("allows IT Staff to change ticket status", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    // Prepare this test independently from other tests.
    await getPrisma().ticket.update({
      where: {
        id: 1,
      },
      data: {
        currentStatus: "NEW",
      },
    });

    const response = await request(app)
      .patch("/api/tickets/1/status")
      .set("Cookie", cookies)
      .send({
        status: "OPEN",
      });

    expect(response.status).toBe(200);
    expect(response.body.currentStatus).toBe(
      "OPEN",
    );
  });

  it("rejects an invalid status transition", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    // Prepare OPEN -> NEW independently.
    await getPrisma().ticket.update({
      where: {
        id: 1,
      },
      data: {
        currentStatus: "OPEN",
      },
    });

    const response = await request(app)
      .patch("/api/tickets/1/status")
      .set("Cookie", cookies)
      .send({
        status: "NEW",
      });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe(
      "INVALID_STATUS_TRANSITION",
    );
  });

  it("returns 404 when changing status of a ticket that does not exist", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const response = await request(app)
      .patch("/api/tickets/999999/status")
      .set("Cookie", cookies)
      .send({
        status: "OPEN",
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      "TICKET_NOT_FOUND",
    );
  });

  // ---------------------------------------------------------------------------
  // IT Priority
  // ---------------------------------------------------------------------------

  it("rejects unauthenticated users from changing IT Priority", async () => {
    const response = await request(app)
      .patch("/api/tickets/1/it-priority")
      .send({
        itPriority: "LOW",
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      "UNAUTHENTICATED",
    );
  });

  it("rejects Requester users from changing IT Priority", async () => {
    const cookies = await login(
      "sarah.williams@example.com",
    );

    const response = await request(app)
      .patch("/api/tickets/1/it-priority")
      .set("Cookie", cookies)
      .send({
        itPriority: "LOW",
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe(
      "FORBIDDEN",
    );
  });

  it("allows IT Staff to change IT Priority", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    await getPrisma().ticket.update({
      where: {
        id: 1,
      },
      data: {
        itPriority: "HIGH",
        requestedPriority: "HIGH",
      },
    });

    const response = await request(app)
      .patch("/api/tickets/1/it-priority")
      .set("Cookie", cookies)
      .send({
        itPriority: "LOW",
      });

    expect(response.status).toBe(200);
    expect(response.body.itPriority).toBe(
      "LOW",
    );

    expect(response.body.requestedPriority).toBe(
      "HIGH",
    );
  });

  it("rejects an invalid IT Priority", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const response = await request(app)
      .patch("/api/tickets/1/it-priority")
      .set("Cookie", cookies)
      .send({
        itPriority: "URGENT",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "INVALID_IT_PRIORITY",
    );
  });

  it("returns 404 when changing IT Priority of a ticket that does not exist", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const response = await request(app)
      .patch("/api/tickets/999999/it-priority")
      .set("Cookie", cookies)
      .send({
        itPriority: "LOW",
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      "TICKET_NOT_FOUND",
    );
  });

  // ---------------------------------------------------------------------------
  // Ticket Owner
  // ---------------------------------------------------------------------------

  it("rejects unauthenticated users from changing ticket owner", async () => {
    const response = await request(app)
      .patch("/api/tickets/1/owner")
      .send({
        primaryOwnerId: "2",
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      "UNAUTHENTICATED",
    );
  });

  it("rejects Requester users from changing ticket owner", async () => {
    const cookies = await login(
      "sarah.williams@example.com",
    );

    const response = await request(app)
      .patch("/api/tickets/1/owner")
      .set("Cookie", cookies)
      .send({
        primaryOwnerId: "2",
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe(
      "FORBIDDEN",
    );
  });

  it("allows IT Staff to claim or assign a ticket to an active IT Staff user", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const jordanId = await getUserId(
      "it.jordan@example.com",
    );

    const response = await request(app)
      .patch("/api/tickets/1/owner")
      .set("Cookie", cookies)
      .send({
        primaryOwnerId: String(jordanId),
      });

    expect(response.status).toBe(200);

    expect(response.body.owner).toEqual(
      expect.objectContaining({
        id: jordanId,
        displayName: expect.any(String),
        email: "it.jordan@example.com",
      }),
    );
  });

  it("allows IT Staff to remove the ticket owner when null is permitted", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const response = await request(app)
      .patch("/api/tickets/1/owner")
      .set("Cookie", cookies)
      .send({
        primaryOwnerId: null,
      });

    expect(response.status).toBe(200);
    expect(response.body.owner).toBeNull();
  });

  it("rejects a Requester as ticket owner", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const sarahId = await getUserId(
      "sarah.williams@example.com",
    );

    const response = await request(app)
      .patch("/api/tickets/1/owner")
      .set("Cookie", cookies)
      .send({
        primaryOwnerId: String(sarahId),
      });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe(
      "INVALID_TICKET_OWNER",
    );
  });

  it("rejects an inactive user as ticket owner", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const inactiveUser =
      await getPrisma().user.findFirst({
        where: {
          isActive: false,
        },
        select: {
          id: true,
        },
      });

    expect(inactiveUser).not.toBeNull();

    const response = await request(app)
      .patch("/api/tickets/1/owner")
      .set("Cookie", cookies)
      .send({
        primaryOwnerId: String(
          inactiveUser!.id,
        ),
      });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe(
      "INVALID_TICKET_OWNER",
    );
  });

  it("returns 404 when changing owner of a ticket that does not exist", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const jordanId = await getUserId(
      "it.jordan@example.com",
    );

    const response = await request(app)
      .patch("/api/tickets/999999/owner")
      .set("Cookie", cookies)
      .send({
        primaryOwnerId: String(jordanId),
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      "TICKET_NOT_FOUND",
    );
  });

  // ---------------------------------------------------------------------------
  // Internal Notes
  // ---------------------------------------------------------------------------

  it("rejects unauthenticated users from adding an internal note", async () => {
    const response = await request(app)
      .post("/api/tickets/1/internal-notes")
      .send({
        body: TEST_NOTE,
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      "UNAUTHENTICATED",
    );
  });

  it("rejects Requester users from adding an internal note", async () => {
    const cookies = await login(
      "sarah.williams@example.com",
    );

    const response = await request(app)
      .post("/api/tickets/1/internal-notes")
      .set("Cookie", cookies)
      .send({
        body: TEST_NOTE,
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe(
      "FORBIDDEN",
    );
  });

  it("allows IT Staff to add an internal note", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const response = await request(app)
      .post("/api/tickets/1/internal-notes")
      .set("Cookie", cookies)
      .send({
        body: TEST_NOTE,
      });

    expect(response.status).toBe(201);

    expect(response.body.type).toBe(
      "INTERNAL_NOTE",
    );
    expect(response.body.body).toBe(
      TEST_NOTE,
    );
    expect(response.body.ticketId).toBe(1);

    expect(response.body.author).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        displayName: "Alex Carter",
        email: "it.alex@example.com",
        role: "IT_STAFF",
      }),
    );
  });

  it("rejects an empty internal note", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const response = await request(app)
      .post("/api/tickets/1/internal-notes")
      .set("Cookie", cookies)
      .send({
        body: "   ",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "INVALID_MESSAGE",
    );
  });

  it("returns 404 when adding an internal note to a ticket that does not exist", async () => {
    const cookies = await login(
      "it.alex@example.com",
    );

    const response = await request(app)
      .post("/api/tickets/999999/internal-notes")
      .set("Cookie", cookies)
      .send({
        body: TEST_NOTE,
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      "TICKET_NOT_FOUND",
    );
  });

  it("allows Admin users to perform IT Staff ticket operations", async () => {
    const cookies = await login(
      "admin@example.com",
    );

    const response = await request(app)
      .patch("/api/tickets/1/it-priority")
      .set("Cookie", cookies)
      .send({
        itPriority: "HIGH",
      });

    expect(response.status).toBe(200);
    expect(response.body.itPriority).toBe(
      "HIGH",
    );
  });
});
