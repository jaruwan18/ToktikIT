import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";
import { generateTicketNumber } from "./utils/ticketNumber.js";

// The Express app is exported separately from app.listen() (see index.ts) so
// Supertest can import `app` without opening a port. Do not merge these files.
export const app = express();

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Issue 2 — API health check
// ---------------------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

// ---------------------------------------------------------------------------
// Issue 4 — Category list
// ---------------------------------------------------------------------------
app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await getPrisma().category.findMany({
      select: { id: true, name: true },
      orderBy: { id: "asc" },
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
    // ---------------------------------------------------------------
    const ticketCount = await getPrisma().ticket.count();

    const ticketNumber = generateTicketNumber(ticketCount + 1);

    // ---------------------------------------------------------------
    // Create ticket
    // ---------------------------------------------------------------
    const ticket = await getPrisma().ticket.create({
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

    // ---------------------------------------------------------------
    // Success response
    // ---------------------------------------------------------------
    return res.status(201).json(ticket);
  } catch (error) {
    console.error("Failed to create ticket:", error);

    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Unable to create ticket.",
    });
  }
});

export default app;
