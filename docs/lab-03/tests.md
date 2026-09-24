# TokTickIT — Lab 3 Test Plan

## 1. Purpose

This document defines the test plan for TokTickIT Lab 3.

The purpose of testing is to verify that the authentication system, role-based authorization, ticket workflow, requester ownership isolation, comments, internal notes, attachments, and administration features work according to the Lab 3 specification.

Testing will follow the Test-Driven Development (TDD) approach where practical. Tests should be written before or together with the implementation, and all required tests must pass before the changes are merged into the main branch.

---

## 2. Testing Scope

### 2.1 In Scope

The following features are included in this test plan:

- User authentication and login
- First-login password change
- Role-based authorization
- Requester access control
- IT Staff access control
- Admin access control
- Requester ownership isolation
- Ticket creation
- Ticket listing and searching
- Ticket detail viewing
- Ticket status changes
- Ticket priority changes
- Ticket assignment
- Public comments
- Internal notes
- Attachment upload
- Attachment download
- Attachment soft removal
- Requester management
- User activation and deactivation
- Protected admin operations
- Database migration and seed data
- Responsive UI behavior
- Validation and error handling

### 2.2 Out of Scope

The following features are not included in Lab 3 testing:

- Single Sign-On
- OAuth or external identity providers
- Email notification integration
- Real-time chat
- Advanced reporting and analytics
- SLA automation
- Automatic ticket categorization
- Production deployment
- Payment-related features
- Features not described in the Lab 3 specification

---

## 3. Testing Strategy

### 3.1 Unit Testing

Unit tests verify individual functions or modules in isolation.

Examples include:

- Password validation
- Password hashing
- Token validation
- Role checking
- Ownership checking
- Ticket number generation
- Status transition validation
- Attachment validation
- Request validation

### 3.2 API Integration Testing

API integration tests verify the behavior of the server endpoints together with the database.

The tests will verify:

- HTTP status codes
- Response body structure
- Authentication requirements
- Authorization rules
- Database changes
- Validation errors
- Ownership isolation
- Error codes

### 3.3 UI Testing

UI tests verify that the frontend displays the correct content and allows users to perform actions according to their roles.

The tests will verify:

- Login form
- First-login password change form
- Requester ticket list
- Requester ticket detail
- IT Staff queue
- IT Staff ticket detail
- Admin user management
- Error messages
- Loading states
- Empty states
- Responsive layout

### 3.4 End-to-End Testing

End-to-end tests verify important user flows from the frontend to the backend.

The main flows include:

1. User logs in.
2. User changes the initial password.
3. Requester creates a ticket.
4. Requester views only their own tickets.
5. IT Staff views the staff queue.
6. IT Staff assigns and updates a ticket.
7. Requester adds a public comment.
8. IT Staff adds an internal note.
9. Admin manages users.
10. Unauthorized users are blocked from protected actions.

---

## 4. Test Environment

### 4.1 Client

- React
- TypeScript
- Vite
- Bootstrap

### 4.2 Server

- Express
- TypeScript
- Prisma
- PostgreSQL

### 4.3 Test Tools

The project may use the following tools:

- Vitest or the configured unit test framework
- Supertest or the configured API test framework
- React Testing Library
- Playwright for end-to-end testing
- Prisma test database or isolated test database

### 4.4 Test Data

The test database should contain users with the following roles:

- Requester
- IT Staff
- Admin

The test data should also contain:

- At least two Requesters
- At least one IT Staff user
- At least one Admin user
- Active and inactive users
- Tickets belonging to different Requesters
- Tickets with different statuses
- Tickets with different priorities
- Tickets with public comments
- Tickets with internal notes
- Tickets with active and removed attachments

---

## 5. Authentication Test Cases

### AUTH-01: Login with valid credentials

**Given**

- A user exists with valid credentials.
- The user account is active.

**When**

- The user submits the correct username and password.

**Then**

- The login request succeeds.
- The server returns an authenticated session or token.
- The response identifies the user's role.
- The user is redirected to the correct page.

### AUTH-02: Login with an incorrect password

**Given**

- A user exists with a valid username.

**When**

- The user submits an incorrect password.

**Then**

- The login request is rejected.
- The server returns an appropriate authentication error.
- No authenticated session or token is created.
- The UI displays an error message.

### AUTH-03: Login with an unknown username

**When**

- A user submits a username that does not exist.

**Then**

- The login request is rejected.
- The response does not expose sensitive information about existing users.
- The UI displays an appropriate error message.

### AUTH-04: Inactive user cannot log in

**Given**

- A user account is inactive.

**When**

- The user submits valid credentials.

**Then**

- Login is rejected.
- No authenticated session or token is created.
- The user receives an appropriate error message.

### AUTH-05: Unauthenticated user cannot access protected endpoints

**When**

- A request is sent to a protected endpoint without authentication.

**Then**

- The server returns `401 Unauthorized`.
- No protected data is returned.
- No database changes are made.

### AUTH-06: First-login password change is required

**Given**

- A user logs in for the first time.
- The user still has the initial password.

**When**

- The user tries to access the application.

**Then**

- The user is required to change the password.
- The user cannot continue to normal application functions before changing the password.

### AUTH-07: First-login password change succeeds

**When**

- The user submits a valid new password.

**Then**

- The password is updated securely.
- The first-login requirement is removed.
- The user can access the application normally.
- The initial password is no longer usable.

### AUTH-08: Invalid new password is rejected

**When**

- The user submits a password that does not meet the password rules.

**Then**

- The password is not changed.
- The server returns a validation error.
- The UI displays the password requirements.

---

## 6. Authorization Test Cases

### AUTHZ-01: Requester cannot access Admin endpoints

**Given**

- The authenticated user has the Requester role.

**When**

- The user calls an Admin-only endpoint.

**Then**

- The server returns `403 Forbidden`.
- No protected data is returned.
- No database changes are made.

### AUTHZ-02: Requester cannot access IT Staff-only actions

**Given**

- The authenticated user has the Requester role.

**When**

- The user attempts to assign a ticket, add an internal note, or perform another IT Staff-only action.

**Then**

- The action is rejected.
- The server returns `403 Forbidden`.
- The UI does not display controls that the user is not allowed to use.

### AUTHZ-03: IT Staff cannot access Admin-only actions

**Given**

- The authenticated user has the IT Staff role.

**When**

- The user attempts to manage users or perform an Admin-only action.

**Then**

- The action is rejected.
- The server returns `403 Forbidden`.
- No database changes are made.

### AUTHZ-04: Admin can access Admin functions

**Given**

- The authenticated user has the Admin role.

**When**

- The user accesses an Admin-only endpoint.

**Then**

- The request succeeds if the input is valid.
- The user can perform the permitted Admin operation.

### AUTHZ-05: Authorization is checked on the backend

**When**

- A user sends a request directly to an endpoint without using the UI.

**Then**

- The server still checks the user's role and ownership.
- Hiding a button in the UI is not treated as sufficient authorization.

---

## 7. Requester Test Cases

### REQ-01: Requester can create a ticket

**Given**

- The user is authenticated as a Requester.

**When**

- The user submits a valid ticket creation form.

**Then**

- The ticket is created.
- The ticket is associated with the authenticated Requester.
- The ticket receives a generated ticket number.
- The initial status is `NEW`.

### REQ-02: Requester cannot create a ticket for another user

**When**

- A Requester attempts to submit another user's requester ID.

**Then**

- The server ignores or rejects the unauthorized requester ID.
- The created ticket belongs to the authenticated Requester.
- The user cannot create a ticket on behalf of another Requester.

### REQ-03: Requester can view their own tickets

**Given**

- The Requester owns one or more tickets.

**When**

- The Requester opens the ticket list.

**Then**

- The user's own tickets are displayed.
- The ticket list supports the required search and pagination behavior.

### REQ-04: Requester cannot view another Requester's ticket

**Given**

- Requester A owns a ticket.
- Requester B is authenticated.

**When**

- Requester B attempts to view Requester A's ticket.

**Then**

- The server denies access.
- The response does not expose the ticket data.
- The server returns the appropriate authorization or not-found response.

### REQ-05: Requester cannot modify another Requester's ticket

**When**

- Requester B attempts to edit or update Requester A's ticket.

**Then**

- The action is rejected.
- The ticket remains unchanged.

### REQ-06: Requester can add a public comment

**When**

- A Requester adds a valid comment to their own ticket.

**Then**

- The comment is saved.
- The comment is visible to the Requester and IT Staff.
- The comment is marked as a public comment.

### REQ-07: Requester cannot create an internal note

**When**

- A Requester attempts to create an internal note.

**Then**

- The server returns `403 Forbidden`.
- No internal note is created.

### REQ-08: Requester can view active attachments on their ticket

**When**

- A Requester opens a ticket containing an active attachment.

**Then**

- The attachment metadata is displayed.
- The attachment can be downloaded if the Requester has permission.

### REQ-09: Removed attachment cannot be downloaded

**Given**

- An attachment has been soft removed.

**When**

- A Requester attempts to download the attachment.

**Then**

- The server returns `410 Gone`.
- The response uses the `ATTACHMENT_REMOVED` error code.
- The UI disables or hides the download action.

---

## 8. IT Staff Test Cases

### STAFF-01: IT Staff can view the staff queue

**Given**

- The user is authenticated as IT Staff.

**When**

- The user opens the staff queue.

**Then**

- The queue displays tickets that IT Staff are allowed to view.
- The queue supports the required filtering, searching, and pagination behavior.

### STAFF-02: IT Staff can view ticket details

**When**

- IT Staff opens a ticket from the queue.

**Then**

- The ticket details are displayed.
- The requester information is displayed according to the specification.
- The ticket status, priority, owner, comments, notes, and attachments are displayed as permitted.

### STAFF-03: IT Staff can assign a ticket

**When**

- IT Staff assigns a ticket to an eligible IT Staff user.

**Then**

- The ticket owner is updated.
- The updated owner is displayed in the ticket detail.
- The database stores the correct owner.

### STAFF-04: Inactive IT Staff cannot be assigned

**Given**

- An IT Staff user is inactive.

**When**

- Another IT Staff user attempts to assign a ticket to that user.

**Then**

- The assignment is rejected.
- The ticket owner remains unchanged.

### STAFF-05: IT Staff can update ticket priority

**When**

- IT Staff selects a valid priority.

**Then**

- The ticket priority is updated.
- The new priority is displayed in the UI.

### STAFF-06: IT Staff can update ticket status

**When**

- IT Staff selects a valid status transition.

**Then**

- The status is updated.
- The transition follows the business rules.
- The updated status is displayed in the UI.

### STAFF-07: Invalid status transition is rejected

**When**

- IT Staff attempts a status transition that is not allowed.

**Then**

- The server rejects the request.
- The ticket status remains unchanged.
- The UI displays an appropriate error message.

### STAFF-08: IT Staff can add an internal note

**When**

- IT Staff adds a valid internal note.

**Then**

- The note is saved.
- The note is visible to authorized IT Staff and Admin users.
- The note is not visible to Requesters.

### STAFF-09: Internal notes are not exposed through public comments

**When**

- A Requester views a ticket containing an internal note.

**Then**

- The internal note is not returned in the Requester's response.
- The internal note is not displayed in the Requester's UI.

### STAFF-10: IT Staff can add a public comment

**When**

- IT Staff adds a public comment.

**Then**

- The comment is saved.
- The comment is visible to the Requester and authorized staff users.

---

## 9. Admin Test Cases

### ADMIN-01: Admin can view user management

**Given**

- The user is authenticated as Admin.

**When**

- The user opens the user management page.

**Then**

- The user list is displayed.
- The list includes the required user information.
- Active and inactive users are distinguishable.

### ADMIN-02: Admin can create a user

**When**

- Admin submits valid information for a new user.

**Then**

- The user is created.
- The selected role is stored correctly.
- The new user can log in according to the authentication rules.

### ADMIN-03: Admin can deactivate an eligible user

**When**

- Admin deactivates an eligible user other than the authenticated Admin.

**Then**

- The user's active state is changed.
- The user can no longer log in.
- The user is excluded from eligible Requester or IT Staff selections as required.

### ADMIN-04: Admin cannot deactivate the last active Admin

**Given**

- Only one active Admin remains.

**When**

- Admin attempts to deactivate that account.

**Then**

- The operation is rejected.
- At least one active Admin remains.
- The database is not changed.

### ADMIN-05: Admin cannot deactivate their own account

**Given**

- The authenticated user has the Admin role.
- The authenticated Admin attempts to deactivate their own account.

**When**

- The Admin submits a request to deactivate their own account.

**Then**

- The operation is rejected.
- The server returns an appropriate validation or business-rule error.
- The Admin account remains active.
- No database changes are made.


### ADMIN-06: Admin cannot remove the last active IT Staff user

**Given**

- Only one active IT Staff user remains.

**When**

- Admin attempts to deactivate that user.

**Then**

- The operation is rejected.
- At least one active IT Staff user remains.

### ADMIN-07: Admin cannot remove the last active Requester

**Given**

- Only one active Requester remains.

**When**

- Admin attempts to deactivate that user.

**Then**

- The operation is rejected.
- At least one active Requester remains.

### ADMIN-08: Inactive users are excluded from new assignments

**When**

- Admin deactivates a user.

**Then**

- The inactive user is not available in new requester or ticket-owner selections where the specification requires active users only.

### ADMIN-09: Admin operations are protected from other roles

**When**

- A Requester or IT Staff user attempts an Admin operation.

**Then**

- The operation is rejected.
- No user data is changed.

---

## 10. Attachment Test Cases

### ATT-01: Valid attachment can be uploaded

**When**

- An authenticated user uploads a supported file within the size limit.

**Then**

- The file is uploaded successfully.
- The attachment metadata is stored.
- The attachment is associated with the correct ticket.

### ATT-02: More than five active attachments are rejected

**Given**

- A ticket already has five active attachments.

**When**

- A user attempts to upload another attachment.

**Then**

- The upload is rejected.
- The response contains the appropriate validation error.
- The number of active attachments remains five.

### ATT-03: Attachment larger than 6 MB is rejected

**When**

- A user uploads a file larger than 6 MB.

**Then**

- The upload is rejected.
- The file is not stored as an active attachment.

### ATT-04: GIF attachment is rejected

**When**

- A user uploads a GIF file.

**Then**

- The upload is rejected.
- The file is not stored as an active attachment.

### ATT-05: Unsupported file type is rejected

**When**

- A user uploads a file type that is not supported.

**Then**

- The upload is rejected.
- The UI displays a validation message.

### ATT-06: Active attachment can be downloaded

**Given**

- The attachment exists and has not been removed.

**When**

- An authorized user downloads the attachment.

**Then**

- The download succeeds.
- The correct file is returned.

### ATT-07: Attachment can be soft removed

**When**

- An authorized user removes an attachment.

**Then**

- The attachment is marked as removed.
- The attachment metadata remains in the database.
- The original file is not treated as an active attachment.

### ATT-08: Removed attachment returns the correct error

**When**

- A user requests a removed attachment.

**Then**

- The server returns `410 Gone`.
- The response contains `ATTACHMENT_REMOVED`.
- The UI disables preview and download actions.

### ATT-09: Removed attachments do not count toward the active limit

**Given**

- A ticket has five attachments, including removed attachments.

**When**

- A user uploads a new attachment.

**Then**

- The active attachment count is checked.
- Removed attachments are not counted as active attachments.

---

## 11. API Validation and Error Test Cases

### API-01: Missing required field

**When**

- A request is submitted without a required field.

**Then**

- The server returns `400 Bad Request`.
- The response contains a useful validation error.
- No invalid data is stored.

### API-02: Invalid requester ID

**When**

- A ticket creation request contains an invalid requester ID.

**Then**

- The server returns `400 Bad Request`.
- The response contains `INVALID_REQUESTER`.
- No ticket is created.

### API-03: Invalid ticket ID

**When**

- A request references a ticket ID that does not exist.

**Then**

- The server returns the appropriate not-found response.
- No database changes are made.

### API-04: Invalid role value

**When**

- A request contains a role value that is not supported.

**Then**

- The request is rejected.
- The database is not changed.

### API-05: Invalid status value

**When**

- A request contains an unsupported ticket status.

**Then**

- The request is rejected.
- The ticket status remains unchanged.

### API-06: Invalid priority value

**When**

- A request contains an unsupported priority.

**Then**

- The request is rejected.
- The ticket priority remains unchanged.

### API-07: Error response does not expose sensitive data

**When**

- An authentication or authorization request fails.

**Then**

- The response does not expose passwords, password hashes, tokens, or unnecessary user information.

---

## 12. Database and Migration Test Cases

### DB-01: Migration runs successfully

**When**

- The Lab 3 migration is executed on a clean database.

**Then**

- The migration completes successfully.
- All required tables, columns, relations, indexes, and constraints are created.

### DB-02: Migration preserves existing Lab 2 data

**Given**

- The database contains existing Lab 2 data.

**When**

- The Lab 3 migration is executed.

**Then**

- Existing tickets and related data remain available.
- Existing requester ownership is preserved.
- Existing attachments and comments are preserved according to the specification.

### DB-03: Seed creates required users

**When**

- The seed command is executed.

**Then**

- Required users are created.
- Each user has the correct role.
- User passwords are stored securely.
- Required active and inactive states are correct.

### DB-04: Seed can be executed safely

**When**

- The seed command is executed more than once.

**Then**

- Duplicate users or duplicate required records are not created.
- The database remains consistent.

### DB-05: Database constraints are enforced

**When**

- Invalid or duplicate data is inserted.

**Then**

- The database rejects the invalid data where constraints apply.
- The API returns a controlled error instead of exposing a server error.

---

## 13. UI Test Cases

### UI-01: Login page displays correctly

**Then**

- The login page contains the required input fields.
- The login button is visible.
- Validation messages are displayed when necessary.

### UI-02: First-login password page displays correctly

**Then**

- The user is informed that a password change is required.
- The new password fields are displayed.
- Password validation feedback is understandable.

### UI-03: Requester sees only requester functions

**Given**

- The user is logged in as Requester.

**Then**

- Requester navigation is displayed.
- Admin and IT Staff-only navigation is not displayed.
- Protected actions remain blocked by the backend.

### UI-04: IT Staff sees staff queue

**Given**

- The user is logged in as IT Staff.

**Then**

- The staff queue is displayed.
- Ticket filtering and searching controls are available.
- IT Staff actions are displayed according to permissions.

### UI-05: Admin sees user management

**Given**

- The user is logged in as Admin.

**Then**

- User management is available.
- User activation and deactivation controls are displayed according to the user's state and business rules.

### UI-06: Loading state is displayed

**When**

- The application is waiting for an API response.

**Then**

- A loading indicator or loading state is displayed.
- The user does not see misleading empty data.

### UI-07: Empty state is displayed

**When**

- The ticket list or user list contains no records.

**Then**

- A clear empty state is displayed.
- The page does not appear broken.

### UI-08: API errors are displayed clearly

**When**

- An API request fails.

**Then**

- The UI displays an understandable error message.
- The user is not shown raw stack traces or sensitive server details.

### UI-09: Responsive layout works on mobile and tablet

**When**

- The application is viewed at mobile and tablet widths.

**Then**

- Content does not overlap.
- Text and controls are not clipped.
- Tables or ticket details remain usable.
- Navigation remains accessible.

### UI-10: Attachment actions reflect attachment state

**Given**

- An attachment has been removed.

**Then**

- Preview and download controls are disabled or hidden.
- The UI does not imply that the removed attachment is still available.

---

## 14. End-to-End Test Scenarios

### E2E-01: First-time user login flow

1. Open the login page.
2. Enter valid initial credentials.
3. Submit the login form.
4. Verify that the password change page is displayed.
5. Enter a valid new password.
6. Submit the password change form.
7. Verify that the user is redirected to the correct application page.

### E2E-02: Requester creates and views a ticket

1. Log in as a Requester.
2. Open the ticket creation page.
3. Enter valid ticket information.
4. Submit the form.
5. Verify that the ticket is created with status `NEW`.
6. Open the ticket list.
7. Verify that the new ticket is displayed.
8. Open the ticket detail.
9. Verify that the ticket information is correct.

### E2E-03: Requester ownership isolation

1. Log in as Requester A.
2. Create a ticket.
3. Log out.
4. Log in as Requester B.
5. Open the ticket list.
6. Verify that Requester A's ticket is not displayed.
7. Attempt to access Requester A's ticket directly.
8. Verify that access is denied.

### E2E-04: IT Staff handles a ticket

1. Log in as IT Staff.
2. Open the staff queue.
3. Select a ticket.
4. Assign the ticket to an eligible IT Staff user.
5. Change the ticket priority.
6. Change the ticket status.
7. Add a public comment.
8. Add an internal note.
9. Verify that the changes are displayed correctly.

### E2E-05: Internal note visibility

1. Log in as IT Staff.
2. Add an internal note to a ticket.
3. Log out.
4. Log in as the Requester who owns the ticket.
5. Open the ticket detail.
6. Verify that the internal note is not visible.
7. Verify that public comments remain visible.

### E2E-06: Admin manages users

1. Log in as Admin.
2. Open user management.
3. Create a valid user.
4. Verify that the user appears in the list.
5. Deactivate the user.
6. Verify that the user is marked inactive.
7. Attempt to log in as the inactive user.
8. Verify that login is rejected.

### E2E-07: Attachment removal flow

1. Log in as an authorized user.
2. Open a ticket with an attachment.
3. Upload a valid attachment if necessary.
4. Verify that the attachment can be downloaded.
5. Remove the attachment.
6. Verify that the attachment remains in the metadata list as removed.
7. Verify that preview and download are disabled.
8. Attempt to download the removed attachment.
9. Verify that the API returns `410 Gone` and `ATTACHMENT_REMOVED`.

---

## 15. Regression Testing

The following Lab 2 features must continue to work after Lab 3 changes:

- Requester can create tickets.
- Requester can view their own tickets.
- Requester cannot view another user's tickets.
- Ticket numbers follow the required format.
- Ticket status starts as `NEW`.
- Ticket search works.
- Ticket pagination works.
- Attachments can be uploaded within the allowed limits.
- Removed attachments cannot be downloaded.
- Responsive UI does not overlap or clip content.
- Existing database records are preserved after migration.

All existing Lab 2 tests should continue to pass unless the behavior is intentionally changed by the Lab 3 specification.

---

## 16. Test Execution Order

The recommended execution order is:

1. Install dependencies.
2. Configure the test environment.
3. Run database migrations.
4. Run seed data.
5. Run unit tests.
6. Run API integration tests.
7. Run UI tests.
8. Run end-to-end tests.
9. Run the complete regression test suite.
10. Verify that no required tests are skipped.
11. Record the test results.
12. Fix failed tests before merging the pull request.

---

## 17. Acceptance Criteria

The implementation is considered ready for review when:

- Authentication tests pass.
- First-login password change tests pass.
- Role-based authorization tests pass.
- Requester ownership isolation tests pass.
- IT Staff workflow tests pass.
- Admin protection tests pass.
- Public comments and internal notes are separated correctly.
- Attachment validation and soft removal tests pass.
- Database migration and seed tests pass.
- UI tests pass at desktop, tablet, and mobile widths.
- End-to-end scenarios pass.
- Lab 2 regression tests pass.
- No required tests are skipped.
- Test results are recorded in the repository.
- The implementation matches the specification and API contract.

---

## 18. Test Result Record

| Test Area | Result | Notes |
|---|---|---|
| Authentication | Pending | To be executed |
| First-login password change | Pending | To be executed |
| Role-based authorization | Pending | To be executed |
| Requester ownership isolation | Pending | To be executed |
| IT Staff workflow | Pending | To be executed |
| Admin functions | Pending | To be executed |
| Public comments | Pending | To be executed |
| Internal notes | Pending | To be executed |
| Attachments | Pending | To be executed |
| Database migration | Pending | To be executed |
| Seed data | Pending | To be executed |
| UI testing | Pending | To be executed |
| Responsive testing | Pending | To be executed |
| End-to-end testing | Pending | To be executed |
| Lab 2 regression testing | Pending | To be executed |

---

## 19. Known Risks

The following risks should be checked during implementation:

- Incorrect role checks may allow unauthorized access.
- Requester ownership may be checked only in the frontend.
- Internal notes may accidentally be returned to Requesters.
- Inactive users may still be allowed to log in or receive assignments.
- Removed attachments may still be downloadable.
- Database migration may affect existing Lab 2 data.
- UI controls may overlap on mobile or tablet screens.
- API errors may expose sensitive information.
- Tests may pass individually but fail when executed together.
- Seed data may create duplicate records when executed multiple times.

---

## 20. Definition of Done for Testing

Testing is complete when:

- All required unit tests pass.
- All required API integration tests pass.
- All required UI tests pass.
- All required end-to-end tests pass.
- All Lab 2 regression tests pass.
- No required tests are skipped.
- Test failures have been fixed or documented.
- Test results are recorded.
- The code has been reviewed by a teammate.
- The pull request is approved before merging.