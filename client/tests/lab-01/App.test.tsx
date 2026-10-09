import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

describe("App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(api, "getCurrentUser").mockResolvedValue({
      id: 1,
      email: "admin@example.com",
      displayName: "Test Admin",
      role: "ADMIN",
      mustChangePassword: false,
      isActive: true,
      requesterId: null,
    });

    vi.spyOn(api, "getRequesters").mockResolvedValue([]);

    vi.spyOn(api, "getTickets").mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      },
    });

    vi.spyOn(api, "getCategories").mockResolvedValue([]);
    vi.spyOn(api, "getRelatedSystems").mockResolvedValue([]);
  });

  it("renders the TokTickIT heading", async () => {
    render(<App />);

    expect(
      await screen.findByText(/TokTickIT/i),
    ).toBeInTheDocument();
  });

  it("shows the main navigation buttons", async () => {
    render(<App />);

    expect(
      await screen.findByRole("button", { name: /My Tickets/i }),
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("button", { name: /Create Ticket/i }).length,
    ).toBeGreaterThan(0);

    expect(
      screen.getByRole("button", { name: /User Management/i }),
    ).toBeInTheDocument();
  });

  it("opens the Create Ticket form when the requester selects Create Ticket", async () => {
    vi.spyOn(api, "getCurrentUser").mockResolvedValue({
      id: 2,
      email: "jennifer@example.com",
      displayName: "Jennifer Anderson",
      role: "REQUESTER",
      mustChangePassword: false,
      isActive: true,
      requesterId: 1,
    });

    render(<App />);

    const createButtons = await screen.findAllByRole("button", {
      name: /Create Ticket/i,
    });

    fireEvent.click(createButtons[0]);

    expect(
      await screen.findByRole("heading", { name: /Ticket Information/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Request Details/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Submit Ticket/i }),
    ).toBeInTheDocument();
  });
});
