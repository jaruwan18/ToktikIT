###### \# TokTickIT — Lab 3 Specification

###### 

###### \## 1. Sprint Goal

###### 

###### Replace the temporary Development Requester selector from Lab 2 with a real authentication and authorization system.

###### 

###### The system will support three roles:

###### 

###### \- Requester

###### \- IT Staff

###### \- Administrator

###### 

###### The system must preserve the existing Lab 2 requester functionality while adding role-based workflows for IT Staff and Administrator.

###### 

###### The main goals are:

###### 

###### \- Authenticate users securely.

###### \- Require users with an initial password to change it before entering the normal application.

###### \- Use the authenticated user identity instead of a client-provided requesterId.

###### \- Enforce authorization on the backend.

###### \- Provide an IT Staff ticket queue and ticket detail workflow.

###### \- Support Public Comments and Internal Notes.

###### \- Provide basic Administrator user management.

###### \- Preserve existing Lab 2 tickets, attachments, categories, and systems.

###### \- Keep the existing Zen Green visual style and responsive behavior.

###### 

###### \---

###### 

###### \## 2. Stakeholder Request

###### 

###### The stakeholder requests the following changes:

###### 

###### 1\. Replace the temporary Development Requester selector with a secure login.

###### 2\. Support Requester, IT Staff, and Administrator roles.

###### 3\. Require users with an initial password to change it at first login.

###### 4\. Allow Requesters to manage their own tickets using their authenticated identity.

###### 5\. Allow IT Staff to view and manage the ticket queue.

###### 6\. Allow IT Staff to claim, assign, and reassign tickets.

###### 7\. Add IT Priority and controlled ticket status changes.

###### 8\. Add Public Comments and Internal Notes.

###### 9\. Allow Requesters to indicate that a problem appears resolved.

###### 10\. Provide basic Administrator user account management.

###### 11\. Protect every restricted operation on the backend.

###### 12\. Reuse the existing Zen Green interface and responsive layout.

###### 

###### \---

###### 

###### \## 3. Scope

###### 

###### \### 3.1 In Scope

###### 

###### \#### Authentication

###### 

###### \- Login with email and password.

###### \- Logout.

###### \- Current authenticated user.

###### \- First-login password change.

###### \- Password validation.

###### \- Secure password hashing.

###### \- Session or token-based authentication.

###### \- Inactive account handling.

###### \- Safe authentication error messages.

###### 

###### \#### Authorization

###### 

###### \- Role-based navigation.

###### \- Backend authorization for protected endpoints.

###### \- Requester ownership protection.

###### \- IT Staff and Administrator access control.

###### \- Protection of Internal Notes.

###### \- Protection of Administrator functions.

###### 

###### \#### Requester

###### 

###### \- View own tickets.

###### \- Create tickets.

###### \- View and manage own attachments.

###### \- Add Public Comments.

###### \- Indicate that a problem appears resolved.

###### \- Continue using Lab 2 requester functionality.

###### \- Preserve ticket ownership based on the authenticated user.

###### 

###### \#### IT Staff

###### 

###### \- View the IT ticket queue.

###### \- Search, filter, sort, and paginate the queue.

###### \- Open ticket details.

###### \- Claim tickets.

###### \- Assign or reassign ticket ownership.

###### \- Change IT Priority.

###### \- Change permitted ticket statuses.

###### \- Add Public Comments.

###### \- Add Internal Notes.

###### \- View attachments.

###### 

###### \#### Administrator

###### 

###### \- View users.

###### \- Search users by supported fields.

###### \- Filter users by role if implemented.

###### \- Create users.

###### \- Edit user name, email, role, and activation status.

###### \- Set a new initial password.

###### \- Prevent self-deactivation.

###### \- Prevent deactivation of the last active Administrator.

###### 

###### \#### Data and Migration

###### 

###### \- Preserve existing Lab 2 tickets.

###### \- Preserve existing attachments.

###### \- Preserve existing categories and systems.

###### \- Migrate Development Requester records to real User records.

###### \- Preserve ticket ownership during migration.

###### \- Add role, activation, password, assignment, priority, comment, note, and workflow data.

###### 

###### \#### UI and Responsive Design

###### 

###### \- Reuse the Zen Green visual style.

###### \- Show the authenticated user's name and role.

###### \- Provide role-specific navigation.

###### \- Provide loading, saving, success, validation, empty, no-result, forbidden, and failure feedback.

###### \- Support desktop, tablet, and mobile layouts.

###### \- Prevent overlap, clipping, and unreadable content.

###### 

###### \### 3.2 Out of Scope

###### 

###### The following features are excluded from Lab 3:

###### 

###### \- Email invitations.

###### \- Password reset by email.

###### \- Multi-factor authentication.

###### \- Social login.

###### \- Single sign-on.

###### \- Self-registration.

###### \- Actions Taken.

###### \- SLA management.

###### \- Escalation.

###### \- Notifications.

###### \- Dashboards and KPI reports.

###### \- Multi-tenant support.

###### \- Production or cloud deployment.

###### \- Multiple roles per user.

###### \- User deletion.

###### \- Bulk user operations.

###### \- User import or export.

###### \- User history.

###### \- Extended user profiles.

###### \- Email delivery.

###### \- Account unlocking or approval workflows.

###### \- Mandatory advanced pagination for user management.

###### \- Multi-column sorting for user management.

###### \- Multiple simultaneous user-list filters.

###### 

###### \---

###### 

###### \## 4. Functional Requirements

###### 

###### \### FR-01 Authentication

###### 

###### The system shall allow an active user to log in using a valid email and password.

###### 

###### The system shall reject:

###### 

###### \- Missing email.

###### \- Missing password.

###### \- Invalid credentials.

###### \- Inactive accounts.

###### \- Unknown accounts.

###### 

###### The system shall not reveal whether an email exists through unsafe error messages.

###### 

###### \### FR-02 First-Login Password Change

###### 

###### A user marked as requiring an initial-password change shall not enter the normal application until the password is changed successfully.

###### 

###### The system shall provide:

###### 

###### \- Current password input.

###### \- New password input.

###### \- Confirm password input.

###### \- Password validation.

###### \- Password confirmation validation.

###### \- Success feedback.

###### \- Failure feedback.

###### 

###### After a successful password change, the user may enter the normal application.

###### 

###### \### FR-03 Logout

###### 

###### The system shall provide a logout action for authenticated users.

###### 

###### After logout:

###### 

###### \- The authentication session or token shall be invalidated.

###### \- Protected pages shall no longer be accessible.

###### \- The user shall be returned to the login page.

###### 

###### \### FR-04 Current User

###### 

###### The system shall provide the currently authenticated user's:

###### 

###### \- ID.

###### \- Name.

###### \- Email.

###### \- Role.

###### \- Activation status.

###### \- First-login password-change state.

###### 

###### The frontend shall use this information to display the authenticated shell and role-specific navigation.

###### 

###### \### FR-05 Requester Identity

###### 

###### Requester ownership shall be determined by the authenticated user identity.

###### 

###### The client shall not be trusted to select or override the requester identity through requesterId.

###### 

###### A Requester shall only be able to access tickets owned by that Requester.

###### 

###### \### FR-06 Requester Ticket Regression

###### 

###### Existing Lab 2 requester functions shall continue to work after authentication is introduced.

###### 

###### The following behavior shall remain available:

###### 

###### \- Creating tickets.

###### \- Viewing own tickets.

###### \- Viewing ticket details.

###### \- Managing own attachments.

###### \- Searching and filtering where already supported.

###### \- Existing attachment rules.

###### \- Existing ownership rules.

###### 

###### \### FR-07 IT Staff Queue

###### 

###### The system shall provide an IT Staff queue containing tickets accessible to IT Staff.

###### 

###### The queue shall support:

###### 

###### \- Search.

###### \- Supported filters.

###### \- Supported sorting.

###### \- Pagination.

###### \- Ticket number.

###### \- Title or subject.

###### \- Requester.

###### \- Status.

###### \- IT Priority.

###### \- Assigned IT Staff.

###### \- Created date.

###### 

###### The exact query parameters and response shape shall be defined in `api-spec.md`.

###### 

###### \### FR-08 Ticket Assignment

###### 

###### Each ticket may have zero or one primary owner.

###### 

###### A ticket may initially be unassigned.

###### 

###### Only an active IT Staff member or Administrator may be assigned as the primary owner.

###### 

###### IT Staff shall be able to:

###### 

###### \- Claim an unassigned ticket.

###### \- Assign a ticket to an eligible IT Staff member.

###### \- Reassign a ticket where permitted.

###### 

###### \### FR-09 IT Priority

###### 

###### The system shall retain the Requester's original Requested Priority.

###### 

###### The IT Priority shall initially copy the Requested Priority.

###### 

###### After creation, IT Staff or Administrator may change the IT Priority.

###### 

###### The Requester's Requested Priority shall not be overwritten by changes to IT Priority.

###### 

###### \### FR-10 Ticket Status

###### 

###### The system shall support these statuses:

###### 

###### \- New

###### \- Open

###### \- In Progress

###### \- Waiting for Requester

###### \- Resolved

###### \- Closed

###### \- Reopened

###### \- Cancelled

###### 

###### The permitted status transitions and allowed roles shall be defined in `api-spec.md` and `tests.md`.

###### 

###### Requesters may indicate that the problem appears resolved, but they shall not directly set a ticket to Resolved or Closed.

###### 

###### \### FR-11 Public Comments

###### 

###### Public Comments shall be visible to:

###### 

###### \- The ticket Requester.

###### \- IT Staff.

###### \- Administrators.

###### 

###### Public Comments shall:

###### 

###### \- Be linked to a ticket.

###### \- Store the author.

###### \- Store the creation time.

###### \- Be append-only.

###### \- Reject empty content.

###### \- Be rendered safely.

###### 

###### \### FR-12 Internal Notes

###### 

###### Internal Notes shall be visible only to:

###### 

###### \- IT Staff.

###### \- Administrators.

###### 

###### Requesters shall not be able to:

###### 

###### \- View Internal Notes.

###### \- Create Internal Notes.

###### \- Edit Internal Notes.

###### \- Delete Internal Notes.

###### 

###### Internal Notes shall:

###### 

###### \- Be linked to a ticket.

###### \- Store the author.

###### \- Store the creation time.

###### \- Be append-only.

###### \- Reject empty content.

###### \- Be rendered safely.

###### 

###### \### FR-13 Administrator User Management

###### 

###### Administrators shall be able to:

###### 

###### \- View users.

###### \- Search users.

###### \- Optionally filter users by role.

###### \- Create a user.

###### \- Edit a user's name.

###### \- Edit a user's email.

###### \- Edit a user's role.

###### \- Edit a user's activation status.

###### \- Set a new initial password.

###### 

###### Each user shall have exactly one role.

###### 

###### The system shall reject duplicate email addresses.

###### 

###### A newly assigned initial password shall require the user to change the password at the next login.

###### 

###### The system shall prevent:

###### 

###### \- An Administrator deactivating their own account.

###### \- Deactivation of the last active Administrator.

###### \- Invalid roles.

###### \- Invalid email addresses.

###### \- Invalid passwords.

###### 

###### \---

###### 

###### \## 5. Business Rules

###### 

###### \### BR-01 Active User Login

###### 

###### Only an active user with valid credentials may log in.

###### 

###### \### BR-02 Initial Password

###### 

###### A user requiring an initial-password change cannot access the normal application before changing the password successfully.

###### 

###### \### BR-03 Authenticated Ownership

###### 

###### The authenticated user identity determines Requester ownership.

###### 

###### The client-provided requesterId shall not be trusted.

###### 

###### \### BR-04 Comment Visibility

###### 

###### Public Comments are visible to Requesters, IT Staff, and Administrators.

###### 

###### Internal Notes are visible only to IT Staff and Administrators.

###### 

###### \### BR-05 Requester Resolution Indication

###### 

###### A Requester may indicate that the problem appears resolved.

###### 

###### A Requester cannot directly set a ticket to Resolved or Closed.

###### 

###### \### BR-06 One Role per User

###### 

###### Each User has exactly one role:

###### 

###### \- Requester.

###### \- IT Staff.

###### \- Administrator.

###### 

###### \### BR-07 Inactive Users

###### 

###### Inactive users cannot log in.

###### 

###### Inactive IT Staff and Administrators cannot be assigned as ticket owners.

###### 

###### \### BR-08 Unique Email

###### 

###### Every user email must be unique.

###### 

###### Email comparison shall be handled consistently by the backend.

###### 

###### \### BR-09 Password Security

###### 

###### Passwords shall never be stored in plaintext.

###### 

###### Passwords shall be stored using a secure password-hashing method.

###### 

###### Passwords shall not be returned in API responses.

###### 

###### \### BR-10 Session Security

###### 

###### Authentication state shall be stored securely.

###### 

###### Logout shall invalidate the active session or token.

###### 

###### Authentication expiration behavior shall be defined in `api-spec.md`.

###### 

###### \### BR-11 Ticket Owner

###### 

###### A ticket may have zero or one primary owner.

###### 

###### The owner must be an active IT Staff member or Administrator.

###### 

###### \### BR-12 Initial Assignment

###### 

###### New tickets are initially unassigned unless the implementation explicitly defines another permitted rule.

###### 

###### \### BR-13 Requested Priority

###### 

###### Requested Priority is the priority selected by the Requester when creating the ticket.

###### 

###### It remains unchanged after ticket creation.

###### 

###### \### BR-14 IT Priority

###### 

###### IT Priority initially copies Requested Priority.

###### 

###### Only IT Staff or Administrators may change IT Priority after creation.

###### 

###### \### BR-15 Status Authorization

###### 

###### Only roles permitted by the status transition matrix may change a ticket status.

###### 

###### The backend must reject unauthorized status changes.

###### 

###### \### BR-16 Comment Content

###### 

###### Comments and Internal Notes must contain nonempty content.

###### 

###### The maximum content length shall be defined consistently in `api-spec.md`, `ui-spec.md`, and `tests.md`.

###### 

###### \### BR-17 Append-only Communication

###### 

###### Public Comments and Internal Notes cannot be edited or deleted after creation in Lab 3.

###### 

###### \### BR-18 Administrator Protection

###### 

###### An Administrator cannot deactivate their own account.

###### 

###### The system must always preserve at least one active Administrator.

###### 

###### \### BR-19 User Deactivation

###### 

###### Users are deactivated instead of deleted.

###### 

###### Historical tickets, comments, and notes must remain associated with their original authors or owners.

###### 

###### \### BR-20 Migration Preservation

###### 

###### Existing Lab 2 tickets, attachments, categories, systems, and ownership information must remain valid after migration.

###### 

###### \---

###### 

###### \## 6. UI Summary

###### 

###### \### 6.1 Login

###### 

###### The Login screen shall contain:

###### 

###### \- Email input.

###### \- Password input.

###### \- Login button.

###### \- Validation messages.

###### \- Busy state.

###### \- Safe authentication error.

###### \- Inactive-account feedback.

###### 

###### \### 6.2 First-Login Password Change

###### 

###### The password-change screen shall contain:

###### 

###### \- Current password input.

###### \- New password input.

###### \- Confirm password input.

###### \- Password requirements.

###### \- Change password button.

###### \- Validation messages.

###### \- Success and failure feedback.

###### 

###### \### 6.3 Authenticated Shell

###### 

###### The authenticated application shall show:

###### 

###### \- User name.

###### \- User role.

###### \- Logout action.

###### \- Password/profile action where implemented.

###### \- Role-specific navigation.

###### 

###### The temporary Development Requester selector shall be removed.

###### 

###### \### 6.4 Requester Interface

###### 

###### The Requester interface shall preserve Lab 2 functionality and add:

###### 

###### \- Authenticated ownership.

###### \- Public Comments.

###### \- Problem Appears Resolved action.

###### 

###### \### 6.5 IT Staff Queue

###### 

###### The IT Staff queue shall show:

###### 

###### \- Search controls.

###### \- Supported filters.

###### \- Sorting controls.

###### \- Pagination.

###### \- Ticket number.

###### \- Title.

###### \- Requester.

###### \- Status.

###### \- IT Priority.

###### \- Assignment.

###### \- Loading state.

###### \- Empty state.

###### \- No-results state.

###### \- Forbidden state.

###### \- Failure state.

###### 

###### \### 6.6 IT Staff Ticket Detail

###### 

###### The ticket detail screen shall show:

###### 

###### \- Ticket information.

###### \- Requester information.

###### \- Assignment.

###### \- IT Priority.

###### \- Status.

###### \- Attachments.

###### \- Public Comments.

###### \- Internal Notes.

###### \- Actions available to the current role.

###### 

###### Public Comments and Internal Notes shall be visually distinguishable.

###### 

###### \### 6.7 Administrator User Management

###### 

###### The user-management screen shall show:

###### 

###### \- Name.

###### \- Email.

###### \- Role.

###### \- Activation status.

###### \- Edit action.

###### \- Search control.

###### \- Optional role filter.

###### \- Create user action.

###### \- Initial password field.

###### \- Validation messages.

###### \- Success and failure feedback.

###### 

###### The interface shall not include user deletion, bulk operations, advanced multi-column sorting, or multiple simultaneous filters.

###### 

###### \---

###### 

###### \## 7. Data Changes

###### 

###### The database shall evolve from Lab 2 without losing existing data.

###### 

###### \### 7.1 User

###### 

###### The User model shall support:

###### 

###### \- id

###### \- name

###### \- email

###### \- passwordHash

###### \- role

###### \- isActive

###### \- mustChangePassword

###### \- createdAt

###### \- updatedAt

###### 

###### Each User has exactly one role.

###### 

###### \### 7.2 Ticket

###### 

###### The Ticket model shall support:

###### 

###### \- Existing Lab 2 ticket fields.

###### \- requesterId.

###### \- primaryOwnerId, nullable.

###### \- requestedPriority.

###### \- itPriority.

###### \- status.

###### \- requesterResolvedIndication where required.

###### \- createdAt.

###### \- updatedAt.

###### 

###### \### 7.3 Comments

###### 

###### A Public Comment shall support:

###### 

###### \- id

###### \- ticketId

###### \- authorId

###### \- content

###### \- createdAt

###### 

###### \### 7.4 Internal Notes

###### 

###### An Internal Note shall support:

###### 

###### \- id

###### \- ticketId

###### \- authorId

###### \- content

###### \- createdAt

###### 

###### \### 7.5 Migration

###### 

###### Development Requester records shall be migrated into User records.

###### 

###### The migration shall:

###### 

###### \- Preserve existing requester information.

###### \- Preserve ticket ownership.

###### \- Preserve existing tickets.

###### \- Preserve existing attachments.

###### \- Preserve existing categories and systems.

###### \- Define initial passwords.

###### \- Mark migrated users as requiring a password change where appropriate.

###### \- Remove the need for the frontend Development Requester selector.

###### 

###### \### 7.6 Seed Data

###### 

###### The seed shall be idempotent and include at least:

###### 

###### \- Four active Requesters.

###### \- One inactive Requester.

###### \- Three active IT Staff.

###### \- One inactive IT Staff.

###### \- One active Administrator.

###### \- Tickets distributed across Requesters.

###### \- Different ticket statuses.

###### \- Different Requested Priorities.

###### \- Different IT Priorities.

###### \- Assigned and unassigned tickets.

###### \- Public Comments.

###### \- Internal Notes.

###### 

###### Seed credentials are for local development only and must not contain real secrets.

###### 

###### \---

###### 

###### \## 8. API Contract Summary

###### 

###### The exact paths, request bodies, response bodies, status codes, cookies or tokens, and error formats shall be defined in `api-spec.md`.

###### 

###### The API shall support:

###### 

###### \### Authentication

###### 

###### \- Login.

###### \- Logout.

###### \- Current user.

###### \- Change initial password.

###### 

###### \### Requester

###### 

###### \- Authenticated ticket creation.

###### \- Own-ticket listing.

###### \- Own-ticket detail.

###### \- Own attachment operations.

###### \- Public Comments.

###### \- Problem Appears Resolved indication.

###### 

###### \### IT Staff

###### 

###### \- Queue listing.

###### \- Search.

###### \- Filtering.

###### \- Sorting.

###### \- Pagination.

###### \- Ticket detail.

###### \- Claim.

###### \- Assign.

###### \- Reassign.

###### \- IT Priority update.

###### \- Status update.

###### \- Public Comments.

###### \- Internal Notes.

###### 

###### \### Administrator

###### 

###### \- User listing.

###### \- User search.

###### \- Optional role filter.

###### \- User creation.

###### \- User update.

###### \- Initial password update.

###### 

###### The API shall distinguish:

###### 

###### \- Unauthenticated requests.

###### \- Forbidden requests.

###### \- Invalid input.

###### \- Missing resources.

###### \- Conflicts.

###### \- Unexpected server errors.

###### 

###### Protected endpoints shall not reveal protected resources belonging to another user.

###### 

###### \---

###### 

###### \## 9. Acceptance Criteria

###### 

###### \### AC-01 Authentication

###### 

###### A valid active user can log in.

###### 

###### Invalid credentials and inactive users are rejected safely.

###### 

###### \### AC-02 First Login

###### 

###### A user with an initial password must change the password before accessing the normal application.

###### 

###### \### AC-03 Logout

###### 

###### Logout invalidates access to protected pages and endpoints.

###### 

###### \### AC-04 Authenticated Requester

###### 

###### Requester ownership is determined by the authenticated identity.

###### 

###### A client cannot create or access tickets for another Requester by changing requesterId.

###### 

###### \### AC-05 Lab 2 Regression

###### 

###### Existing Lab 2 requester features continue to work after authentication is introduced.

###### 

###### \### AC-06 IT Queue

###### 

###### IT Staff can view, search, filter, sort, and paginate the permitted ticket queue.

###### 

###### \### AC-07 Assignment

###### 

###### IT Staff can claim, assign, and reassign tickets according to the authorization rules.

###### 

###### \### AC-08 IT Priority

###### 

###### IT Staff can change IT Priority while Requested Priority remains unchanged.

###### 

###### \### AC-09 Status Workflow

###### 

###### Only permitted roles can perform permitted status transitions.

###### 

###### \### AC-10 Public Comments

###### 

###### Requesters, IT Staff, and Administrators can view Public Comments according to access rules.

###### 

###### \### AC-11 Internal Notes

###### 

###### IT Staff and Administrators can view and create Internal Notes.

###### 

###### Requesters cannot access Internal Notes.

###### 

###### \### AC-12 Requester Resolution Indication

###### 

###### Requesters can indicate that a problem appears resolved without directly setting Resolved or Closed.

###### 

###### \### AC-13 Administrator User Management

###### 

###### Administrators can create and update users while duplicate emails and invalid values are rejected.

###### 

###### \### AC-14 Administrator Protection

###### 

###### An Administrator cannot deactivate themselves or the last active Administrator.

###### 

###### \### AC-15 Migration

###### 

###### Existing Lab 2 data remains valid after migration.

###### 

###### \### AC-16 Responsive UI

###### 

###### The Login, Requester, IT Staff, and Administrator interfaces work on desktop, tablet, and mobile without overlap or clipping.

###### 

###### \### AC-17 Backend Security

###### 

###### Every protected operation is enforced by the backend, not only by hiding frontend controls.

###### 

###### \---

###### 

###### \## 10. Definition of Done

###### 

###### The Lab 3 work is complete when:

###### 

###### \- The four Lab 3 contract documents are present.

###### \- The migration plan is documented and tested.

###### \- Authentication works.

###### \- First-login password change works.

###### \- Logout works.

###### \- Backend authorization is implemented.

###### \- Requester ownership uses authenticated identity.

###### \- Lab 2 requester regression tests pass.

###### \- IT Staff queue works.

###### \- IT Staff ticket detail works.

###### \- Assignment and reassignment work.

###### \- IT Priority works.

###### \- Status transitions are enforced.

###### \- Public Comments work.

###### \- Internal Notes are protected.

###### \- Administrator user management works.

###### \- Required unit, API, UI, responsive, security, migration, regression, and E2E tests are implemented.

###### \- No required tests are skipped in the final main branch.

###### \- Seed data is idempotent and meets the required role counts.

###### \- Existing Lab 2 data is preserved.

###### \- UI follows the Zen Green style.

###### \- Desktop, tablet, and mobile layouts are checked.

###### \- `reviewer.md` and `ai-use.md` are updated.

###### \- All required GitHub Issues are completed.

###### \- Required Pull Requests are reviewed and approved.

###### \- Final changes are merged through the required branch flow.

###### \- Final evidence is collected from the final `main` branch.

###### 

###### \---

###### 

###### \## 11. Assumptions and Decisions

###### 

###### 1\. Each user has exactly one role.

###### 2\. User accounts are created by an Administrator or seed data.

###### 3\. Self-registration is not included.

###### 4\. Password reset by email is not included.

###### 5\. Users are deactivated instead of deleted.

###### 6\. Existing Lab 2 data must be preserved.

###### 7\. Development Requester records will be migrated to User records.

###### 8\. The frontend will not be trusted to determine ownership or authorization.

###### 9\. Public Comments and Internal Notes are append-only.

###### 10\. Requesters cannot directly set Resolved or Closed.

###### 11\. IT Priority is separate from Requested Priority.

###### 12\. Tickets have at most one primary owner.

###### 13\. A ticket may initially be unassigned.

###### 14\. Only active IT Staff or Administrators may own tickets.

###### 15\. The exact status transition matrix will be finalized in `api-spec.md`.

###### 16\. The exact API error format will be finalized in `api-spec.md`.

###### 17\. The exact password rules will be consistent across the API, UI, and tests.

###### 18\. The exact comment and note length limits will be consistent across the API, UI, and tests.

###### 19\. The existing Zen Green style will be reused.

###### 20\. Features explicitly excluded by the Labsheet will not be implemented in Lab 3.

