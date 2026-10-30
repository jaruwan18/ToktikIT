import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { generateTicketNumber } from "../../src/utils/ticketNumber.js";

const createdTicketIds: number[] = [];

afterAll(async () => {
  await getPrisma().ticket.deleteMany({
    where: { id: { in: createdTicketIds } },
  });
});

describe("Lab 4 - Ticket number sequence regression", () => {
  it("creates a Ticket even when the Ticket count is below numbers already in use", async () => {
    const prisma = getPrisma();
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // The old generator used count + 1. Occupy that number with a Ticket
    // that is not counted (its createdAt is outside this year), which is the
    // same situation as Ticket numbers left behind after deletions.
    const ticketCount = await prisma.ticket.count({
      where: { createdAt: { gte: startOfYear } },
    });
    const countBasedNumber = generateTicketNumber(ticketCount + 1, now);

    const existing = await prisma.ticket.findUnique({
      where: { ticketNumber: countBasedNumber },
    });

    if (!existing) {
      const base = await prisma.ticket.findFirstOrThrow({
        select: {
          requesterId: true,
          categoryId: true,
          relatedSystemId: true,
        },
      });

      const occupied = await prisma.ticket.create({
        data: {
          ticketNumber: countBasedNumber,
          requesterId: base.requesterId,
          categoryId: base.categoryId,
          relatedSystemId: base.relatedSystemId,
          summary: "Occupies the count-based ticket number",
          description: "Regression test for ticket number conflicts.",
          requestedPriority: "LOW",
          createdAt: new Date("2000-01-01T00:00:00.000Z"),
        },
      });
      createdTicketIds.push(occupied.id);
    }

    const agent = request.agent(app);

    const loginResponse = await agent
      .post("/api/auth/login")
      .send({
        email: "sarah.williams@example.com",
        password: "Password123!",
      });

    expect(loginResponse.status).toBe(200);

    const response = await agent.post("/api/tickets").send({
      categoryId: 1,
      relatedSystemId: 1,
      summary: "Ticket number regression",
      description: "Created after the count-based number was taken.",
      requestedPriority: "LOW",
    });

    expect(response.status).toBe(201);
    expect(response.body.ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);
    expect(response.body.ticketNumber).not.toBe(countBasedNumber);

    createdTicketIds.push(response.body.id);
  });
});
