import express, { Request, Response } from "express";
import cors from "cors";
import { Prisma } from "@prisma/client";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { getPrisma } from "./prisma.js";
import { generateTicketNumber } from "./utils/ticketNumber.js";

// The Express app is exported separately from app.listen() (see index.ts) so
// Supertest can import `app` without opening a port. Do not merge these files.
export const app = express();

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Attachment upload configuration
// ---------------------------------------------------------------------------

const UPLOAD_DIR = path.resolve("uploads");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ACTIVE_ATTACHMENTS = 5;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const storedFilename = `${crypto.randomUUID()}${extension}`;

    cb(null, storedFilename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      const error = new Error("UNSUPPORTED_FILE_TYPE");
      cb(error);
      return;
    }

    cb(null, true);
  },
});

// ---------------------------------------------------------------------------
// Helper — Validate active requester
// ---------------------------------------------------------------------------

async function validateRequester(
  requesterIdHeader: string | undefined
): Promise<number | null> {
  const requesterId = Number(requesterIdHeader);

  if (
    !requesterIdHeader ||
    !Number.isInteger(requesterId) ||
    requesterId < 1
  ) {
    return null;
  }

  const requester = await getPrisma().requester.findFirst({
    where: {
      id: requesterId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  return requester ? requester.id : null;
}

// ---------------------------------------------------------------------------
// Issue 2 — API health check
// ---------------------------------------------------------------------------

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "TokTickIT API",
  });
});

// ---------------------------------------------------------------------------
// Issue 4 — Category list
// ---------------------------------------------------------------------------

app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await getPrisma().category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    res.status(200).json(categories);
  } catch {
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Unable to retrieve categories.",
    });
  }
});

// ---------------------------------------------------------------------------
// Related Systems
// ---------------------------------------------------------------------------

app.get("/api/related-systems", async (_req: Request, res: Response) => {
  try {
    const relatedSystems = await getPrisma().relatedSystem.findMany({
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

    res.status(200).json(relatedSystems);
  } catch {
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Unable to retrieve related systems.",
    });
  }
});

// ---------------------------------------------------------------------------
// Issue 13 — Development Requester Context
// ---------------------------------------------------------------------------

app.get("/api/requesters", async (_req: Request, res: Response) => {
  try {
    const requesters = await getPrisma().requester.findMany({
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

    res.status(200).json(requesters);
  } catch (error) {
    console.error("Failed to retrieve requesters:", error);

    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Unable to retrieve requesters.",
    });
  }
});

// ---------------------------------------------------------------------------
// Create Ticket
// POST /api/tickets
// ---------------------------------------------------------------------------

app.post("/api/tickets", async (req: Request, res: Response) => {
  try {
    // ---------------------------------------------------------------
    // Validate Requester Identity
    // ---------------------------------------------------------------

    const requesterIdHeader = req.header("X-Requester-Id");

    const requesterId = Number(requesterIdHeader);

    if (
      !requesterIdHeader ||
      !Number.isInteger(requesterId) ||
      requesterId < 1
    ) {
      return res.status(400).json({
        error: "INVALID_REQUESTER",
        message: "A valid, active Requester identity is required.",
      });
    }

    const requester = await getPrisma().requester.findFirst({
      where: {
        id: requesterId,
        isActive: true,
      },
    });

    if (!requester) {
      return res.status(400).json({
        error: "INVALID_REQUESTER",
        message: "A valid, active Requester identity is required.",
      });
    }

    // ---------------------------------------------------------------
    // Read request body
    // ---------------------------------------------------------------

    const {
      categoryId,
      relatedSystemId,
      summary,
      description,
      requestedPriority,
    } = req.body;

    // ---------------------------------------------------------------
    // Field validation
    // ---------------------------------------------------------------

    const fields: Record<string, string> = {};

    const trimmedSummary =
      typeof summary === "string" ? summary.trim() : "";

    const trimmedDescription =
      typeof description === "string" ? description.trim() : "";

    if (
      trimmedSummary.length < 5 ||
      trimmedSummary.length > 150
    ) {
      fields.summary =
        "Summary must be between 5 and 150 characters.";
    }

    if (
      trimmedDescription.length < 10 ||
      trimmedDescription.length > 2000
    ) {
      fields.description =
        "Description must be between 10 and 2000 characters.";
    }

    if (
      !["LOW", "MEDIUM", "HIGH"].includes(requestedPriority)
    ) {
      fields.requestedPriority =
        "Requested priority must be LOW, MEDIUM, or HIGH.";
    }

    if (
      !Number.isInteger(categoryId) ||
      categoryId < 1
    ) {
      fields.categoryId =
        "Category is required and must be active.";
    }

    if (
      !Number.isInteger(relatedSystemId) ||
      relatedSystemId < 1
    ) {
      fields.relatedSystemId =
        "Related System is required and must be active.";
    }

    if (Object.keys(fields).length > 0) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "One or more fields are invalid.",
        fields,
      });
    }

    // ---------------------------------------------------------------
    // Validate Category and Related System references
    // ---------------------------------------------------------------

    const category = await getPrisma().category.findUnique({
      where: {
        id: categoryId,
      },
    });

    const relatedSystem = await getPrisma().relatedSystem.findFirst({
      where: {
        id: relatedSystemId,
        isActive: true,
      },
    });

    if (!category || !relatedSystem) {
      return res.status(400).json({
        error: "INVALID_REFERENCE",
        message:
          "The selected Category or Related System is not available.",
      });
    }

    // ---------------------------------------------------------------
    // Generate ticket number
    // BR-01:
    // TKT-YYYY-NNNNNN
    // Sequential per year
    // Retry up to 3 times if a unique constraint collision occurs
    // ---------------------------------------------------------------

    const prisma = getPrisma();
    const now = new Date();

    const startOfYear = new Date(
      now.getFullYear(),
      0,
      1
    );

    const startOfNextYear = new Date(
      now.getFullYear() + 1,
      0,
      1
    );

    const MAX_RETRIES = 3;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const ticketCount = await prisma.ticket.count({
          where: {
            createdAt: {
              gte: startOfYear,
              lt: startOfNextYear,
            },
          },
        });

        const ticketNumber = generateTicketNumber(
          ticketCount + 1,
          now
        );

        // -------------------------------------------------------------
        // Create ticket
        // -------------------------------------------------------------

        const ticket = await prisma.ticket.create({
          data: {
            ticketNumber,
            requesterId,
            categoryId,
            relatedSystemId,
            summary: trimmedSummary,
            description: trimmedDescription,
            requestedPriority,
          },
        });

        // -------------------------------------------------------------
        // Success response
        // -------------------------------------------------------------

        return res.status(201).json(ticket);
      } catch (error) {
        // -------------------------------------------------------------
        // Retry if Ticket Number conflicts with UNIQUE constraint
        // -------------------------------------------------------------

        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002" &&
          attempt < MAX_RETRIES - 1
        ) {
          continue;
        }

        throw error;
      }
    }

    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Unable to generate a unique ticket number.",
    });
  } catch (error) {
    console.error("Failed to create ticket:", error);

    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Unable to create ticket.",
    });
  }
});

// ---------------------------------------------------------------------------
// Attachment API
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// POST /api/tickets/:id/attachments
// Upload one attachment
// ---------------------------------------------------------------------------

app.post(
  "/api/tickets/:id/attachments",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const requesterId = await validateRequester(
        req.header("X-Requester-Id")
      );

      if (!requesterId) {
        return res.status(400).json({
          error: "INVALID_REQUESTER",
          message: "A valid, active Requester identity is required.",
        });
      }

      const ticketId = Number(req.params.id);

      if (!Number.isInteger(ticketId) || ticketId < 1) {
        return res.status(404).json({
          error: "TICKET_NOT_FOUND",
          message: "Ticket not found.",
        });
      }

      const ticket = await getPrisma().ticket.findFirst({
        where: {
          id: ticketId,
          requesterId,
        },
        select: {
          id: true,
          requesterId: true,
        },
      });

      if (!ticket) {
        return res.status(404).json({
          error: "TICKET_NOT_FOUND",
          message: "Ticket not found.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "A file is required.",
        });
      }

      const activeAttachmentCount =
        await getPrisma().attachment.count({
          where: {
            ticketId,
            isRemoved: false,
          },
        });

      if (activeAttachmentCount >= MAX_ACTIVE_ATTACHMENTS) {
        return res.status(409).json({
          error: "ATTACHMENT_LIMIT_REACHED",
          message:
            "This ticket already has the maximum of 5 active attachments.",
        });
      }

      const attachment = await getPrisma().attachment.create({
        data: {
          ticketId,
          originalFilename: req.file.originalname,
          storedFilename: req.file.filename,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
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

      return res.status(201).json(attachment);
    } catch (error) {
      console.error("Failed to upload attachment:", error);

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Unable to upload attachment.",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/tickets/:id/attachments
// List active and removed attachment metadata
// ---------------------------------------------------------------------------

app.get(
  "/api/tickets/:id/attachments",
  async (req: Request, res: Response) => {
    try {
      const requesterId = await validateRequester(
        req.query.requesterId?.toString()
      );

      if (!requesterId) {
        return res.status(400).json({
          error: "INVALID_REQUESTER",
          message: "A valid, active Requester identity is required.",
        });
      }

      const ticketId = Number(req.params.id);

      if (!Number.isInteger(ticketId) || ticketId < 1) {
        return res.status(404).json({
          error: "TICKET_NOT_FOUND",
          message: "Ticket not found.",
        });
      }

      const ticket = await getPrisma().ticket.findFirst({
        where: {
          id: ticketId,
          requesterId,
        },
        select: {
          id: true,
        },
      });

      if (!ticket) {
        return res.status(404).json({
          error: "TICKET_NOT_FOUND",
          message: "Ticket not found.",
        });
      }

      const attachments = await getPrisma().attachment.findMany({
        where: {
          ticketId,
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

      return res.status(200).json(attachments);
    } catch (error) {
      console.error("Failed to retrieve attachments:", error);

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Unable to retrieve attachments.",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/attachments/:id/download
// Download active attachment
// ---------------------------------------------------------------------------

app.get(
  "/api/attachments/:id/download",
  async (req: Request, res: Response) => {
    try {
      const requesterId = await validateRequester(
        req.query.requesterId?.toString()
      );

      if (!requesterId) {
        return res.status(400).json({
          error: "INVALID_REQUESTER",
          message: "A valid, active Requester identity is required.",
        });
      }

      const attachmentId = Number(req.params.id);

      if (!Number.isInteger(attachmentId) || attachmentId < 1) {
        return res.status(404).json({
          error: "ATTACHMENT_NOT_FOUND",
          message: "Attachment not found.",
        });
      }

      const attachment = await getPrisma().attachment.findFirst({
        where: {
          id: attachmentId,
          ticket: {
            requesterId,
          },
        },
        select: {
          id: true,
          ticketId: true,
          originalFilename: true,
          storedFilename: true,
          mimeType: true,
          isRemoved: true,
        },
      });

      if (!attachment) {
        return res.status(404).json({
          error: "ATTACHMENT_NOT_FOUND",
          message: "Attachment not found.",
        });
      }

      if (attachment.isRemoved) {
        return res.status(410).json({
          error: "ATTACHMENT_REMOVED",
          message:
            "This attachment has been removed and is no longer available.",
        });
      }

      const filePath = path.join(
        UPLOAD_DIR,
        attachment.storedFilename
      );

      res.setHeader("Content-Type", attachment.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(
          attachment.originalFilename
        )}"`
      );

      return res.sendFile(filePath, (error) => {
        if (error && !res.headersSent) {
          console.error("Failed to download attachment:", error);

          res.status(500).json({
            error: "INTERNAL_ERROR",
            message: "Unable to download attachment.",
          });
        }
      });
    } catch (error) {
      console.error("Failed to retrieve attachment:", error);

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Unable to download attachment.",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// DELETE /api/attachments/:id
// Soft-remove attachment
// ---------------------------------------------------------------------------

app.delete(
  "/api/attachments/:id",
  async (req: Request, res: Response) => {
    try {
      const requesterId = await validateRequester(
        req.header("X-Requester-Id")
      );

      if (!requesterId) {
        return res.status(400).json({
          error: "INVALID_REQUESTER",
          message: "A valid, active Requester identity is required.",
        });
      }

      const attachmentId = Number(req.params.id);

      if (!Number.isInteger(attachmentId) || attachmentId < 1) {
        return res.status(404).json({
          error: "TICKET_NOT_FOUND",
          message: "Ticket not found.",
        });
      }

      const reason =
        typeof req.body?.reason === "string"
          ? req.body.reason.trim()
          : "";

      if (reason.length < 5) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message:
            "A removal reason of at least 5 characters is required.",
        });
      }

      const attachment = await getPrisma().attachment.findFirst({
        where: {
          id: attachmentId,
          ticket: {
            requesterId,
          },
        },
        select: {
          id: true,
          ticketId: true,
          isRemoved: true,
        },
      });

      if (!attachment) {
        return res.status(404).json({
          error: "TICKET_NOT_FOUND",
          message: "Ticket not found.",
        });
      }

      if (attachment.isRemoved) {
        return res.status(409).json({
          error: "ATTACHMENT_ALREADY_REMOVED",
          message:
            "This attachment has already been removed.",
        });
      }

      const removedAt = new Date();

      const updatedAttachment =
        await getPrisma().attachment.update({
          where: {
            id: attachmentId,
          },
          data: {
            isRemoved: true,
            removedAt,
            removalReason: reason,
          },
          select: {
            id: true,
            isRemoved: true,
            removedAt: true,
            removalReason: true,
          },
        });

      return res.status(200).json(updatedAttachment);
    } catch (error) {
      console.error("Failed to remove attachment:", error);

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Unable to remove attachment.",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// Multer error handler
// ---------------------------------------------------------------------------

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: express.NextFunction
  ) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "FILE_TOO_LARGE",
          message: "File exceeds the 5 MB size limit.",
        });
      }

      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Unable to process uploaded file.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "UNSUPPORTED_FILE_TYPE"
    ) {
      return res.status(400).json({
        error: "UNSUPPORTED_FILE_TYPE",
        message:
          "Allowed file types are JPG, PNG, WEBP, and PDF.",
      });
    }

    console.error("Unhandled application error:", error);

    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Internal server error.",
    });
  }
);

export default app;
