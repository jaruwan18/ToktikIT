import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import * as api from "../../src/api";

vi.mock("../../src/api", () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  changePassword: vi.fn(),

  getCategories: vi.fn().mockResolvedValue([]),
  getRelatedSystems: vi.fn().mockResolvedValue([]),
  getRequesters: vi.fn().mockResolvedValue([]),
  getTickets: vi.fn().mockResolvedValue({
    tickets: [],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    },
  }),
  getTicketDetail: vi.fn(),
  createTicket: vi.fn(),
  uploadAttachment: vi.fn(),
  downloadAttachment: vi.fn(),
  removeAttachment: vi.fn(),
}));

describe("Lab 3 - Application Authentication Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the Login screen when the user is not authenticated", async () => {
    vi.mocked(api.getCurrentUser).mockRejectedValue(
      new Error("You must be logged in."),
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: /login/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/email/i),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/password/i),
    ).toBeInTheDocument();
  });

  it("shows the authenticated application after the current user is loaded", async () => {
    vi.mocked(api.getCurrentUser).mockResolvedValue({
      id: 7,
      email: "it.alex@example.com",
      displayName: "Alex Carter",
      role: "IT_STAFF",
      mustChangePassword: false,
      isActive: true,
    });

    render(<App />);

    expect(
      await screen.findByText(/Alex Carter/i),
    ).toBeInTheDocument();


      expect(screen.getByText("IT_STAFF")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /logout/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows the password change screen when mustChangePassword is true", async () => {
    vi.mocked(api.getCurrentUser).mockResolvedValue({
      id: 7,
      email: "it.alex@example.com",
      displayName: "Alex Carter",
      role: "IT_STAFF",
      mustChangePassword: true,
      isActive: true,
    });

    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: /change password/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/current password|temporary password/i),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/^new password$/i),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/^confirm new password$/i),
    ).toBeInTheDocument();
  });

  it("does not show the Lab 2 Development Requester selector", async () => {
    vi.mocked(api.getCurrentUser).mockResolvedValue({
      id: 7,
      email: "it.alex@example.com",
      displayName: "Alex Carter",
      role: "IT_STAFF",
      mustChangePassword: false,
      isActive: true,
    });

    render(<App />);

    await screen.findByText(/Alex Carter/i);

    expect(
      screen.queryByLabelText(/requester/i),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(/lab 2 testing requester/i),
    ).not.toBeInTheDocument();
  });

  it("logs out the current user and returns to Login", async () => {
    vi.mocked(api.getCurrentUser).mockResolvedValue({
      id: 7,
      email: "it.alex@example.com",
      displayName: "Alex Carter",
      role: "IT_STAFF",
      mustChangePassword: false,
      isActive: true,
    });

    vi.mocked(api.logout).mockResolvedValue();

    render(<App />);

    const logoutButton = await screen.findByRole("button", {
      name: /logout/i,
    });

    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(api.logout).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByRole("heading", {
        name: /login/i,
      }),
    ).toBeInTheDocument();
  });
});
