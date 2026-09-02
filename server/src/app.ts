import express from "express";
import cors from "cors";

import { Prisma } from "@prisma/client";
import { getPrisma } from "./prisma.js";
import { generateTicketNumber } from "./utils/ticketNumber.js";

export const app = express();

app.use(cors());
app.use(express.json());

/**
 * GET /api/health
 */
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "TokTickIT API",
  });
});

/**
 * GET /api/categories
 */
app.get("/api/categories", async (_req, res) => {
  try {
    const prisma = getPrisma();

    const categories = await prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error("GET /api/categories failed:", error);

    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Unable to retrieve categories.",
    });
  }
});

/**
 * GET /api/related-systems
 */
app.get("/api/related-systems", async (_req, res) => {
  try {
    const prisma = getPrisma();

    const relatedSystems = await prisma.relatedSystem.findMany({
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

    return res.status(200).json(relatedSystems);
  } catch (error) {
    console.error("GET /api/related-systems failed:", error);

    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Unable to retrieve related systems.",
    });
  }
});

/**
 * GET /api/requesters
 */
app.get("/api/requesters", async (_req, res) => {
  try {
    const prisma = getPrisma();

    const requesters = await prisma.requester.findMany({
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
    console.error("GET /api/requesters failed:", error);

    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Unable to retrieve requesters.",
    });
  }
});

/**
 * POST /api/tickets
 */
app.post("/api/tickets", async (req, res) => {
  try {
    const {
      categoryId,
      relatedSystemId,
      summary,
      description,
      requestedPriority,
    } = req.body;

    /**
     * Requester ID comes from X-Requester-Id header
     */
    const requesterId = Number(req.header("X-Requester-Id"));

    const prisma = getPrisma();

    /**
     * Validate requester
     */
    if (!Number.isInteger(requesterId) || requesterId <= 0) {
      return res.status(400).json({
        error: "INVALID_REQUESTER",
      });
    }

    const requester = await prisma.requester.findFirst({
      where: {
        id: requesterId,
        isActive: true,
      },
    });

    if (!requester) {
      return res.status(400).json({
        error: "INVALID_REQUESTER",
      });
    }

    /**
     * Validate summary
     */
    if (
      typeof summary !== "string" ||
      summary.trim().length < 5 ||
      summary.trim().length > 150
    ) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        fields: {
          summary:
            "Summary is required and must be between 5 and 150 characters.",
        },
      });
    }

    /**
     * Validate description
     */
    if (
      typeof description !== "string" ||
      description.trim().length < 10 ||
      description.trim().length > 2000
    ) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        fields: {
          description:
            "Description is required and must be between 10 and 2000 characters.",
        },
      });
    }

    /**
     * Validate category
     */
    if (!Number.isInteger(categoryId)) {
      return res.status(400).json({
        error: "INVALID_REFERENCE",
      });
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return res.status(400).json({
        error: "INVALID_REFERENCE",
      });
    }

    /**
     * Validate related system
     */
    if (!Number.isInteger(relatedSystemId)) {
      return res.status(400).json({
        error: "INVALID_REFERENCE",
      });
    }

    const relatedSystem = await prisma.relatedSystem.findFirst({
      where: {
        id: relatedSystemId,
        isActive: true,
      },
    });

    if (!relatedSystem) {
      return res.status(400).json({
        error: "INVALID_REFERENCE",
      });
    }

    /**
     * Validate priority
     */
    if (
      requestedPriority !== "LOW" &&
      requestedPriority !== "MEDIUM" &&
      requestedPriority !== "HIGH"
    ) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        fields: {
          requestedPriority:
            "Priority must be LOW, MEDIUM, or HIGH.",
        },
      });
    }

    /**
     * Generate ticket number
     *
     * BR-01:
     * - Format: TKT-YYYY-NNNNNN
     * - Sequential per year
     * - Retry up to 3 times on unique ticket number collision
     */
    const MAX_RETRIES = 3;
    const now = new Date();

    const startOfYear = new Date(
      now.getFullYear(),
      0,
      1,
    );

    const startOfNextYear = new Date(
      now.getFullYear() + 1,
      0,
      1,
    );

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
          now,
        );

        /**
         * Create ticket
         */
        const ticket = await prisma.ticket.create({
          data: {
            ticketNumber,
            requesterId,
            categoryId,
            relatedSystemId,
            summary: summary.trim(),
            description: description.trim(),
            requestedPriority,
            currentStatus: "NEW",
          },
        });

        return res.status(201).json(ticket);
      } catch (error) {
        /**
         * Retry when the generated ticket number
         * conflicts with the UNIQUE constraint.
         */
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          if (attempt < MAX_RETRIES - 1) {
            continue;
          }

          return res.status(409).json({
            error: "TICKET_NUMBER_CONFLICT",
          });
        }

        throw error;
      }
    }

    return res.status(409).json({
      error: "TICKET_NUMBER_CONFLICT",
    });
  } catch (error) {
    console.error("POST /api/tickets failed:", error);

    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Unable to create ticket.",
    });
  }
});

/**
 * GET /api/tickets
 *
 * My Tickets
 *
 * Supports:
 * - requester ownership
 * - search by ticket number or summary
 * - category filter
 * - related system filter
 * - priority filter
 * - status filter
 * - sorting
 * - pagination
 */
app.get("/api/tickets", async (req, res) => {
  try {
    /**
     * Validate requesterId
     */
    if (!req.query.requesterId) {
      return res.status(400).json({
        error: {
          code: "INVALID_REQUESTER",
          message: "requesterId is required.",
        },
      });
    }

    const requesterId = Number(req.query.requesterId);

    if (!Number.isInteger(requesterId) || requesterId <= 0) {
      return res.status(400).json({
        error: {
          code: "INVALID_REQUESTER",
          message: "requesterId must be a valid integer.",
        },
      });
    }

    const prisma = getPrisma();

    /**
     * Check requester exists and is active
     */
    const requester = await prisma.requester.findFirst({
      where: {
        id: requesterId,
        isActive: true,
      },
    });

    if (!requester) {
      return res.status(404).json({
        error: {
          code: "REQUESTER_NOT_FOUND",
          message: "Requester not found.",
        },
      });
    }

    /**
     * Pagination
     *
     * Default:
     * page = 1
     * pageSize = 10
     *
     * Maximum:
     * pageSize = 50
     */
    const pageValue = Number(req.query.page);
    const pageSizeValue = Number(req.query.pageSize);

    const page =
      req.query.page === undefined
        ? 1
        : Number.isInteger(pageValue) && pageValue > 0
          ? pageValue
          : 1;

    const pageSize =
      req.query.pageSize === undefined
        ? 10
        : Number.isInteger(pageSizeValue) && pageSizeValue > 0
          ? Math.min(pageSizeValue, 50)
          : 10;

    const skip = (page - 1) * pageSize;

    /**
     * Build query filters
     */
    const where: any = {
      requesterId,
    };

    /**
     * Search by ticket number or summary
     */
    const search =
      typeof req.query.search === "string"
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

    /**
     * Category filter
     */
    if (req.query.categoryId !== undefined) {
      const categoryId = Number(req.query.categoryId);

      if (Number.isInteger(categoryId) && categoryId > 0) {
        where.categoryId = categoryId;
      }
    }

    /**
     * Related system filter
     */
    if (req.query.relatedSystemId !== undefined) {
      const relatedSystemId = Number(
        req.query.relatedSystemId,
      );

      if (
        Number.isInteger(relatedSystemId) &&
        relatedSystemId > 0
      ) {
        where.relatedSystemId = relatedSystemId;
      }
    }

    /**
     * Priority filter
     */
    if (req.query.requestedPriority !== undefined) {
      const priority = String(req.query.requestedPriority);

      if (
        priority === "LOW" ||
        priority === "MEDIUM" ||
        priority === "HIGH"
      ) {
        where.requestedPriority = priority;
      }
    }

    /**
     * Status filter
     */
    if (req.query.currentStatus !== undefined) {
      const status = String(req.query.currentStatus);

      if (status === "NEW") {
        where.currentStatus = status;
      }
    }

    /**
     * Sorting
     *
     * Default:
     * createdAt descending
     */
    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "ticketNumber",
      "summary",
    ];

    const requestedSortBy =
      typeof req.query.sortBy === "string"
        ? req.query.sortBy
        : "createdAt";

    const sortBy = allowedSortFields.includes(requestedSortBy)
      ? requestedSortBy
      : "createdAt";

    const requestedSortOrder =
      typeof req.query.sortOrder === "string"
        ? req.query.sortOrder.toLowerCase()
        : "desc";

    const sortOrder =
      requestedSortOrder === "asc" ? "asc" : "desc";

    /**
     * Count matching tickets
     */
    const total = await prisma.ticket.count({
      where,
    });

    /**
     * Retrieve paginated tickets
     */
    const tickets = await prisma.ticket.findMany({
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

    /**
     * Calculate total pages
     */
    const totalPages =
      total === 0 ? 0 : Math.ceil(total / pageSize);

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
    console.error("GET /api/tickets failed:", error);

    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Unable to retrieve tickets.",
      },
    });
  }
});
