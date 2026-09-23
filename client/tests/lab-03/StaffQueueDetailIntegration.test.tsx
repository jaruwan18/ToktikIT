import { fireEvent, render, screen } from "@testing-library/react";
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
    data: [],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    },
  }),

  getItTickets: vi.fn().mockResolvedValue({
    data: [],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    },
  }),

  getTicketDetail: vi.fn(),
  getItTicketDetail: vi.fn(),
  createTicket: vi.fn(),
  uploadAttachment: vi.fn(),
  downloadAttachment: vi.fn(),
  removeAttachment: vi.fn(),
}));

vi.mock("../../src/components/StaffTicketQueue", () => ({
  default: ({
    onOpenTicket,
  }: {
    onOpenTicket: (ticketId: number) => void;
  }) => (
    <section>
      <h1>IT Ticket Queue</h1>

      <button
        type="button"
        onClick={() => onOpenTicket(123)}
      >
        Open Ticket TKT-2026-000123
      </button>
    </section>
  ),
}));

vi.mock("../../src/components/StaffTicketDetail", () => ({
  default: ({
    ticketId,
    onBack,
  }: {
    ticketId: number;
    onBack: () => void;
  }) => (
    <section>
      <h1>Staff Ticket Detail</h1>

      <div>Ticket ID: {ticketId}</div>

      <button type="button" onClick={onBack}>
        Back to Queue
      </button>
    </section>
  ),
}));

describe("Lab 3 - Staff Queue to Ticket Detail Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(api.getCurrentUser).mockResolvedValue({
      id: 7,
      email: "it.alex@example.com",
      displayName: "Alex Carter",
      role: "IT_STAFF",
      mustChangePassword: false,
      isActive: true,
    });
  });

  it("opens Staff Ticket Detail from the IT Ticket Queue", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: /it ticket queue/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /open ticket tkt-2026-000123/i,
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: /staff ticket detail/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ticket ID: 123"),
    ).toBeInTheDocument();
  });

  it("returns from Staff Ticket Detail back to the Queue", async () => {
    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: /open ticket tkt-2026-000123/i,
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: /staff ticket detail/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /back to queue/i,
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: /it ticket queue/i,
      }),
    ).toBeInTheDocument();
  });
});