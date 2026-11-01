import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createTicket,
  downloadAttachment,
  getTicketDetail,
  removeAttachment,
  uploadAttachment,
} from "../../src/api.js";

// Regression found by the Lab 4 E2E tests: since Lab 3 the API identifies
// the Requester from the session cookie, so every Requester request must be
// sent with credentials. Without it, Create Ticket failed with
// "You must be logged in."

function okResponse(body: unknown = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Lab 4 - Requester requests send the session cookie", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [
      "createTicket",
      () =>
        createTicket(1, {
          categoryId: 1,
          relatedSystemId: 1,
          summary: "Printer offline",
          description: "The printer is offline.",
          requestedPriority: "LOW",
        }),
    ],
    ["getTicketDetail", () => getTicketDetail(1, 2)],
    [
      "uploadAttachment",
      () => uploadAttachment(1, 2, new File(["x"], "note.txt")),
    ],
    ["downloadAttachment", () => downloadAttachment(1, 3)],
    ["removeAttachment", () => removeAttachment(1, 3, "Wrong file")],
  ])("%s uses credentials: include", async (_name, call) => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(okResponse());

    await call().catch(() => undefined);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      credentials: "include",
    });
  });
});
