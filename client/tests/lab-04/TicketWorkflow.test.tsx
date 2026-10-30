import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TicketWorkflow from "../../src/components/TicketWorkflow.js";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function getOptionValues() {
  const select = screen.getByLabelText(
    "Change Status To",
  ) as HTMLSelectElement;

  return Array.from(select.options)
    .map((option) => option.value)
    .filter((value) => value !== "");
}

describe("Lab 4 - Ticket Workflow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows only the permitted next statuses for an Open Ticket", () => {
    render(
      <TicketWorkflow
        ticketId={1}
        currentStatus="OPEN"
        onStatusChanged={vi.fn()}
        onRefreshRequested={vi.fn()}
      />,
    );

    expect(getOptionValues()).toEqual([
      "IN_PROGRESS",
      "WAITING_FOR_REQUESTER",
      "CANCELLED",
    ]);
  });

  it("shows only Closed and Reopened for a Resolved Ticket", () => {
    render(
      <TicketWorkflow
        ticketId={1}
        currentStatus="RESOLVED"
        onStatusChanged={vi.fn()}
        onRefreshRequested={vi.fn()}
      />,
    );

    expect(getOptionValues()).toEqual(["CLOSED", "REOPENED"]);
  });

  it("shows no status control for a Cancelled Ticket", () => {
    render(
      <TicketWorkflow
        ticketId={1}
        currentStatus="CANCELLED"
        onStatusChanged={vi.fn()}
        onRefreshRequested={vi.fn()}
      />,
    );

    expect(
      screen.queryByLabelText("Change Status To"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "No further status changes are available for this Ticket.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the submit button disabled until a status is selected", () => {
    render(
      <TicketWorkflow
        ticketId={1}
        currentStatus="IN_PROGRESS"
        onStatusChanged={vi.fn()}
        onRefreshRequested={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Update Status" }),
    ).toBeDisabled();
  });

  it("sends the status change and reports the updated status", async () => {
    const result = {
      id: 1,
      ticketNumber: "TKT-2026-000001",
      currentStatus: "IN_PROGRESS",
      updatedAt: "2026-10-30T10:00:00.000Z",
    };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(result));
    const onStatusChanged = vi.fn();

    render(
      <TicketWorkflow
        ticketId={1}
        currentStatus="OPEN"
        onStatusChanged={onStatusChanged}
        onRefreshRequested={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Change Status To"), {
      target: { value: "IN_PROGRESS" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Update Status" }),
    );

    await waitFor(() => {
      expect(onStatusChanged).toHaveBeenCalledWith(result);
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/tickets/1/status");
    expect(options).toMatchObject({
      method: "PATCH",
      credentials: "include",
    });
    expect(JSON.parse(String(options?.body))).toEqual({
      status: "IN_PROGRESS",
    });
    expect(
      await screen.findByText("Status changed to In Progress."),
    ).toBeInTheDocument();
  });

  it("prevents a duplicate request while saving", async () => {
    let resolveFetch: (value: Response) => void = () => {};
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          }),
      );

    render(
      <TicketWorkflow
        ticketId={1}
        currentStatus="OPEN"
        onStatusChanged={vi.fn()}
        onRefreshRequested={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Change Status To"), {
      target: { value: "CANCELLED" },
    });

    const button = screen.getByRole("button", {
      name: "Update Status",
    });
    fireEvent.click(button);

    expect(
      await screen.findByRole("button", { name: "Saving..." }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Saving..." }));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch(
      jsonResponse({
        id: 1,
        ticketNumber: "TKT-2026-000001",
        currentStatus: "CANCELLED",
        updatedAt: "2026-10-30T10:00:00.000Z",
      }),
    );

    await screen.findByText("Status changed to Cancelled.");
  });

  it("shows the resolution gate message and does not report a change", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(
        {
          error: "RESOLUTION_NOT_ALLOWED",
          message:
            "The Ticket does not satisfy the required resolution conditions.",
        },
        409,
      ),
    );
    const onStatusChanged = vi.fn();

    render(
      <TicketWorkflow
        ticketId={1}
        currentStatus="IN_PROGRESS"
        onStatusChanged={onStatusChanged}
        onRefreshRequested={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Change Status To"), {
      target: { value: "RESOLVED" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Update Status" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This Ticket cannot be resolved yet.",
    );
    expect(onStatusChanged).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: "Refresh Ticket" }),
    ).not.toBeInTheDocument();
    expect(
      (screen.getByLabelText("Change Status To") as HTMLSelectElement)
        .value,
    ).toBe("RESOLVED");
  });

  it("offers a refresh when the Ticket was changed by someone else", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(
        {
          error: "STALE_UPDATE",
          message:
            "The Ticket status changed after it was loaded. Refresh and try again.",
        },
        409,
      ),
    );
    const onRefreshRequested = vi.fn();

    render(
      <TicketWorkflow
        ticketId={1}
        currentStatus="IN_PROGRESS"
        onStatusChanged={vi.fn()}
        onRefreshRequested={onRefreshRequested}
      />,
    );

    fireEvent.change(screen.getByLabelText("Change Status To"), {
      target: { value: "WAITING_FOR_REQUESTER" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Update Status" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "changed by someone else",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Refresh Ticket" }),
    );
    expect(onRefreshRequested).toHaveBeenCalledTimes(1);
  });

  it("shows a forbidden message when the backend rejects the role", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({ message: "Forbidden" }, 403),
    );

    render(
      <TicketWorkflow
        ticketId={1}
        currentStatus="OPEN"
        onStatusChanged={vi.fn()}
        onRefreshRequested={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Change Status To"), {
      target: { value: "IN_PROGRESS" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Update Status" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You do not have permission to change this Ticket's status.",
    );
  });

  it("shows a safe message when the server cannot be reached", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new TypeError("Failed to fetch"),
    );

    render(
      <TicketWorkflow
        ticketId={1}
        currentStatus="OPEN"
        onStatusChanged={vi.fn()}
        onRefreshRequested={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Change Status To"), {
      target: { value: "IN_PROGRESS" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Update Status" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to reach the server.",
    );
  });
});
