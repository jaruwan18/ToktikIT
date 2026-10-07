# TokTickIT Lab 4 Test Specification

## 1. Test Strategy

Lab 4 testing verifies that the new functionality works correctly while preserving the behavior implemented in Labs 1-3.

Testing shall cover:

* Unit tests
* API/integration tests
* UI component tests
* UI style tests
* Responsive tests
* Authorization tests
* Ticket workflow tests
* Migration tests
* Seed/idempotency tests
* Regression tests
* Performance-smoke tests
* End-to-end tests
* Accessibility checks

The test suite must verify both successful behavior and safe failure behavior.

Backend authorization is treated as the authoritative security boundary.

---

# 2. Test Scope

The Lab 4 test scope includes:

1. Actions Taken
2. Actions Taken authorization
3. Actions Taken validation
4. Ticket status workflow
5. Resolution rule
6. Requester Dashboard
7. IT Staff Dashboard
8. Dashboard ownership protection
9. Dashboard drill-down
10. Concurrency and stale updates
11. Duplicate/retry safety
12. Database migration
13. Seed idempotency
14. Lab 1-3 regression
15. Responsive behavior
16. Accessibility
17. Visual consistency
18. Safe API failures
19. End-to-end workflows
20. Performance smoke checks

---

# 3. Test Levels

## 3.1 Unit Tests

Unit tests shall verify isolated business logic where practical.

Examples:

* Ticket status transition validation
* Resolution rule validation
* Dashboard metric calculations
* Follow-up note validation
* Action Taken validation
* Ownership checks
* Role checks
* Date/time boundary calculations

Unit tests should not depend on unnecessary external services.

---

## 3.2 API / Integration Tests

API tests shall verify:

* authentication
* authorization
* request validation
* database behavior
* Actions Taken operations
* Ticket workflow operations
* dashboard calculations
* ownership protection
* conflict handling
* safe error responses

API tests shall use the existing TokTickIT server testing conventions.

---

## 3.3 UI Component Tests

UI component tests shall verify:

* rendering
* user interaction
* validation messages
* loading states
* empty states
* error states
* forbidden states
* successful operations
* role-based visibility
* keyboard interaction
* responsive behavior where practical

---

## 3.4 UI Style Tests

UI style verification shall check:

* Zen Green design consistency
* spacing
* typography
* buttons
* cards
* tables
* status indicators
* priority indicators
* modal/dialog behavior
* visual distinction between shared and private/internal information

---

## 3.5 End-to-End Tests

E2E tests shall verify important complete user flows across the application.

Required E2E flows include:

* Actions Taken creation
* Ticket resolution
* Requester Dashboard
* IT Staff Dashboard

---

# 4. Actions Taken API Tests

Test file:

```text
server/tests/lab-04/actions-taken.api.test.ts
```

## API-AT-01 Unauthenticated Retrieval

Given an unauthenticated user, when the user requests Actions Taken, the API returns:

```text
401 Unauthorized
```

---

## API-AT-02 Requester Can View Owned Ticket Actions

Given an authenticated Requester who owns a Ticket, when the Requester requests its Actions Taken, the API returns:

```text
200 OK
```

and only Actions belonging to that Ticket are returned.

---

## API-AT-03 Requester Cannot View Another User's Ticket Actions

Given an authenticated Requester who does not own a Ticket, when the Requester requests its Actions Taken, the API rejects the request safely.

Expected result:

```text
403 Forbidden
```

or the existing application-safe not-found behavior.

---

## API-AT-04 Requester Cannot Create Action

Given an authenticated Requester, when the Requester attempts to create an Action Taken, the API returns:

```text
403 Forbidden
```

The Action Taken must not be created.

---

## API-AT-05 Requester Cannot Update Action

Given an authenticated Requester, when the Requester attempts to update an Action Taken, the API returns:

```text
403 Forbidden
```

The Action Taken must remain unchanged.

---

## API-AT-06 IT Staff Can Create Action

Given an authenticated authorized IT Staff user and an accessible Ticket, when valid Action Taken data is submitted, the API returns:

```text
201 Created
```

and creates the Action Taken under the correct Ticket.

---

## API-AT-07 Admin Can Create Action

Given an authenticated Admin user and an accessible Ticket, when valid Action Taken data is submitted, the API returns:

```text
201 Created
```

---

## API-AT-08 IT Staff Can Update Action

Given an authorized IT Staff user and an existing Action Taken, when valid update data is submitted, the API returns:

```text
200 OK
```

and the Action Taken is updated.

---

## API-AT-09 Admin Can Update Action

Given an Admin user and an existing Action Taken, when valid update data is submitted, the API returns:

```text
200 OK
```

---

## API-AT-10 Follow-up Note Validation

Given:

```text
followUpRequired = true
```

and no follow-up note, when the Action Taken is submitted, the API returns:

```text
400 Bad Request
```

The Action Taken must not be created or updated.

---

## API-AT-11 Authenticated Performer

Given an authenticated IT Staff/Admin user, when an Action Taken is created, the backend records the authenticated user as the performer.

The client must not be able to impersonate another user.

---

## API-AT-12 Inactive User Validation

Given an inactive user, when the operation requires an active performer, the API rejects the operation safely.

The inactive user must not be accepted as a new performer.

---

## API-AT-13 Multiple Actions

Given a Ticket, when zero, one, or multiple Actions Taken are created, the API correctly stores and retrieves all valid Actions without losing Ticket data.

---

## API-AT-14 Non-existent Ticket

Given a Ticket ID that does not exist, when an Action Taken operation is requested, the API returns:

```text
404 Not Found
```

or the existing safe not-found behavior.

---

## API-AT-15 Non-existent Action

Given an Action ID that does not exist, when an update is requested, the API returns:

```text
404 Not Found
```

---

## API-AT-16 Duplicate/Retry Safety

Given a repeated submission caused by a duplicate click or safe network retry, the system must not create unintended duplicate Actions Taken.

---

# 5. Ticket Workflow API Tests

Test file:

```text
server/tests/lab-04/ticket-workflow.api.test.ts
```

## API-WF-01 Authentication

Unauthenticated status updates return:

```text
401 Unauthorized
```

---

## API-WF-02 Requester Cannot Perform Formal Transition

Given an authenticated Requester, when the Requester attempts to change a Ticket status through the formal workflow endpoint, the API returns:

```text
403 Forbidden
```

---

## API-WF-03 IT Staff Can Perform Allowed Transition

Given an authorized IT Staff user, when a valid transition is requested, the API accepts the transition.

---

## API-WF-04 Admin Can Perform Allowed Transition

Given an Admin user, when a valid transition is requested, the API accepts the transition.

---

## API-WF-05 New to Open

The transition:

```text
New → Open
```

is accepted for IT Staff/Admin.

---

## API-WF-06 New to Cancelled

The transition:

```text
New → Cancelled
```

is accepted for IT Staff/Admin.

---

## API-WF-07 Open to In Progress

The transition:

```text
Open → In Progress
```

is accepted.

---

## API-WF-08 Open to Waiting for Requester

The transition:

```text
Open → Waiting for Requester
```

is accepted.

---

## API-WF-09 In Progress to Resolved

The transition:

```text
In Progress → Resolved
```

is accepted only when the resolution rule is satisfied.

---

## API-WF-10 Waiting for Requester to Resolved

The transition:

```text
Waiting for Requester → Resolved
```

is accepted only when the resolution rule is satisfied.

---

## API-WF-11 Resolved to Closed

The transition:

```text
Resolved → Closed
```

is accepted.

---

## API-WF-12 Resolved to Reopened

The transition:

```text
Resolved → Reopened
```

is accepted.

---

## API-WF-13 Closed to Reopened

The transition:

```text
Closed → Reopened
```

is accepted.

---

## API-WF-14 Invalid Transition

A transition that is not included in the approved transition matrix must be rejected.

Expected result:

```text
409 Conflict
```

The Ticket status must remain unchanged.

---

## API-WF-15 Resolution Rule

When the Ticket does not satisfy the required resolution conditions, an attempt to move the Ticket to:

```text
Resolved
```

must return:

```text
409 Conflict
```

with:

```text
RESOLUTION_NOT_ALLOWED
```

---

## API-WF-16 Stale Update

Given a Ticket that has been changed by another operation, a stale update must not silently overwrite the newer state.

Expected result:

```text
409 Conflict
```

---

# 6. Requester Dashboard API Tests

Test file:

```text
server/tests/lab-04/requester-dashboard.api.test.ts
```

## API-RD-01 Unauthenticated Access

Unauthenticated users requesting the Requester Dashboard receive:

```text
401 Unauthorized
```

---

## API-RD-02 Authenticated Requester Access

An authenticated Requester can retrieve their dashboard.

Expected result:

```text
200 OK
```

---

## API-RD-03 Own Data Only

The dashboard contains only Tickets belonging to the authenticated Requester.

---

## API-RD-04 Requester ID Cannot Be Impersonated

A Requester must not be able to provide another Requester's ID and receive that user's dashboard data.

---

## API-RD-05 Total Open Calculation

The `totalOpen` metric is calculated from the authenticated Requester's Tickets using the approved workflow definition.

---

## API-RD-06 Waiting for Requester Calculation

The `waitingForRequester` metric correctly counts Tickets whose status is:

```text
Waiting for Requester
```

---

## API-RD-07 Recently Updated Calculation

The `recentlyUpdated` metric correctly follows the defined recent time window and timezone convention.

---

## API-RD-08 Recently Resolved Calculation

The `recentlyResolved` metric correctly follows the defined recent time window and timezone convention.

---

## API-RD-09 Empty Dashboard

When the Requester has no matching Tickets, the API returns valid zero/empty values.

Example:

```json
{
  "metrics": {
    "totalOpen": 0,
    "waitingForRequester": 0,
    "recentlyUpdated": 0,
    "recentlyResolved": 0
  },
  "recentTickets": []
}
```

---

## API-RD-10 Concise Dashboard Response

The dashboard endpoint returns metric data and relevant recent Ticket summaries rather than an unnecessary full Ticket collection.

---

# 7. IT Staff Dashboard API Tests

Test file:

```text
server/tests/lab-04/staff-dashboard.api.test.ts
```

## API-SD-01 Unauthenticated Access

Unauthenticated users receive:

```text
401 Unauthorized
```

---

## API-SD-02 Requester Access Denied

A Requester attempting to access the Staff Dashboard receives:

```text
403 Forbidden
```

---

## API-SD-03 IT Staff Access

An authorized IT Staff user can retrieve the Staff Dashboard.

Expected result:

```text
200 OK
```

---

## API-SD-04 Admin Access

An Admin can retrieve the Staff Dashboard.

---

## API-SD-05 Unassigned Calculation

The `unassigned` metric correctly counts Tickets without a Ticket Owner/assignee according to the existing data model.

---

## API-SD-06 Current User Owned Calculation

The `currentUserOwned` metric correctly counts Tickets assigned to the authenticated IT Staff user.

---

## API-SD-07 Status Summary

The dashboard correctly returns counts grouped by supported Ticket status.

---

## API-SD-08 Priority Summary

The dashboard correctly returns counts grouped by existing Ticket priority values.

---

## API-SD-09 Recent Tickets

The dashboard returns the appropriate recently updated accessible Tickets according to the defined time window.

---

## API-SD-10 Empty Metrics

When there are no matching records, the dashboard returns valid zero/empty results rather than an error.

---

# 8. UI Component Tests

## 8.1 StaffDashboard

Test file:

```text
client/src/**/lab-04 tests/StaffDashboard.test.tsx
```

The test shall verify:

* dashboard renders
* metric cards render
* unassigned metric displays
* current-user-owned metric displays
* status summary displays
* priority summary displays
* recent Tickets display
* loading state displays
* empty state displays
* API failure state displays
* forbidden state displays
* metric drill-down works
* role restrictions work

---

## 8.2 RequesterDashboard

Test file:

```text
client/src/**/lab-04 tests/RequesterDashboard.test.tsx
```

The test shall verify:

* dashboard renders
* own Ticket metrics render
* total open displays
* waiting for requester displays
* recently updated displays
* recently resolved displays
* only authenticated Requester data is displayed
* loading state displays
* empty state displays
* API failure state displays
* drill-down works
* My Tickets is not unnecessarily duplicated

---

## 8.3 ActionsTaken

Test file:

```text
client/src/**/lab-04 tests/ActionsTaken.test.tsx
```

The test shall verify:

* Actions Taken list renders
* empty Actions Taken state renders
* Action Date/Time renders
* Action Description renders
* Result renders
* Performed By renders
* Follow-Up Required renders
* Follow-up Note renders
* Attachment Notes renders
* authorized staff can open create form
* authorized staff can edit an Action
* Requester sees read-only Actions
* validation message displays
* follow-up note validation works
* loading state works
* error state works
* forbidden state works
* form data is preserved after recoverable failure

---

## 8.4 TicketWorkflow

Test file:

```text
client/src/**/lab-04 tests/TicketWorkflow.test.tsx
```

The test shall verify:

* current Ticket status displays
* permitted transitions are shown
* invalid transitions are not offered
* Requester does not receive formal transition controls
* resolution guidance displays
* backend workflow errors display safely
* successful transition refreshes Ticket summary
* conflict/stale update state displays correctly

---

# 9. Responsive Tests

Lab 4 screens shall be tested at:

* desktop
* tablet
* mobile

The following shall be verified:

* no clipped content
* no overlapping controls
* no inaccessible forms
* no inaccessible dialogs
* no unnecessary horizontal page scrolling
* metric cards remain readable
* tables remain usable
* buttons remain accessible
* forms remain usable
* navigation remains usable

Required screens:

* IT Staff Dashboard
* Requester Dashboard
* Ticket Detail
* Actions Taken
* Ticket Workflow controls

---

# 10. Accessibility Tests

Accessibility testing shall verify:

## 10.1 Keyboard Navigation

All important interactive controls must be reachable by keyboard.

---

## 10.2 Visible Focus

Keyboard focus must be clearly visible.

---

## 10.3 Semantic Labels

Form controls, buttons, dialogs, and important status information must have meaningful semantic labels.

---

## 10.4 Non-color Status Indicators

Ticket status and priority must not depend only on color.

Text, icons, labels, or other non-color indicators must be available where appropriate.

---

## 10.5 Dialog Accessibility

Dialogs must:

* be reachable by keyboard
* have meaningful labels
* provide accessible controls
* allow users to close them appropriately
* not trap users unexpectedly

---

# 11. UI Style Verification

The following visual requirements shall be checked:

* Zen Green design language remains consistent
* existing typography conventions remain consistent
* buttons follow existing styling
* cards follow existing styling
* spacing remains consistent
* Ticket status and priority remain visually understandable
* private/internal information remains visually distinct where applicable
* no unfinished placeholder UI remains
* no broken or obsolete controls remain

---

# 12. Migration Tests

Migration testing shall verify:

## MIG-01 Existing Data Preservation

Existing Lab 1-3 data remains available after the migration.

---

## MIG-02 Existing Tickets

Existing Tickets remain valid after the Actions Taken model is introduced.

---

## MIG-03 Zero Actions

Existing Tickets can have zero Actions Taken.

---

## MIG-04 Relationships

Ticket-to-Actions and User-to-Actions relationships are valid.

---

## MIG-05 Migration Failure Safety

Migration failures do not silently corrupt existing data.

---

# 13. Seed Tests

## SEED-01 Seed Completes

The seed process completes successfully on a clean database.

---

## SEED-02 Seed Idempotency

Running the seed repeatedly does not create unintended duplicate records.

---

## SEED-03 Zero Actions

Seed data contains Tickets with zero Actions Taken.

---

## SEED-04 One Action

Seed data contains Tickets with one Action Taken.

---

## SEED-05 Multiple Actions

Seed data contains Tickets with multiple Actions Taken.

---

## SEED-06 Assigned Tickets

Seed data contains assigned Tickets.

---

## SEED-07 Unassigned Tickets

Seed data contains unassigned Tickets.

---

## SEED-08 Status Coverage

Seed data includes major Ticket statuses.

---

## SEED-09 Priority Coverage

Seed data includes major Ticket priorities.

---

# 14. Regression Tests

Lab 4 must not break required Lab 1-3 functionality.

Regression testing shall cover:

* authentication
* login
* logout
* role-based access
* Requester behavior
* IT Staff behavior
* Administrator behavior
* user management
* My Tickets
* Ticket creation
* Ticket Detail
* public comments
* internal notes
* attachments
* attachment authorization
* existing navigation
* existing API behavior

All required existing tests shall pass before final integration.

---

# 15. Security and Authorization Tests

Security testing shall verify:

* unauthenticated users cannot access protected endpoints
* Requesters cannot perform staff-only operations
* Requesters cannot modify Actions Taken
* Requesters cannot access another Requester's dashboard
* Requesters cannot impersonate another requester
* unauthorized users cannot change Ticket status
* inactive users cannot be used where active-user validation is required
* backend authorization works even when frontend controls are bypassed
* sensitive backend information is not exposed in API errors

---

# 16. Conflict and Safe Failure Tests

The system shall be tested for:

* stale Ticket update
* concurrent update
* invalid status transition
* resolution rule failure
* duplicate submission
* repeated button click
* network retry
* invalid Ticket ID
* invalid Action ID
* unauthorized resource access
* server-side failure

The UI must show a safe and understandable message.

Recoverable form data should be preserved where possible.

---

# 17. Performance-Smoke Tests

Performance-smoke testing shall verify that:

* dashboard endpoints respond within a reasonable time for seeded test data
* Actions Taken retrieval remains usable with multiple Actions
* Ticket status updates remain responsive
* dashboard queries do not unnecessarily retrieve the complete Ticket dataset
* repeated dashboard requests do not cause obvious uncontrolled query growth

The goal is smoke-level verification, not production-scale benchmarking.

---

# 18. End-to-End Tests

Required E2E directory:

```text
e2e/lab-04/
```

Required files:

```text
e2e/lab-04/
├── actions-taken-flow.spec.ts
├── ticket-resolution.spec.ts
└── dashboards.spec.ts
```

---

## 18.1 Actions Taken E2E

The E2E flow shall verify:

1. IT Staff logs in.
2. IT Staff opens an accessible Ticket.
3. IT Staff opens Actions Taken.
4. IT Staff creates an Action Taken.
5. The Action appears on the Ticket.
6. The Action can be viewed.
7. The Action can be edited when permitted.
8. Requester can view the Action.
9. Requester cannot edit the Action.

---

## 18.2 Ticket Resolution E2E

The E2E flow shall verify:

1. IT Staff logs in.
2. IT Staff opens an assigned/accessible Ticket.
3. Ticket status is changed through permitted transitions.
4. Invalid transitions are not accepted.
5. Resolution conditions are checked.
6. Ticket can move to `Resolved` only when the resolution rule is satisfied.
7. Ticket can move to `Closed` according to the workflow.
8. Ticket can be reopened according to the workflow.

---

## 18.3 Dashboard E2E

The E2E flow shall verify:

### IT Staff

1. IT Staff logs in.
2. Staff Dashboard is accessible.
3. Operational metrics display.
4. Metric drill-down works.
5. Recent Tickets can be opened.

### Requester

1. Requester logs in.
2. Requester Dashboard is accessible.
3. Only the Requester's own metrics display.
4. Recent Tickets belong only to that Requester.
5. Dashboard drill-down works.
6. Another Requester's data cannot be accessed.

---

# 19. Acceptance Criteria Traceability

Every acceptance criterion in `specification.md` must map to at least one planned test.

| Acceptance Criterion                | Planned Test Coverage                                            |
| ----------------------------------- | ---------------------------------------------------------------- |
| AC-01 Actions Taken Creation        | API-AT-06, API-AT-07, E2E Actions Taken                          |
| AC-02 Requester Dashboard Ownership | API-RD-03, API-RD-04, E2E Dashboard                              |
| AC-03 Requester Actions Read-only   | API-AT-04, API-AT-05, ActionsTaken UI                            |
| AC-04 Multiple Actions              | API-AT-13, Migration/Seed Tests                                  |
| AC-05 Follow-up Validation          | API-AT-10, ActionsTaken UI                                       |
| AC-06 Ticket Status Validation      | API-WF-03 to API-WF-14, TicketWorkflow UI                        |
| AC-07 Resolution Gate               | API-WF-15, Ticket Resolution E2E                                 |
| AC-08 Dashboard Metrics             | API-RD-05 to API-RD-08, API-SD-05 to API-SD-09                   |
| AC-09 Dashboard Drill-down          | Dashboard UI tests, Dashboard E2E                                |
| AC-10 Authorization                 | API-AT-01 to API-AT-05, API-WF-01/02, API-RD-01/04, API-SD-01/02 |
| AC-11 Conflict Handling             | API-WF-16, conflict UI tests                                     |
| AC-12 Regression                    | Lab 1-3 regression suite                                         |
| AC-13 Responsive UI                 | Responsive tests                                                 |
| AC-14 Accessibility                 | Accessibility tests                                              |
| AC-15 Seed and Migration            | Migration Tests, Seed Tests                                      |

---

# 20. Test Evidence

The following evidence shall be collected during implementation and final verification:

* passing API test output
* passing UI test output
* passing E2E test output
* migration verification
* seed verification
* regression test output
* responsive screenshots
* accessibility verification
* Staff Dashboard screenshots
* Requester Dashboard screenshots
* Actions Taken screenshots
* Ticket Workflow screenshots

Evidence shall be stored or referenced according to the Lab 4 submission requirements.

---

# 21. Required Test File Structure

The expected Lab 4 test structure is:

```text
server/tests/lab-04/
├── actions-taken.api.test.ts
├── ticket-workflow.api.test.ts
├── requester-dashboard.api.test.ts
└── staff-dashboard.api.test.ts
```

```text
client/
└── .../
    └── lab-04 tests/
        ├── StaffDashboard.test.tsx
        ├── RequesterDashboard.test.tsx
        ├── ActionsTaken.test.tsx
        └── TicketWorkflow.test.tsx
```

```text
e2e/lab-04/
├── actions-taken-flow.spec.ts
├── ticket-resolution.spec.ts
└── dashboards.spec.ts
```

---

# 22. Test Definition of Done

Testing for Lab 4 is complete when:

* Unit tests are implemented where appropriate.
* Actions Taken API tests pass.
* Ticket workflow API tests pass.
* Requester Dashboard API tests pass.
* IT Staff Dashboard API tests pass.
* UI component tests pass.
* Responsive behavior is verified.
* Accessibility behavior is verified.
* Migration tests pass.
* Seed idempotency is verified.
* Lab 1-3 regression tests pass.
* Performance-smoke checks pass.
* E2E tests pass.
* Authorization tests pass.
* Conflict and stale-update behavior is verified.
* Safe API failure behavior is verified.
* Acceptance Criteria traceability is complete.
* Required evidence is collected.
* No known critical regression remains.

The test plan must remain consistent with:

```text
docs/lab-04/specification.md
docs/lab-04/ui-spec.md
docs/lab-04/api-spec.md
```
