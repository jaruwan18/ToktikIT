import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import app from "../../src/app.js";

const prismaMock = {
  requester: {
    findFirst: vi.fn(),
  },
  ticket: {
    findFirst: vi.fn(),
  },
  attachment: {
    count: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock("../../src/prisma.js", () => ({
  getPrisma: () => prismaMock,
}));

describe("Attachment API", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.requester.findFirst.mockResolvedValue({
      id: 1,
      name: "Jennifer Anderson",
    });
  });

  describe("POST /api/tickets/:id/attachments", () => {
    it("API-12: uploads a valid attachment successfully", async () => {
      const uploadedAt = new Date("2026-09-02T10:00:00.000Z");

      prismaMock.ticket.findFirst.mockResolvedValue({
        id: 1,
        requesterId: 1,
      });

      prismaMock.attachment.count.mockResolvedValue(0);

      prismaMock.attachment.create.mockResolvedValue({
        id: 10,
        ticketId: 1,
        originalFilename: "evidence.pdf",
        mimeType: "application/pdf",
        sizeBytes: 9,
        uploadedAt,
        isRemoved: false,
      });

      const response = await request(app)
        .post("/api/tickets/1/attachments")
        .set("X-Requester-Id", "1")
        .attach("file", Buffer.from("test file"), {
          filename: "evidence.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).toBe(201);

      expect(response.body).toEqual({
        id: 10,
        ticketId: 1,
        originalFilename: "evidence.pdf",
        mimeType: "application/pdf",
        sizeBytes: 9,
        uploadedAt: expect.any(String),
        isRemoved: false,
      });

      expect(prismaMock.attachment.create).toHaveBeenCalledWith({
        data: {
          ticketId: 1,
          originalFilename: "evidence.pdf",
          storedFilename: expect.stringMatching(/^[0-9a-f-]{36}\.pdf$/),
          mimeType: "application/pdf",
          sizeBytes: 9,
        },
        select: {
          id: true,
          ticketId: true,
          originalFilename: true,
          mimeType: true,
          sizeBytes: true,
          uploadedAt: true,
          isRemoved: true,
        },
      });
    });

    it("API-13: rejects files larger than 5 MB", async () => {
      prismaMock.ticket.findFirst.mockResolvedValue({
        id: 1,
        requesterId: 1,
      });

      const response = await request(app)
        .post("/api/tickets/1/attachments")
        .set("X-Requester-Id", "1")
        .attach("file", Buffer.alloc(6 * 1024 * 1024), {
          filename: "large.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).toBe(400);

      expect(response.body).toEqual({
        error: "FILE_TOO_LARGE",
        message: "File exceeds the 5 MB size limit.",
      });
    });

    it("API-14: rejects unsupported file types", async () => {
      prismaMock.ticket.findFirst.mockResolvedValue({
        id: 1,
        requesterId: 1,
      });

      const response = await request(app)
        .post("/api/tickets/1/attachments")
        .set("X-Requester-Id", "1")
        .attach("file", Buffer.from("fake gif content"), {
          filename: "image.gif",
          contentType: "image/gif",
        });

      expect(response.status).toBe(400);

      expect(response.body).toEqual({
        error: "UNSUPPORTED_FILE_TYPE",
        message: "Allowed file types are JPG, PNG, WEBP, and PDF.",
      });
    });

    it("API-15: rejects the 6th active attachment", async () => {
      prismaMock.ticket.findFirst.mockResolvedValue({
        id: 1,
        requesterId: 1,
      });

      prismaMock.attachment.count.mockResolvedValue(5);

      const response = await request(app)
        .post("/api/tickets/1/attachments")
        .set("X-Requester-Id", "1")
        .attach("file", Buffer.from("test file"), {
          filename: "evidence.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).toBe(409);

      expect(response.body).toEqual({
        error: "ATTACHMENT_LIMIT_REACHED",
        message:
          "This ticket already has the maximum of 5 active attachments.",
      });
    });
  });

  describe("GET /api/tickets/:id/attachments", () => {
    it("returns active and removed attachment metadata for the ticket", async () => {
      const uploadedAt = new Date("2026-09-02T10:00:00.000Z");
      const removedAt = new Date("2026-09-02T11:00:00.000Z");

      prismaMock.ticket.findFirst.mockResolvedValue({
        id: 1,
        requesterId: 1,
      });

      prismaMock.attachment.findMany.mockResolvedValue([
        {
          id: 10,
          ticketId: 1,
          originalFilename: "evidence.pdf",
          mimeType: "application/pdf",
          sizeBytes: 1234,
          uploadedAt,
          isRemoved: false,
          removedAt: null,
          removalReason: null,
        },
        {
          id: 11,
          ticketId: 1,
          originalFilename: "old-image.png",
          mimeType: "image/png",
          sizeBytes: 2345,
          uploadedAt,
          isRemoved: true,
          removedAt,
          removalReason: "No longer needed",
        },
      ]);

      const response = await request(app)
        .get("/api/tickets/1/attachments")
        .query({
          requesterId: "1",
        });

      expect(response.status).toBe(200);

      expect(response.body).toEqual([
        {
          id: 10,
          ticketId: 1,
          originalFilename: "evidence.pdf",
          mimeType: "application/pdf",
          sizeBytes: 1234,
          uploadedAt: uploadedAt.toISOString(),
          isRemoved: false,
          removedAt: null,
          removalReason: null,
        },
        {
          id: 11,
          ticketId: 1,
          originalFilename: "old-image.png",
          mimeType: "image/png",
          sizeBytes: 2345,
          uploadedAt: uploadedAt.toISOString(),
          isRemoved: true,
          removedAt: removedAt.toISOString(),
          removalReason: "No longer needed",
        },
      ]);

      expect(prismaMock.attachment.findMany).toHaveBeenCalledWith({
        where: {
          ticketId: 1,
        },
        select: {
          id: true,
          ticketId: true,
          originalFilename: true,
          mimeType: true,
          sizeBytes: true,
          uploadedAt: true,
          isRemoved: true,
          removedAt: true,
          removalReason: true,
        },
        orderBy: {
          uploadedAt: "asc",
        },
      });
    });
  });

  describe("Attachment validation and ownership", () => {
    it("rejects an invalid requester", async () => {
      prismaMock.requester.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/tickets/1/attachments")
        .query({
          requesterId: "999",
        });

      expect(response.status).toBe(400);

      expect(response.body).toEqual({
        error: "INVALID_REQUESTER",
        message: "A valid, active Requester identity is required.",
      });
    });

    it("returns 404 when the ticket does not belong to the requester", async () => {
      prismaMock.ticket.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/tickets/999/attachments")
        .query({
          requesterId: "1",
        });

      expect(response.status).toBe(404);

      expect(response.body).toEqual({
        error: "TICKET_NOT_FOUND",
        message: "Ticket not found.",
      });
    });

    it("rejects a removal reason shorter than 5 characters", async () => {
      prismaMock.attachment.findFirst.mockResolvedValue({
        id: 10,
        ticketId: 1,
        isRemoved: false,
        ticket: {
          id: 1,
          requesterId: 1,
        },
      });

      const response = await request(app)
        .delete("/api/attachments/10")
        .set("X-Requester-Id", "1")
        .send({
          reason: "bad",
        });

      expect(response.status).toBe(400);

      expect(response.body).toEqual({
        error: "VALIDATION_ERROR",
        message: "A removal reason of at least 5 characters is required.",
      });
    });

    it("returns 409 when the attachment has already been removed", async () => {
      prismaMock.attachment.findFirst.mockResolvedValue({
        id: 10,
        ticketId: 1,
        isRemoved: true,
        ticket: {
          id: 1,
          requesterId: 1,
        },
      });

      const response = await request(app)
        .delete("/api/attachments/10")
        .set("X-Requester-Id", "1")
        .send({
          reason: "No longer needed",
        });

      expect(response.status).toBe(409);

      expect(response.body).toEqual({
        error: "ATTACHMENT_ALREADY_REMOVED",
        message: "This attachment has already been removed.",
      });
    });

    it("returns 404 when the attachment does not exist", async () => {
      prismaMock.attachment.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/attachments/999")
        .set("X-Requester-Id", "1")
        .send({
          reason: "No longer needed",
        });

      expect(response.status).toBe(404);

      expect(response.body).toEqual({
       error: "TICKET_NOT_FOUND",
       message: "Ticket not found.",
      });
    });
  });

  describe("DELETE /api/attachments/:id", () => {
    it("API-16: soft-removes an attachment with a valid reason", async () => {
      const removedAt = new Date("2026-09-02T10:00:00.000Z");

      prismaMock.attachment.findFirst.mockResolvedValue({
        id: 10,
        ticketId: 1,
        isRemoved: false,
        ticket: {
          id: 1,
          requesterId: 1,
        },
      });

      prismaMock.attachment.update.mockResolvedValue({
        id: 10,
        isRemoved: true,
        removedAt,
        removalReason: "No longer needed",
      });

      const response = await request(app)
        .delete("/api/attachments/10")
        .set("X-Requester-Id", "1")
        .send({
          reason: "No longer needed",
        });

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        id: 10,
        isRemoved: true,
        removedAt: removedAt.toISOString(),
        removalReason: "No longer needed",
      });

      expect(prismaMock.attachment.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: {
          isRemoved: true,
          removedAt: expect.any(Date),
          removalReason: "No longer needed",
        },
        select: {
          id: true,
          isRemoved: true,
          removedAt: true,
          removalReason: true,
        },
      });
    });

    it("API-17: prevents another requester from removing the attachment", async () => {
      prismaMock.attachment.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/attachments/10")
        .set("X-Requester-Id", "2")
        .send({
          reason: "Remove this file",
        });

      expect(response.status).toBe(404);

      expect(response.body).toEqual({
        error: "TICKET_NOT_FOUND",
        message: "Ticket not found.",
      });
    });
  });

  describe("GET /api/attachments/:id/download", () => {
    it("API-18: returns 410 for a soft-removed attachment", async () => {
      prismaMock.attachment.findFirst.mockResolvedValue({
        id: 10,
        ticketId: 1,
        originalFilename: "evidence.pdf",
        storedFilename: "stored-file-name.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1234,
        isRemoved: true,
        removedAt: new Date("2026-09-02T10:00:00.000Z"),
        ticket: {
          id: 1,
          requesterId: 1,
        },
      });

      const response = await request(app)
        .get("/api/attachments/10/download")
        .query({
          requesterId: "1",
        });

      expect(response.status).toBe(410);

      expect(response.body).toEqual({
        error: "ATTACHMENT_REMOVED",
        message:
          "This attachment has been removed and is no longer available.",
      });
    });
  });
});