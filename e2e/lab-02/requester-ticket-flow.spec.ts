import { test, expect } from "../../client/node_modules/@playwright/test/index.js";

test.describe("Lab 2 - Requester Ticket Flow", () => {
  // Since Lab 3 the app requires login, and the Requester comes from the
  // session instead of the old requester selector.
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    await page.locator("#login-email").fill("jennifer.anderson@example.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: "Login", exact: true }).click();

    await expect(
      page.getByRole("heading", { name: "My Tickets" }),
    ).toBeVisible();
  });

  test("E2E-01: requester can create a ticket and see the official ticket number", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Create Ticket", exact: true }).click();

    await expect(
      page.getByRole("heading", { name: "Create Ticket" }),
    ).toBeVisible();

    await page.locator("#create-category").selectOption({ index: 1 });
    await page.locator("#create-related-system").selectOption({ index: 1 });
    await page.locator("#create-priority").selectOption("MEDIUM");

    await page.locator("#create-summary").fill("E2E test ticket");

    await page
      .locator("#create-description")
      .fill("This ticket was created by the Lab 2 E2E test.");

    await page.getByRole("button", { name: "Submit Ticket" }).click();

    await expect(
      page.getByText("Ticket created successfully"),
    ).toBeVisible();

    const ticketNumberSection = page.locator(".ticket-number-success");

    await expect(ticketNumberSection).toBeVisible();

    await expect(ticketNumberSection).toContainText(
      /TKT-\d{4}-\d{6}/,
    );
  });

  test("E2E-02: requester sees their own ticket list without choosing a requester", async ({
    page,
  }) => {
    await expect(page.getByText("Jennifer Anderson")).toBeVisible();
    await expect(page.locator("#requester-selector")).toHaveCount(0);

    await expect(
      page.getByRole("heading", { name: "My Tickets" }),
    ).toBeVisible();
  });

  test("E2E-03: requester can open ticket detail and see attachment controls", async ({
    page,
  }) => {
    const ticketLinks = page.locator(".ticket-link");

    if ((await ticketLinks.count()) === 0) {
      await page.getByRole("button", { name: "Create Ticket" }).click();

      await page.locator("#create-category").selectOption({ index: 1 });
      await page.locator("#create-related-system").selectOption({ index: 1 });
      await page.locator("#create-priority").selectOption("LOW");

      await page
        .locator("#create-summary")
        .fill("Attachment E2E test ticket");

      await page
        .locator("#create-description")
        .fill("This ticket is used to test the attachment flow.");

      await page.getByRole("button", { name: "Submit Ticket" }).click();

      await expect(
        page.getByText("Ticket created successfully"),
      ).toBeVisible();

      await page.getByRole("button", { name: "View My Tickets" }).click();
    }

    await expect(page.locator(".ticket-link").first()).toBeVisible();

    await page.locator(".ticket-link").first().click();

    await expect(
      page.getByRole("heading", { name: "Ticket Detail" }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "← Back to My Tickets" }),
    ).toBeVisible();

    await expect(page.locator("#attachment-file")).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Upload Attachment" }),
    ).toBeVisible();
  });
});