import request from "supertest";
import bcrypt from "bcrypt";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { CurrentStatus } from "@prisma/client";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

const PASSWORD = "Password123!";
const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const OWNER_EMAIL = `lab4-dash-owner-${RUN_ID}@example.com`;
const EMPTY_EMAIL = `lab4-dash-empty-${RUN_ID}@example.com`;

const createdUserIds: number[] = [];
const createdRequesterIds: number[] = [];
const createdTicketIds: number[] = [];

let ownerRequesterId = 0;
let otherRequesterId = 0;

const DAY_MS = 24 * 60 * 60 * 1000;

async function createRequesterUser(email: string): Promise<number> {
  const prisma = getPrisma();

  const user = await prisma.user.create({
    data: {
      email,
      displayName: `Dashboard Test ${email}`,
      passwordHash: await bcrypt.hash(PASSWORD, 10),
      role: "REQUESTER",
      mustChangePassword: false,
      isActive: true,
    },
  });
  createdUserIds.push(user.id);

  const requester = await prisma.requester.create({
    data: {
      name: user.displayName,
      email,
      userId: user.id,
    },
  });
  createdRequesterIds.push(requester.id);

  return requester.id;
}

async function createTicket(
  requesterId: number,
  currentStatus: CurrentStatus,
  daysAgo = 0,
): Promise<void> {
  const prisma = getPrisma();
  const base = await prisma.ticket.findFirstOrThrow({
    select: { categoryId: true, relatedSystemId: true },
  });

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: `TKT-TEST-RDASH-${RUN_ID}-${createdTicketIds.length}`,
      requesterId,
      categoryId: base.categoryId,
      relatedSystemId: base.relatedSystemId,
      summary: `Requester dashboard test ${currentStatus}`,
      description: "Ticket created for requester dashboard API testing.",
      requestedPriority: "MEDIUM",
      itPriority: "MEDIUM",
      currentStatus,
    },
  });
  createdTicketIds.push(ticket.id);

  if (daysAgo > 0) {
    // updatedAt is managed by Prisma, so move it back with raw SQL.
    await prisma.$executeRaw`
      UPDATE "Ticket"
      SET "updatedAt" = ${new Date(Date.now() - daysAgo * DAY_MS)}
      WHERE id = ${ticket.id}
    `;
  }
}

async function login(email: string) {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email, password: PASSWORD });

  expect(response.status).toBe(200);

  return response.headers["set-cookie"];
}

beforeAll(async () => {
  ownerRequesterId = await createRequesterUser(OWNER_EMAIL);
  await createRequesterUser(EMPTY_EMAIL);

  const other = await getPrisma().requester.findUniqueOrThrow({
    where: { email: "jennifer.anderson@example.com" },
    select: { id: true },
  });
  otherRequesterId = other.id;

  // Known data for the owner (recent window = last 7 days):
  await createTicket(ownerRequesterId, "OPEN"); // open, recent
  await createTicket(ownerRequesterId, "WAITING_FOR_REQUESTER"); // open, waiting, recent
  await createTicket(ownerRequesterId, "IN_PROGRESS", 10); // open, not recent
  await createTicket(ownerRequesterId, "RESOLVED", 2); // recently resolved
  await createTicket(ownerRequesterId, "CLOSED", 20); // old, not counted
  await createTicket(ownerRequesterId, "CANCELLED"); // recent, not open
});

afterAll(async () => {
  const prisma = getPrisma();

  await prisma.ticket.deleteMany({ where: { id: { in: createdTicketIds } } });
  await prisma.requester.deleteMany({
    where: { id: { in: createdRequesterIds } },
  });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe("Lab 4 - Requester Dashboard API", () => {
  it("rejects unauthenticated requests", async () => {
    const response = await request(app).get("/api/dashboard/requester");

    expect(response.status).toBe(401);
  });

  it("rejects IT Staff because the dashboard is for Requesters", async () => {
    const cookies = await login("it.alex@example.com");

    const response = await request(app)
      .get("/api/dashboard/requester")
      .set("Cookie", cookies);

    expect(response.status).toBe(403);
  });

  it("calculates metrics only from the authenticated Requester's Tickets", async () => {
    const cookies = await login(OWNER_EMAIL);

    const response = await request(app)
      .get("/api/dashboard/requester")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);
    expect(response.body.metrics).toEqual({
      totalOpen: 3,
      waitingForRequester: 1,
      recentlyUpdated: 4,
      recentlyResolved: 1,
    });
    expect(response.body.recentWindow.days).toBe(7);
  });

  it("returns at most 5 recent Tickets, newest first, all owned by the Requester", async () => {
    const cookies = await login(OWNER_EMAIL);

    const response = await request(app)
      .get("/api/dashboard/requester")
      .set("Cookie", cookies);

    const recentTickets = response.body.recentTickets as Array<{
      ticketNumber: string;
      updatedAt: string;
    }>;

    expect(recentTickets).toHaveLength(5);
    expect(
      recentTickets.every((ticket) =>
        ticket.ticketNumber.startsWith(`TKT-TEST-RDASH-${RUN_ID}`),
      ),
    ).toBe(true);

    const times = recentTickets.map((ticket) =>
      new Date(ticket.updatedAt).getTime(),
    );
    expect([...times].sort((a, b) => b - a)).toEqual(times);

    // Concise: no full Ticket bodies are returned.
    expect(recentTickets[0]).not.toHaveProperty("description");
  });

  it("ignores a requesterId supplied by the client", async () => {
    const cookies = await login(OWNER_EMAIL);

    const own = await request(app)
      .get("/api/dashboard/requester")
      .set("Cookie", cookies);

    const spoofed = await request(app)
      .get(`/api/dashboard/requester?requesterId=${otherRequesterId}`)
      .set("Cookie", cookies);

    expect(spoofed.status).toBe(200);
    expect(spoofed.body.metrics).toEqual(own.body.metrics);
  });

  it("returns zero metrics and an empty list for a Requester without Tickets", async () => {
    const cookies = await login(EMPTY_EMAIL);

    const response = await request(app)
      .get("/api/dashboard/requester")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);
    expect(response.body.metrics).toEqual({
      totalOpen: 0,
      waitingForRequester: 0,
      recentlyUpdated: 0,
      recentlyResolved: 0,
    });
    expect(response.body.recentTickets).toEqual([]);
  });

  it("drill-down filters on My Tickets return exactly the counted Tickets", async () => {
    const cookies = await login(OWNER_EMAIL);

    const dashboard = await request(app)
      .get("/api/dashboard/requester")
      .set("Cookie", cookies);

    const { metrics, drillDown } = dashboard.body;

    for (const metric of Object.keys(metrics)) {
      const list = await request(app)
        .get("/api/tickets")
        .query({ ...drillDown[metric], pageSize: 50 })
        .set("Cookie", cookies);

      expect(list.status).toBe(200);
      expect(list.body.pagination.total, metric).toBe(metrics[metric]);
    }
  });

  it("returns a safe 500 error when the database fails", async () => {
    const cookies = await login(OWNER_EMAIL);
    const prisma = getPrisma();
    const spy = vi
      .spyOn(prisma.ticket, "count")
      .mockRejectedValueOnce(new Error("database unavailable"));
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      const response = await request(app)
        .get("/api/dashboard/requester")
        .set("Cookie", cookies);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "INTERNAL_ERROR",
        message: "Unable to load dashboard data.",
      });
    } finally {
      spy.mockRestore();
      consoleSpy.mockRestore();
    }
  });
});
