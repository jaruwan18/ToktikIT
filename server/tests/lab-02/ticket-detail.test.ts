import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import app from "../../src/app";
import { prisma } from "../../src/prisma";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    requester: {
      findFirst: vi.fn(),
    },
    ticket: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("../../src/prisma", () => ({
  prisma: prismaMock,
  getPrisma: () => prismaMock,
}));

const mockedPrisma = vi.mocked(prisma);

describe("GET /api/tickets/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedPrisma.ticket.findFirst.mockResolvedValue(null);
  });

  it("returns ticket detail for the owning active requester", async () => {
    mockedPrisma.requester.findFirst.mockResolvedValue({
      id: 1,
      name: "Jennifer Anderson",
    });

    mockedPrisma.ticket.findFirst.mockResolvedValue({
      id: 101,
      ticketNumber: "TKT-2026-000101",
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 7,
      summary: "Laptop battery drains quickly",
      description:
        "My laptop battery is draining much faster than usual, even when idle.",
      requestedPriority: "MEDIUM",
      currentStatus: "NEW",
      createdAt: new Date("2026-08-30T09:00:00.000Z"),
      updatedAt: new Date("2026-08-30T10:15:00.000Z"),
      requester: {
        id: 1,
        name: "Jennifer Anderson",
      },
      category: {
        id: 2,
        name: "Hardware",
      },
      relatedSystem: {
        id: 7,
        name: "Corporate Laptop",
      },
      attachments: [
        {
          id: 55,
          originalFilename: "battery-report.pdf",
          mimeType: "application/pdf",
          sizeBytes: 204800,
          uploadedAt: new Date("2026-08-30T09:30:00.000Z"),
          isRemoved: false,
          removedAt: null,
          removalReason: null,
        },
      ],
    });

    const response = await request(app)
      .get("/api/tickets/101")
      .query({ requesterId: 1 });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      ticketNumber: "TKT-2026-000101",
      requesterId: 1,
      requesterName: "Jennifer Anderson",
      categoryId: 2,
      categoryName: "Hardware",
      relatedSystemId: 7,
      relatedSystemName: "Corporate Laptop",
      summary: "Laptop battery drains quickly",
      description:
        "My laptop battery is draining much faster than usual, even when idle.",
      requestedPriority: "MEDIUM",
      currentStatus: "NEW",
      createdAt: "2026-08-30T09:00:00.000Z",
      updatedAt: "2026-08-30T10:15:00.000Z",
      attachments: [
        {
          id: 55,
          originalFilename: "battery-report.pdf",
          mimeType: "application/pdf",
          sizeBytes: 204800,
          uploadedAt: "2026-08-30T09:30:00.000Z",
          isRemoved: false,
          removedAt: null,
          removalReason: null,
        },
      ],
    });
  });

  it("returns 400 when requesterId is missing", async () => {
    const response = await request(app).get("/api/tickets/101");

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "INVALID_REQUESTER",
      message: "A valid, active Requester identity is required.",
    });
  });

  it("returns 400 when requester is inactive or does not exist", async () => {
    mockedPrisma.requester.findFirst.mockResolvedValue(null);

    const response = await request(app)
      .get("/api/tickets/101")
      .query({ requesterId: 999 });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "INVALID_REQUESTER",
      message: "A valid, active Requester identity is required.",
    });
  });

  it("returns 404 when ticket does not exist", async () => {
    mockedPrisma.requester.findFirst.mockResolvedValue({
      id: 1,
      name: "Jennifer Anderson",
    });

    mockedPrisma.ticket.findFirst.mockResolvedValue(null);

    const response = await request(app)
      .get("/api/tickets/999")
      .query({ requesterId: 1 });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      error: "TICKET_NOT_FOUND",
      message: "Ticket not found.",
    });
  });

  it("returns 404 when ticket belongs to another requester", async () => {
    mockedPrisma.requester.findFirst.mockResolvedValue({
      id: 1,
      name: "Jennifer Anderson",
    });

    mockedPrisma.ticket.findFirst.mockResolvedValue(null);

    const response = await request(app)
      .get("/api/tickets/101")
      .query({ requesterId: 1 });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      error: "TICKET_NOT_FOUND",
      message: "Ticket not found.",
    });
  });

  it("returns an empty attachment list when the ticket has no attachments", async () => {
    mockedPrisma.requester.findFirst.mockResolvedValue({
      id: 1,
      name: "Jennifer Anderson",
    });

    mockedPrisma.ticket.findFirst.mockResolvedValue({
      id: 101,
      ticketNumber: "TKT-2026-000101",
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 7,
      summary: "Laptop issue",
      description: "My laptop has an issue.",
      requestedPriority: "MEDIUM",
      currentStatus: "NEW",
      createdAt: new Date("2026-08-30T09:00:00.000Z"),
      updatedAt: new Date("2026-08-30T10:15:00.000Z"),
      requester: {
        id: 1,
        name: "Jennifer Anderson",
      },
      category: {
        id: 2,
        name: "Hardware",
      },
      relatedSystem: {
        id: 7,
        name: "Corporate Laptop",
      },
      attachments: [],
    });

    const response = await request(app)
      .get("/api/tickets/101")
      .query({ requesterId: 1 });

    expect(response.status).toBe(200);
    expect(response.body.attachments).toEqual([]);
  });

  it("returns 500 when the database fails", async () => {
    mockedPrisma.requester.findFirst.mockRejectedValue(
      new Error("Database connection failed"),
    );

    const response = await request(app)
      .get("/api/tickets/101")
      .query({ requesterId: 1 });

    expect(response.status).toBe(500);

    expect(response.body).toEqual({
      error: "INTERNAL_ERROR",
      message: "Unable to retrieve ticket.",
    });
  });
});