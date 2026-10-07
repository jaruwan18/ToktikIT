# TokTickIT Lab 4 Specification

## 1. Sprint Goal

Lab 4 completes the core TokTickIT service-desk workflow by adding Actions Taken tracking, enforcing the final Ticket workflow, providing role-appropriate dashboards, and hardening the complete application from Labs 1-3.

The increment must preserve existing authentication, authorization, Requester, IT Staff, Administrator, Ticket, comment, note, and attachment behavior while adding the required Lab 4 functionality.

---

## 2. Stakeholder Request

The service desk needs a reliable way to record the actual work performed on each Ticket.

IT Staff and Administrators must be able to record Actions Taken under a Ticket, including the action date/time, description, result, performer, follow-up requirement, follow-up note, and attachment notes.

The primary Ticket Owner remains responsible for coordinating the Ticket, but another authorized IT Staff member may perform and record an Action Taken.

Requesters must be able to see Actions Taken for their Tickets but must not create or modify them.

The system must also provide concise dashboards for Requesters and IT Staff, enforce the complete Ticket lifecycle, and preserve the behavior implemented in Labs 1-3.

---

## 3. Scope

### 3.1 Included

Lab 4 includes:

1. Actions Taken data model and Ticket relationship.
2. Actions Taken create, retrieve, and update behavior.
3. Authentication and authorization for Actions Taken.
4. Validation of performers/assignees.
5. Ticket status transition rules.
6. Ticket resolution rule.
7. Requester dashboard.
8. IT Staff dashboard.
9. Dashboard metrics and drill-down behavior.
10. Database migration and seed updates.
11. API changes required for the new functionality.
12. Responsive UI changes.
13. Accessibility improvements required by the Lab 4 contract.
14. Regression testing for Labs 1-3.
15. Security, authorization, concurrency, and safe-failure hardening.
16. Final visual consistency using the existing Zen Green design language.

### 3.2 Explicit Exclusions

The following are outside the Lab 4 scope:

- Automatic SLA clocks.
- Automatic escalation.
- On-call scheduling.
- External notifications or messaging.
- Inventory management.
- Purchasing.
- Cost accounting.
- Payroll.
- Multi-level approvals.
- Electronic signatures.
- Advanced BI/report builders.
- Data warehouse/export systems.
- Multi-tenant production cloud operations.
- New features not approved by the Lab 4 handout or Engineering Contract.

---

## 4. Functional Requirements

### FR-01 Actions Taken

The system shall allow an authorized IT Staff member or Administrator to create an Actions Taken record under a Ticket.

Each Action Taken shall contain:

- Action Date/Time
- Action Description
- Result
- Performed By
- Follow-Up Required
- Follow-up Note when follow-up is required
- Attachment Notes

The authenticated user is recorded automatically as the creator/performer according to the approved API behavior.

### FR-02 Multiple Actions

A Ticket may contain zero, one, or multiple Actions Taken records.

An Action Taken belongs to exactly one Ticket.

### FR-03 Ticket Owner

A Ticket may have one primary Ticket Owner responsible for coordinating the Ticket.

The Ticket Owner does not have to be the person who performs every Action Taken.

### FR-04 Requester Actions Access

An authenticated Requester may view Actions Taken belonging to Tickets they own.

A Requester shall not create or modify Actions Taken.

### FR-05 IT Staff Actions Access

Authorized IT Staff may create and update Actions Taken for Tickets they are permitted to access.

### FR-06 Administrator Actions Access

Administrators shall have the same Actions Taken capabilities as IT Staff, subject to the final authorization implementation.

### FR-07 Ticket Workflow

The system shall support the following Ticket statuses:

1. New
2. Open
3. In Progress
4. Waiting for Requester
5. Resolved
6. Closed
7. Reopened
8. Cancelled

The backend shall enforce valid status transitions.

### FR-08 Resolution Rule

A Ticket shall not be moved to `Resolved` unless the required resolution conditions defined in the approved workflow are satisfied.

The backend is authoritative for this rule.

The UI may guide users but must not be treated as the security or business-rule boundary.

### FR-09 Requester Resolution Feedback

Requesters may indicate that a problem appears resolved.

This does not directly perform the formal IT Staff workflow transition.

IT Staff must review the work and formally update the Ticket status.

### FR-10 IT Staff Dashboard

The IT Staff Dashboard shall provide concise operational information.

The dashboard may include approved metrics such as:

- Unassigned Tickets
- Current-user-owned Tickets
- Status summaries
- Priority summaries
- Recently updated Tickets
- Other operational metrics explicitly approved by the Engineering Contract

Every metric must have a defined calculation and drill-down behavior.

### FR-11 Requester Dashboard

The Requester Dashboard shall summarize only the authenticated Requester's Tickets.

The approved metrics include:

- Total open Tickets
- Tickets waiting for requester
- Recently updated Tickets
- Recently resolved Tickets

The dashboard shall not expose another Requester's data.

### FR-12 Dashboard Drill-down

Every actionable dashboard card or item shall provide a path to the relevant detailed Ticket Queue, Ticket Detail, or filtered view.

Dashboard endpoints should return concise metric data rather than entire Ticket collections.

### FR-13 Loading and Failure States

Lab 4 screens shall define and implement appropriate behavior for:

- Loading
- Empty results
- Validation errors
- Forbidden access
- Not found
- Conflicts/stale updates
- Safe API failures
- Successful operations

### FR-14 Duplicate/Retry Safety

Repeated clicks or safe network retries shall not create unintended duplicate Actions Taken or other duplicate workflow changes.

### FR-15 Regression

Existing Lab 1-3 functionality must continue to work, including:

- Authentication
- Authorization
- Requester behavior
- IT Staff behavior
- Administrator behavior
- My Tickets
- Ticket Detail
- Public comments
- Internal notes
- Attachments
- User management
- Existing navigation

---

## 5. Business Rules

### BR-01 Action Ownership

Each Actions Taken record belongs to exactly one Ticket.

### BR-02 Action Performer

An Action Taken records the authenticated user who performs/creates the action according to the API contract.

The performer must be an authorized active user.

### BR-03 Ticket Owner

A Ticket has at most one primary Ticket Owner.

The Ticket Owner is responsible for coordinating the Ticket but may differ from the performer of an Action Taken.

### BR-04 Action Date/Time

Action Date/Time is stored as a date-time value.

The API shall use an unambiguous ISO 8601 representation.

### BR-05 Follow-up Validation

If `Follow-Up Required` is true, `Follow-up Note` is required.

If follow-up is not required, the follow-up note may be empty.

### BR-06 Requester Read-only

Requesters can view Actions Taken for their own Tickets but cannot create or modify Actions Taken.

### BR-07 Backend Authorization

Every protected write operation must be authorized by the backend.

Hiding a UI control is not considered authorization.

### BR-08 Inactive Users

Inactive users must not be accepted as new performers/assignees where the operation requires an active user.

### BR-09 Ticket Status Authority

The backend is authoritative for Ticket status transitions.

The UI only exposes transitions allowed for the current user and current Ticket state.

### BR-10 Status Transition Safety

A status update must validate the current Ticket status and the requested next status.

Invalid transitions must return a safe conflict/validation response rather than silently changing the Ticket.

### BR-11 Resolution Gate

A Ticket cannot enter `Resolved` when the required resolution conditions are not satisfied.

The exact conditions are defined by the final approved workflow and must be enforced by the backend.

### BR-12 Closed Tickets

A Ticket in `Closed` state must follow the approved workflow rules before another status can be selected.

### BR-13 Reopened Tickets

A Ticket may return to an active workflow through `Reopened` only through an approved transition.

### BR-14 Cancelled Tickets

A Ticket in `Cancelled` state cannot be changed through an arbitrary status update.

Any permitted transition must be explicitly included in the transition matrix.

### BR-15 Requester Dashboard Ownership

Requester dashboard queries must derive ownership from the authenticated requester identity.

A requester-provided arbitrary owner/requester ID must not be trusted for authorization.

### BR-16 Staff Dashboard Authorization

Staff operational metrics must only be available to authorized IT Staff/Admin users.

### BR-17 Dashboard Empty State

When a metric has no matching records, the API shall return a valid zero/empty result rather than an error.

### BR-18 Dashboard Date Boundaries

Where dashboard metrics depend on time ranges, the API contract shall define the timezone and date boundaries consistently.

### BR-19 Data Preservation

Database migration must preserve existing Lab 1-3 data.

Existing Tickets must remain valid even when they have zero Actions Taken.

### BR-20 Seed Idempotency

The seed process must be safe to execute repeatedly without creating unintended duplicate records.

Seed data must include Tickets representing zero, one, and multiple Actions Taken where required for testing.

---

## 6. Ticket Status Transition Matrix

The following matrix is the proposed Lab 4 implementation decision.

| Current Status | Next Status | Allowed Role | Notes |
|---|---|---|---|
| New | Open | IT Staff, Admin | Start processing |
| New | Cancelled | IT Staff, Admin | Cancel when appropriate |
| Open | In Progress | IT Staff, Admin | Work begins |
| Open | Waiting for Requester | IT Staff, Admin | Requester input required |
| Open | Cancelled | IT Staff, Admin | Cancel when appropriate |
| In Progress | Waiting for Requester | IT Staff, Admin | Requester input required |
| In Progress | Resolved | IT Staff, Admin | Resolution gate required |
| In Progress | Cancelled | IT Staff, Admin | Cancel when appropriate |
| Waiting for Requester | In Progress | IT Staff, Admin | Requester responded |
| Waiting for Requester | Resolved | IT Staff, Admin | Resolution gate required |
| Waiting for Requester | Cancelled | IT Staff, Admin | Cancel when appropriate |
| Resolved | Closed | IT Staff, Admin | Final closure |
| Resolved | Reopened | IT Staff, Admin | Work needs to continue |
| Closed | Reopened | IT Staff, Admin | Reopen after closure |
| Reopened | In Progress | IT Staff, Admin | Resume work |
| Reopened | Waiting for Requester | IT Staff, Admin | Requester input required |
| Reopened | Resolved | IT Staff, Admin | Resolution gate required |
| Reopened | Cancelled | IT Staff, Admin | Cancel when appropriate |

Requester users do not directly perform formal Ticket status transitions.

The exact transition matrix is an implementation decision because the handout requires students to define the complete matrix but does not prescribe every individual transition.

---

## 7. UI Specification Summary

Lab 4 extends the existing application rather than replacing the existing screens.

Required areas:

### 7.1 IT Staff Dashboard

- Operational metric cards
- Recent/urgent Ticket information where approved
- Drill-down to detailed views
- Loading state
- Empty state
- Forbidden state
- Safe API failure state
- Responsive layout

### 7.2 Requester Dashboard

- Own Ticket metrics only
- Recent/attention-required Ticket information
- Drill-down to Ticket Detail or filtered views
- No duplication of the full My Tickets screen
- Loading, empty, forbidden, and safe-failure states
- Responsive layout

### 7.3 Actions Taken on Ticket Detail

The existing Ticket Detail screen shall include:

- Actions Taken list/table
- Create mode for authorized staff
- View/edit mode
- Action Date/Time
- Action Description
- Result
- Performed By
- Follow-Up Required
- Follow-up Note
- Attachment Notes

Requesters have read-only access.

### 7.4 Ticket Workflow

Status controls shall:

- Show only permitted transitions
- Provide validation feedback
- Prevent invalid transitions
- Show backend errors safely
- Refresh the Ticket summary after successful status changes

### 7.5 Visual and Accessibility Requirements

The UI shall preserve the Zen Green design language and existing UI conventions.

The application shall provide:

- Visible keyboard focus
- Keyboard operation
- Semantic labels
- Non-color status cues
- Responsive layouts
- No clipped content
- No overlapping controls
- No inaccessible dialogs
- No unnecessary horizontal page scrolling

Detailed UI behavior is defined in `ui-spec.md`.

---

## 8. Data Changes

### 8.1 Actions Taken Model

The Lab 4 data model introduces a parent-child relationship:

```text
Ticket
  └── 0..N ActionsTaken

An Actions Taken record contains at minimum:

id
ticketId
actionDateTime
actionDescription
result
performedById
followUpRequired
followUpNote
attachmentNotes
createdAt
updatedAt

The exact database types and naming must follow the existing Prisma conventions.

8.2 Relationships
Ticket 1 ──── N ActionsTaken

User 1 ──── N ActionsTaken

performedById identifies the authenticated user responsible for the Action Taken.

8.3 Indexes

Indexes should support:

Ticket-based Action retrieval
Action date/time ordering
Performer-based queries when required
8.4 Migration

The migration must:

Add the Actions Taken table/model.
Preserve all existing records.
Allow existing Tickets to have zero Actions Taken.
Preserve existing relationships.
Fail safely if migration prerequisites are not satisfied.
8.5 Backfill

No historical Actions Taken records exist in earlier Labs unless discovered in the existing repository.

Therefore no artificial historical Actions Taken records should be created during migration.

Seed data may create representative Actions Taken records for testing.

8.6 Seed

Seed data should include:

Tickets with zero Actions Taken
Tickets with one Action Taken
Tickets with multiple Actions Taken
Assigned Tickets
Unassigned Tickets
Major Ticket statuses
Major Ticket priorities
Active users
Relevant inactive-user cases

The seed must remain idempotent.

9. API Contract Summary

The API shall preserve existing Lab 1-3 APIs.

Lab 4 adds endpoints for:

Actions Taken retrieval
Actions Taken creation
Actions Taken update
Ticket workflow/status updates
IT Staff dashboard data
Requester dashboard data

The detailed endpoint contracts are defined in api-spec.md.

Every protected operation must enforce backend authorization.

10. Acceptance Criteria
AC-01 Actions Taken Creation

Given an authorized IT Staff/Admin user and valid data, when an Actions Taken record is created, then it is saved under the correct Ticket with the authenticated creator and valid performer.

AC-02 Requester Dashboard Ownership

Given an authenticated Requester, when dashboard data is retrieved, then only metrics and recent Ticket information belonging to that Requester are returned.

AC-03 Requester Actions Read-only

Given an authenticated Requester viewing an owned Ticket, Actions Taken are visible but create/update operations are rejected.

AC-04 Multiple Actions

Given a Ticket, the system can store and retrieve zero, one, or multiple Actions Taken records without losing existing Ticket data.

AC-05 Follow-up Validation

Given Follow-Up Required = true, an Action Taken without a follow-up note is rejected.

AC-06 Ticket Status Validation

Given a Ticket and requested next status, the backend accepts only transitions defined in the approved transition matrix.

AC-07 Resolution Gate

Given a Ticket that does not satisfy the required resolution conditions, an attempt to move it to Resolved is rejected safely.

AC-08 Dashboard Metrics

Given valid dashboard data, the backend returns concise metric values using the calculations defined in the API contract.

AC-09 Dashboard Drill-down

Given an actionable dashboard metric, the user can navigate to the corresponding detailed or filtered Ticket view.

AC-10 Authorization

Given a user without permission for a protected Lab 4 operation, the backend rejects the operation even when the request is manually constructed.

AC-11 Conflict Handling

Given a stale or concurrent Ticket update, the system detects or safely handles the conflict without silently overwriting a more recent change.

AC-12 Regression

Given the completed Lab 4 implementation, all required Lab 1-3 regression tests continue to pass.

AC-13 Responsive UI

Given desktop, tablet, and mobile viewport sizes, Lab 4 screens remain usable without clipped or overlapping content.

AC-14 Accessibility

Given keyboard-only interaction, required controls remain operable and focus is visible.

AC-15 Seed and Migration

Given a clean or existing database, the migration preserves existing data and the seed can be executed repeatedly without unintended duplicates.

Every acceptance criterion must map to at least one planned test in tests.md.

11. Definition of Done

Lab 4 is considered complete when:

 Engineering Contract documents are complete.
 Actions Taken database model is implemented.
 Migration preserves existing data.
 Seed data is idempotent.
 Actions Taken APIs work.
 Actions Taken authorization is enforced.
 Actions Taken UI works.
 Requester Actions Taken access is read-only.
 Ticket workflow is enforced by the backend.
 Resolution rule is enforced.
 IT Staff Dashboard works.
 Requester Dashboard works.
 Dashboard ownership is protected.
 Dashboard drill-down works.
 API tests pass.
 UI tests pass.
 Workflow tests pass.
 Authorization tests pass.
 Migration/regression tests pass.
 E2E tests pass.
 Responsive behavior is verified.
 Accessibility behavior is verified.
 Zen Green visual consistency is verified.
 No known Lab 1-3 regression remains.
 No broken links, placeholder controls, or unfinished UI remain.
 README setup/seed/migration/test instructions are current.
 Required evidence is collected.
 All feature branches are peer-reviewed and merged appropriately.
 lab4-staging is verified before final integration to main.
12. Assumptions and Decisions
AD-01 Status Matrix

The Lab 4 handout requires students to define the complete Ticket transition matrix but does not prescribe every individual transition.

Therefore the transition matrix in this document is the proposed implementation decision and must remain consistent with api-spec.md, ui-spec.md, and tests.md.

AD-02 Action Creator and Performer

The stakeholder request specifies Performed by (auto). The implementation therefore uses the authenticated user identity rather than accepting an arbitrary creator identity from the client.

AD-03 Historical Backfill

No artificial historical Actions Taken records will be generated for existing Tickets during migration.

Existing Tickets remain valid with zero Actions Taken.

AD-04 Dashboard Time Range

Dashboard metrics involving recent records will use explicit API-defined date/time boundaries and the application timezone convention. The exact boundary is documented in api-spec.md.

AD-05 Existing API Compatibility

Existing Lab 1-3 endpoints remain unchanged unless a Lab 4 requirement explicitly requires an additive change.

AD-06 Authorization Boundary

Backend authorization is the source of truth. Frontend visibility is only a usability mechanism.

AD-07 Scope Control

Any feature not explicitly required by the Lab 4 PDF, existing application behavior, or this Engineering Contract requires a separate decision before implementation.