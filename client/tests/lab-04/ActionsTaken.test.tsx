import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ActionsTaken from "../../src/components/ActionsTaken.js";

const mockActions = [
  {
    id: 1,
    ticketId: 100,
    actionDateTime: "2026-10-09T09:30:00.000Z",
    actionDescription: "Checked the reported issue.",
    result: "Issue reproduced successfully.",
    performedById: 10,
    followUpRequired: false,
    followUpNote: null,
    attachmentNotes: null,
    createdAt: "2026-10-09T09:35:00.000Z",
    updatedAt: "2026-10-09T09:35:00.000Z",
    performedBy: {
      id: 10,
      displayName: "John Staff",
      email: "john.staff@example.com",
      role: "IT_STAFF",
    },
  },
];

describe("Lab 4 - Actions Taken", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should load and display Actions Taken for a requester in read-only mode", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: mockActions,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    render(<ActionsTaken ticketId={100} canEdit={false} />);

    expect(screen.getByText("Actions Taken")).toBeInTheDocument();

    expect(
      await screen.findByText("Checked the reported issue."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Issue reproduced successfully."),
    ).toBeInTheDocument();

    expect(screen.getByText("John Staff")).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /add action/i })).not.toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://localhost:3000/api/tickets/100/actions",
    );
  });


  it("should show an empty state when there are no Actions Taken", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: [],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    render(<ActionsTaken ticketId={100} canEdit={false} />);

    expect(
      await screen.findByText(/no actions taken/i),
    ).toBeInTheDocument();
  });

  it("should allow IT Staff to open the create form", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: [],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    render(<ActionsTaken ticketId={100} canEdit={true} />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add action/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", { name: /add action/i }),
    );

    expect(
      screen.getByRole("heading", { name: /add action taken/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/action description/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/^result$/i)).toBeInTheDocument();

    expect(
      screen.getByLabelText(/follow-up required/i),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/performed by/i),
    ).toBeInTheDocument();
  });

  it("should require a Follow-up Note when Follow-Up Required is Yes", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: [],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    render(<ActionsTaken ticketId={100} canEdit={true} />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add action/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", { name: /add action/i }),
    );

    fireEvent.change(
      screen.getByLabelText(/action description/i),
      {
        target: {
          value: "Called requester to investigate the issue.",
        },
      },
    );

    fireEvent.change(screen.getByLabelText(/^result$/i), {
      target: {
        value: "Requester confirmed the issue.",
      },
    });

    fireEvent.click(
      screen.getByLabelText(/follow-up required/i),
    );

    fireEvent.click(
      screen.getByRole("button", { name: /save action/i }),
    );

    expect(
      await screen.findByText(/follow-up note is required/i),
    ).toBeInTheDocument();
  });

  it("should create an Action Taken with an Idempotency-Key", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [],
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 2,
            ticketId: 100,
            actionDateTime: "2026-10-09T10:00:00.000Z",
            actionDescription: "Contacted requester.",
            result: "Requester confirmed resolution.",
            performedById: 10,
            followUpRequired: false,
            followUpNote: null,
            attachmentNotes: null,
            createdAt: "2026-10-09T10:01:00.000Z",
            updatedAt: "2026-10-09T10:01:00.000Z",
            performedBy: {
              id: 10,
              displayName: "John Staff",
              email: "john.staff@example.com",
              role: "IT_STAFF",
            },
          }),
          {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                ...mockActions[0],
                id: 2,
                actionDescription: "Contacted requester.",
                result: "Requester confirmed resolution.",
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    render(<ActionsTaken ticketId={100} canEdit={true} />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add action/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", { name: /add action/i }),
    );

    fireEvent.change(
      screen.getByLabelText(/action description/i),
      {
        target: {
          value: "Contacted requester.",
        },
      },
    );

    fireEvent.change(screen.getByLabelText(/^result$/i), {
      target: {
        value: "Requester confirmed resolution.",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /save action/i }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    const createRequest = fetchMock.mock.calls[1];

    expect(createRequest[0]).toBe(
        "http://localhost:3000/api/tickets/100/actions",
    );

    const createOptions = createRequest[1] as RequestInit;

    expect(createOptions.method).toBe("POST");

    const headers = createOptions.headers as Record<string, string>;

    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["Idempotency-Key"]).toBeTruthy();

    const requestBody = JSON.parse(createOptions.body as string);

    expect(requestBody.actionDescription).toBe(
      "Contacted requester.",
    );

    expect(requestBody.result).toBe(
      "Requester confirmed resolution.",
    );

    expect(requestBody.followUpRequired).toBe(false);
  });

  it("should edit an existing Action Taken and send updatedAt", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: mockActions,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...mockActions[0],
            actionDescription: "Updated action description.",
            result: "Updated result.",
            updatedAt: "2026-10-09T11:00:00.000Z",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                ...mockActions[0],
                actionDescription: "Updated action description.",
                result: "Updated result.",
                updatedAt: "2026-10-09T11:00:00.000Z",
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    render(<ActionsTaken ticketId={100} canEdit={true} />);

    expect(
      await screen.findByText("Checked the reported issue."),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /edit/i }),
    );

    const descriptionInput =
      screen.getByLabelText(/action description/i);

    fireEvent.change(descriptionInput, {
      target: {
        value: "Updated action description.",
      },
    });

    fireEvent.change(screen.getByLabelText(/^result$/i), {
      target: {
        value: "Updated result.",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /save changes/i }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    const updateRequest = fetchMock.mock.calls[1];

    expect(updateRequest[0]).toBe(
      "http://localhost:3000/api/tickets/100/actions/1",
    );

    const updateOptions = updateRequest[1] as RequestInit;

    expect(updateOptions.method).toBe("PATCH");

    const requestBody = JSON.parse(
      updateOptions.body as string,
    );

    expect(requestBody.updatedAt).toBe(
      mockActions[0].updatedAt,
    );

    expect(requestBody.actionDescription).toBe(
      "Updated action description.",
    );

    expect(requestBody.result).toBe("Updated result.");
  });

  it("should preserve form data and show an error when update returns 409", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: mockActions,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              code: "ACTION_STALE",
              message:
                "This Action Taken was updated by another user.",
            },
          }),
          {
            status: 409,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: mockActions,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    render(<ActionsTaken ticketId={100} canEdit={true} />);

    expect(
      await screen.findByText("Checked the reported issue."),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /edit/i }),
    );

    const descriptionInput =
      screen.getByLabelText(/action description/i);

    fireEvent.change(descriptionInput, {
      target: {
        value: "My unsaved updated description.",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /save changes/i }),
    );

    expect(
      await screen.findByText(
        /This Action Taken was updated by another user/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue(
        "My unsaved updated description.",
      ),
    ).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("should show an error and allow retry when loading Actions Taken fails", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              code: "ACTIONS_LOAD_FAILED",
              message: "Unable to retrieve Actions Taken.",
            },
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: mockActions,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    render(<ActionsTaken ticketId={100} canEdit={false} />);

    expect(
      await screen.findByText(/Unable to retrieve Actions Taken/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /retry/i }),
    );

    expect(
      await screen.findByText("Checked the reported issue."),
    ).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});