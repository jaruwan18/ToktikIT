import { expect, test, type Page } from "../../client/node_modules/@playwright/test/index.js";
import {
  API_URL,
  USERS,
  apiLogin,
  createTicketAs,
  loginUi,
  readListTotal,
  uniqueText,
} from "./helpers.js";

// docs/lab-04/tests.md §18.3 - Requester and IT Staff dashboards.

async function readCardValue(page: Page, label: string): Promise<number> {
  const card = page.getByRole("button", {
    name: new RegExp(`^${label}: \\d+\\. View tickets$`),
  });
  await expect(card).toBeVisible();

  const name = (await card.getAttribute("aria-label")) ?? "";
  return Number(name.match(/: (\d+)\./)?.[1] ?? NaN);
}

async function openDashboard(page: Page, heading: string) {
  await page.getByRole("button", { name: "Dashboard", exact: true }).click();
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  await expect(page.getByText("Loading dashboard...")).toHaveCount(0);
}

test.describe("Lab 4 - Dashboards", () => {
  test("Requester dashboard shows only the Requester's own Tickets and drills down to matching lists", async ({
    page,
    playwright,
  }) => {
    const api = await playwright.request.newContext();
    const otherTicket = await createTicketAs(
      api,
      USERS.otherRequester,
      uniqueText("E2E Other requester"),
    );
    await api.dispose();

    const ownApi = await playwright.request.newContext();
    const ownTicket = await createTicketAs(
      ownApi,
      USERS.requester,
      uniqueText("E2E Own dashboard"),
    );
    await ownApi.dispose();

    await loginUi(page, USERS.requester);
    await openDashboard(page, "My Dashboard");

    // Ownership: the new own Ticket is listed, the other Requester's is not.
    const recent = page.getByRole("region", {
      name: "Recently Updated Tickets",
    });
    await expect(recent).toContainText(ownTicket.ticketNumber);
    await expect(page.getByText(otherTicket.ticketNumber)).toHaveCount(0);

    // Drill-down: each card opens My Tickets with the same total.
    for (const label of [
      "Total Open Tickets",
      "Waiting for Requester",
      "Recently Updated",
      "Recently Resolved",
    ]) {
      const value = await readCardValue(page, label);

      await page
        .getByRole("button", { name: new RegExp(`^${label}: `) })
        .click();
      await expect(
        page.getByText(`From dashboard: ${label}`),
      ).toBeVisible();
      expect(await readListTotal(page), label).toBe(value);

      await openDashboard(page, "My Dashboard");
    }

    // A recent Ticket opens Ticket Detail.
    await recent
      .getByRole("button", { name: new RegExp(ownTicket.ticketNumber) })
      .click();
    await expect(
      page.getByRole("heading", { name: "Ticket Detail" }),
    ).toBeVisible();
  });

  test("IT Staff dashboard cards drill down to queue lists with the same totals", async ({
    page,
  }) => {
    await loginUi(page, USERS.staff);
    await openDashboard(page, "IT Staff Dashboard");

    await expect(
      page.getByRole("region", { name: "Status Summary" }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Urgent Tickets" }),
    ).toBeVisible();

    for (const label of [
      "Unassigned Tickets",
      "My Owned Tickets",
      "Waiting for Requester",
      "Closed",
      "High",
    ]) {
      const value = await readCardValue(page, label);

      await page
        .getByRole("button", { name: new RegExp(`^${label}: `) })
        .click();
      await expect(page.getByText(/From dashboard:/)).toBeVisible();
      expect(await readListTotal(page), label).toBe(value);

      await openDashboard(page, "IT Staff Dashboard");
    }
  });

  test("Requesters cannot open the IT Staff dashboard data", async ({
    page,
    playwright,
  }) => {
    await loginUi(page, USERS.requester);
    await openDashboard(page, "My Dashboard");
    await expect(
      page.getByRole("heading", { name: "IT Staff Dashboard" }),
    ).toHaveCount(0);

    const api = await playwright.request.newContext();
    await apiLogin(api, USERS.requester);
    const response = await api.get(`${API_URL}/api/dashboard/staff`);
    expect(response.status()).toBe(403);
    await api.dispose();
  });

  test("dashboards are usable on a mobile screen", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    await loginUi(page, USERS.staff);
    await openDashboard(page, "IT Staff Dashboard");

    await expect(
      page.getByRole("button", { name: /^Unassigned Tickets: / }),
    ).toBeVisible();

    const hasHorizontalScroll = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);

    await context.close();
  });
});
