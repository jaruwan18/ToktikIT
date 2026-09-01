import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const findManyMock = vi.fn();

vi.mock("../../src/prisma.js", () => ({
  getPrisma: () => ({
    relatedSystem: {
      findMany: findManyMock,
    },
  }),
}));

import { app } from "../../src/app.js";

describe("GET /api/related-systems", () => {
  beforeEach(() => {
    findManyMock.mockReset();
  });

  it("returns only active related systems", async () => {
    findManyMock.mockResolvedValue([
      {
        id: 1,
        name: "Email",
      },
      {
        id: 2,
        name: "Campus Wi-Fi",
      },
    ]);

    const response = await request(app).get("/api/related-systems");

    expect(response.status).toBe(200);

    expect(response.body).toEqual([
      {
        id: 1,
        name: "Email",
      },
      {
        id: 2,
        name: "Campus Wi-Fi",
      },
    ]);

    expect(findManyMock).toHaveBeenCalledWith({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  });

  it("returns an empty array when there are no active related systems", async () => {
    findManyMock.mockResolvedValue([]);

    const response = await request(app).get("/api/related-systems");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns 500 when the database fails", async () => {
    findManyMock.mockRejectedValue(
      new Error("Database connection failed")
    );

    const response = await request(app).get("/api/related-systems");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "INTERNAL_ERROR",
      message: "Unable to retrieve related systems.",
    });
  });
});
