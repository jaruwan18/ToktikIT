import { Router, Request, Response } from "express";
import { CurrentStatus, ItPriority, Prisma, Role } from "@prisma/client";
import { getPrisma } from "./prisma.js";
import { requireRole } from "./authorization.js";

export const dashboardRouter = Router();

// Lab 4 dashboard calculation rules (docs/lab-04/api-spec.md sections 9-13).

// Statuses where work is still expected from IT Staff or the Requester.
export const ACTIVE_STATUSES: CurrentStatus[] = [
  "NEW",
  "OPEN",
  "IN_PROGRESS",
  "WAITING_FOR_REQUESTER",
  "REOPENED",
];

const ALL_STATUSES: CurrentStatus[] = [
  "NEW",
  "OPEN",
  "IN_PROGRESS",
  "WAITING_FOR_REQUESTER",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
  "CANCELLED",
];

const ALL_IT_PRIORITIES: ItPriority[] = ["LOW", "MEDIUM", "HIGH"];

// Rolling recent window: from (now - 7 days) up to now.
export const RECENT_WINDOW_DAYS = 7;

const LIST_LIMIT = 5;

const ticketSummarySelect = {
  id: true,
  ticketNumber: true,
  summary: true,
  currentStatus: true,
  itPriority: true,
  updatedAt: true,
} satisfies Prisma.TicketSelect;

const DAY_MS = 24 * 60 * 60 * 1000;

function getRecentWindowStart(now: Date): Date {
  return new Date(now.getTime() - RECENT_WINDOW_DAYS * DAY_MS);
}

const RESOLVED_STATUSES: CurrentStatus[] = ["RESOLVED", "CLOSED"];

// Drill-down filters shared by the dashboard and the Ticket list endpoints
// (GET /api/tickets and GET /api/it/tickets), so that following a dashboard
// card returns exactly the Tickets the card counted.
//   statusGroup=active    -> ACTIVE_STATUSES
//   statusGroup=resolved  -> RESOLVED or CLOSED
//   updatedWithinDays=N   -> updatedAt within the last N days (1-365)
export function applyDrillDownFilters(
  where: Prisma.TicketWhereInput,
  query: Record<string, unknown>,
): void {
  const conditions: Prisma.TicketWhereInput[] = [];

  if (query.statusGroup === "active") {
    conditions.push({ currentStatus: { in: ACTIVE_STATUSES } });
  } else if (query.statusGroup === "resolved") {
    conditions.push({ currentStatus: { in: RESOLVED_STATUSES } });
  }

  const days = Number(query.updatedWithinDays);

  if (Number.isInteger(days) && days >= 1 && days <= 365) {
    conditions.push({
      updatedAt: { gte: new Date(Date.now() - days * DAY_MS) },
    });
  }

  if (conditions.length > 0) {
    const existing = where.AND
      ? Array.isArray(where.AND)
        ? where.AND
        : [where.AND]
      : [];

    where.AND = [...existing, ...conditions];
  }
}

function sendDashboardError(res: Response, error: unknown, route: string) {
  console.error(`${route} failed:`, error);

  return res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "Unable to load dashboard data.",
  });
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/requester
// Requester Dashboard. The requester is always derived from the session;
// any requesterId supplied by the client is ignored.
// ---------------------------------------------------------------------------

dashboardRouter.get(
  "/requester",
  requireRole(Role.REQUESTER),
  async (req: Request, res: Response) => {
    try {
      const prisma = getPrisma();
      const now = new Date();
      const windowStart = getRecentWindowStart(now);

      const requester = await prisma.requester.findUnique({
        where: {
          userId: req.session.userId,
        },
        select: {
          id: true,
        },
      });

      // A Requester user without a requester profile owns no Tickets.
      const requesterId = requester?.id ?? -1;
      const ownTickets = { requesterId };

      const [
        totalOpen,
        waitingForRequester,
        recentlyUpdated,
        recentlyResolved,
        recentTickets,
      ] = await Promise.all([
        prisma.ticket.count({
          where: {
            ...ownTickets,
            currentStatus: { in: ACTIVE_STATUSES },
          },
        }),
        prisma.ticket.count({
          where: {
            ...ownTickets,
            currentStatus: "WAITING_FOR_REQUESTER",
          },
        }),
        prisma.ticket.count({
          where: {
            ...ownTickets,
            updatedAt: { gte: windowStart, lte: now },
          },
        }),
        prisma.ticket.count({
          where: {
            ...ownTickets,
            currentStatus: { in: ["RESOLVED", "CLOSED"] },
            updatedAt: { gte: windowStart, lte: now },
          },
        }),
        prisma.ticket.findMany({
          where: ownTickets,
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          take: LIST_LIMIT,
          select: ticketSummarySelect,
        }),
      ]);

      return res.status(200).json({
        metrics: {
          totalOpen,
          waitingForRequester,
          recentlyUpdated,
          recentlyResolved,
        },
        recentTickets,
        recentWindow: {
          days: RECENT_WINDOW_DAYS,
          from: windowStart.toISOString(),
          to: now.toISOString(),
        },
        // Query parameters for GET /api/tickets that list exactly the
        // Tickets behind each metric.
        drillDown: {
          totalOpen: { statusGroup: "active" },
          waitingForRequester: { currentStatus: "WAITING_FOR_REQUESTER" },
          recentlyUpdated: { updatedWithinDays: RECENT_WINDOW_DAYS },
          recentlyResolved: {
            statusGroup: "resolved",
            updatedWithinDays: RECENT_WINDOW_DAYS,
          },
        },
      });
    } catch (error) {
      return sendDashboardError(
        res,
        error,
        "GET /api/dashboard/requester",
      );
    }
  },
);

// ---------------------------------------------------------------------------
// GET /api/dashboard/staff
// IT Staff Dashboard (also used by Administrators).
// ---------------------------------------------------------------------------

dashboardRouter.get(
  "/staff",
  requireRole(Role.IT_STAFF, Role.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const prisma = getPrisma();
      const now = new Date();
      const windowStart = getRecentWindowStart(now);
      const currentUserId = req.session.userId as number;
      const activeTickets = {
        currentStatus: { in: ACTIVE_STATUSES },
      };

      const [
        unassigned,
        currentUserOwned,
        statusGroups,
        priorityGroups,
        myActionsTaken,
        urgentTickets,
        recentTickets,
      ] = await Promise.all([
        prisma.ticket.count({
          where: { ...activeTickets, ownerId: null },
        }),
        prisma.ticket.count({
          where: { ...activeTickets, ownerId: currentUserId },
        }),
        prisma.ticket.groupBy({
          by: ["currentStatus"],
          _count: { _all: true },
        }),
        prisma.ticket.groupBy({
          by: ["itPriority"],
          where: activeTickets,
          _count: { _all: true },
        }),
        prisma.actionTaken.count({
          where: {
            performedById: currentUserId,
            actionDateTime: { gte: windowStart, lte: now },
          },
        }),
        prisma.ticket.findMany({
          where: { ...activeTickets, itPriority: "HIGH" },
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          take: LIST_LIMIT,
          select: ticketSummarySelect,
        }),
        prisma.ticket.findMany({
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          take: LIST_LIMIT,
          select: ticketSummarySelect,
        }),
      ]);

      // Zero-fill so every status and priority is always present.
      const byStatus = Object.fromEntries(
        ALL_STATUSES.map((status) => [
          status,
          statusGroups.find((group) => group.currentStatus === status)
            ?._count._all ?? 0,
        ]),
      );

      const byItPriority = Object.fromEntries(
        ALL_IT_PRIORITIES.map((priority) => [
          priority,
          priorityGroups.find((group) => group.itPriority === priority)
            ?._count._all ?? 0,
        ]),
      );

      return res.status(200).json({
        metrics: {
          unassigned,
          currentUserOwned,
          myActionsTaken,
          byStatus,
          byItPriority,
        },
        urgentTickets,
        recentTickets,
        recentWindow: {
          days: RECENT_WINDOW_DAYS,
          from: windowStart.toISOString(),
          to: now.toISOString(),
        },
        // Query parameters for GET /api/it/tickets that list exactly the
        // Tickets behind each metric. myActionsTaken counts actions, not
        // Tickets, so it has no Ticket list.
        drillDown: {
          unassigned: { owner: "unassigned", statusGroup: "active" },
          currentUserOwned: { owner: "me", statusGroup: "active" },
          byStatus: Object.fromEntries(
            ALL_STATUSES.map((status) => [
              status,
              { currentStatus: status },
            ]),
          ),
          byItPriority: Object.fromEntries(
            ALL_IT_PRIORITIES.map((priority) => [
              priority,
              { itPriority: priority, statusGroup: "active" },
            ]),
          ),
        },
      });
    } catch (error) {
      return sendDashboardError(
        res,
        error,
        "GET /api/dashboard/staff",
      );
    }
  },
);
