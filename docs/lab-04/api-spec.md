# TokTickIT Lab 4 API Specification

## 1. Purpose

This document defines the API contract for the Lab 4 functionality of TokTickIT.

The API changes cover:

* Actions Taken
* Ticket status workflow
* Requester Dashboard
* IT Staff Dashboard
* Authorization
* Validation
* Conflict handling
* Safe API failures
* Duplicate/retry safety

Existing Lab 1-3 APIs must continue to work unless an additive Lab 4 change is explicitly required.

The backend is the authoritative boundary for authentication, authorization, ownership, validation, workflow rules, and protected operations.

---

## 2. General API Conventions

### 2.1 Authentication

All protected Lab 4 endpoints require an authenticated session.

If the user is not authenticated, the API shall return:

```text
401 Unauthorized
```

Example:

```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication is required."
}
```

The server shall determine the authenticated user from the existing authentication/session mechanism.

Client-provided user IDs must not be trusted as proof of identity.

---

### 2.2 Authorization

Authorization shall be enforced by the backend.

Hiding a button or form in the frontend is not considered authorization.

The API shall verify:

* authenticated user identity
* user role
* Ticket access
* Ticket ownership where required
* Action Taken access
* dashboard access
* status transition permission

If the authenticated user does not have permission, the API shall return:

```text
403 Forbidden
```

Example:

```json
{
  "error": "FORBIDDEN",
  "message": "You do not have permission to perform this operation."
}
```

---

### 2.3 Not Found

If a requested Ticket or Action Taken does not exist, the API shall return:

```text
404 Not Found
```

Example:

```json
{
  "error": "NOT_FOUND",
  "message": "The requested resource was not found."
}
```

The API should not reveal unnecessary information about resources that the authenticated user is not allowed to access.

---

### 2.4 Validation Error

Invalid request data shall return:

```text
400 Bad Request
```

Example:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "The request data is invalid."
}
```

Validation errors should identify the invalid field when it is safe and useful to do so.

---

### 2.5 Conflict

The API shall use:

```text
409 Conflict
```

when an operation conflicts with the current state of the resource.

Examples include:

* invalid Ticket status transition
* resolution rule failure
* stale update
* concurrent update
* duplicate operation that cannot safely be repeated

Example:

```json
{
  "error": "CONFLICT",
  "message": "The resource has changed or the requested operation is not allowed in its current state."
}
```

---

### 2.6 Internal Server Error

Unexpected server failures shall return:

```text
500 Internal Server Error
```

Example:

```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred."
}
```

The API must not expose stack traces, database credentials, SQL statements, session secrets, or other sensitive internal information.

---

# 3. Actions Taken API

## 3.1 Retrieve Actions Taken

### Endpoint

```http
GET /api/tickets/:ticketId/actions
```

### Authentication

Required.

### Authorization

* Requester: allowed only when the Ticket belongs to the authenticated Requester.
* IT Staff: allowed when the Ticket is accessible to the authenticated staff member.
* Admin: follows the same operational access rules as IT Staff.

### Purpose

Returns the Actions Taken records belonging to the specified Ticket.

A Ticket may contain:

* zero Actions Taken
* one Action Taken
* multiple Actions Taken

### Successful Response

```text
200 OK
```

Example:

```json
{
  "actions": [
    {
      "id": "action-id",
      "ticketId": "ticket-id",
      "actionDateTime": "2026-10-07T10:30:00.000Z",
      "actionDescription": "Checked the affected workstation.",
      "result": "Identified the source of the problem.",
      "performedById": "user-id",
      "followUpRequired": false,
      "followUpNote": null,
      "attachmentNotes": null,
      "createdAt": "2026-10-07T10:30:00.000Z",
      "updatedAt": "2026-10-07T10:30:00.000Z"
    }
  ]
}
```

If the Ticket has no Actions Taken:

```json
{
  "actions": []
}
```

The empty result is valid and must not be treated as an error.

---

## 3.2 Create Action Taken

### Endpoint

```http
POST /api/tickets/:ticketId/actions
```

### Authentication

Required.

### Authorization

Allowed for:

* IT Staff
* Admin

Requester users must not create Actions Taken.

### Request Body

```json
{
  "actionDateTime": "2026-10-07T10:30:00.000Z",
  "actionDescription": "Checked the affected workstation.",
  "result": "Identified the source of the problem.",
  "followUpRequired": false,
  "followUpNote": null,
  "attachmentNotes": null
}
```

### Performer Identity

The authenticated user is recorded automatically as the creator/performer according to the approved implementation.

The client must not be allowed to impersonate another user by supplying an arbitrary authenticated identity.

The resulting record contains:

```text
performedById = authenticated user ID
```

The backend must verify that the authenticated user is an authorized active user for the operation.

### Successful Response

```text
201 Created
```

Example:

```json
{
  "action": {
    "id": "action-id",
    "ticketId": "ticket-id",
    "actionDateTime": "2026-10-07T10:30:00.000Z",
    "actionDescription": "Checked the affected workstation.",
    "result": "Identified the source of the problem.",
    "performedById": "authenticated-user-id",
    "followUpRequired": false,
    "followUpNote": null,
    "attachmentNotes": null,
    "createdAt": "2026-10-07T10:30:00.000Z",
    "updatedAt": "2026-10-07T10:30:00.000Z"
  }
}
```

---

## 3.3 Create Action Validation

The API shall validate:

* Ticket exists
* authenticated user is authorized
* authenticated user is active
* actionDateTime is valid
* actionDescription is valid
* result is valid
* followUpRequired is boolean
* followUpNote is present when followUpRequired is true

If:

```json
{
  "followUpRequired": true,
  "followUpNote": null
}
```

the API shall reject the request.

Example:

```text
400 Bad Request
```

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Follow-up note is required when follow-up is required."
}
```

---

## 3.4 Update Action Taken

### Endpoint

```http
PATCH /api/tickets/:ticketId/actions/:actionId
```

### Authentication

Required.

### Authorization

Allowed for:

* IT Staff
* Admin

Requester users must not update Actions Taken.

### Request Body

Only fields that are allowed to change should be accepted.

Example:

```json
{
  "actionDateTime": "2026-10-07T11:00:00.000Z",
  "actionDescription": "Checked the affected workstation and network connection.",
  "result": "Network connection was restored.",
  "followUpRequired": true,
  "followUpNote": "Confirm with the requester after testing.",
  "attachmentNotes": null
}
```

The backend must validate the Action Taken belongs to the specified Ticket.

### Successful Response

```text
200 OK
```

Example:

```json
{
  "action": {
    "id": "action-id",
    "ticketId": "ticket-id",
    "actionDateTime": "2026-10-07T11:00:00.000Z",
    "actionDescription": "Checked the affected workstation and network connection.",
    "result": "Network connection was restored.",
    "performedById": "user-id",
    "followUpRequired": true,
    "followUpNote": "Confirm with the requester after testing.",
    "attachmentNotes": null,
    "createdAt": "2026-10-07T10:30:00.000Z",
    "updatedAt": "2026-10-07T11:00:00.000Z"
  }
}
```

---

# 4. Action Taken Authorization Matrix

| Operation                          | Requester | IT Staff | Admin |
| ---------------------------------- | --------: | -------: | ----: |
| View Actions Taken on owned Ticket |       Yes |      Yes |   Yes |
| Create Action Taken                |        No |      Yes |   Yes |
| Update Action Taken                |        No |      Yes |   Yes |

The backend must enforce this matrix.

---

# 5. Ticket Status Workflow API

## 5.1 Update Ticket Status

### Endpoint

```http
PATCH /api/tickets/:ticketId/status
```

### Authentication

Required.

### Authorization

Formal Ticket status transitions are performed by:

* IT Staff
* Admin

Requester users do not directly perform formal Ticket status transitions.

### Request Body

```json
{
  "status": "In Progress"
}
```

The API shall validate the current Ticket status and the requested next status.

---

## 5.2 Allowed Statuses

The API shall support:

```text
New
Open
In Progress
Waiting for Requester
Resolved
Closed
Reopened
Cancelled
```

---

## 5.3 Status Transition Matrix

| Current Status        | Next Status           | Allowed Role    |
| --------------------- | --------------------- | --------------- |
| New                   | Open                  | IT Staff, Admin |
| New                   | Cancelled             | IT Staff, Admin |
| Open                  | In Progress           | IT Staff, Admin |
| Open                  | Waiting for Requester | IT Staff, Admin |
| Open                  | Cancelled             | IT Staff, Admin |
| In Progress           | Waiting for Requester | IT Staff, Admin |
| In Progress           | Resolved              | IT Staff, Admin |
| In Progress           | Cancelled             | IT Staff, Admin |
| Waiting for Requester | In Progress           | IT Staff, Admin |
| Waiting for Requester | Resolved              | IT Staff, Admin |
| Waiting for Requester | Cancelled             | IT Staff, Admin |
| Resolved              | Closed                | IT Staff, Admin |
| Resolved              | Reopened              | IT Staff, Admin |
| Closed                | Reopened              | IT Staff, Admin |
| Reopened              | In Progress           | IT Staff, Admin |
| Reopened              | Waiting for Requester | IT Staff, Admin |
| Reopened              | Resolved              | IT Staff, Admin |
| Reopened              | Cancelled             | IT Staff, Admin |

The backend shall reject transitions not listed in this matrix.

---

## 5.4 Invalid Status Transition

If a requested transition is not allowed:

```text
409 Conflict
```

Example:

```json
{
  "error": "INVALID_STATUS_TRANSITION",
  "message": "The requested Ticket status transition is not allowed."
}
```

The Ticket must remain unchanged.

---

# 6. Resolution Rule

A Ticket cannot be moved to:

```text
Resolved
```

unless the required resolution conditions defined by the approved workflow are satisfied.

The backend is authoritative for the resolution rule.

If the resolution condition is not satisfied:

```text
409 Conflict
```

Example:

```json
{
  "error": "RESOLUTION_NOT_ALLOWED",
  "message": "The Ticket does not satisfy the required resolution conditions."
}
```

The UI may display guidance, but the backend must enforce the rule.

---

# 7. Requester Resolution Feedback

A Requester may indicate that the problem appears resolved.

This action does not directly perform the formal Ticket status transition to `Resolved`.

The backend must keep the Requester feedback separate from the formal IT Staff/Admin workflow transition.

IT Staff or Admin must review the Ticket and perform the formal status transition when appropriate.

---

# 8. Ticket Status Update Success

When a status update succeeds:

```text
200 OK
```

Example:

```json
{
  "ticket": {
    "id": "ticket-id",
    "status": "In Progress",
    "updatedAt": "2026-10-07T11:30:00.000Z"
  }
}
```

The client should refresh the Ticket summary and related UI after a successful update.

---

# 9. Requester Dashboard API

## 9.1 Retrieve Requester Dashboard

### Endpoint

```http
GET /api/dashboard/requester
```

### Authentication

Required.

### Authorization

Requester dashboard data is available only to the authenticated Requester.

The requester ID must be derived from the authenticated session.

The client must not provide an arbitrary requester ID for authorization.

---

## 9.2 Requester Dashboard Response

### Successful Response

```text
200 OK
```

Example:

```json
{
  "metrics": {
    "totalOpen": 3,
    "waitingForRequester": 1,
    "recentlyUpdated": 2,
    "recentlyResolved": 1
  },
  "recentTickets": [
    {
      "id": "ticket-id",
      "ticketNumber": "TKT-2026-000001",
      "title": "Cannot access internal system",
      "status": "In Progress",
      "priority": "HIGH",
      "updatedAt": "2026-10-07T11:30:00.000Z"
    }
  ]
}
```

The response must contain only data belonging to the authenticated Requester.

---

## 9.3 Requester Dashboard Metrics

### totalOpen

Number of Tickets owned by the authenticated Requester that are considered open according to the approved workflow.

The exact status set must remain consistent with the application workflow.

### waitingForRequester

Number of Tickets owned by the authenticated Requester whose current status is:

```text
Waiting for Requester
```

### recentlyUpdated

Number of the authenticated Requester's Tickets updated within the recent time window defined by this API contract and application timezone.

### recentlyResolved

Number of the authenticated Requester's Tickets resolved within the recent time window defined by this API contract and application timezone.

---

## 9.4 Requester Dashboard Ownership Protection

The API must derive the requester identity from authentication.

The following type of request must not be trusted:

```http
GET /api/dashboard/requester?requesterId=another-user-id
```

A Requester must never be able to use a supplied ID to access another Requester's dashboard data.

---

## 9.5 Requester Dashboard Empty State

If the authenticated Requester has no matching Tickets:

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

An empty dashboard is a valid result and must not return an error.

---

# 10. IT Staff Dashboard API

## 10.1 Retrieve IT Staff Dashboard

### Endpoint

```http
GET /api/dashboard/staff
```

### Authentication

Required.

### Authorization

Allowed for:

* IT Staff
* Admin

Requester users must receive:

```text
403 Forbidden
```

---

## 10.2 IT Staff Dashboard Response

### Successful Response

```text
200 OK
```

Example:

```json
{
  "metrics": {
    "unassigned": 2,
    "currentUserOwned": 4,
    "byStatus": {
      "New": 1,
      "Open": 2,
      "In Progress": 3,
      "Waiting for Requester": 1,
      "Resolved": 2,
      "Closed": 5,
      "Reopened": 1,
      "Cancelled": 0
    },
    "byPriority": {
      "LOW": 2,
      "MEDIUM": 4,
      "HIGH": 5,
      "URGENT": 1
    }
  },
  "recentTickets": [
    {
      "id": "ticket-id",
      "ticketNumber": "TKT-2026-000001",
      "title": "Cannot access internal system",
      "status": "In Progress",
      "priority": "HIGH",
      "updatedAt": "2026-10-07T11:30:00.000Z"
    }
  ]
}
```

The response should contain concise operational information rather than returning the complete Ticket collection.

---

# 11. IT Staff Dashboard Metrics

## 11.1 Unassigned

Number of Tickets that do not currently have a Ticket Owner/assignee according to the existing application data model.

The calculation must follow the existing Ticket ownership model.

---

## 11.2 Current User Owned

Number of accessible Tickets currently assigned to the authenticated IT Staff user according to the existing Ticket ownership/assignment model.

This metric must not expose Tickets that the authenticated user is not authorized to access.

---

## 11.3 Status Summary

The API may return counts grouped by the supported Ticket statuses:

```text
New
Open
In Progress
Waiting for Requester
Resolved
Closed
Reopened
Cancelled
```

---

## 11.4 Priority Summary

The API may return counts grouped by the existing Ticket priority values.

The API must use the priority values already defined by the application rather than introducing new priority values only for the dashboard.

---

## 11.5 Recently Updated Tickets

The API may return a concise list of recently updated accessible Tickets.

The recent time window must use the same application timezone and date boundary convention defined by the dashboard implementation.

---

# 12. Dashboard Drill-down

Dashboard metric cards and actionable items shall provide a path to a relevant detailed view.

Examples:

```text
Unassigned Tickets
        ↓
Ticket Queue filtered to unassigned Tickets
```

```text
Waiting for Requester
        ↓
Ticket Queue filtered by Waiting for Requester
```

```text
Recently Updated
        ↓
Relevant Ticket list/detail
```

The dashboard API itself should return concise metric information and should not duplicate the complete Ticket collection.

The frontend is responsible for navigating to the appropriate detailed or filtered view.

---

# 13. Dashboard Date and Time Convention

Dashboard calculations involving recent records must use:

* an explicit time window
* a consistent application timezone
* clearly defined start and end boundaries

The API implementation must document the final selected recent time window before the dashboard feature is considered complete.

The same rule must be used consistently by:

* Requester Dashboard
* IT Staff Dashboard
* API tests
* UI tests
* E2E tests

---

# 14. Concurrency and Stale Updates

Protected updates must avoid silently overwriting a newer change.

The implementation may use an existing version field, `updatedAt`, transaction checks, or another safe concurrency mechanism consistent with the existing application architecture.

When a stale update is detected:

```text
409 Conflict
```

Example:

```json
{
  "error": "STALE_UPDATE",
  "message": "The resource was changed by another operation. Refresh and try again."
}
```

The frontend should preserve recoverable form data where possible and allow the user to retry safely.

---

# 15. Duplicate and Retry Safety

The API must prevent unintended duplicate operations caused by:

* repeated button clicks
* accidental form submission
* safe network retries
* repeated requests caused by client retry behavior

The implementation may use:

* client-side submission locking
* server-side idempotency handling
* unique request identifiers
* transaction checks
* other mechanisms consistent with the existing architecture

The selected implementation must not create duplicate Actions Taken from a single intended user operation.

---

# 16. Safe API Failure

API failures must return safe responses.

The API must not expose:

* database connection strings
* passwords
* session secrets
* SQL queries
* stack traces
* internal file paths
* unnecessary implementation details

Example safe failure:

```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred."
}
```

The frontend shall display an understandable error message without exposing sensitive backend details.

---

# 17. API Authorization Summary

| Endpoint                |            Requester |          IT Staff |             Admin |
| ----------------------- | -------------------: | ----------------: | ----------------: |
| GET Ticket Actions      |           Own Ticket | Accessible Ticket | Accessible Ticket |
| POST Ticket Action      |                   No |               Yes |               Yes |
| PATCH Ticket Action     |                   No |               Yes |               Yes |
| PATCH Ticket Status     | No formal transition |               Yes |               Yes |
| GET Requester Dashboard |        Own dashboard |                No |                No |
| GET Staff Dashboard     |                   No |               Yes |               Yes |

Backend authorization is authoritative for every protected endpoint.

---

# 18. API Test Requirements

The following API behavior must be covered by tests.

## Actions Taken

* authenticated user can retrieve permitted Actions Taken
* requester can retrieve Actions Taken for owned Tickets
* requester cannot retrieve Actions Taken for another user's Ticket
* requester cannot create Actions Taken
* requester cannot update Actions Taken
* IT Staff can create Actions Taken
* Admin can create Actions Taken
* IT Staff can update Actions Taken
* Admin can update Actions Taken
* unauthenticated users are rejected
* inactive users are rejected where active-user validation is required
* invalid data is rejected
* follow-up note validation works
* non-existent Ticket is handled safely
* non-existent Action Taken is handled safely
* duplicate/retry behavior is safe

## Ticket Workflow

* authenticated staff can perform allowed transitions
* requester cannot perform formal status transitions
* invalid transitions are rejected
* resolution rule is enforced
* stale updates are handled safely
* unauthorized users are rejected
* successful status changes return the updated Ticket state

## Requester Dashboard

* authenticated requester can retrieve their dashboard
* dashboard contains only the authenticated requester's data
* another requester cannot be impersonated
* unauthenticated users are rejected
* empty dashboard returns valid zero/empty values

## IT Staff Dashboard

* IT Staff can retrieve staff dashboard data
* Admin can retrieve staff dashboard data
* Requester cannot retrieve staff dashboard data
* unauthenticated users are rejected
* dashboard metrics are calculated correctly
* empty metrics return valid zero/empty values

---

# 19. Compatibility with Existing APIs

Lab 4 must preserve the existing APIs implemented in Labs 1-3.

Existing behavior for the following areas must continue to work:

* authentication
* authorization
* user management
* Tickets
* My Tickets
* Ticket Detail
* comments
* internal notes
* attachments
* existing navigation-related API behavior

Lab 4 API changes should be additive wherever possible.

Existing endpoints must not be removed or silently changed without an explicit requirement.

---

# 20. API Acceptance Criteria

### API-AC-01

An authenticated IT Staff/Admin user can create an Action Taken under an accessible Ticket.

### API-AC-02

The authenticated user identity is recorded automatically and cannot be impersonated through arbitrary client input.

### API-AC-03

A Requester can view Actions Taken for an owned Ticket but cannot create or update Actions Taken.

### API-AC-04

A Ticket can contain zero, one, or multiple Actions Taken records.

### API-AC-05

Follow-up validation prevents an Action Taken with `followUpRequired = true` from being saved without a follow-up note.

### API-AC-06

The backend accepts only Ticket status transitions defined in the approved transition matrix.

### API-AC-07

The backend rejects invalid attempts to transition a Ticket to `Resolved`.

### API-AC-08

Requester dashboard data is restricted to the authenticated Requester's Tickets.

### API-AC-09

IT Staff/Admin dashboard data is restricted to authorized operational users.

### API-AC-10

Dashboard APIs return concise metrics and valid empty results.

### API-AC-11

Unauthorized and unauthenticated operations are rejected by the backend.

### API-AC-12

Stale or conflicting updates are handled safely without silently overwriting newer data.

### API-AC-13

Repeated operations do not unintentionally create duplicate Actions Taken or workflow changes.

### API-AC-14

API failures do not expose sensitive internal information.

### API-AC-15

Existing Lab 1-3 APIs continue to work after Lab 4 changes.

---

# 21. Planned API Test Files

The Lab 4 API tests shall be organized as:

```text
server/tests/lab-04/
├── actions-taken.api.test.ts
├── ticket-workflow.api.test.ts
├── requester-dashboard.api.test.ts
└── staff-dashboard.api.test.ts
```

The tests shall provide traceability to the acceptance criteria defined in:

```text
docs/lab-04/specification.md
```

and the test plan defined in:

```text
docs/lab-04/tests.md
```

---

# 22. Implementation Decision

The exact route implementation must follow the existing TokTickIT server conventions.

Before implementation, the existing server routes, authentication middleware, Prisma schema, Ticket ownership/assignment model, and current API response conventions shall be inspected.

If an existing route already provides equivalent functionality, the Lab 4 implementation should extend that route rather than creating unnecessary duplicate APIs.

The final implementation must remain consistent with:

* `specification.md`
* `ui-spec.md`
* `tests.md`
* the existing Lab 1-3 application architecture
* the approved Lab 4 Engineering Contract
