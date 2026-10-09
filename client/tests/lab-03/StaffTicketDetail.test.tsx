import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StaffTicketDetail from "../../src/components/StaffTicketDetail";

const mockTicket = {
id: 1,
ticketNumber: "TKT-2026-000001",
requesterId: 10,
requester: {
id: 10,
name: "Test Requester",
email: "[requester@example.com](mailto:requester@example.com)",
isActive: true,
},
requesterName: "Test Requester",
categoryId: 1,
category: {
id: 1,
name: "Hardware",
},
categoryName: "Hardware",
relatedSystemId: 1,
relatedSystem: {
id: 1,
name: "Computer",
isActive: true,
},
relatedSystemName: "Computer",
ownerId: 20,
owner: {
id: 20,
displayName: "IT Staff",
email: "[staff@example.com](mailto:staff@example.com)",
},
summary: "Computer cannot start",
description:
"The computer does not start when the power button is pressed.",
requestedPriority: "HIGH" as const,
itPriority: "HIGH" as const,
currentStatus: "IN_PROGRESS" as const,
createdAt: "2026-09-01T10:00:00.000Z",
updatedAt: "2026-09-01T11:00:00.000Z",
messages: [
{
id: 1,
type: "PUBLIC_COMMENT",
body: "We are checking the computer.",
createdAt: "2026-09-01T10:30:00.000Z",
updatedAt: "2026-09-01T10:30:00.000Z",
author: {
id: 20,
displayName: "IT Staff",
email: "[staff@example.com](mailto:staff@example.com)",
role: "IT_STAFF",
},
},
],
attachments: [
{
id: 1,
originalFilename: "error.png",
mimeType: "image/png",
sizeBytes: 1024,
uploadedAt: "2026-09-01T10:05:00.000Z",
isRemoved: false,
removedAt: null,
removalReason: null,
},
],
};

const mockFetch = vi.fn();

const mockActionsResponse = {
data: [],
};

beforeEach(() => {
mockFetch.mockReset();
vi.stubGlobal("fetch", mockFetch);

// Lab 4: ActionsTaken loads its own action list.
mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
const url = String(input);


if (url.includes("/api/tickets/1/actions")) {
  return {
    ok: true,
    status: 200,
    json: async () => mockActionsResponse,
  };
}

return {
  ok: true,
  status: 200,
  json: async () => mockTicket,
};


});
});

describe("StaffTicketDetail", () => {
it("shows loading state while retrieving ticket detail", () => {
mockFetch.mockImplementation(
() => new Promise(() => {}),
);


render(
  <StaffTicketDetail
    ticketId={1}
    onBack={vi.fn()}
  />,
);

expect(
  screen.getByText("Loading..."),
).toBeInTheDocument();


});

it("renders ticket detail after successful retrieval", async () => {
render( <StaffTicketDetail
     ticketId={1}
     onBack={vi.fn()}
   />,
);


expect(
  await screen.findAllByText("TKT-2026-000001"),
).toHaveLength(2);

expect(
  screen.getByText("Computer cannot start"),
).toBeInTheDocument();

expect(
  screen.getByText("Test Requester"),
).toBeInTheDocument();

expect(
  screen.getByText("Hardware"),
).toBeInTheDocument();

expect(
  screen.getByText("Computer"),
).toBeInTheDocument();

expect(
  screen.getAllByText("IT Staff"),
).toHaveLength(2);

expect(
  screen.getByText(
    "We are checking the computer.",
  ),
).toBeInTheDocument();

expect(
  screen.getByText("error.png"),
).toBeInTheDocument();

expect(mockFetch).toHaveBeenCalledWith(
  expect.stringContaining("/api/it/tickets/1"),
  {
    credentials: "include",
  },
);


});

it("shows error state when ticket retrieval fails", async () => {
mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
const url = String(input);


  if (url.includes("/api/tickets/1/actions")) {
    return {
      ok: true,
      status: 200,
      json: async () => mockActionsResponse,
    };
  }

  return {
    ok: false,
    status: 500,
    json: async () => ({
      error: "INTERNAL_ERROR",
      message:
        "Unable to retrieve IT Staff ticket detail.",
    }),
  };
});

render(
  <StaffTicketDetail
    ticketId={1}
    onBack={vi.fn()}
  />,
);

expect(
  await screen.findByText(
    "Unable to retrieve IT Staff ticket detail.",
  ),
).toBeInTheDocument();

expect(
  screen.getByRole("button", {
    name: "Retry",
  }),
).toBeInTheDocument();


});

it("shows not found state when the API returns 404", async () => {
mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
const url = String(input);


  if (url.includes("/api/tickets/1/actions")) {
    return {
      ok: true,
      status: 200,
      json: async () => mockActionsResponse,
    };
  }

  return {
    ok: false,
    status: 404,
    json: async () => ({
      error: "TICKET_NOT_FOUND",
      message: "Ticket not found.",
    }),
  };
});

render(
  <StaffTicketDetail
    ticketId={999}
    onBack={vi.fn()}
  />,
);

expect(
  await screen.findByText("Ticket not found"),
).toBeInTheDocument();


});

it("calls onBack when the back button is clicked", async () => {
const onBack = vi.fn();


render(
  <StaffTicketDetail
    ticketId={1}
    onBack={onBack}
  />,
);

await screen.findAllByText("TKT-2026-000001");

fireEvent.click(
  screen.getByRole("button", {
    name: /Back to IT Ticket Queue/i,
  }),
);

expect(onBack).toHaveBeenCalledTimes(1);


});

it("retries loading after clicking Retry", async () => {
mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
const url = String(input);


  if (url.includes("/api/tickets/1/actions")) {
    return {
      ok: true,
      status: 200,
      json: async () => mockActionsResponse,
    };
  }

  return {
    ok: false,
    status: 500,
    json: async () => ({
      error: "INTERNAL_ERROR",
      message:
        "Unable to retrieve IT Staff ticket detail.",
    }),
  };
});

render(
  <StaffTicketDetail
    ticketId={1}
    onBack={vi.fn()}
  />,
);

const retryButton = await screen.findByRole(
  "button",
  { name: "Retry" },
);

mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
  const url = String(input);

  if (url.includes("/api/tickets/1/actions")) {
    return {
      ok: true,
      status: 200,
      json: async () => mockActionsResponse,
    };
  }

  return {
    ok: true,
    status: 200,
    json: async () => mockTicket,
  };
});

fireEvent.click(retryButton);

await waitFor(() => {
  expect(
    screen.getAllByText("TKT-2026-000001"),
  ).toHaveLength(2);
});

expect(
  mockFetch.mock.calls.some(([url]) =>
    String(url).includes("/api/it/tickets/1"),
  ),
).toBe(true);


});

it("distinguishes public comments from internal notes", async () => {
const ticketWithMessages = {
...mockTicket,
messages: [
{
...mockTicket.messages[0],
type: "COMMENT",
body: "Public update for the requester.",
},
{
id: 2,
type: "INTERNAL_NOTE",
body: "Internal note for IT Staff.",
createdAt: "2026-09-01T11:00:00.000Z",
updatedAt: "2026-09-01T11:00:00.000Z",
author: {
id: 20,
displayName: "IT Staff",
email: "[staff@example.com](mailto:staff@example.com)",
role: "IT_STAFF",
},
},
],
};


mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
  const url = String(input);

  if (url.includes("/api/tickets/1/actions")) {
    return {
      ok: true,
      status: 200,
      json: async () => mockActionsResponse,
    };
  }

  return {
    ok: true,
    status: 200,
    json: async () => ticketWithMessages,
  };
});

render(
  <StaffTicketDetail
    ticketId={1}
    onBack={vi.fn()}
  />,
);

await screen.findAllByText("TKT-2026-000001");

expect(
  screen.getAllByText("Public Comment"),
).toHaveLength(2);

expect(
  screen.getAllByText("Internal Note"),
).toHaveLength(2);

expect(
  screen.getByText(
    "Public update for the requester.",
  ),
).toBeInTheDocument();

expect(
  screen.getByText(
    "Internal note for IT Staff.",
  ),
).toBeInTheDocument();


});

it("adds a public comment", async () => {
const newComment = {
id: 2,
ticketId: 1,
type: "COMMENT",
body: "The issue has been checked.",
createdAt: "2026-09-01T12:00:00.000Z",
updatedAt: "2026-09-01T12:00:00.000Z",
author: {
id: 20,
displayName: "IT Staff",
email: "[staff@example.com](mailto:staff@example.com)",
role: "IT_STAFF",
},
};


mockFetch.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);

  if (url.includes("/api/tickets/1/actions")) {
    return {
      ok: true,
      status: 200,
      json: async () => mockActionsResponse,
    };
  }

  if (
    url.includes("/api/tickets/1/comments") &&
    init?.method === "POST"
  ) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        message: newComment,
      }),
    };
  }

  return {
    ok: true,
    status: 200,
    json: async () => mockTicket,
  };
});

render(
  <StaffTicketDetail
    ticketId={1}
    onBack={vi.fn()}
  />,
);

await screen.findAllByText("TKT-2026-000001");

fireEvent.change(
  screen.getByLabelText("Message"),
  {
    target: {
      value: "The issue has been checked.",
    },
  },
);

fireEvent.click(
  screen.getByRole("button", {
    name: "Add Public Comment",
  }),
);

await waitFor(() => {
  expect(
    screen.getByText(
      "The issue has been checked.",
    ),
  ).toBeInTheDocument();
});

expect(
  mockFetch.mock.calls.some(([url, init]) =>
    String(url).includes("/api/tickets/1/comments") &&
    (init as RequestInit | undefined)?.method === "POST"
  ),
).toBe(true);

expect(
  mockFetch.mock.calls.find(([url, init]) =>
    String(url).includes("/api/tickets/1/comments") &&
    (init as RequestInit | undefined)?.method === "POST"
  )?.[1],
).toEqual(
  expect.objectContaining({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      body: "The issue has been checked.",
    }),
  }),
);


});

it("adds an internal note", async () => {
const newNote = {
id: 3,
ticketId: 1,
type: "INTERNAL_NOTE",
body: "Checked the workstation configuration.",
createdAt: "2026-09-01T12:30:00.000Z",
updatedAt: "2026-09-01T12:30:00.000Z",
author: {
id: 20,
displayName: "IT Staff",
email: "[staff@example.com](mailto:staff@example.com)",
role: "IT_STAFF",
},
};


mockFetch.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);

  if (url.includes("/api/tickets/1/actions")) {
    return {
      ok: true,
      status: 200,
      json: async () => mockActionsResponse,
    };
  }

  if (
    url.includes("/api/tickets/1/internal-notes") &&
    init?.method === "POST"
  ) {
    return {
      ok: true,
      status: 200,
      json: async () => newNote,
    };
  }

  return {
    ok: true,
    status: 200,
    json: async () => mockTicket,
  };
});

render(
  <StaffTicketDetail
    ticketId={1}
    onBack={vi.fn()}
  />,
);

await screen.findAllByText("TKT-2026-000001");

fireEvent.change(
  screen.getByLabelText("Message Type"),
  {
    target: {
      value: "INTERNAL_NOTE",
    },
  },
);

fireEvent.change(
  screen.getByLabelText("Message"),
  {
    target: {
      value:
        "Checked the workstation configuration.",
    },
  },
);

fireEvent.click(
  screen.getByRole("button", {
    name: "Add Internal Note",
  }),
);

await waitFor(() => {
  expect(
    screen.getByText(
      "Checked the workstation configuration.",
    ),
  ).toBeInTheDocument();
});

expect(
  mockFetch.mock.calls.some(([url, init]) =>
    String(url).includes("/api/tickets/1/internal-notes") &&
    (init as RequestInit | undefined)?.method === "POST"
  ),
).toBe(true);

expect(
  mockFetch.mock.calls.find(([url, init]) =>
    String(url).includes("/api/tickets/1/internal-notes") &&
    (init as RequestInit | undefined)?.method === "POST"
  )?.[1],
).toEqual(
  expect.objectContaining({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      body:
        "Checked the workstation configuration.",
    }),
  }),
);

});
});
