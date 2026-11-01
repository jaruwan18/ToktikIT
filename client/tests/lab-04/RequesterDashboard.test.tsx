import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RequesterDashboard from "../../src/components/RequesterDashboard.js";
import { getTickets } from "../../src/api.js";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const drillDown = {
  totalOpen: { statusGroup: "active" },
  waitingForRequester: { currentStatus: "WAITING_FOR_REQUESTER" },
  recentlyUpdated: { updatedWithinDays: 7 },
  recentlyResolved: { statusGroup: "resolved", updatedWithinDays: 7 },
};

const recentWindow = {
  days: 7,
  from: "2026-10-24T00:00:00.000Z",
  to: "2026-10-31T00:00:00.000Z",
};

const dashboard = {
  metrics: {
    totalOpen: 3,
    waitingForRequester: 1,
    recentlyUpdated: 4,
    recentlyResolved: 2,
  },
  recentTickets: [
    {
      id: 11,
      ticketNumber: "TKT-2026-000011",
      summary: "Printer is offline",
      currentStatus: "WAITING_FOR_REQUESTER",
      itPriority: "MEDIUM",
      updatedAt: "2026-10-30T03:00:00.000Z",
    },
  ],
  recentWindow,
  drillDown,
};

const emptyDashboard = {
  metrics: {
    totalOpen: 0,
    waitingForRequester: 0,
    recentlyUpdated: 0,
    recentlyResolved: 0,
  },
  recentTickets: [],
  recentWindow,
  drillDown,
};

function renderDashboard() {
  const onOpenTicket = vi.fn();
  const onDrillDown = vi.fn();

  render(
    <RequesterDashboard
      onOpenTicket={onOpenTicket}
      onDrillDown={onDrillDown}
    />,
  );

  return { onOpenTicket, onDrillDown };
}

describe("Lab 4 - Requester Dashboard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a loading state without misleading zero values", async () => {
    let resolveFetch: (response: Response) => void = () => {};
    vi.spyOn(globalThis, "fetch").mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    renderDashboard();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading dashboard...",
    );
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Total Open Tickets"),
    ).not.toBeInTheDocument();

    resolveFetch(jsonResponse(dashboard));

    expect(await screen.findByText("Total Open Tickets")).toBeInTheDocument();
  });

  it("calls the session-based endpoint without any requester id", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(dashboard));

    renderDashboard();

    await screen.findByText("Total Open Tickets");

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toMatch(/\/api\/dashboard\/requester$/);
    expect(url).not.toContain("requesterId");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows the four metrics returned by the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(dashboard));

    renderDashboard();

    expect(
      await screen.findByRole("button", {
        name: "Total Open Tickets: 3. View tickets",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Waiting for Requester: 1. View tickets",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Recently Updated: 4. View tickets",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Recently Resolved: 2. View tickets",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Updated in the last 7 days")).toBeInTheDocument();
  });

  it("drills down with the filter supplied by the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(dashboard));

    const { onDrillDown } = renderDashboard();

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Waiting for Requester: 1. View tickets",
      }),
    );
    expect(onDrillDown).toHaveBeenCalledWith(
      { currentStatus: "WAITING_FOR_REQUESTER" },
      "Waiting for Requester",
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Recently Resolved: 2. View tickets",
      }),
    );
    expect(onDrillDown).toHaveBeenLastCalledWith(
      { statusGroup: "resolved", updatedWithinDays: 7 },
      "Recently Resolved",
    );
  });

  it("opens Ticket Detail from a recent Ticket", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(dashboard));

    const { onOpenTicket } = renderDashboard();

    fireEvent.click(
      await screen.findByRole("button", { name: /TKT-2026-000011/ }),
    );

    expect(onOpenTicket).toHaveBeenCalledWith(11);
    expect(screen.getByText("Waiting for Requester", {
      selector: ".status-badge",
    })).toBeInTheDocument();
  });

  it("shows zero values and a helpful message when there are no Tickets", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(emptyDashboard),
    );

    renderDashboard();

    expect(
      await screen.findByText("You have no Tickets requiring attention."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Total Open Tickets: 0. View tickets",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("You have no Tickets yet.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a forbidden message without dashboard data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ error: "FORBIDDEN" }, 403),
    );

    renderDashboard();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You do not have permission to view this dashboard.",
    );
    expect(screen.queryByText("Total Open Tickets")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Retry" }),
    ).not.toBeInTheDocument();
  });

  it("shows a safe error and retries after an API failure", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse(
          { error: "INTERNAL_ERROR", message: "PrismaClient stack trace" },
          500,
        ),
      )
      .mockResolvedValueOnce(jsonResponse(dashboard));

    renderDashboard();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Unable to load dashboard data. Please try again.",
    );
    expect(alert).not.toHaveTextContent("Prisma");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("button", {
        name: "Total Open Tickets: 3. View tickets",
      }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("sends drill-down filters to the My Tickets API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        data: [],
        pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
      }),
    );

    await getTickets({
      requesterId: 5,
      statusGroup: "resolved",
      updatedWithinDays: 7,
    });

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get("statusGroup")).toBe("resolved");
    expect(url.searchParams.get("updatedWithinDays")).toBe("7");
  });

  it("does not render the dashboard data while waiting for Retry", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));

    renderDashboard();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Check your connection",
      ),
    );
    expect(screen.queryByText("Recently Updated Tickets")).not.toBeInTheDocument();
  });
});
