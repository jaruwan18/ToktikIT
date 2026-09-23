import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StaffTicketQueue from "../../src/components/StaffTicketQueue";
import * as api from "../../src/api";
import type { ItTicketListItem } from "../../src/api";

vi.mock("../../src/api", () => ({
  getItTickets: vi.fn(),
}));

const mockTickets: ItTicketListItem[] = [
  {
    id: 1,
    ticketNumber: "TKT-2026-000001",
    requesterId: 1,
    categoryId: 1,
    relatedSystemId: 1,
    ownerId: 7,
    summary: "Cannot access university email",
    description: "Email login is not working.",
    requestedPriority: "HIGH",
    itPriority: "HIGH",
    currentStatus: "IN_PROGRESS",
    createdAt: "2026-09-21T08:00:00.000Z",
    updatedAt: "2026-09-21T09:00:00.000Z",
    requester: {
      id: 1,
      name: "Sarah Williams",
      email: "sarah.williams@example.com",
      isActive: true,
    },
    category: {
      id: 1,
      name: "Email",
    },
    relatedSystem: {
      id: 1,
      name: "University Email",
    },
    owner: {
      id: 7,
      displayName: "Alex Carter",
      email: "it.alex@example.com",
    },
  },
  {
    id: 2,
    ticketNumber: "TKT-2026-000002",
    requesterId: 2,
    categoryId: 2,
    relatedSystemId: 2,
    ownerId: null,
    summary: "VPN connection problem",
    description: "VPN cannot connect.",
    requestedPriority: "MEDIUM",
    itPriority: "MEDIUM",
    currentStatus: "NEW",
    createdAt: "2026-09-20T08:00:00.000Z",
    updatedAt: "2026-09-20T09:00:00.000Z",
    requester: {
      id: 2,
      name: "John Smith",
      email: "john.smith@example.com",
      isActive: true,
    },
    category: {
      id: 2,
      name: "Network",
    },
    relatedSystem: {
      id: 2,
      name: "VPN",
    },
    owner: null,
  },
];

describe("Lab 3 - IT Staff Ticket Queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(api.getItTickets).mockResolvedValue({
      data: mockTickets,
      pagination: {
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      },
    });
  });

  it("renders the IT Staff ticket queue", async () => {
    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: /IT Staff Ticket Queue/i,
      }),
    ).toBeInTheDocument();

    expect(
      await screen.findAllByText("TKT-2026-000001"),
    ).not.toHaveLength(0);

    expect(
      screen.getAllByText("Cannot access university email").length,
    ).toBeGreaterThan(0);
  });

  it("loads queue data from the IT Staff API", async () => {
    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(api.getItTickets).toHaveBeenCalledWith({
        search: undefined,
        currentStatus: undefined,
        itPriority: undefined,
        page: 1,
        pageSize: 10,
      });
    });
  });

  it("supports ticket search", async () => {
    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
      />,
    );

    const searchInput =
      screen.getByLabelText(/search/i);

    fireEvent.change(searchInput, {
      target: {
        value: "VPN",
      },
    });

    await waitFor(() => {
      expect(api.getItTickets).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "VPN",
          page: 1,
          pageSize: 10,
        }),
      );
    });
  });

  it("supports status filtering", async () => {
    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByLabelText(/^status$/i),
      {
        target: {
          value: "IN_PROGRESS",
        },
      },
    );

    await waitFor(() => {
      expect(api.getItTickets).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStatus: "IN_PROGRESS",
          page: 1,
        }),
      );
    });
  });

  it("supports IT priority filtering", async () => {
    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByLabelText(/IT Priority/i),
      {
        target: {
          value: "HIGH",
        },
      },
    );

    await waitFor(() => {
      expect(api.getItTickets).toHaveBeenCalledWith(
        expect.objectContaining({
          itPriority: "HIGH",
          page: 1,
        }),
      );
    });
  });

  it("displays requester and owner information", async () => {
    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
      />,
    );

    expect(
      await screen.findAllByText("Sarah Williams"),
    ).not.toHaveLength(0);

    expect(
      screen.getAllByText("Alex Carter").length,
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByText("Unassigned").length,
    ).toBeGreaterThan(0);
  });

  it("displays status and IT priority badges", async () => {
    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
      />,
    );

    expect(
      await screen.findAllByText("In Progress"),
    ).not.toHaveLength(0);

    expect(
      screen.getAllByText("High").length,
    ).toBeGreaterThan(0);

   expect(
     screen.getAllByText("New").length,
   ).toBeGreaterThan(0);
  });

  it("opens a ticket when the Open button is clicked", async () => {
    const onOpenTicket = vi.fn();

    render(
      <StaffTicketQueue
        onOpenTicket={onOpenTicket}
      />,
    );

    const openButtons =
      await screen.findAllByRole("button", {
        name: /open/i,
      });

    fireEvent.click(openButtons[0]);

    expect(onOpenTicket).toHaveBeenCalledWith(1);
  });

  it("shows the empty state when there are no tickets", async () => {
    vi.mocked(api.getItTickets).mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      },
    });

    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
      />,
    );

    expect(
      await screen.findByText(
        /No tickets in the queue/i,
      ),
    ).toBeInTheDocument();
  });

  it("shows the no-results state when filters return no tickets", async () => {
    vi.mocked(api.getItTickets)
      .mockResolvedValueOnce({
        data: mockTickets,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
        },
      })
      .mockResolvedValueOnce({
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        },
      });

    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByLabelText(/IT Priority/i),
      {
        target: {
          value: "LOW",
        },
      },
    );

    expect(
      await screen.findByText(
        /No tickets match your filters/i,
      ),
    ).toBeInTheDocument();
  });

  it("shows the API failure state", async () => {
    vi.mocked(api.getItTickets).mockRejectedValue(
      new Error("Server unavailable"),
    );

    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
      />,
    );

    expect(
      await screen.findByText(
        "Server unavailable",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /retry/i,
      }),
    ).toBeInTheDocument();
  });

  it("supports pagination", async () => {
    vi.mocked(api.getItTickets).mockResolvedValue({
      data: mockTickets,
      pagination: {
        page: 1,
        pageSize: 10,
        total: 25,
        totalPages: 3,
      },
    });

    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
      />,
    );

    const nextButton =
      await screen.findByRole("button", {
        name: "Next",
      });

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(api.getItTickets).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          pageSize: 10,
        }),
      );
    });
  });

  it("supports sorting", async () => {
    render(
      <StaffTicketQueue
        onOpenTicket={vi.fn()}
      />,
    );

    const summaryButton =
      await screen.findByRole("button", {
        name: /Summary/i,
      });

    fireEvent.click(summaryButton);

    expect(
      summaryButton.textContent,
    ).toContain("↑");

    fireEvent.click(summaryButton);

    expect(
      summaryButton.textContent,
    ).toContain("↓");
  });
});