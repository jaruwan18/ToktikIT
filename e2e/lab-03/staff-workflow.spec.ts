import { expect, Page, test } from "../../client/node_modules/@playwright/test/index.js";

const IT_STAFF_EMAIL = "it.alex@example.com";
const IT_STAFF_PASSWORD = "Password123!";

async function loginAsItStaff(page: Page) {
  await page.goto("/");

  await expect(page.locator("#login-email")).toBeVisible();
  await expect(page.locator("#login-password")).toBeVisible();

  await page.locator("#login-email").fill(IT_STAFF_EMAIL);
  await page.locator("#login-password").fill(IT_STAFF_PASSWORD);

  await page.getByRole("button", { name: "Login", exact: true }).click();

  await expect(
    page.getByRole("heading", {
      name: "IT Staff Ticket Queue",
      exact: true,
    }),
  ).toBeVisible();
}

async function getFirstTicketNumber(page: Page) {
  const ticketLinks = page.locator(".ticket-link");

  await expect(ticketLinks.first()).toBeAttached({
    timeout: 10000,
  });

  await expect
    .poll(async () => {
      for (let i = 0; i < await ticketLinks.count(); i += 1) {
        if (await ticketLinks.nth(i).isVisible()) {
          return true;
        }
      }

      return false;
    }, {
      timeout: 10000,
    })
    .toBe(true);

  for (let i = 0; i < await ticketLinks.count(); i += 1) {
    const ticketLink = ticketLinks.nth(i);

    if (await ticketLink.isVisible()) {
      return (await ticketLink.textContent())?.trim() ?? "";
    }
  }

  throw new Error("No visible ticket link found.");
}

async function openFirstTicket(page: Page, ticketNumber: string) {
  const ticketLinks = page.locator(".ticket-link", {
    hasText: ticketNumber,
  });

  await expect(ticketLinks.first()).toHaveCount(1, {
    timeout: 10000,
  });

  for (let i = 0; i < await ticketLinks.count(); i += 1) {
    const ticketLink = ticketLinks.nth(i);

    if (await ticketLink.isVisible()) {
      await ticketLink.click();

      await expect(
        page.getByText("IT Staff Ticket Detail", { exact: true }),
      ).toBeVisible({ timeout: 10000 });

      return;
    }
  }

  throw new Error(`No visible ticket link found for ${ticketNumber}.`);
}

test.describe("Lab 3 - IT Staff authenticated workflow", () => {
  test("Login -> Queue -> Ticket Detail -> Public Comment -> Internal Note", async ({
    page,
  }) => {
    await loginAsItStaff(page);

    await expect(
      page.getByRole("heading", {
        name: "IT Staff Ticket Queue",
        exact: true,
      }),
    ).toBeVisible();

    const ticketNumber = await getFirstTicketNumber(page);

    expect(ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);

    const searchInput = page.locator("#staff-ticket-search");

    await searchInput.fill(ticketNumber);

    await expect(
      page.locator(".ticket-link", {
        hasText: ticketNumber,
      }).first(),
    ).toBeVisible();

    await searchInput.fill("");

    const statusFilter = page.locator("#staff-status-filter");
    const statusOptions = statusFilter.locator("option");

    if ((await statusOptions.count()) > 1) {
      const statusValue = await statusOptions.nth(1).getAttribute("value");

      if (statusValue) {
        await statusFilter.selectOption(statusValue);

        await expect(statusFilter).toHaveValue(statusValue);
      }
    }

    const priorityFilter = page.locator("#staff-priority-filter");
    const priorityOptions = priorityFilter.locator("option");

    if ((await priorityOptions.count()) > 1) {
      const priorityValue = await priorityOptions.nth(1).getAttribute("value");

      if (priorityValue) {
        await priorityFilter.selectOption(priorityValue);

        await expect(priorityFilter).toHaveValue(priorityValue);
      }
    }

    await page.getByRole("button", { name: "Clear", exact: true }).click();

    await openFirstTicket(page, ticketNumber);

    await expect(
      page.getByRole("heading", {
        name: "Ticket Information",
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Messages",
        exact: true,
      }),
    ).toBeVisible();

    const publicComment = `E2E public comment ${Date.now()}`;

    await page.locator("#staff-message-type").selectOption("COMMENT");

    await page
      .locator("#staff-message-body")
      .fill(publicComment);

    await page.getByRole("button", {
      name: "Add Public Comment",
      exact: true,
    }).click();

    await expect(
      page.getByText(publicComment, { exact: true }),
    ).toBeVisible();

    const internalNote = `E2E internal note ${Date.now()}`;

    await page
      .locator("#staff-message-type")
      .selectOption("INTERNAL_NOTE");

    await page
      .locator("#staff-message-body")
      .fill(internalNote);

    await page.getByRole("button", {
      name: "Add Internal Note",
      exact: true,
    }).click();

    await expect(
      page.getByText(internalNote, { exact: true }),
    ).toBeVisible();

    await page.getByRole("button", {
      name: /Back to IT Ticket Queue/i,
    }).click();

    await expect(
      page.getByRole("heading", {
        name: "IT Staff Ticket Queue",
        exact: true,
      }),
    ).toBeVisible();
  });

  test("IT Staff Ticket Queue is usable on desktop, tablet, and mobile", async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 1280,
      height: 720,
    });

    await loginAsItStaff(page);

    await expect(
      page.getByRole("heading", {
        name: "IT Staff Ticket Queue",
        exact: true,
      }),
    ).toBeVisible();

    await expect(page.locator("table").first()).toBeVisible();

    await page.setViewportSize({
      width: 768,
      height: 1024,
    });

    await expect(
      page.getByRole("heading", {
        name: "IT Staff Ticket Queue",
        exact: true,
      }),
    ).toBeVisible();

    await expect(page.locator("body")).not.toHaveCSS(
      "overflow-x",
      "hidden",
    );

    await page.setViewportSize({
      width: 375,
      height: 667,
    });

    await expect(
      page.getByRole("heading", {
        name: "IT Staff Ticket Queue",
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.locator(".ticket-card").first(),
    ).toBeVisible();

    await expect(
      page.locator("#staff-ticket-search"),
    ).toBeVisible();

    await expect(
      page.locator("#staff-status-filter"),
    ).toBeVisible();

    await expect(
      page.locator("#staff-priority-filter"),
    ).toBeVisible();
  });
});