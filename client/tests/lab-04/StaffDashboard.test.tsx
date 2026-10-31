import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import StaffDashboard from "../../src/components/StaffDashboard.js";
import StaffTicketQueue from "../../src/components/StaffTicketQueue.js";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const statuses = [
  "NEW",
  "OPEN",
  "IN_PROGRESS",
  "WAITING_FOR_REQUESTER",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
  "CANCELLED",
] as const;

function buildDashboard(overrides: {
  unassigned?: number;
  currentUserOwned?: number;
  byItPriority?: { LOW: number; MEDIUM: number; HIGH: number };
  urgentTickets?: unknown[];
} = {}) {
  return {
    metrics: {
      unassigned: overrides.unassigned ?? 2,
      currentUserOwned: overrides.currentUserOwned ?? 3,
      myActionsTaken: 5,
      byStatus: {
        NEW: 2,
        OPEN: 1,
        IN_PROGRESS: 3,
        WAITING_FOR_REQUESTER: 4,
        RESOLVED: 1,
        CLOSED: 6,
        REOPENED: 0,
        CANCELLED: 1,
      },
      byItPriority: overrides.byItPriority ?? { LOW: 1, MEDIUM: 5, HIGH: 4 },
    },
    urgentTickets: overrides.urgentTickets ?? [
      {
        id: 21,
        ticketNumber: "TKT-2026-000021",
        summary: "Server room alarm",
        currentStatus: "IN_PROGRESS",
        itPriority: "HIGH",
        updatedAt: "2026-10-30T03:00:00.000Z",
      },
    ],
    recentTickets: [],
    recentWindow: {
      days: 7,
      from: "2026-10-24T00:00:00.000Z",
      to: "2026-10-31T00:00:00.000Z",
    },
    drillDown: {
      unassigned: { owner: "unassigned", statusGroup: "active" },
      currentUserOwned: { owner: "me", statusGroup: "active" },
      byStatus: Object.fromEntries(
        statuses.map((status) => [status, { currentStatus: status }]),
      ),
      byItPriority: {
        LOW: { itPriority: "LOW", statusGroup: "active" },
        MEDIUM: { itPriority: "MEDIUM", statusGroup: "active" },
        HIGH: { itPriority: "HIGH", statusGroup: "active" },
      },
    },
  };
}

function renderDashboard() {
  const onOpenTicket = vi.fn();
  const onDrillDown = vi.fn();

  render(
    <StaffDashboard onOpenTicket={onOpenTicket} onDrillDown={onDrillDown} />,
  );

  return { onOpenTicket, onDrillDown };
}

describe("Lab 4 - IT Staff Dashboard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a loading state without zero values", () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));

    renderDashboard();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading dashboard...",
    );
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Loading..." })).toBeDisabled();
  });

  it("shows operational metrics, every status and every IT Priority", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(buildDashboard()));

    renderDashboard();

    expect(
      await screen.findByRole("button", {
        name: "Unassigned Tickets: 2. View tickets",
      }),
    ).toBeInTheDocument();
    expect(String(fetchMock.mock.calls[0][0])).toMatch(
      /\/api\/dashboard\/staff$/,
    );
    expect(
      screen.getByRole("button", {
        name: "My Owned Tickets: 3. View tickets",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("My Actions Taken")).toBeInTheDocument();

    const statusSummary = screen.getByRole("region", {
      name: "Status Summary",
    });
    expect(within(statusSummary).getAllByRole("button")).toHaveLength(8);
    expect(
      within(statusSummary).getByRole("button", {
        name: "Waiting for Requester: 4. View tickets",
      }),
    ).toBeInTheDocument();

    const prioritySummary = screen.getByRole("region", {
      name: "IT Priority Summary (active Tickets)",
    });
    expect(within(prioritySummary).getAllByRole("button")).toHaveLength(3);
  });

  it("does not make My Actions Taken look clickable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(buildDashboard()),
    );

    renderDashboard();

    await screen.findByText("My Actions Taken");

    expect(
      screen.queryByRole("button", { name: /My Actions Taken/ }),
    ).not.toBeInTheDocument();
  });

  it("drills down with the filters supplied by the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(buildDashboard()),
    );

    const { onDrillDown } = renderDashboard();

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Unassigned Tickets: 2. View tickets",
      }),
    );
    expect(onDrillDown).toHaveBeenCalledWith(
      { owner: "unassigned", statusGroup: "active" },
      "Unassigned Tickets",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "High: 4. View tickets" }),
    );
    expect(onDrillDown).toHaveBeenLastCalledWith(
      { itPriority: "HIGH", statusGroup: "active" },
      "IT Priority: High",
    );
  });

  it("lists urgent Tickets that open Ticket Detail", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(buildDashboard()),
    );

    const { onOpenTicket } = renderDashboard();

    const urgent = await screen.findByRole("region", {
      name: "Urgent Tickets",
    });
    fireEvent.click(
      within(urgent).getByRole("button", { name: /TKT-2026-000021/ }),
    );

    expect(onOpenTicket).toHaveBeenCalledWith(21);
  });

  it("shows an empty-state message when nothing needs attention", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        buildDashboard({
          unassigned: 0,
          currentUserOwned: 0,
          byItPriority: { LOW: 0, MEDIUM: 0, HIGH: 0 },
          urgentTickets: [],
        }),
      ),
    );

    renderDashboard();

    expect(
      await screen.findByText("No Tickets currently require attention."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No active High priority Tickets."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a forbidden message for users without Staff access", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ error: "FORBIDDEN" }, 403),
    );

    renderDashboard();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You do not have permission to view this dashboard.",
    );
    expect(screen.queryByText("Status Summary")).not.toBeInTheDocument();
  });

  it("shows a safe error with Retry when the API fails", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ error: "INTERNAL_ERROR" }, 500))
      .mockResolvedValueOnce(jsonResponse(buildDashboard()));

    renderDashboard();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load dashboard data. Please try again.",
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("region", { name: "Status Summary" }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("Lab 4 - IT Ticket Queue drill-down", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function emptyQueue() {
    return jsonResponse({
      data: [],
      pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    });
  }

  it("requests the queue with the dashboard filter and explains it", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => emptyQueue());

    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
        drillDown={{
          filter: { owner: "unassigned", statusGroup: "active" },
          label: "Unassigned Tickets",
        }}
      />,
    );

    expect(
      await screen.findByText("From dashboard: Unassigned Tickets"),
    ).toBeInTheDocument();
    expect(screen.getByText("Unassigned · Active")).toBeInTheDocument();

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.pathname).toBe("/api/it/tickets");
    expect(url.searchParams.get("owner")).toBe("unassigned");
    expect(url.searchParams.get("statusGroup")).toBe("active");
  });

  it("pre-selects the status filter for a status card", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => emptyQueue());

    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
        drillDown={{
          filter: { currentStatus: "WAITING_FOR_REQUESTER" },
          label: "Status: Waiting for Requester",
        }}
      />,
    );

    await screen.findByText("From dashboard: Status: Waiting for Requester");

    expect(screen.getByLabelText("Status")).toHaveValue(
      "WAITING_FOR_REQUESTER",
    );
    expect(
      new URL(String(fetchMock.mock.calls[0][0])).searchParams.get(
        "currentStatus",
      ),
    ).toBe("WAITING_FOR_REQUESTER");
  });

  it("removes the dashboard filter when the user shows all Tickets", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => emptyQueue());

    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
        drillDown={{
          filter: { owner: "me", statusGroup: "active" },
          label: "My Owned Tickets",
        }}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Show all Tickets" }),
    );

    expect(
      screen.queryByText("From dashboard: My Owned Tickets"),
    ).not.toBeInTheDocument();

    const lastUrl = new URL(String(fetchMock.mock.lastCall?.[0]));
    expect(lastUrl.searchParams.get("owner")).toBeNull();
    expect(lastUrl.searchParams.get("statusGroup")).toBeNull();
  });
});
