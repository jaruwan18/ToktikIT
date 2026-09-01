import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const findManyMock = vi.fn();

vi.mock("../../src/prisma.js", () => ({
  getPrisma: () => ({
    requester: {
      findMany: findManyMock,
    },
  }),
}));

import { app } from "../../src/app.js";

describe("GET /api/requesters", () => {
  beforeEach(() => {
    findManyMock.mockReset();
  });

  it("returns only active requesters", async () => {
    findManyMock.mockResolvedValue([
      {
        id: 1,
        name: "Jennifer Anderson",
        email: "jennifer.anderson@example.com",
      },
      {
        id: 2,
        name: "Michael Brown",
        email: "michael.brown@example.com",
      },
    ]);

    const response = await request(app).get("/api/requesters");

    expect(response.status).toBe(200);

    expect(response.body).toEqual([
      {
        id: 1,
        name: "Jennifer Anderson",
        email: "jennifer.anderson@example.com",
      },
      {
        id: 2,
        name: "Michael Brown",
        email: "michael.brown@example.com",
      },
    ]);

    expect(findManyMock).toHaveBeenCalledWith({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  });

  it("returns an empty array when there are no active requesters", async () => {
    findManyMock.mockResolvedValue([]);

    const response = await request(app).get("/api/requesters");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns 500 when the database fails", async () => {
    findManyMock.mockRejectedValue(
      new Error("Database connection failed")
    );

    const response = await request(app).get("/api/requesters");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "INTERNAL_ERROR",
      message: "Unable to retrieve requesters.",
    });
  });
});
