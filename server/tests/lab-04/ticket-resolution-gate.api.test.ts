import request from "supertest";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

const PASSWORD = "Password123!";
const BASE_TICKET_ID = 3;

let testTicketId: number | null = null;

const cleanupKeys = new Set<string>();

async function login(email: string) {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password: PASSWORD,
    });

  expect(response.status).toBe(200);

  return response.headers["set-cookie"];
}

async function getItStaffId(): Promise<number> {
  const user = await getPrisma().user.findUnique({
    where: {
      email: "it.alex@example.com",
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("IT Staff test user was not found.");
  }

  return user.id;
}

async function createTestTicket(): Promise<void> {
  const prisma = getPrisma();

  const baseTicket = await prisma.ticket.findUnique({
    where: {
      id: BASE_TICKET_ID,
    },
  });

  if (!baseTicket) {
    throw new Error(
      `Base ticket ${BASE_TICKET_ID} was not found.`,
    );
  }

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: `TKT-TEST-RESOLUTION-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      requesterId: baseTicket.requesterId,
      categoryId: baseTicket.categoryId,
      relatedSystemId: baseTicket.relatedSystemId,
      ownerId: baseTicket.ownerId,
      summary: "Resolution Gate integration test",
      description: "Ticket created for isolated API testing.",
      requestedPriority: baseTicket.requestedPriority,
      itPriority: baseTicket.itPriority,
      currentStatus: "IN_PROGRESS",
    },
  });

  testTicketId = ticket.id;
}

async function createAction(options: {
  key: string;
  actionDescription: string;
  result: string;
  followUpRequired?: boolean;
  followUpNote?: string | null;
}): Promise<void> {
  if (testTicketId === null) {
    throw new Error("Test ticket has not been created.");
  }

  cleanupKeys.add(options.key);

  await getPrisma().actionTaken.create({
    data: {
      ticketId: testTicketId,
      performedById: await getItStaffId(),
      idempotencyKey: options.key,

      // Ensure this Action Taken is the latest record.
      actionDateTime: new Date(
        "2099-01-01T00:00:00.000Z",
      ),

      actionDescription: options.actionDescription,
      result: options.result,
      followUpRequired: options.followUpRequired ?? false,
      followUpNote: options.followUpNote ?? null,
    },
  });
}


async function requestResolution(cookies: string) {
  if (testTicketId === null) {
    throw new Error("Test ticket has not been created.");
  }

  return request(app)
    .patch(`/api/tickets/${testTicketId}/status`)
    .set("Cookie", cookies)
    .send({
      status: "RESOLVED",
    });
}


async function expectStatusUnchanged(): Promise<void> {
  if (testTicketId === null) {
    throw new Error("Test ticket has not been created.");
  }

  const ticket = await getPrisma().ticket.findUnique({
    where: {
      id: testTicketId,
    },
    select: {
      currentStatus: true,
    },
  });

  expect(ticket?.currentStatus).toBe("IN_PROGRESS");
}

beforeEach(async () => {
  testTicketId = null;
  cleanupKeys.clear();

  await createTestTicket();
});

afterEach(async () => {
  const prisma = getPrisma();

  try {
    if (testTicketId !== null) {
      // Delete only Action Taken records belonging to this test.
      await prisma.actionTaken.deleteMany({
        where: {
          ticketId: testTicketId,
        },
      });

      // Delete only the Ticket created by this test.
      await prisma.ticket.delete({
        where: {
          id: testTicketId,
        },
      });
    }
  } finally {
    testTicketId = null;

    // Defensive cleanup for test records with known keys.
    if (cleanupKeys.size > 0) {
      await prisma.actionTaken.deleteMany({
        where: {
          idempotencyKey: {
            in: [...cleanupKeys],
          },
        },
      });
    }

    cleanupKeys.clear();
  }
});

describe("Lab 4 - Ticket Resolution Gate API", () => {
  it("rejects resolution when no Action Taken exists", async () => {
    const cookies = await login("it.alex@example.com");

    const response = await requestResolution(cookies);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe(
      "RESOLUTION_NOT_ALLOWED",
    );

    await expectStatusUnchanged();
  });

  it("rejects resolution when Action Description is empty or whitespace", async () => {
    const cookies = await login("it.alex@example.com");

    await createAction({
      key: "lab4-resolution-gate-empty-description",
      actionDescription: "   ",
      result: "Test result",
    });

    const response = await requestResolution(cookies);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe(
      "RESOLUTION_NOT_ALLOWED",
    );

    await expectStatusUnchanged();
  });

  it("rejects resolution when Result is empty or whitespace", async () => {
    const cookies = await login("it.alex@example.com");

    await createAction({
      key: "lab4-resolution-gate-empty-result",
      actionDescription: "Checked the device",
      result: "   ",
    });

    const response = await requestResolution(cookies);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe(
      "RESOLUTION_NOT_ALLOWED",
    );

    await expectStatusUnchanged();
  });

  it("rejects resolution when follow-up is required but the note is empty", async () => {
    const cookies = await login("it.alex@example.com");

    await createAction({
      key: "lab4-resolution-gate-missing-follow-up",
      actionDescription: "Checked the device",
      result: "Device needs requester confirmation",
      followUpRequired: true,
      followUpNote: "   ",
    });

    const response = await requestResolution(cookies);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe(
      "RESOLUTION_NOT_ALLOWED",
    );

    await expectStatusUnchanged();
  });

  it("allows resolution when the latest Action Taken satisfies all conditions", async () => {
    const cookies = await login("it.alex@example.com");

    await createAction({
      key: "lab4-resolution-gate-valid",
      actionDescription: "Checked the device",
      result: "Device is working normally",
      followUpRequired: false,
    });

    const response = await requestResolution(cookies);

    expect(response.status).toBe(200);
    expect(response.body.currentStatus).toBe("RESOLVED");
  });

  it("allows resolution when follow-up is required and a note is provided", async () => {
    const cookies = await login("it.alex@example.com");

    await createAction({
      key: "lab4-resolution-gate-valid-follow-up",
      actionDescription: "Checked the device",
      result: "Follow-up is scheduled",
      followUpRequired: true,
      followUpNote: "Contact requester tomorrow.",
    });

    const response = await requestResolution(cookies);

    expect(response.status).toBe(200);
    expect(response.body.currentStatus).toBe("RESOLVED");
  });
});
