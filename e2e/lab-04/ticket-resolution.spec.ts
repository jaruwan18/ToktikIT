import { expect, test, type Page } from "../../client/node_modules/@playwright/test/index.js";
import {
  API_URL,
  USERS,
  apiLogin,
  createTicketAs,
  loginUi,
  openStaffTicket,
  uniqueText,
} from "./helpers.js";

// docs/lab-04/tests.md §18.2 - Ticket resolution workflow.

async function nextStatusOptions(page: Page): Promise<string[]> {
  const options = await page
    .getByLabel("Change Status To")
    .locator("option")
    .evaluateAll((elements) =>
      elements
        .map((element) => (element as HTMLOptionElement).value)
        .filter((value) => value !== ""),
    );

  return options;
}

async function changeStatus(page: Page, status: string, label: string) {
  await page.getByLabel("Change Status To").selectOption(status);
  await page.getByRole("button", { name: "Update Status" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: `Status changed to ${label}.` }),
  ).toBeVisible();
}

test.describe("Lab 4 - Ticket resolution", () => {
  test("a Ticket is resolved only after a complete Action Taken, then closed and reopened", async ({
    page,
    playwright,
  }) => {
    const api = await playwright.request.newContext();
    const ticket = await createTicketAs(
      api,
      USERS.requester,
      uniqueText("E2E Resolution"),
    );
    await api.dispose();

    // 1-2. IT Staff logs in and opens the Ticket.
    await loginUi(page, USERS.staff);
    await openStaffTicket(page, ticket.ticketNumber);

    // 3-4. Only permitted transitions are offered.
    expect(await nextStatusOptions(page)).toEqual(["OPEN", "CANCELLED"]);

    await changeStatus(page, "OPEN", "Open");
    expect(await nextStatusOptions(page)).toEqual([
      "IN_PROGRESS",
      "WAITING_FOR_REQUESTER",
      "CANCELLED",
    ]);

    await changeStatus(page, "IN_PROGRESS", "In Progress");
    expect(await nextStatusOptions(page)).toContain("RESOLVED");
    expect(await nextStatusOptions(page)).not.toContain("CLOSED");

    // 5. Resolving without any Action Taken is rejected.
    await page.getByLabel("Change Status To").selectOption("RESOLVED");
    await page.getByRole("button", { name: "Update Status" }).click();
    await expect(
      page.getByRole("alert").filter({
        hasText: "This Ticket cannot be resolved yet.",
      }),
    ).toBeVisible();

    // 6. Record a complete Action Taken, then resolving succeeds.
    const actions = page.getByRole("region", { name: "Actions Taken" });
    await actions.getByRole("button", { name: "Add Action Taken" }).click();
    await actions.getByLabel("Action Description").fill("Replaced the network cable");
    await actions.getByLabel("Result").fill("Connection is stable.");
    await actions.getByRole("button", { name: "Save Action Taken" }).click();
    await expect(
      actions.getByRole("row", { name: /Replaced the network cable/ }),
    ).toBeVisible();

    await changeStatus(page, "RESOLVED", "Resolved");
    expect(await nextStatusOptions(page)).toEqual(["CLOSED", "REOPENED"]);

    // 7. Close the Ticket.
    await changeStatus(page, "CLOSED", "Closed");
    expect(await nextStatusOptions(page)).toEqual(["REOPENED"]);

    // 8. Reopen the Ticket.
    await changeStatus(page, "REOPENED", "Reopened");
    expect(await nextStatusOptions(page)).toContain("IN_PROGRESS");
    expect(await nextStatusOptions(page)).not.toContain("CLOSED");
  });

  test("the API rejects a transition the UI does not offer", async ({
    playwright,
  }) => {
    const requesterApi = await playwright.request.newContext();
    const ticket = await createTicketAs(
      requesterApi,
      USERS.requester,
      uniqueText("E2E Invalid transition"),
    );
    await requesterApi.dispose();

    const staffApi = await playwright.request.newContext();
    await apiLogin(staffApi, USERS.staff);

    const response = await staffApi.patch(
      `${API_URL}/api/tickets/${ticket.id}/status`,
      { data: { status: "CLOSED" } },
    );

    expect(response.status()).toBe(409);
    expect((await response.json()).error).toBe("INVALID_STATUS_TRANSITION");
    await staffApi.dispose();
  });
});
