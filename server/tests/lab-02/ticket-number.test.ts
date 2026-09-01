import { describe, expect, it } from "vitest";
import { generateTicketNumber } from "../../src/utils/ticketNumber.js";

describe("generateTicketNumber", () => {
  it("generates ticket number in TKT-YYYY-NNNNNN format", () => {
    const result = generateTicketNumber(
      1,
      new Date("2026-01-01T00:00:00Z")
    );

    expect(result).toBe("TKT-2026-000001");
  });

  it("pads the sequence number to 6 digits", () => {
    const result = generateTicketNumber(
      123,
      new Date("2026-01-01T00:00:00Z")
    );

    expect(result).toBe("TKT-2026-000123");
  });

  it("handles large sequence numbers", () => {
    const result = generateTicketNumber(
      999999,
      new Date("2026-01-01T00:00:00Z")
    );

    expect(result).toBe("TKT-2026-999999");
  });

  it("throws an error for invalid sequence number", () => {
    expect(() => generateTicketNumber(0)).toThrow(
      "Sequence must be a positive integer."
    );
  });
});
