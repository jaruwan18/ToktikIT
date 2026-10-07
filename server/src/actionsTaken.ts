import { Router, Request, Response } from "express";
import { Prisma, Role } from "@prisma/client";
import { getPrisma } from "./prisma.js";
import { requireAuth, requireRole } from "./authorization.js";

export const actionsTakenRouter = Router();

const actionSelect = {
  id: true,
  ticketId: true,
  actionDateTime: true,
  actionDescription: true,
  result: true,
  performedById: true,
  followUpRequired: true,
  followUpNote: true,
  attachmentNotes: true,
  createdAt: true,
  updatedAt: true,

  performedBy: {
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.ActionTakenSelect;

function parsePositiveId(value: string): number | null {
  const id = Number(value);

  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  return id;
}

function parseDateTime(value: unknown): Date | null {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function parseActionInput(
  body: any,
  requireDateTime: boolean,
) {
  const fields: Record<string, string> = {};

  let actionDateTime: Date | undefined;

  if (
    requireDateTime ||
    body.actionDateTime !== undefined
  ) {
    const parsedDate = parseDateTime(
      body.actionDateTime,
    );

    if (!parsedDate) {
      fields.actionDateTime =
        "Action Date/Time must be a valid ISO date-time.";
    } else {
      actionDateTime = parsedDate;
    }
  }

  const actionDescription =
    typeof body.actionDescription === "string"
      ? body.actionDescription.trim()
      : "";

  if (actionDescription.length === 0) {
    fields.actionDescription =
      "Action Description is required.";
  } else if (actionDescription.length > 5000) {
    fields.actionDescription =
      "Action Description must not exceed 5000 characters.";
  }

  const result =
    typeof body.result === "string"
      ? body.result.trim()
      : "";

  if (result.length === 0) {
    fields.result =
      "Result is required.";
  } else if (result.length > 5000) {
    fields.result =
      "Result must not exceed 5000 characters.";
  }

  const followUpRequired =
    typeof body.followUpRequired === "boolean"
      ? body.followUpRequired
      : body.followUpRequired === undefined
        ? false
        : null;

  if (followUpRequired === null) {
    fields.followUpRequired =
      "Follow-Up Required must be true or false.";
  }

  const followUpNote =
    body.followUpNote === null ||
    body.followUpNote === undefined
      ? null
      : typeof body.followUpNote === "string"
        ? body.followUpNote.trim()
        : null;

  if (
    followUpRequired === true &&
    (!followUpNote ||
      followUpNote.length === 0)
  ) {
    fields.followUpNote =
      "Follow-up Note is required when Follow-Up Required is true.";
  } else if (
    followUpNote &&
    followUpNote.length > 2000
  ) {
    fields.followUpNote =
      "Follow-up Note must not exceed 2000 characters.";
  }

  const attachmentNotes =
    body.attachmentNotes === null ||
    body.attachmentNotes === undefined
      ? null
      : typeof body.attachmentNotes === "string"
        ? body.attachmentNotes.trim()
        : null;

  if (
    attachmentNotes &&
    attachmentNotes.length > 2000
  ) {
    fields.attachmentNotes =
      "Attachment Notes must not exceed 2000 characters.";
  }

  return {
    fields,
    actionDateTime,
    actionDescription,
    result,
    followUpRequired:
      followUpRequired === true,
    followUpNote,
    attachmentNotes,
  };
}

async function getActiveUser(req: Request) {
  if (!req.session.userId) {
    return null;
  }

  return getPrisma().user.findUnique({
    where: {
      id: req.session.userId,
    },
    select: {
      id: true,
      role: true,
      isActive: true,
      requester: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  });
}

async function getTicket(ticketId: number) {
  return getPrisma().ticket.findUnique({
    where: {
      id: ticketId,
    },
    select: {
      id: true,
      requesterId: true,
      requester: {
        select: {
          userId: true,
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// GET /api/tickets/:ticketId/actions
// ---------------------------------------------------------------------------

actionsTakenRouter.get(
  "/:ticketId/actions",
  requireAuth,
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const ticketId =
        parsePositiveId(
          req.params.ticketId,
        );

      if (!ticketId) {
        return res.status(404).json({
          error: "TICKET_NOT_FOUND",
          message: "Ticket not found.",
        });
      }

      const user =
        await getActiveUser(req);

      if (!user || !user.isActive) {
        req.session.destroy(
          () => undefined,
        );

        return res.status(401).json({
          error: "UNAUTHENTICATED",
          message: "You must be logged in.",
        });
      }

      const ticket =
        await getTicket(ticketId);

      if (!ticket) {
        return res.status(404).json({
          error: "TICKET_NOT_FOUND",
          message: "Ticket not found.",
        });
      }

      // Requester can only view Actions Taken
      // for their own Ticket.
      if (
        user.role === Role.REQUESTER &&
        ticket.requester.userId !== user.id
      ) {
        return res.status(403).json({
          error: "FORBIDDEN",
          message:
            "You do not have permission to access these Actions Taken.",
        });
      }

      const actions =
        await getPrisma().actionTaken.findMany({
          where: {
            ticketId,
          },
          select: actionSelect,
          orderBy: [
            {
              actionDateTime: "asc",
            },
            {
              id: "asc",
            },
          ],
        });

      return res.status(200).json({
        data: actions,
      });
    } catch (error) {
      console.error(
        "GET Actions Taken failed:",
        error,
      );

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message:
          "Unable to retrieve Actions Taken.",
      });
    }
  },
);

// ---------------------------------------------------------------------------
// POST /api/tickets/:ticketId/actions
// ---------------------------------------------------------------------------

actionsTakenRouter.post(
  "/:ticketId/actions",
  requireRole(
    Role.IT_STAFF,
    Role.ADMIN,
  ),
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const ticketId =
        parsePositiveId(
          req.params.ticketId,
        );

      if (!ticketId) {
        return res.status(404).json({
          error: "TICKET_NOT_FOUND",
          message: "Ticket not found.",
        });
      }

      const ticket =
        await getTicket(ticketId);

      if (!ticket) {
        return res.status(404).json({
          error: "TICKET_NOT_FOUND",
          message: "Ticket not found.",
        });
      }

      const user =
        await getActiveUser(req);

      if (!user || !user.isActive) {
        return res.status(401).json({
          error: "UNAUTHENTICATED",
          message: "You must be logged in.",
        });
      }

      const rawIdempotencyKey =
        req.header("Idempotency-Key");

      const idempotencyKey =
        rawIdempotencyKey?.trim() || null;

      if (
        idempotencyKey &&
        idempotencyKey.length > 200
      ) {
        return res.status(400).json({
          error:
            "INVALID_IDEMPOTENCY_KEY",
          message:
            "Idempotency-Key must not exceed 200 characters.",
        });
      }

      const parsed =
        parseActionInput(
          req.body ?? {},
          true,
        );

      if (
        Object.keys(parsed.fields)
          .length > 0
      ) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message:
            "One or more fields are invalid.",
          fields: parsed.fields,
        });
      }

      // Retry protection.
      if (idempotencyKey) {
        const existing =
          await getPrisma().actionTaken.findUnique(
            {
              where: {
                idempotencyKey,
              },
              select: actionSelect,
            },
          );

        if (existing) {
          const sameRequest =
            existing.ticketId ===
              ticketId &&
            existing.performedById ===
              user.id &&
            existing.actionDateTime.getTime() ===
              parsed.actionDateTime!.getTime() &&
            existing.actionDescription ===
              parsed.actionDescription &&
            existing.result ===
              parsed.result &&
            existing.followUpRequired ===
              parsed.followUpRequired &&
            existing.followUpNote ===
              parsed.followUpNote &&
            existing.attachmentNotes ===
              parsed.attachmentNotes;

          if (!sameRequest) {
            return res.status(409).json({
              error:
                "IDEMPOTENCY_KEY_CONFLICT",
              message:
                "The Idempotency-Key has already been used for a different Action Taken.",
            });
          }

          return res.status(200).json(
            existing,
          );
        }
      }

      try {
        const action =
          await getPrisma().actionTaken.create(
            {
              data: {
                ticketId,
                actionDateTime:
                  parsed.actionDateTime!,
                actionDescription:
                  parsed.actionDescription,
                result: parsed.result,
                performedById:
                  user.id,
                followUpRequired:
                  parsed.followUpRequired,
                followUpNote:
                  parsed.followUpNote,
                attachmentNotes:
                  parsed.attachmentNotes,
                idempotencyKey,
              },
              select: actionSelect,
            },
          );

        return res.status(201).json(
          action,
        );
      } catch (error) {
        // Handles the race where two identical
        // requests arrive at the same time.
        if (
          idempotencyKey &&
          error instanceof
            Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          const existing =
            await getPrisma().actionTaken.findUnique(
              {
                where: {
                  idempotencyKey,
                },
                select: actionSelect,
              },
            );

          if (existing) {
            return res.status(200).json(
              existing,
            );
          }
        }

        throw error;
      }
    } catch (error) {
      console.error(
        "POST Actions Taken failed:",
        error,
      );

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message:
          "Unable to create Action Taken.",
      });
    }
  },
);

// ---------------------------------------------------------------------------
// PATCH /api/tickets/:ticketId/actions/:actionId
// ---------------------------------------------------------------------------

actionsTakenRouter.patch(
  "/:ticketId/actions/:actionId",
  requireRole(
    Role.IT_STAFF,
    Role.ADMIN,
  ),
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const ticketId =
        parsePositiveId(
          req.params.ticketId,
        );

      const actionId =
        parsePositiveId(
          req.params.actionId,
        );

      if (!ticketId || !actionId) {
        return res.status(404).json({
          error: "ACTION_NOT_FOUND",
          message:
            "Action Taken not found.",
        });
      }

      const ticket =
        await getTicket(ticketId);

      if (!ticket) {
        return res.status(404).json({
          error: "TICKET_NOT_FOUND",
          message: "Ticket not found.",
        });
      }

      const existing =
        await getPrisma().actionTaken.findFirst(
          {
            where: {
              id: actionId,
              ticketId,
            },
            select: {
              id: true,
              updatedAt: true,
            },
          },
        );

      if (!existing) {
        return res.status(404).json({
          error: "ACTION_NOT_FOUND",
          message:
            "Action Taken not found.",
        });
      }

      const clientUpdatedAt =
        parseDateTime(
          req.body?.updatedAt,
        );

      if (!clientUpdatedAt) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message:
            "updatedAt is required and must be a valid ISO date-time.",
          fields: {
            updatedAt:
              "A valid updatedAt value is required.",
          },
        });
      }

      if (
        clientUpdatedAt.getTime() !==
        existing.updatedAt.getTime()
      ) {
        return res.status(409).json({
          error: "STALE_UPDATE",
          message:
            "This Action Taken was changed after you last loaded it. Refresh before saving again.",
        });
      }

      const parsed =
        parseActionInput(
          req.body ?? {},
          false,
        );

      if (
        Object.keys(parsed.fields)
          .length > 0
      ) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message:
            "One or more fields are invalid.",
          fields: parsed.fields,
        });
      }

      const updateData: Prisma.ActionTakenUpdateManyMutationInput =
        {
          actionDescription:
            parsed.actionDescription,
          result: parsed.result,
          followUpRequired:
            parsed.followUpRequired,
          followUpNote:
            parsed.followUpNote,
          attachmentNotes:
            parsed.attachmentNotes,
        };

      if (parsed.actionDateTime) {
        updateData.actionDateTime =
          parsed.actionDateTime;
      }

      const updated =
        await getPrisma().actionTaken.updateMany(
          {
            where: {
              id: actionId,
              ticketId,
              updatedAt:
                existing.updatedAt,
            },
            data: updateData,
          },
        );

      if (updated.count !== 1) {
        return res.status(409).json({
          error: "STALE_UPDATE",
          message:
            "This Action Taken was changed after you last loaded it. Refresh before saving again.",
        });
      }

      const saved =
        await getPrisma().actionTaken.findUnique(
          {
            where: {
              id: actionId,
            },
            select: actionSelect,
          },
        );

      return res.status(200).json(
        saved,
      );
    } catch (error) {
      console.error(
        "PATCH Actions Taken failed:",
        error,
      );

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message:
          "Unable to update Action Taken.",
      });
    }
  },
);