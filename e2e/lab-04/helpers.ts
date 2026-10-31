import {
  expect,
  type APIRequestContext,
  type Locator,
  type Page,
} from "../../client/node_modules/@playwright/test/index.js";

// Shared helpers for the Lab 4 E2E tests. Every test creates its own
// Ticket through the API so the tests are independent and repeatable.

export const API_URL = process.env.E2E_API_URL ?? "http://localhost:3000";
export const PASSWORD = "Password123!";

export const USERS = {
  requester: "jennifer.anderson@example.com",
  otherRequester: "michael.brown@example.com",
  staff: "it.alex@example.com",
};

export function uniqueText(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function loginUi(page: Page, email: string) {
  await page.goto("/");
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(PASSWORD);
  await page.getByRole("button", { name: "Login", exact: true }).click();

  await expect(
    page.getByRole("button", { name: "Logout" }),
  ).toBeVisible();
}

export async function apiLogin(
  request: APIRequestContext,
  email: string,
) {
  const response = await request.post(`${API_URL}/api/auth/login`, {
    data: { email, password: PASSWORD },
  });

  expect(response.ok()).toBe(true);
}

export interface CreatedTicket {
  id: number;
  ticketNumber: string;
  summary: string;
}

// Creates a Ticket as the given Requester. The request context keeps the
// session cookie, so pass a fresh context per user.
export async function createTicketAs(
  request: APIRequestContext,
  email: string,
  summary: string,
): Promise<CreatedTicket> {
  await apiLogin(request, email);

  const [categories, systems] = await Promise.all([
    request.get(`${API_URL}/api/categories`).then((r) => r.json()),
    request.get(`${API_URL}/api/related-systems`).then((r) => r.json()),
  ]);

  const response = await request.post(`${API_URL}/api/tickets`, {
    data: {
      categoryId: categories[0].id,
      relatedSystemId: systems[0].id,
      summary,
      description: "Ticket created by the Lab 4 E2E tests.",
      requestedPriority: "MEDIUM",
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  const ticket = body.ticket ?? body;

  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    summary,
  };
}

// Ticket lists render a table on wide screens and cards on narrow ones,
// so pick whichever matching element is visible.
export async function clickVisible(locator: Locator) {
  await expect
    .poll(async () => {
      for (let i = 0; i < (await locator.count()); i += 1) {
        if (await locator.nth(i).isVisible()) {
          return true;
        }
      }

      return false;
    })
    .toBe(true);

  for (let i = 0; i < (await locator.count()); i += 1) {
    if (await locator.nth(i).isVisible()) {
      await locator.nth(i).click();
      return;
    }
  }
}

export async function openStaffTicket(page: Page, ticketNumber: string) {
  await page.getByRole("button", { name: "IT Ticket Queue" }).click();
  await page.locator("#staff-ticket-search").fill(ticketNumber);
  await clickVisible(
    page.locator(".ticket-link", { hasText: ticketNumber }),
  );

  await expect(
    page.getByText("IT Staff Ticket Detail", { exact: true }),
  ).toBeVisible();
}

export async function openRequesterTicket(
  page: Page,
  ticketNumber: string,
) {
  await page.getByRole("button", { name: "My Tickets" }).click();
  await page.locator("#ticket-search").fill(ticketNumber);
  await clickVisible(
    page.locator(".ticket-link", { hasText: ticketNumber }),
  );

  await expect(
    page.getByRole("heading", { name: "Ticket Detail" }),
  ).toBeVisible();
}

// Reads N from "Showing x to y of N tickets".
// An empty result shows a "No tickets ..." message instead, which is 0.
export async function readListTotal(page: Page): Promise<number> {
  const summary = page.getByText(/Showing \d+ to \d+ of \d+/).first();
  const empty = page.getByText(/No tickets/).first();

  await expect(summary.or(empty)).toBeVisible();

  if (await empty.isVisible()) {
    return 0;
  }

  const match = (await summary.innerText()).match(/of\s+(\d+)/);
  return Number(match?.[1] ?? NaN);
}
