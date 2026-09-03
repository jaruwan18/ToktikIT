import express, { Request, Response } from "express";
import cors from "cors";
import { Prisma } from "@prisma/client";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs/promises";
import { getPrisma } from "./prisma.js";
import { generateTicketNumber } from "./utils/ticketNumber.js";

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

// Make sure upload directory exists when the server starts.
void fs.mkdir(UPLOAD_DIR, { recursive: true }).catch((error) => {
  console.error("Failed to create upload directory:", error);
});

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
      cb(new Error("UNSUPPORTED_FILE_TYPE"));
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
  if (!requesterIdHeader) {
    return null;
  }

  const requesterId = Number(requesterIdHeader);

  if (
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
// Helper — Remove uploaded file safely
// ---------------------------------------------------------------------------

async function removeUploadedFile(
  filename: string | undefined
): Promise<void> {
  if (!filename) {
    return;
  }

  try {
    await fs.unlink(path.join(UPLOAD_DIR, filename));
  } catch (error) {
    // File may already have been removed.
    console.warn(
      `Unable to remove uploaded file "${filename}":`,
      error
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/health
// ---------------------------------------------------------------------------

app.get(
  "/api/health",
  (_req: Request, res: Response) => {
    return res.status(200).json({
      status: "ok",
      service: "TokTickIT API",
    });
  }
);

// ---------------------------------------------------------------------------
// GET /api/categories
// ---------------------------------------------------------------------------

app.get(
  "/api/categories",
  async (_req: Request, res: Response) => {
    try {
      const categories =
        await getPrisma().category.findMany({
          select: {
            id: true,
            name: true,
          },

          orderBy: {
            id: "asc",
          },
        });

      return res.status(200).json(categories);
    } catch (error) {
      console.error(
        "Failed to retrieve categories:",
        error
      );

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message:
          "Unable to retrieve categories.",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/related-systems
// ---------------------------------------------------------------------------

app.get(
  "/api/related-systems",
  async (_req: Request, res: Response) => {
    try {
      const relatedSystems =
        await getPrisma().relatedSystem.findMany({
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

      return res.status(200).json(
        relatedSystems
      );
    } catch (error) {
      console.error(
        "Failed to retrieve related systems:",
        error
      );

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message:
          "Unable to retrieve related systems.",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/requesters
// Development Requester Context
// ---------------------------------------------------------------------------

app.get(
  "/api/requesters",
  async (_req: Request, res: Response) => {
    try {
      const requesters =
        await getPrisma().requester.findMany({
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

      return res.status(200).json(requesters);
    } catch (error) {
      console.error(
        "Failed to retrieve requesters:",
        error
      );

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message:
          "Unable to retrieve requesters.",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/tickets
// Create Ticket
// ---------------------------------------------------------------------------

app.post(
  "/api/tickets",
  async (req: Request, res: Response) => {
    try {
      // ---------------------------------------------------------------------
      // Validate Requester Identity
      // ---------------------------------------------------------------------

      const requesterIdHeader =
        req.header("X-Requester-Id");

      const requesterId =
        Number(requesterIdHeader);

      if (
        !requesterIdHeader ||
        !Number.isInteger(requesterId) ||
        requesterId < 1
      ) {
        return res.status(400).json({
          error: "INVALID_REQUESTER",
          message:
            "A valid, active Requester identity is required.",
        });
      }

      const requester =
        await getPrisma().requester.findFirst({
          where: {
            id: requesterId,
            isActive: true,
          },

          select: {
            id: true,
          },
        });

      if (!requester) {
        return res.status(400).json({
          error: "INVALID_REQUESTER",
          message:
            "A valid, active Requester identity is required.",
        });
      }

      // ---------------------------------------------------------------------
      // Read request body
      // ---------------------------------------------------------------------

      const {
        categoryId,
        relatedSystemId,
        summary,
        description,
        requestedPriority,
      } = req.body;

      // ---------------------------------------------------------------------
      // Field validation
      // ---------------------------------------------------------------------

      const fields: Record<string, string> = {};

      const trimmedSummary =
        typeof summary === "string"
          ? summary.trim()
          : "";

      const trimmedDescription =
        typeof description === "string"
          ? description.trim()
          : "";

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
        !["LOW", "MEDIUM", "HIGH"].includes(
          requestedPriority
        )
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

      if (
        Object.keys(fields).length > 0
      ) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message:
            "One or more fields are invalid.",
          fields,
        });
      }

      // ---------------------------------------------------------------------
      // Validate Category
      // ---------------------------------------------------------------------

      const category =
        await getPrisma().category.findUnique({
          where: {
            id: categoryId,
          },

          select: {
            id: true,
          },
        });

      if (!category) {
        return res.status(400).json({
          error: "INVALID_REFERENCE",
          message:
            "Category must be a valid active category.",
        });
      }

      // ---------------------------------------------------------------------
      // Validate Related System
      // ---------------------------------------------------------------------

      const relatedSystem =
        await getPrisma().relatedSystem.findFirst({
          where: {
            id: relatedSystemId,
            isActive: true,
          },

          select: {
            id: true,
          },
        });

      if (!relatedSystem) {
        return res.status(400).json({
          error: "INVALID_REFERENCE",
          message:
            "Related System must be a valid active system.",
        });
      }

      // ---------------------------------------------------------------------
      // Generate Ticket Number
      //
      // BR-01:
      // TKT-YYYY-NNNNNN
      // Sequential per year
      // Retry up to 3 times on unique constraint collision
      // ---------------------------------------------------------------------

      const prisma = getPrisma();

      const MAX_RETRIES = 3;
      const now = new Date();

      const startOfYear =
        new Date(
          now.getFullYear(),
          0,
          1,
          0,
          0,
          0,
          0
        );

      const startOfNextYear =
        new Date(
          now.getFullYear() + 1,
          0,
          1,
          0,
          0,
          0,
          0
        );

      for (
        let attempt = 0;
        attempt < MAX_RETRIES;
        attempt++
      ) {
        try {
          const ticketCount =
            await prisma.ticket.count({
              where: {
                createdAt: {
                  gte: startOfYear,
                  lt: startOfNextYear,
                },
              },
            });

          const ticketNumber =
            generateTicketNumber(
              ticketCount + 1,
              now
            );

          const ticket =
            await prisma.ticket.create({
              data: {
                ticketNumber,
                requesterId,
                categoryId,
                relatedSystemId,
                summary: trimmedSummary,
                description: trimmedDescription,
                requestedPriority,
                currentStatus: "NEW",
              },
            });

          return res.status(201).json(ticket);
        } catch (error) {
          if (
            error instanceof
              Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            if (
              attempt <
              MAX_RETRIES - 1
            ) {
              continue;
            }

            return res.status(409).json({
              error:
                "TICKET_NUMBER_CONFLICT",
            });
          }

          throw error;
        }
      }

      return res.status(409).json({
        error:
          "TICKET_NUMBER_CONFLICT",
      });
    } catch (error) {
      console.error(
        "POST /api/tickets failed:",
        error
      );

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message:
          "Unable to create ticket.",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/tickets
// My Tickets
// ---------------------------------------------------------------------------

app.get(
  "/api/tickets",
  async (req: Request, res: Response) => {
    try {
      if (!req.query.requesterId) {
        return res.status(400).json({
          error: {
            code: "INVALID_REQUESTER",
            message:
              "requesterId is required.",
          },
        });
      }

      const requesterId =
        Number(req.query.requesterId);

      if (
        !Number.isInteger(requesterId) ||
        requesterId <= 0
      ) {
        return res.status(400).json({
          error: {
            code: "INVALID_REQUESTER",
            message:
              "requesterId must be a valid integer.",
          },
        });
      }

      const prisma = getPrisma();

      const requester =
        await prisma.requester.findFirst({
          where: {
            id: requesterId,
            isActive: true,
          },
        });

      if (!requester) {
        return res.status(404).json({
          error: {
            code: "REQUESTER_NOT_FOUND",
            message:
              "Requester not found.",
          },
        });
      }

      // ---------------------------------------------------------------------
      // Pagination
      // ---------------------------------------------------------------------

      const pageValue =
        Number(req.query.page);

      const pageSizeValue =
        Number(req.query.pageSize);

      const page =
        req.query.page === undefined
          ? 1
          : Number.isInteger(pageValue) &&
              pageValue > 0
            ? pageValue
            : 1;

      const pageSize =
        req.query.pageSize === undefined
          ? 10
          : Number.isInteger(pageSizeValue) &&
              pageSizeValue > 0
            ? Math.min(
                pageSizeValue,
                50
              )
            : 10;

      const skip =
        (page - 1) * pageSize;

      // ---------------------------------------------------------------------
      // Build query filters
      // ---------------------------------------------------------------------

      const where: any = {
        requesterId,
      };

      const search =
        typeof req.query.search ===
        "string"
          ? req.query.search.trim()
          : "";

      if (search) {
        where.OR = [
          {
            ticketNumber: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            summary: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      if (
        req.query.categoryId !==
        undefined
      ) {
        const categoryId =
          Number(
            req.query.categoryId
          );

        if (
          Number.isInteger(
            categoryId
          ) &&
          categoryId > 0
        ) {
          where.categoryId =
            categoryId;
        }
      }

      if (
        req.query.relatedSystemId !==
        undefined
      ) {
        const relatedSystemId =
          Number(
            req.query.relatedSystemId
          );

        if (
          Number.isInteger(
            relatedSystemId
          ) &&
          relatedSystemId > 0
        ) {
          where.relatedSystemId =
            relatedSystemId;
        }
      }

      if (
        req.query.requestedPriority !==
        undefined
      ) {
        const priority =
          String(
            req.query.requestedPriority
          );

        if (
          priority === "LOW" ||
          priority === "MEDIUM" ||
          priority === "HIGH"
        ) {
          where.requestedPriority =
            priority;
        }
      }

      if (
        req.query.currentStatus !==
        undefined
      ) {
        const status =
          String(
            req.query.currentStatus
          );

        if (status === "NEW") {
          where.currentStatus =
            status;
        }
      }

      // ---------------------------------------------------------------------
      // Sorting
      // ---------------------------------------------------------------------

      const allowedSortFields = [
        "createdAt",
        "updatedAt",
        "ticketNumber",
        "summary",
      ];

      const requestedSortBy =
        typeof req.query.sortBy ===
        "string"
          ? req.query.sortBy
          : "createdAt";

      const sortBy =
        allowedSortFields.includes(
          requestedSortBy
        )
          ? requestedSortBy
          : "createdAt";

      const requestedSortOrder =
        typeof req.query.sortOrder ===
        "string"
          ? req.query.sortOrder.toLowerCase()
          : "desc";

      const sortOrder =
        requestedSortOrder === "asc"
          ? "asc"
          : "desc";

      // ---------------------------------------------------------------------
      // Count
      // ---------------------------------------------------------------------

      const total =
        await prisma.ticket.count({
          where,
        });

      // ---------------------------------------------------------------------
      // Retrieve tickets
      // ---------------------------------------------------------------------

      const tickets =
        await prisma.ticket.findMany({
          where,

          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },

            relatedSystem: {
              select: {
                id: true,
                name: true,
              },
            },
          },

          orderBy: {
            [sortBy]: sortOrder,
          },

          skip,
          take: pageSize,
        });

      const totalPages =
        total === 0
          ? 0
          : Math.ceil(
              total / pageSize
            );

      return res.status(200).json({
        data: tickets,

        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      });
    } catch (error) {
      console.error(
        "GET /api/tickets failed:",
        error
      );

      return res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message:
            "Unable to retrieve tickets.",
        },
      });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/tickets/:id
// Ticket Detail
// ---------------------------------------------------------------------------

app.get(
  "/api/tickets/:id",
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const requesterId =
        Number(
          req.query.requesterId
        );

      if (
        !req.query.requesterId ||
        !Number.isInteger(
          requesterId
        ) ||
        requesterId < 1
      ) {
        return res.status(400).json({
          error:
            "INVALID_REQUESTER",
          message:
            "A valid, active Requester identity is required.",
        });
      }

      const requester =
        await getPrisma().requester.findFirst(
          {
            where: {
              id: requesterId,
              isActive: true,
            },

            select: {
              id: true,
              name: true,
            },
          }
        );

      if (!requester) {
        return res.status(400).json({
          error:
            "INVALID_REQUESTER",
          message:
            "A valid, active Requester identity is required.",
        });
      }

      const ticketId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          ticketId
        ) ||
        ticketId < 1
      ) {
        return res.status(404).json({
          error:
            "TICKET_NOT_FOUND",
          message:
            "Ticket not found.",
        });
      }

      const ticket =
        await getPrisma().ticket.findFirst(
          {
            where: {
              id: ticketId,
              requesterId,
            },

            select: {
              ticketNumber: true,
              requesterId: true,
              categoryId: true,
              relatedSystemId: true,
              summary: true,
              description: true,
              requestedPriority: true,
              currentStatus: true,
              createdAt: true,
              updatedAt: true,

              requester: {
                select: {
                  id: true,
                  name: true,
                },
              },

              category: {
                select: {
                  id: true,
                  name: true,
                },
              },

              relatedSystem: {
                select: {
                  id: true,
                  name: true,
                },
              },

              attachments: {
                select: {
                  id: true,
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
              },
            },
          }
        );

      if (!ticket) {
        return res.status(404).json({
          error:
            "TICKET_NOT_FOUND",
          message:
            "Ticket not found.",
        });
      }

      return res.status(200).json({
        ticketNumber:
          ticket.ticketNumber,

        requesterId:
          ticket.requesterId,

        requesterName:
          ticket.requester.name,

        categoryId:
          ticket.categoryId,

        categoryName:
          ticket.category.name,

        relatedSystemId:
          ticket.relatedSystemId,

        relatedSystemName:
          ticket.relatedSystem.name,

        summary:
          ticket.summary,

        description:
          ticket.description,

        requestedPriority:
          ticket.requestedPriority,

        currentStatus:
          ticket.currentStatus,

        createdAt:
          ticket.createdAt,

        updatedAt:
          ticket.updatedAt,

        attachments:
          ticket.attachments,
      });
    } catch (error) {
      console.error(
        "Failed to retrieve ticket detail:",
        error
      );

      return res.status(500).json({
        error:
          "INTERNAL_ERROR",
        message:
          "Unable to retrieve ticket.",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// Attachment API
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// POST /api/tickets/:id/attachments
// Upload one attachment
// ---------------------------------------------------------------------------
//
// Important:
// Requester and ticket ownership are checked BEFORE multer writes the file.
// This prevents unauthorized uploads from creating orphan files.
// ---------------------------------------------------------------------------

app.post(
  "/api/tickets/:id/attachments",

  async (
    req: Request,
    res: Response,
    next: express.NextFunction
  ) => {
    try {
      const requesterId =
        await validateRequester(
          req.header(
            "X-Requester-Id"
          )
        );

      if (!requesterId) {
        return res.status(400).json({
          error:
            "INVALID_REQUESTER",
          message:
            "A valid, active Requester identity is required.",
        });
      }

      const ticketId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          ticketId
        ) ||
        ticketId < 1
      ) {
        return res.status(404).json({
          error:
            "TICKET_NOT_FOUND",
          message:
            "Ticket not found.",
        });
      }

      const ticket =
        await getPrisma().ticket.findFirst(
          {
            where: {
              id: ticketId,
              requesterId,
            },

            select: {
              id: true,
              requesterId: true,
            },
          }
        );

      if (!ticket) {
        return res.status(404).json({
          error:
            "TICKET_NOT_FOUND",
          message:
            "Ticket not found.",
        });
      }

      const activeAttachmentCount =
        await getPrisma().attachment.count(
          {
            where: {
              ticketId,
              isRemoved: false,
            },
          }
        );

      if (
        activeAttachmentCount >=
        MAX_ACTIVE_ATTACHMENTS
      ) {
        return res.status(409).json({
          error:
            "ATTACHMENT_LIMIT_REACHED",
          message:
            "This ticket already has the maximum of 5 active attachments.",
        });
      }

      // Only after all authorization checks pass,
      // process the actual uploaded file.
      return upload.single("file")(
        req,
        res,
        next
      );
    } catch (error) {
      console.error(
        "Failed to validate attachment upload:",
        error
      );

      return res.status(500).json({
        error:
          "INTERNAL_ERROR",
        message:
          "Unable to upload attachment.",
      });
    }
  },

  async (
    req: Request,
    res: Response
  ) => {
    let storedFilename:
      | string
      | undefined;

    try {
      const requesterId =
        await validateRequester(
          req.header(
            "X-Requester-Id"
          )
        );

      if (!requesterId) {
        return res.status(400).json({
          error:
            "INVALID_REQUESTER",
          message:
            "A valid, active Requester identity is required.",
        });
      }

      const ticketId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          ticketId
        ) ||
        ticketId < 1
      ) {
        return res.status(404).json({
          error:
            "TICKET_NOT_FOUND",
          message:
            "Ticket not found.",
        });
      }

      const ticket =
        await getPrisma().ticket.findFirst(
          {
            where: {
              id: ticketId,
              requesterId,
            },

            select: {
              id: true,
            },
          }
        );

      if (!ticket) {
        return res.status(404).json({
          error:
            "TICKET_NOT_FOUND",
          message:
            "Ticket not found.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error:
            "VALIDATION_ERROR",
          message:
            "A file is required.",
        });
      }

      storedFilename =
        req.file.filename;

      // Re-check active attachment count
      // immediately before database insertion.
      const activeAttachmentCount =
        await getPrisma().attachment.count(
          {
            where: {
              ticketId,
              isRemoved: false,
            },
          }
        );

      if (
        activeAttachmentCount >=
        MAX_ACTIVE_ATTACHMENTS
      ) {
        await removeUploadedFile(
          storedFilename
        );

        return res.status(409).json({
          error:
            "ATTACHMENT_LIMIT_REACHED",
          message:
            "This ticket already has the maximum of 5 active attachments.",
        });
      }

      const attachment =
        await getPrisma().attachment.create(
          {
            data: {
              ticketId,

              originalFilename:
                req.file.originalname,

              storedFilename:
                req.file.filename,

              mimeType:
                req.file.mimetype,

              sizeBytes:
                req.file.size,
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
          }
        );

      return res.status(201).json(
        attachment
      );
    } catch (error) {
      if (storedFilename) {
        await removeUploadedFile(
          storedFilename
        );
      }

      console.error(
        "Failed to upload attachment:",
        error
      );

      return res.status(500).json({
        error:
          "INTERNAL_ERROR",
        message:
          "Unable to upload attachment.",
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
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const requesterId =
        await validateRequester(
          req.header(
            "X-Requester-Id"
          )
        );

      if (!requesterId) {
        return res.status(400).json({
          error:
            "INVALID_REQUESTER",
          message:
            "A valid, active Requester identity is required.",
        });
      }

      const ticketId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          ticketId
        ) ||
        ticketId < 1
      ) {
        return res.status(404).json({
          error:
            "TICKET_NOT_FOUND",
          message:
            "Ticket not found.",
        });
      }

      const ticket =
        await getPrisma().ticket.findFirst(
          {
            where: {
              id: ticketId,
              requesterId,
            },

            select: {
              id: true,
            },
          }
        );

      if (!ticket) {
        return res.status(404).json({
          error:
            "TICKET_NOT_FOUND",
          message:
            "Ticket not found.",
        });
      }

      const attachments =
        await getPrisma().attachment.findMany(
          {
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
          }
        );

      return res.status(200).json(
        attachments
      );
    } catch (error) {
      console.error(
        "Failed to retrieve attachments:",
        error
      );

      return res.status(500).json({
        error:
          "INTERNAL_ERROR",
        message:
          "Unable to retrieve attachments.",
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
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const requesterId =
        await validateRequester(
          req.header(
            "X-Requester-Id"
          )
        );

      if (!requesterId) {
        return res.status(400).json({
          error:
            "INVALID_REQUESTER",
          message:
            "A valid, active Requester identity is required.",
        });
      }

      const attachmentId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          attachmentId
        ) ||
        attachmentId < 1
      ) {
        return res.status(404).json({
          error:
            "ATTACHMENT_NOT_FOUND",
          message:
            "Attachment not found.",
        });
      }

      const attachment =
        await getPrisma().attachment.findFirst(
          {
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
          }
        );

      if (!attachment) {
        return res.status(404).json({
          error:
            "ATTACHMENT_NOT_FOUND",
          message:
            "Attachment not found.",
        });
      }

      if (attachment.isRemoved) {
        return res.status(410).json({
          error:
            "ATTACHMENT_REMOVED",
          message:
            "This attachment has been removed and is no longer available.",
        });
      }

      const filePath =
        path.join(
          UPLOAD_DIR,
          attachment.storedFilename
        );

      res.setHeader(
        "Content-Type",
        attachment.mimeType
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(
          attachment.originalFilename
        )}"`
      );

      return res.sendFile(
        filePath,
        (error) => {
          if (
            error &&
            !res.headersSent
          ) {
            console.error(
              "Failed to download attachment:",
              error
            );

            res.status(500).json({
              error:
                "INTERNAL_ERROR",
              message:
                "Unable to download attachment.",
            });
          }
        }
      );
    } catch (error) {
      console.error(
        "Failed to retrieve attachment:",
        error
      );

      return res.status(500).json({
        error:
          "INTERNAL_ERROR",
        message:
          "Unable to download attachment.",
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
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const requesterId =
        await validateRequester(
          req.header(
            "X-Requester-Id"
          )
        );

      if (!requesterId) {
        return res.status(400).json({
          error:
            "INVALID_REQUESTER",
          message:
            "A valid, active Requester identity is required.",
        });
      }

      const attachmentId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          attachmentId
        ) ||
        attachmentId < 1
      ) {
        return res.status(404).json({
          error:
            "ATTACHMENT_NOT_FOUND",
          message:
            "Attachment not found.",
        });
      }

      const reason =
        typeof req.body?.reason ===
        "string"
          ? req.body.reason.trim()
          : "";

      if (reason.length < 5) {
        return res.status(400).json({
          error:
            "VALIDATION_ERROR",
          message:
            "A removal reason of at least 5 characters is required.",
        });
      }

      const attachment =
        await getPrisma().attachment.findFirst(
          {
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
          }
        );

      if (!attachment) {
        return res.status(404).json({
          error:
            "ATTACHMENT_NOT_FOUND",
          message:
            "Attachment not found.",
        });
      }

      if (attachment.isRemoved) {
        return res.status(409).json({
          error:
            "ATTACHMENT_ALREADY_REMOVED",
          message:
            "This attachment has already been removed.",
        });
      }

      const removedAt =
        new Date();

      const updatedAttachment =
        await getPrisma().attachment.update(
          {
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
              ticketId: true,
              originalFilename: true,
              mimeType: true,
              sizeBytes: true,
              uploadedAt: true,
              isRemoved: true,
              removedAt: true,
              removalReason: true,
            },
          }
        );

      return res
        .status(200)
        .json(
          updatedAttachment
        );
    } catch (error) {
      console.error(
        "Failed to remove attachment:",
        error
      );

      return res.status(500).json({
        error:
          "INTERNAL_ERROR",
        message:
          "Unable to remove attachment.",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// Multer / application error handler
// ---------------------------------------------------------------------------

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: express.NextFunction
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          error:
            "FILE_TOO_LARGE",
          message:
            "File exceeds the 5 MB size limit.",
        });
      }

      return res.status(400).json({
        error:
          "VALIDATION_ERROR",
        message:
          "Unable to process uploaded file.",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "UNSUPPORTED_FILE_TYPE"
    ) {
      return res.status(400).json({
        error:
          "UNSUPPORTED_FILE_TYPE",
        message:
          "Allowed file types are JPG, PNG, WEBP, and PDF.",
      });
    }

    console.error(
      "Unhandled application error:",
      error
    );

    return res.status(500).json({
      error:
        "INTERNAL_ERROR",
      message:
        "Internal server error.",
    });
  }
);

// ---------------------------------------------------------------------------
// Export Express app for Supertest
// ---------------------------------------------------------------------------

export default app;
