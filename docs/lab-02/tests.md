# Lab 2 Test Plan

## 1. Test Strategy

Lab 2 follows a test-first approach based on the Lab 2 specification, API specification, and UI specification.

The test strategy covers the following levels:

1. **Unit Test**
   - Verify Ticket Number generation and formatting.
   - Verify the business logic required by Lab 2.

2. **API / Integration Test**
   - Verify requester validation.
   - Verify ticket creation and validation.
   - Verify My Tickets filtering, searching, sorting, pagination, and ownership isolation.
   - Verify Ticket Detail ownership protection.
   - Verify attachment validation, ownership, soft removal, and download protection.
   - Verify requester and related-system reference data.

3. **UI Component Test**
   - Verify Create Ticket form behaviour.
   - Verify client-side validation.
   - Verify successful ticket creation.
   - Verify API failure handling and preservation of entered values.

4. **Responsive / Visual Test**
   - Verify Desktop, Tablet, and Mobile layouts.
   - Verify no clipping, overlapping content, or unwanted horizontal scrolling.

5. **End-to-End Test**
   - Verify the requester ticket workflow from the UI.
   - Verify requester ownership isolation.
   - Verify attachment lifecycle behaviour.

No required test is intentionally skipped, disabled, or commented out.

---

## 2. Planned Tests and Current Status

### 2.1 Unit Tests

| ID | Requirement / AC | Test | Actual Test Path | Status |
|---|---|---|---|---|
| UNIT-01 | BR-01 | Ticket Number format and generation | `server/tests/lab-02/ticket-number.test.ts` | **Passed** |

UNIT-01 verifies the backend-generated Ticket Number, including the required `TKT-YYYY-NNNNNN` format and Ticket Number generation behaviour.

---

### 2.2 API / Integration Tests

#### Create Ticket API

| ID | Requirement / AC | Test | Actual Test Path | Status |
|---|---|---|---|---|
| API-01 | AC-01, BR-01, BR-02 | Create valid ticket and return official Ticket Number | `server/tests/lab-02/create-ticket.test.ts` | **Passed** |
| API-02 | AC-04, BR-04 | Reject summary shorter than 5 characters | `server/tests/lab-02/create-ticket.test.ts` | **Passed** |
| API-03 | BR-05 | Validate description length | `server/tests/lab-02/create-ticket.test.ts` | **Passed** |
| API-04 | BR-06 | Validate category and related-system IDs | `server/tests/lab-02/create-ticket.test.ts` | **Passed** |
| API-05 | BR-07 | Validate priority value | `server/tests/lab-02/create-ticket.test.ts` | **Passed** |

Actual implementation uses:

`server/tests/lab-02/create-ticket.test.ts`

This file contains **6 passing tests**.

---

#### My Tickets API

| ID | Requirement / AC | Test | Actual Test Path | Status |
|---|---|---|---|---|
| API-06 | AC-09, FR-04 | Return only tickets belonging to selected requester | `server/tests/lab-02/my-tickets.test.ts` | **Passed** |
| API-07 | BR-12 | Search tickets by Ticket Number | `server/tests/lab-02/my-tickets.test.ts` | **Passed** |
| API-08 | BR-12 | Search tickets by Summary | `server/tests/lab-02/my-tickets.test.ts` | **Passed** |
| API-09 | BR-11 | Pagination and page-size behaviour | `server/tests/lab-02/my-tickets.test.ts` | **Passed** |
| API-10 | AC-11 | Empty state when requester has no tickets | `server/tests/lab-02/my-tickets.test.ts` | **Passed** |

Additional My Tickets API cases are also covered by the same test file, including filtering and ticket-list behaviour.

Actual implementation:

`server/tests/lab-02/my-tickets.test.ts`

The file contains **11 passing tests**.

---

#### Ticket Detail API

| ID | Requirement / AC | Test | Actual Test Path | Status |
|---|---|---|---|---|
| API-11 | AC-03, BR-09 | Prevent requester from accessing another requester's ticket | `server/tests/lab-02/ticket-detail.test.ts` | **Passed** |
| API-12 | FR-06 | Retrieve ticket detail for the owning requester | `server/tests/lab-02/ticket-detail.test.ts` | **Passed** |

Actual implementation:

`server/tests/lab-02/ticket-detail.test.ts`

The file contains **7 passing tests**.

---

#### Attachment API

| ID | Requirement / AC | Test | Actual Test Path | Status |
|---|---|---|---|---|
| API-13 | AC-07, BR-15 | Reject attachment larger than 5 MB | `server/tests/lab-02/attachments.test.ts` | **Passed** |
| API-14 | BR-15 | Validate permitted attachment types | `server/tests/lab-02/attachments.test.ts` | **Passed** |
| API-15 | AC-08 | Reject attachment when 5 active attachments already exist | `server/tests/lab-02/attachments.test.ts` | **Passed** |
| API-16 | AC-12, BR-16 | Soft-remove attachment and preserve metadata | `server/tests/lab-02/attachments.test.ts` | **Passed** |
| API-17 | BR-17 | Verify attachment ownership protection | `server/tests/lab-02/attachments.test.ts` | **Passed** |
| API-18 | AC-13 | Block download of a soft-removed attachment | `server/tests/lab-02/attachments.test.ts` | **Passed** |

Actual implementation:

`server/tests/lab-02/attachments.test.ts`

The file contains **13 passing tests**.

---

#### Requester API

| ID | Requirement / AC | Test | Actual Test Path | Status |
|---|---|---|---|---|
| API-19 | AC-14, BR-18 | Inactive requester is not available for selection | `server/tests/lab-02/requesters.test.ts` | **Passed** |
| API-20 | AC-15 | Handle requester list when no active requester is available | `server/tests/lab-02/requesters.test.ts` | **Passed** |

Actual implementation:

`server/tests/lab-02/requesters.test.ts`

The file contains **3 passing tests**.

---

#### Related-System / Reference Data API

| ID | Requirement / AC | Test | Actual Test Path | Status |
|---|---|---|---|---|
| API-21 | FR-03 | Related-system reference data behaviour | `server/tests/lab-02/related-systems.test.ts` | **Passed** |

Actual implementation:

`server/tests/lab-02/related-systems.test.ts`

The file contains **3 passing tests**.

---

#### Requester Identity API

| ID | Requirement / AC | Test | Actual Test Path | Status |
|---|---|---|---|---|
| API-22 | API specification / requester identity rules | Dedicated requester identity validation test | `server/tests/lab-02/requester-identity.api.test.ts` | **Not separately implemented** |

The requester identity rules are exercised by the existing Lab 2 API tests, but there is currently no separate file named:

`server/tests/lab-02/requester-identity.api.test.ts`

Therefore API-22 is not marked as a separate passed test.

---

## 2.3 UI Component Tests

| ID | Requirement / AC | Test | Actual Test Path | Status |
|---|---|---|---|---|
| UI-01 | AC-02 | Requester selection / Create Ticket UI display | `client/tests/lab-02/App.lab2.test.tsx` | **Partial / Not separately mapped** |
| UI-02 | AC-04 | Required-field and summary validation | `client/tests/lab-02/App.lab2.test.tsx` | **Passed** |
| UI-03 | AC-05 | Submit button disabled while request is in progress | `client/tests/lab-02/App.lab2.test.tsx` | **Not separately implemented** |
| UI-04 | AC-06 | API failure preserves entered form values | `client/tests/lab-02/App.lab2.test.tsx` | **Passed** |
| UI-05 | AC-07 | Invalid attachment rejected before upload | `client/tests/lab-02/App.lab2.test.tsx` | **Not separately implemented** |
| UI-06 | AC-01 | Successful creation displays official Ticket Number | `client/tests/lab-02/App.lab2.test.tsx` | **Passed** |
| UI-07 | AC-09, AC-17 | My Tickets requester isolation and requester switching | `client/tests/lab-02/App.lab2.test.tsx` | **Not separately implemented** |
| UI-08 | AC-10 | No-results search state | `client/tests/lab-02/App.lab2.test.tsx` | **Not separately implemented** |
| UI-09 | AC-11 | Empty ticket-list state and Create Ticket CTA | `client/tests/lab-02/App.lab2.test.tsx` | **Not separately implemented** |
| UI-10 | AC-14, AC-15 | Requester selector inactive/empty states | `client/tests/lab-02/App.lab2.test.tsx` | **Not separately implemented** |
| UI-11 | AC-12 | Soft-removed attachment UI behaviour | `client/tests/lab-02/App.lab2.test.tsx` | **Not separately implemented** |
| UI-12 | UI specification | General UI component behaviour | `client/tests/lab-02/App.lab2.test.tsx` | **Not separately implemented** |

The current Lab 2 UI test file contains **6 passing tests** covering:

- Create Ticket form display
- Required-field validation
- Summary minimum-length validation
- Description minimum-length validation
- Successful ticket creation and official Ticket Number
- API failure with preservation of entered form values

Actual test file:

`client/tests/lab-02/App.lab2.test.tsx`

---

## 2.4 Responsive and Visual Tests

The Lab 2 specification requires responsive verification for:

- Desktop: ≥ 992 px
- Tablet: 768–991 px
- Mobile: < 768 px

The required checks include:

- No horizontal page scrolling on Mobile.
- No clipped text.
- No overlapping controls or content.
- My Tickets changes appropriately for smaller screen sizes.
- Layout remains usable on Desktop, Tablet, and Mobile.
- Playwright screenshots are captured for visual verification.

| ID | Requirement / AC | Test | Actual Test Path | Status |
|---|---|---|---|---|
| RESP-01 | AC-16 | Mobile My Tickets layout | `e2e/lab-02/responsive-mobile.spec.ts` | **Not separately implemented** |
| RESP-02 | Responsive UI | Tablet layout | `e2e/lab-02/responsive-tablet.spec.ts` | **Not separately implemented** |
| RESP-03 | Responsive UI | Desktop layout | `e2e/lab-02/responsive-desktop.spec.ts` | **Not separately implemented** |

The current repository does not contain the three dedicated `responsive-*.spec.ts` files.

Responsive behaviour therefore still requires final visual/screenshot verification.

---

## 2.5 End-to-End Tests

The implemented Playwright E2E tests are consolidated in:

`e2e/lab-02/requester-ticket-flow.spec.ts`

| ID | Requirement / AC | Test | Actual Test Path | Status |
|---|---|---|---|---|
| E2E-01 | AC-01, AC-09 | Requester creates a ticket and verifies ticket workflow | `e2e/lab-02/requester-ticket-flow.spec.ts` | **Passed** |
| E2E-02 | AC-03, AC-17 | Requester ownership isolation and requester switching | `e2e/lab-02/requester-ticket-flow.spec.ts` | **Passed** |
| E2E-03 | AC-12, AC-13 | Attachment lifecycle and soft-removal behaviour | `e2e/lab-02/requester-ticket-flow.spec.ts` | **Passed** |

The final Playwright run produced:

```text
3 passed