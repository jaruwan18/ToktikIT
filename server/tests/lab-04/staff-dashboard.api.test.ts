import request from "supertest";
import bcrypt from "bcrypt";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";
import type { CurrentStatus, ItPriority } from "@prisma/client";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { ACTIVE_STATUSES } from "../../src/dashboard.js";

const PASSWORD = "Password123!";
const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const STAFF_EMAIL = `lab4-dash-staff-${RUN_ID}@example.com`;

const DAY_MS = 24 * 60 * 60 * 1000;

const createdTicketIds: number[] = [];
let staffUserId = 0;

async function login(email: string) {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email, password: PASSWORD });

  expect(response.status).toBe(200);

  return response.headers["set-cookie"];
}

async function createTicket(options: {
  currentStatus: CurrentStatus;
  itPriority?: ItPriority;
  ownerId?: number | null;
}): Promise<number> {
  const prisma = getPrisma();
  const base = await prisma.ticket.findFirstOrThrow({
    select: {
      requesterId: true,
      categoryId: true,
      relatedSystemId: true,
    },
  });

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: `TKT-TEST-SDASH-${RUN_ID}-${createdTicketIds.length}`,
      requesterId: base.requesterId,
      categoryId: base.categoryId,
      relatedSystemId: base.relatedSystemId,
      ownerId: options.ownerId ?? null,
      summary: `Staff dashboard test ${options.currentStatus}`,
      description: "Ticket created for staff dashboard API testing.",
      requestedPriority: "MEDIUM",
      itPriority: options.itPriority ?? "MEDIUM",
      currentStatus: options.currentStatus,
    },
  });
  createdTicketIds.push(ticket.id);

  return ticket.id;
}

async function getStaffDashboard(email: string) {
  const cookies = await login(email);

  return request(app)
    .get("/api/dashboard/staff")
    .set("Cookie", cookies);
}

// Other test files create and delete Tickets in parallel, so global counts
// are compared with the database only when they did not change during the
// request.
async function expectMatchesDatabase(
  readMetric: (body: any) => number,
  queryDatabase: () => Promise<number>,
) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const before = await queryDatabase();
    const response = await getStaffDashboard("it.alex@example.com");
    const after = await queryDatabase();

    if (before === after) {
      expect(readMetric(response.body)).toBe(before);
      return;
    }
  }

  throw new Error("Database kept changing; could not compare metric.");
}

beforeAll(async () => {
  const prisma = getPrisma();

  const user = await prisma.user.create({
    data: {
      email: STAFF_EMAIL,
      displayName: "Dashboard Test Staff",
      passwordHash: await bcrypt.hash(PASSWORD, 10),
      role: "IT_STAFF",
      mustChangePassword: false,
      isActive: true,
    },
  });
  staffUserId = user.id;

  // Known data for the dedicated staff user.
  const ownedOpen = await createTicket({
    currentStatus: "IN_PROGRESS",
    ownerId: staffUserId,
  });
  await createTicket({ currentStatus: "REOPENED", ownerId: staffUserId });
  await createTicket({ currentStatus: "CLOSED", ownerId: staffUserId });

  // Two recent actions and one older than the 7-day window.
  await prisma.actionTaken.createMany({
    data: [0, 1, 10].map((daysAgo, index) => ({
      ticketId: ownedOpen,
      performedById: staffUserId,
      actionDateTime: new Date(Date.now() - daysAgo * DAY_MS - 1000),
      actionDescription: `Dashboard test action ${index}`,
      result: "Done",
      idempotencyKey: `lab4-sdash-${RUN_ID}-${index}`,
    })),
  });
});

afterAll(async () => {
  const prisma = getPrisma();

  await prisma.actionTaken.deleteMany({
    where: { performedById: staffUserId },
  });
  await prisma.ticket.deleteMany({ where: { id: { in: createdTicketIds } } });
  await prisma.user.delete({ where: { id: staffUserId } });
});

describe("Lab 4 - IT Staff Dashboard API", () => {
  it("rejects unauthenticated requests", async () => {
    const response = await request(app).get("/api/dashboard/staff");

    expect(response.status).toBe(401);
  });

  it("rejects Requesters", async () => {
    const response = await getStaffDashboard(
      "jennifer.anderson@example.com",
    );

    expect(response.status).toBe(403);
  });

  it("allows IT Staff and Administrators", async () => {
    const staff = await getStaffDashboard("it.alex@example.com");
    const admin = await getStaffDashboard("admin@example.com");

    expect(staff.status).toBe(200);
    expect(admin.status).toBe(200);
  });

  it("counts active Tickets owned by the current user and their recent Actions Taken", async () => {
    const response = await getStaffDashboard(STAFF_EMAIL);

    expect(response.status).toBe(200);
    expect(response.body.metrics.currentUserOwned).toBe(2);
    expect(response.body.metrics.myActionsTaken).toBe(2);
  });

  it("returns every status and IT Priority, including zero counts", async () => {
    const response = await getStaffDashboard("it.alex@example.com");

    expect(Object.keys(response.body.metrics.byStatus).sort()).toEqual(
      [
        "CANCELLED",
        "CLOSED",
        "IN_PROGRESS",
        "NEW",
        "OPEN",
        "REOPENED",
        "RESOLVED",
        "WAITING_FOR_REQUESTER",
      ],
    );
    expect(Object.keys(response.body.metrics.byItPriority).sort()).toEqual(
      ["HIGH", "LOW", "MEDIUM"],
    );
  });

  it("matches the database for unassigned active Tickets", async () => {
    await createTicket({ currentStatus: "NEW", ownerId: null });

    await expectMatchesDatabase(
      (body) => body.metrics.unassigned,
      () =>
        getPrisma().ticket.count({
          where: {
            ownerId: null,
            currentStatus: { in: ACTIVE_STATUSES },
          },
        }),
    );
  });

  it("matches the database for the Waiting for Requester status count", async () => {
    await expectMatchesDatabase(
      (body) => body.metrics.byStatus.WAITING_FOR_REQUESTER,
      () =>
        getPrisma().ticket.count({
          where: { currentStatus: "WAITING_FOR_REQUESTER" },
        }),
    );
  });

  it("matches the database for active HIGH IT Priority Tickets", async () => {
    await expectMatchesDatabase(
      (body) => body.metrics.byItPriority.HIGH,
      () =>
        getPrisma().ticket.count({
          where: {
            itPriority: "HIGH",
            currentStatus: { in: ACTIVE_STATUSES },
          },
        }),
    );
  });

  it("lists only active HIGH priority Tickets as urgent, at most 5", async () => {
    await createTicket({ currentStatus: "OPEN", itPriority: "HIGH" });
    await createTicket({ currentStatus: "CLOSED", itPriority: "HIGH" });

    const response = await getStaffDashboard("it.alex@example.com");
    const urgentTickets = response.body.urgentTickets as Array<{
      itPriority: string;
      currentStatus: CurrentStatus;
    }>;

    expect(urgentTickets.length).toBeGreaterThan(0);
    expect(urgentTickets.length).toBeLessThanOrEqual(5);
    expect(
      urgentTickets.every(
        (ticket) =>
          ticket.itPriority === "HIGH" &&
          ACTIVE_STATUSES.includes(ticket.currentStatus),
      ),
    ).toBe(true);
  });

  it("returns at most 5 recently updated Tickets without full Ticket bodies", async () => {
    const response = await getStaffDashboard("it.alex@example.com");
    const recentTickets = response.body.recentTickets as Array<{
      updatedAt: string;
    }>;

    expect(recentTickets.length).toBeLessThanOrEqual(5);
    expect(recentTickets[0]).not.toHaveProperty("description");

    const times = recentTickets.map((ticket) =>
      new Date(ticket.updatedAt).getTime(),
    );
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  it("filters the IT Ticket Queue by owner for dashboard drill-down", async () => {
    const cookies = await login(STAFF_EMAIL);

    const mine = await request(app)
      .get("/api/it/tickets?owner=me&pageSize=50")
      .set("Cookie", cookies);

    expect(mine.status).toBe(200);

    const tickets = mine.body.data as Array<{
      ticketNumber: string;
    }>;

    expect(tickets).toHaveLength(3);
    expect(
      tickets.every((ticket) =>
        ticket.ticketNumber.startsWith(`TKT-TEST-SDASH-${RUN_ID}`),
      ),
    ).toBe(true);
  });
});
