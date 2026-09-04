import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

vi.mock("../../src/prisma.js", () => ({
  getPrisma: vi.fn(),
}));

const prisma = {
  requester: {
    findFirst: vi.fn(),
  },
  ticket: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
};

describe("GET /api/tickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getPrisma).mockReturnValue(prisma as any);
  });

  it("returns only tickets belonging to the selected requester", async () => {
    prisma.requester.findFirst.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    prisma.ticket.findMany.mockResolvedValue([
      {
        id: 1,
        ticketNumber: "TKT-2026-000001",
        requesterId: 1,
        categoryId: 1,
        relatedSystemId: 1,
        summary: "Cannot access email",
        description: "Unable to access my email account.",
        requestedPriority: "HIGH",
        currentStatus: "NEW",
        createdAt: new Date("2026-01-01T10:00:00Z"),
        updatedAt: new Date("2026-01-01T10:00:00Z"),
        category: {
          id: 1,
          name: "Account and Access",
        },
        relatedSystem: {
          id: 1,
          name: "Email",
        },
      },
    ]);

    prisma.ticket.count.mockResolvedValue(1);

    const response = await request(app)
      .get("/api/tickets")
      .query({ requesterId: 1 });

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].ticketNumber).toBe(
      "TKT-2026-000001",
    );
    expect(response.body.data[0].requesterId).toBe(1);

    expect(prisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          requesterId: 1,
        }),
      }),
    );
  });

  it("returns an empty list when the requester has no tickets", async () => {
    prisma.requester.findFirst.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    prisma.ticket.findMany.mockResolvedValue([]);
    prisma.ticket.count.mockResolvedValue(0);

    const response = await request(app)
      .get("/api/tickets")
      .query({ requesterId: 1 });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.pagination.total).toBe(0);
    expect(response.body.pagination.totalPages).toBe(0);
  });

  it("returns 400 when requesterId is missing", async () => {
    const response = await request(app).get("/api/tickets");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_REQUESTER");
  });

  it("returns 400 when requesterId is invalid", async () => {
    const response = await request(app)
      .get("/api/tickets")
      .query({ requesterId: "abc" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_REQUESTER");
  });

  it("supports search by ticket number or summary", async () => {
    prisma.requester.findFirst.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    prisma.ticket.count.mockResolvedValue(1);
    prisma.ticket.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/tickets")
      .query({
        requesterId: 1,
        search: "email",
      });

    expect(response.status).toBe(200);

    expect(prisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          requesterId: 1,
          OR: [
            {
              ticketNumber: {
                contains: "email",
                mode: "insensitive",
              },
            },
            {
              summary: {
                contains: "email",
                mode: "insensitive",
              },
            },
          ],
        }),
      }),
    );
  });

  it("supports multiple filters together", async () => {
    prisma.requester.findFirst.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    prisma.ticket.count.mockResolvedValue(1);
    prisma.ticket.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/tickets")
      .query({
        requesterId: 1,
        categoryId: 2,
        relatedSystemId: 3,
        requestedPriority: "HIGH",
        currentStatus: "NEW",
      });

    expect(response.status).toBe(200);

    expect(prisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          requesterId: 1,
          categoryId: 2,
          relatedSystemId: 3,
          requestedPriority: "HIGH",
          currentStatus: "NEW",
        }),
      }),
    );
  });

  it("uses the requested page and page size", async () => {
    prisma.requester.findFirst.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    prisma.ticket.count.mockResolvedValue(35);
    prisma.ticket.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/tickets")
      .query({
        requesterId: 1,
        page: 2,
        pageSize: 10,
      });

    expect(response.status).toBe(200);

    expect(response.body.pagination).toEqual({
      page: 2,
      pageSize: 10,
      total: 35,
      totalPages: 4,
    });

    expect(prisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it("limits page size to a maximum of 50", async () => {
    prisma.requester.findFirst.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    prisma.ticket.count.mockResolvedValue(100);
    prisma.ticket.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/tickets")
      .query({
        requesterId: 1,
        page: 1,
        pageSize: 100,
      });

    expect(response.status).toBe(200);

    expect(response.body.pagination.pageSize).toBe(50);

    expect(prisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 50,
      }),
    );
  });

  it("supports sorting by an allowed field and order", async () => {
    prisma.requester.findFirst.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    prisma.ticket.count.mockResolvedValue(2);
    prisma.ticket.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/tickets")
      .query({
        requesterId: 1,
        sortBy: "summary",
        sortOrder: "asc",
      });

    expect(response.status).toBe(200);

    expect(prisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          summary: "asc",
        },
      }),
    );
  });

  it("falls back to default pagination and sorting for invalid values", async () => {
    prisma.requester.findFirst.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    prisma.ticket.count.mockResolvedValue(3);
    prisma.ticket.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/tickets")
      .query({
        requesterId: 1,
        page: "abc",
        pageSize: "abc",
        sortBy: "invalid",
        sortOrder: "invalid",
      });

    expect(response.status).toBe(200);

    expect(response.body.pagination).toEqual({
      page: 1,
      pageSize: 10,
      total: 3,
      totalPages: 1,
    });

    expect(prisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
      }),
    );
  });

  it("returns 500 when the database fails", async () => {
    prisma.requester.findFirst.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    prisma.ticket.count.mockRejectedValue(
      new Error("Database connection failed"),
    );

    const response = await request(app)
      .get("/api/tickets")
      .query({ requesterId: 1 });

    expect(response.status).toBe(500);

    expect(response.body).toEqual({
      error: {
        code: "INTERNAL_ERROR",
        message: "Unable to retrieve tickets.",
      },
    });
  });
});
