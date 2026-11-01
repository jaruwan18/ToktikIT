import { expect, test } from "../../client/node_modules/@playwright/test/index.js";
import {
  USERS,
  createTicketAs,
  loginUi,
  openRequesterTicket,
  openStaffTicket,
  uniqueText,
} from "./helpers.js";

// docs/lab-04/tests.md §18.1 - Actions Taken flow.

test.describe("Lab 4 - Actions Taken flow", () => {
  test("IT Staff records and edits an Action Taken; the Requester can only view it", async ({
    browser,
    playwright,
  }) => {
    const api = await playwright.request.newContext();
    const ticket = await createTicketAs(
      api,
      USERS.requester,
      uniqueText("E2E Actions Taken"),
    );
    await api.dispose();

    const description = uniqueText("Restarted the print spooler");
    const editedResult = "Printer is back online after the restart.";

    // 1-2. IT Staff logs in and opens the Ticket.
    const staffContext = await browser.newContext();
    const staff = await staffContext.newPage();
    await loginUi(staff, USERS.staff);
    await openStaffTicket(staff, ticket.ticketNumber);

    // 3. IT Staff opens Actions Taken.
    const actions = staff.getByRole("region", { name: "Actions Taken" });
    await expect(actions.getByText("No Actions Taken yet.")).toBeVisible();

    // 4. IT Staff creates an Action Taken. Performed By is automatic.
    await actions.getByRole("button", { name: "Add Action Taken" }).click();
    await expect(actions.getByLabel("Action Date/Time")).not.toHaveValue("");
    await actions.getByLabel("Action Description").fill(description);
    await actions.getByLabel("Result").fill("Spooler restarted.");
    await actions.getByRole("button", { name: "Save Action Taken" }).click();

    // 5-6. The Action appears on the Ticket with the staff user's name.
    const row = actions.getByRole("row", { name: new RegExp(description) });
    await expect(row).toBeVisible();
    await expect(row).toContainText("Spooler restarted.");
    await expect(row).toContainText(USERS.staff);

    // 7. The Action can be edited by IT Staff.
    await row.getByRole("button", { name: "Edit" }).click();
    await actions.getByLabel("Result").fill(editedResult);
    await actions.getByRole("button", { name: "Save Changes" }).click();
    await expect(row).toContainText(editedResult);

    // A follow-up without a note is rejected by the form.
    await actions.getByRole("button", { name: "Add Action Taken" }).click();
    await actions.getByLabel("Action Description").fill("Checked toner level");
    await actions.getByLabel("Result").fill("Toner low.");
    await actions.getByLabel("Follow-Up Required?").check();
    await actions.getByRole("button", { name: "Save Action Taken" }).click();
    await expect(
      actions.getByText("Follow-up Note is required.").first(),
    ).toBeVisible();
    await actions.getByRole("button", { name: "Cancel" }).click();
    await staffContext.close();

    // 8. The Requester can view the Action on their own Ticket.
    const requesterContext = await browser.newContext();
    const requester = await requesterContext.newPage();
    await loginUi(requester, USERS.requester);
    await openRequesterTicket(requester, ticket.ticketNumber);

    const requesterActions = requester.getByRole("region", {
      name: "Actions Taken",
    });
    const requesterRow = requesterActions.getByRole("row", {
      name: new RegExp(description),
    });
    await expect(requesterRow).toContainText(editedResult);

    // 9. The Requester has no way to add or edit Actions Taken.
    await expect(
      requesterActions.getByRole("button", { name: "Add Action Taken" }),
    ).toHaveCount(0);
    await expect(
      requesterActions.getByRole("button", { name: "Edit" }),
    ).toHaveCount(0);

    await requesterContext.close();
  });
});
