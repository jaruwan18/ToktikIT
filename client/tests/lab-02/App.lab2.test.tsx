import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

describe("Lab 2 - Create Ticket UI", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(api, "getRequesters").mockResolvedValue([
      {
        id: 1,
        name: "Jennifer Anderson",
        email: "jennifer@example.com",
        isActive: true,
      },
      {
        id: 2,
        name: "Michael Brown",
        email: "michael@example.com",
        isActive: true,
      },
      {
        id: 3,
        name: "Sarah Williams",
        email: "sarah@example.com",
        isActive: true,
      },
      {
        id: 4,
        name: "David Miller",
        email: "david@example.com",
        isActive: true,
      },
      {
        id: 5,
        name: "Emily Johnson",
        email: "emily@example.com",
        isActive: false,
      },
    ]);

    vi.spyOn(api, "getTickets").mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      },
    });

    vi.spyOn(api, "getCategories").mockResolvedValue([
      { id: 1, name: "Account and Access" },
    ]);

    vi.spyOn(api, "getRelatedSystems").mockResolvedValue([
      { id: 1, name: "Email" },
    ]);
  });

  const openCreateTicket = async () => {
    const createButtons = await screen.findAllByRole("button", {
      name: /Create Ticket/i,
    });

    fireEvent.click(createButtons[0]);
  };

  const getSummary = () =>
    screen.getByRole("textbox", {
      name: /Summary/i,
    });

  const getDescription = () =>
    screen.getByRole("textbox", {
      name: /Description/i,
    });

  const getRequestedPriority = () =>
    screen.getByRole("combobox", {
      name: /Requested Priority/i,
    });

  const getCategory = () =>
    screen.getByRole("combobox", {
      name: /Category/i,
    });

  const getRelatedSystem = () =>
    screen.getByRole("combobox", {
      name: /Related System/i,
    });

  it("shows the Create Ticket form", async () => {
    render(<App />);

    await openCreateTicket();

    expect(
      await screen.findByRole("heading", {
        name: /Create Ticket/i,
      })
    ).toBeInTheDocument();

    expect(getSummary()).toBeInTheDocument();
    expect(getDescription()).toBeInTheDocument();
    expect(getRequestedPriority()).toBeInTheDocument();
    expect(getCategory()).toBeInTheDocument();
    expect(getRelatedSystem()).toBeInTheDocument();
  });

  it("shows validation errors when required fields are empty", async () => {
    render(<App />);

    await openCreateTicket();

    const submitButton = await screen.findByRole("button", {
      name: /Submit Ticket/i,
    });

    fireEvent.click(submitButton);

    expect(
      await screen.findByText(/Summary is required/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/Description is required/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/Please select a requested priority/i)
    ).toBeInTheDocument();
  });

  it("validates summary minimum length", async () => {
    render(<App />);

    await openCreateTicket();

    fireEvent.change(getSummary(), {
      target: { value: "abc" },
    });

    fireEvent.change(getDescription(), {
      target: {
        value: "This is a valid description.",
      },
    });

    fireEvent.change(getRequestedPriority(), {
      target: { value: "LOW" },
    });

    fireEvent.click(
      await screen.findByRole("button", {
        name: /Submit Ticket/i,
      })
    );

    expect(
      await screen.findByText(
        /Summary must be at least 5 characters/i
      )
    ).toBeInTheDocument();
  });

  it("validates description minimum length", async () => {
    render(<App />);

    await openCreateTicket();

    fireEvent.change(getSummary(), {
      target: { value: "Valid summary" },
    });

    fireEvent.change(getDescription(), {
      target: { value: "short" },
    });

    fireEvent.change(getRequestedPriority(), {
      target: { value: "LOW" },
    });

    fireEvent.click(
      await screen.findByRole("button", {
        name: /Submit Ticket/i,
      })
    );

    expect(
      await screen.findByText(
        /Description must be at least 10 characters/i
      )
    ).toBeInTheDocument();
  });

  it("creates a ticket and displays the official Ticket Number", async () => {
    vi.spyOn(api, "createTicket").mockResolvedValue({
      id: 1,
      ticketNumber: "TKT-2026-000001",
      requesterId: 1,
      categoryId: 1,
      relatedSystemId: 1,
      summary: "Cannot access email",
      description:
        "Unable to access the company email account.",
      requestedPriority: "HIGH",
      currentStatus: "NEW",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    render(<App />);

    await openCreateTicket();

    fireEvent.change(getSummary(), {
      target: { value: "Cannot access email" },
    });

    fireEvent.change(getDescription(), {
      target: {
        value:
          "Unable to access the company email account.",
      },
    });

    fireEvent.change(getRequestedPriority(), {
      target: { value: "HIGH" },
    });

    fireEvent.change(getCategory(), {
      target: { value: "1" },
    });

    fireEvent.change(getRelatedSystem(), {
      target: { value: "1" },
    });

    fireEvent.click(
      await screen.findByRole("button", {
        name: /Submit Ticket/i,
      })
    );

    await waitFor(() => {
      expect(api.createTicket).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText("TKT-2026-000001")
    ).toBeInTheDocument();
  });

  it("preserves form values when ticket creation fails", async () => {
    vi.spyOn(api, "createTicket").mockRejectedValue(
      new Error("Unable to connect to TokTickIT API")
    );

    render(<App />);

    await openCreateTicket();

    const summary = getSummary();
    const description = getDescription();

    fireEvent.change(summary, {
      target: { value: "Cannot access email" },
    });

    fireEvent.change(description, {
      target: {
        value:
          "Unable to access the company email account.",
      },
    });

    fireEvent.change(getRequestedPriority(), {
      target: { value: "HIGH" },
    });

    fireEvent.change(getCategory(), {
      target: { value: "1" },
    });

    fireEvent.change(getRelatedSystem(), {
      target: { value: "1" },
    });

    fireEvent.click(
      await screen.findByRole("button", {
        name: /Submit Ticket/i,
      })
    );

    expect(
      await screen.findByText(/Unable to create ticket/i)
    ).toBeInTheDocument();

    expect(summary).toHaveValue("Cannot access email");

    expect(description).toHaveValue(
      "Unable to access the company email account."
    );
  });
});