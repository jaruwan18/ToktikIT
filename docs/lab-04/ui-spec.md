# TokTickIT Lab 4 UI Specification

## 1. Purpose

This document defines the UI requirements for Lab 4.

Lab 4 extends the existing TokTickIT interface without replacing the screens and navigation implemented in Labs 1-3.

The UI shall support:

* IT Staff Dashboard
* Requester Dashboard
* Actions Taken on Ticket Detail
* Ticket status workflow
* Loading states
* Empty states
* Validation errors
* Forbidden states
* Not-found states
* Conflict/stale-update states
* Safe API failure states
* Responsive behavior
* Accessibility
* Zen Green visual consistency

The UI must follow the existing application conventions wherever possible.

---

# 2. Global UI Principles

## 2.1 Existing Application First

Lab 4 shall extend the existing TokTickIT interface.

Existing:

* navigation
* layout
* typography
* buttons
* forms
* cards
* tables
* dialogs
* status indicators
* priority indicators

should be reused where appropriate.

New components must not introduce an unrelated visual style.

---

## 2.2 Zen Green Design Language

The Lab 4 UI shall preserve the existing Zen Green design language.

The following shall remain visually consistent:

* primary actions
* navigation
* cards
* buttons
* form controls
* Ticket status
* Ticket priority
* success messages
* error messages
* dashboard components

The implementation should use the existing project styles and Bootstrap conventions rather than introducing an unnecessary new design system.

---

## 2.3 Information Hierarchy

Important information should be visually easy to identify.

The UI should prioritize:

1. Ticket identity
2. Ticket status
3. Ticket priority
4. Ownership/assignment
5. Actions Taken
6. Recent updates
7. Available actions

Users should be able to understand the current Ticket state without opening unnecessary dialogs or navigating through multiple screens.

---

# 3. Role Navigation

## 3.1 Requester

The Requester navigation shall provide access to:

* Requester Dashboard
* My Tickets
* Ticket Detail
* other existing Requester functions from Labs 1-3

The Requester Dashboard must not replace the existing My Tickets screen.

---

## 3.2 IT Staff

IT Staff navigation shall provide access to:

* IT Staff Dashboard
* Tickets
* My Tickets where applicable
* Ticket Detail
* existing IT Staff functions from Labs 1-3

---

## 3.3 Administrator

Administrator navigation shall retain existing administrative functions.

Administrators shall receive the same Lab 4 operational capabilities as IT Staff where specified by the Engineering Contract.

---

## 3.4 Unauthorized Navigation

Navigation items that are not available to the current role should not be presented as usable controls.

However, hiding navigation is only a usability mechanism.

Backend authorization remains authoritative.

If a protected page or operation is accessed directly without permission, the UI shall display an appropriate forbidden state.

---

# 4. IT Staff Dashboard

## 4.1 Purpose

The IT Staff Dashboard provides concise operational information for IT Staff and Administrators.

The dashboard must help users quickly identify Tickets that require attention.

---

## 4.2 Dashboard Layout

The dashboard should contain:

* metric cards
* operational summaries
* recent Ticket information
* drill-down controls

The layout should remain readable on desktop, tablet, and mobile screens.

---

## 4.3 Metric Cards

The dashboard may display:

### Unassigned Tickets

Shows the number of accessible Tickets without a Ticket Owner/assignee according to the existing Ticket data model.

The card should provide a path to the relevant Ticket list.

---

### Current User Owned

Shows the number of accessible Tickets assigned to the authenticated IT Staff user.

The card should provide a path to the relevant Ticket list.

---

### Status Summary

Shows Ticket counts grouped by supported statuses.

Supported statuses:

* New
* Open
* In Progress
* Waiting for Requester
* Resolved
* Closed
* Reopened
* Cancelled

---

### Priority Summary

Shows Ticket counts grouped by the existing Ticket priority values.

The UI must use the priority values already defined by the application.

---

### Recently Updated

Shows relevant recently updated Tickets.

The UI shall use the same time-window and timezone convention as the dashboard API.

---

## 4.4 Dashboard Drill-down

Actionable metric cards shall provide a clear way to open the corresponding detailed or filtered Ticket view.

Examples:

```text
Unassigned Tickets
        ↓
Filtered Ticket Queue
```

```text
Current User Owned
        ↓
My Assigned Tickets
```

```text
Waiting for Requester
        ↓
Filtered Ticket Queue
```

The dashboard should not duplicate the complete Ticket list unnecessarily.

---

# 5. IT Staff Dashboard States

## 5.1 Loading State

While dashboard data is being retrieved:

* show a clear loading indicator
* maintain the page layout
* avoid displaying misleading zero values
* prevent accidental duplicate actions where appropriate

---

## 5.2 Empty State

If there are no matching operational records:

* display a clear message
* display zero values where appropriate
* do not treat an empty result as an error

Example:

```text
No Tickets currently require attention.
```

---

## 5.3 Forbidden State

If a user without Staff/Admin permission attempts to access the Staff Dashboard:

* show a clear forbidden message
* do not display protected dashboard data

---

## 5.4 API Failure State

If the dashboard API fails:

* display a safe error message
* do not display sensitive backend information
* provide a retry action where appropriate
* preserve surrounding page state where possible

---

# 6. Requester Dashboard

## 6.1 Purpose

The Requester Dashboard summarizes the authenticated Requester's own Tickets.

It must never expose another Requester's data.

---

## 6.2 Dashboard Metrics

The Requester Dashboard shall provide:

### Total Open Tickets

Shows the number of the authenticated Requester's Tickets considered open according to the approved workflow.

---

### Waiting for Requester

Shows the number of the authenticated Requester's Tickets currently in:

```text
Waiting for Requester
```

---

### Recently Updated

Shows recently updated Tickets belonging only to the authenticated Requester.

---

### Recently Resolved

Shows recently resolved Tickets belonging only to the authenticated Requester.

---

## 6.3 Recent Ticket Information

The dashboard may show concise information such as:

* Ticket number
* Ticket title
* status
* priority
* last updated time

The user should be able to open the relevant Ticket Detail.

---

## 6.4 Ownership Protection

The Requester Dashboard must display only data returned for the authenticated Requester.

The UI must not allow a Requester to select or enter another Requester's ID to retrieve dashboard information.

Backend ownership protection remains authoritative.

---

## 6.5 No My Tickets Duplication

The Requester Dashboard should provide summary information and attention-focused items.

It should not duplicate the complete My Tickets screen.

---

# 7. Requester Dashboard States

## 7.1 Loading

While dashboard data is loading:

* show a clear loading indicator
* preserve dashboard structure
* avoid misleading metric values

---

## 7.2 Empty

When the Requester has no matching Tickets:

* display zero metric values
* display a helpful empty-state message
* do not show an error

Example:

```text
You have no Tickets requiring attention.
```

---

## 7.3 Forbidden

If the dashboard cannot be accessed:

* display a clear forbidden message
* do not render protected Ticket information

---

## 7.4 API Failure

If the dashboard API fails:

* display a safe error message
* provide retry where appropriate
* do not display backend stack traces or sensitive details

---

# 8. Actions Taken on Ticket Detail

## 8.1 Purpose

Actions Taken are displayed within the existing Ticket Detail screen.

The feature must extend Ticket Detail rather than creating an unnecessary separate application screen.

---

## 8.2 Actions Taken List

The Actions Taken section shall display:

* Action Date/Time
* Action Description
* Result
* Performed By
* Follow-Up Required
* Follow-up Note
* Attachment Notes

The UI may use a table, list, or another structure consistent with the existing Ticket Detail design.

---

## 8.3 Empty Actions State

A Ticket with no Actions Taken must display a valid empty state.

Example:

```text
No Actions Taken have been recorded for this Ticket.
```

For authorized IT Staff/Admin users, the UI should provide an option to add the first Action Taken.

---

## 8.4 Requester View

Requesters can view Actions Taken for Tickets they own.

Requesters must not see controls for:

* creating Actions Taken
* editing Actions Taken
* changing Action Taken data

Actions Taken are read-only for Requesters.

---

## 8.5 IT Staff View

Authorized IT Staff can:

* view Actions Taken
* create Actions Taken
* edit Actions Taken

The create and edit controls should be clearly associated with the Actions Taken section.

---

## 8.6 Administrator View

Administrators receive the same Actions Taken UI capabilities as IT Staff according to the approved authorization rules.

---

# 9. Create Action Taken Form

## 9.1 Form Fields

The form shall provide:

* Action Date/Time
* Action Description
* Result
* Follow-Up Required
* Follow-up Note
* Attachment Notes

The authenticated user is recorded automatically as the performer.

The user should not be required to manually enter their own identity.

---

## 9.2 Follow-Up Validation

When:

```text
Follow-Up Required = Yes
```

the Follow-up Note field becomes required.

If the user attempts to submit without a Follow-up Note:

* prevent invalid submission where practical
* display a clear validation message
* preserve the entered form data

---

## 9.3 Form Submission

While submitting:

* disable or protect the submit action from duplicate clicks
* show a loading indicator
* do not create duplicate Actions Taken

After successful creation:

* close the form or return to the Action list
* display the newly created Action
* refresh the relevant Ticket summary if required

---

# 10. Edit Action Taken

Authorized IT Staff/Admin users may edit an existing Action Taken.

The edit form shall:

* display existing values
* allow permitted fields to be changed
* validate required fields
* preserve form data after recoverable failures
* prevent duplicate submission

After successful update:

* display the updated Action
* refresh the Action list
* show a clear success state where appropriate

---

# 11. Actions Taken Error States

The UI shall handle:

### Validation Error

Display field-level or form-level validation messages.

### Forbidden

Display that the current user does not have permission.

### Not Found

Display that the Ticket or Action Taken no longer exists.

### Conflict

Display a message indicating that the Action or Ticket changed and the user should refresh/retry.

### API Failure

Display a safe error message without exposing internal server information.

---

# 12. Ticket Workflow UI

## 12.1 Current Status

Ticket Detail shall clearly display the current Ticket status.

Supported statuses:

* New
* Open
* In Progress
* Waiting for Requester
* Resolved
* Closed
* Reopened
* Cancelled

---

## 12.2 Status Controls

IT Staff/Admin users shall see only status transitions permitted from the current Ticket state.

The UI must not offer obviously invalid transitions.

However, the backend remains responsible for enforcing the actual transition.

---

## 12.3 Requester Status View

Requesters can view the current Ticket status.

Requesters do not receive the formal IT Staff/Admin status transition controls.

If Requester feedback indicates that the problem appears resolved, the UI shall distinguish this from the formal `Resolved` status transition.

---

## 12.4 Resolution Guidance

When a user attempts to resolve a Ticket:

* display any required resolution information
* validate required conditions where practical
* provide clear feedback if the resolution rule is not satisfied

The backend remains authoritative.

---

## 12.5 Successful Status Change

After a successful status change:

* update the displayed status
* refresh relevant Ticket summary information
* update available transition controls
* display success feedback where appropriate

---

## 12.6 Invalid Transition

If the backend rejects the transition:

* keep the current valid status displayed
* show a safe explanation
* do not imply that the transition succeeded

---

## 12.7 Conflict / Stale Update

If another user changed the Ticket before the current update completed:

* show a conflict message
* avoid silently overwriting the newer state
* refresh the Ticket state when appropriate
* preserve recoverable user input where possible

---

# 13. General Loading Behavior

All Lab 4 interactive screens shall provide clear loading behavior.

Loading indicators should:

* appear close to the affected content
* avoid blocking unrelated parts of the page
* prevent duplicate actions
* not display misleading information

---

# 14. General Empty States

Empty states shall distinguish between:

* valid empty results
* errors
* forbidden access
* loading

Examples:

```text
No Actions Taken have been recorded.
```

```text
No Tickets currently match this dashboard metric.
```

Empty states should provide a useful next action when appropriate.

---

# 15. General Error Handling

The UI shall safely handle:

* validation errors
* unauthorized access
* forbidden access
* not found
* conflicts
* stale updates
* server errors
* network failures

The UI must not expose:

* stack traces
* database errors
* SQL statements
* server paths
* credentials
* session secrets

---

# 16. Duplicate Submission Protection

Interactive operations must be protected against accidental duplicate submissions.

This applies to:

* creating Actions Taken
* updating Actions Taken
* changing Ticket status
* retrying failed operations

The UI may:

* disable the submit button while processing
* show a progress state
* prevent repeated clicks
* safely restore the action after completion

The backend remains responsible for final duplicate/retry safety.

---

# 17. Responsive Requirements

Lab 4 must work on:

* desktop
* tablet
* mobile

---

## 17.1 Desktop

Desktop layouts should use available screen space efficiently.

Dashboard cards may be displayed in rows or grids.

Ticket Detail and Actions Taken should remain easy to scan.

---

## 17.2 Tablet

Tablet layouts must adapt without:

* clipped content
* overlapping controls
* unusable tables
* inaccessible dialogs

Dashboard cards may wrap into multiple rows.

---

## 17.3 Mobile

Mobile layouts must remain usable without unnecessary horizontal page scrolling.

Requirements include:

* readable text
* accessible buttons
* usable forms
* appropriately stacked metric cards
* usable Actions Taken content
* accessible dialogs
* accessible navigation

---

## 17.4 Responsive Tables

If Actions Taken are displayed in a table, the implementation must ensure that mobile users can access all required information.

The UI should prefer:

* responsive stacking
* readable row layouts
* appropriately wrapped content

over forcing unnecessary page-wide horizontal scrolling.

---

# 18. Accessibility

## 18.1 Keyboard Navigation

All important interactive controls must be usable with a keyboard.

This includes:

* navigation
* dashboard cards
* buttons
* forms
* dialogs
* status controls
* Actions Taken controls

---

## 18.2 Visible Focus

Keyboard focus must be clearly visible.

Users must be able to determine which element currently has focus.

---

## 18.3 Semantic Labels

Controls must have meaningful accessible labels.

Examples include:

* Add Action Taken
* Edit Action Taken
* Change Ticket Status
* Retry
* Close Dialog

Icon-only controls must have an accessible name.

---

## 18.4 Non-color Status Indicators

Status and priority must not be communicated only through color.

Use:

* text labels
* icons
* badges
* other non-color indicators

where appropriate.

---

## 18.5 Form Accessibility

Forms must provide:

* associated labels
* understandable validation messages
* keyboard access
* visible focus
* clear required-field indication

---

## 18.6 Dialog Accessibility

Dialogs must:

* have a meaningful title
* be keyboard accessible
* have accessible controls
* provide a clear close action
* maintain logical focus behavior

---

# 19. Visual Distinction

The UI should clearly distinguish different types of information.

Examples:

* Ticket status
* Ticket priority
* Action Taken information
* internal/private information
* requester-visible information
* success messages
* validation messages
* error messages

The distinction must not rely only on color.

---

# 20. Dashboard Visual Requirements

Dashboard metric cards should:

* have clear labels
* display understandable values
* provide enough contrast
* support keyboard interaction when clickable
* provide visible focus
* communicate whether they are actionable

Clickable metric cards should behave like accessible interactive controls rather than decorative elements.

---

# 21. Navigation and Existing Screens

Lab 4 must not unnecessarily replace existing screens.

The implementation should preserve:

* existing navigation
* existing Ticket list behavior
* My Tickets
* Ticket Detail
* comments
* internal notes
* attachments
* user management
* authentication-related screens

New Lab 4 screens and sections should integrate naturally with the existing application.

---

# 22. Obsolete and Unfinished UI

Before final integration, the application shall be checked for:

* placeholder text
* unfinished buttons
* broken links
* dead navigation items
* console-error-causing interactions
* duplicate controls
* obsolete Lab 4 UI
* inaccessible dialogs
* incomplete forms

No known unfinished Lab 4 UI should remain in the final release.

---

# 23. UI Test Targets

The following UI test files are required:

```text
client/
└── .../
    └── lab-04 tests/
        ├── StaffDashboard.test.tsx
        ├── RequesterDashboard.test.tsx
        ├── ActionsTaken.test.tsx
        └── TicketWorkflow.test.tsx
```

The tests shall cover the UI requirements defined in this document.

---

# 24. UI Acceptance Summary

The UI implementation is considered acceptable when:

* IT Staff Dashboard is available to authorized IT Staff/Admin users.
* Requester Dashboard is available to authenticated Requesters.
* Requester Dashboard shows only the authenticated Requester's data.
* Dashboard metrics have clear meanings.
* Dashboard metrics provide appropriate drill-down behavior.
* Actions Taken appear on Ticket Detail.
* Requesters can view Actions Taken but cannot create or modify them.
* IT Staff/Admin users can create and update Actions Taken.
* Follow-up validation works.
* Ticket status controls show permitted transitions.
* Invalid transitions are rejected safely.
* Resolution guidance is provided.
* Backend workflow rules remain authoritative.
* Loading states are implemented.
* Empty states are implemented.
* Validation errors are implemented.
* Forbidden states are implemented.
* Not-found states are implemented.
* Conflict states are implemented.
* Safe API failure states are implemented.
* Duplicate submissions are protected.
* Desktop layout works.
* Tablet layout works.
* Mobile layout works.
* Keyboard navigation works.
* Visible focus is provided.
* Semantic labels are provided.
* Status/priority do not rely only on color.
* Dialogs are accessible.
* No clipped or overlapping content remains.
* No unnecessary horizontal page scrolling remains.
* Zen Green visual consistency is preserved.
* Existing Lab 1-3 screens and behavior remain intact.

---

# 25. UI Definition of Done

The Lab 4 UI is complete when:

* Staff Dashboard is implemented.
* Requester Dashboard is implemented.
* Actions Taken UI is implemented.
* Ticket Workflow UI is implemented.
* Role-based UI behavior is implemented.
* Backend authorization is respected.
* Loading states are implemented.
* Empty states are implemented.
* Error states are implemented.
* Conflict states are implemented.
* Duplicate submission protection is implemented.
* Responsive behavior is verified.
* Accessibility behavior is verified.
* Zen Green visual consistency is verified.
* Existing Lab 1-3 UI behavior remains functional.
* Required UI tests pass.
* E2E tests cover the major Lab 4 workflows.
* Required screenshots/evidence are collected.
* No broken links, placeholder controls, or unfinished Lab 4 UI remains.
