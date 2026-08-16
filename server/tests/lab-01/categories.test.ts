import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

const EXPECTED_CATEGORIES = [
  "Account and Access",
  "Hardware",
  "Software",
  "Network",
];

describe("GET /api/categories", () => {
  it("returns 200 and the four seeded categories in id order", async () => {
    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(4);
    expect(res.body.map((c: { name: string }) => c.name)).toEqual(EXPECTED_CATEGORIES);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("name");
  });
});
