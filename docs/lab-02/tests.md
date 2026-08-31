\# Lab 2 Test Plan and Results



\## 1. Test Strategy



Tests are planned before implementation (Test-Driven Development). For each Issue, failing tests are

written first against the planned API/UI contract, then the smallest correct implementation is added

until the test passes, then the code is refactored while keeping tests green. No test is skipped,

disabled, or commented out in the final `main` branch.



Test levels used: Unit, API (Supertest), UI component (Vitest + React Testing Library), Responsive

(Playwright screenshots), and E2E (Playwright).



\## 2. Planned Tests



| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |

|---|---|---|---|---|---|---|

| UNIT-01 | Unit | BR-01 | Ticket Number generator produces `TKT-YYYY-NNNNNN` format | Format matches regex, unique per call | `server/src/utils/\_\_tests\_\_/ticketNumber.test.ts` | Pending |

| API-01 | API | AC-01, BR-01, BR-02 | POST /api/tickets with valid data | 201; Ticket saved with unique ticketNumber; currentStatus = NEW | `server/tests/lab-02/create-ticket.api.test.ts` | Pending |

| API-02 | API | AC-04, BR-04 | POST /api/tickets with Summary < 5 chars | 400; VALIDATION\_ERROR with fields.summary message | `server/tests/lab-02/create-ticket.api.test.ts` | Pending |

| API-03 | API | BR-05 | POST /api/tickets with Description < 10 chars | 400; VALIDATION\_ERROR with fields.description message | `server/tests/lab-02/create-ticket.api.test.ts` | Pending |

| API-04 | API | BR-06 | POST /api/tickets with inactive/unknown categoryId | 400; INVALID\_REFERENCE | `server/tests/lab-02/create-ticket.api.test.ts` | Pending |

| API-05 | API | BR-07 | POST /api/tickets with invalid requestedPriority value | 400; VALIDATION\_ERROR | `server/tests/lab-02/create-ticket.api.test.ts` | Pending |

| API-06 | API | AC-09, FR-04 | GET /api/tickets scoped to requesterId | 200; only the calling Requester's tickets returned | `server/tests/lab-02/my-tickets.api.test.ts` | Pending |

| API-07 | API | BR-12 | GET /api/tickets?search=laptop | 200; only matching Ticket Number/Summary returned | `server/tests/lab-02/my-tickets.api.test.ts` | Pending |

| API-08 | API | BR-12 | GET /api/tickets?categoryId\&requestedPriority\&currentStatus combined | 200; results satisfy AND of all filters | `server/tests/lab-02/my-tickets.api.test.ts` | Pending |

| API-09 | API | BR-11 | GET /api/tickets?page=999\&pageSize=9999 | 200; falls back to page=1, pageSize=10 (capped at 50) | `server/tests/lab-02/my-tickets.api.test.ts` | Pending |

| API-10 | API | AC-11 | GET /api/tickets for a Requester with zero tickets | 200; data: \[], totalItems: 0 | `server/tests/lab-02/my-tickets.api.test.ts` | Pending |

| API-11 | API | AC-03, BR-09 | GET /api/tickets/:id for a Ticket owned by a different Requester | 404 TICKET\_NOT\_FOUND | `server/tests/lab-02/ticket-detail.api.test.ts` | Pending |

| API-12 | API | FR-06 | GET /api/tickets/:id for an owned Ticket | 200; full detail including attachments array | `server/tests/lab-02/ticket-detail.api.test.ts` | Pending |

| API-13 | API | AC-07, BR-15 | POST /api/tickets/:id/attachments with a 6 MB file | 400 FILE\_TOO\_LARGE | `server/tests/lab-02/attachments.api.test.ts` | Pending |

| API-14 | API | BR-15 | POST /api/tickets/:id/attachments with a .gif file | 400 UNSUPPORTED\_FILE\_TYPE | `server/tests/lab-02/attachments.api.test.ts` | Pending |

| API-15 | API | AC-08, BR-15 | POST /api/tickets/:id/attachments as the 6th active attachment | 409 ATTACHMENT\_LIMIT\_REACHED | `server/tests/lab-02/attachments.api.test.ts` | Pending |

| API-16 | API | AC-12, BR-16 | DELETE /api/attachments/:id with a valid reason | 200; isRemoved true; metadata retained | `server/tests/lab-02/attachments.api.test.ts` | Pending |

| API-17 | API | BR-17 | DELETE /api/attachments/:id owned by a different Requester's Ticket | 404 TICKET\_NOT\_FOUND | `server/tests/lab-02/attachments.api.test.ts` | Pending |

| API-18 | API | AC-13 | GET /api/attachments/:id/download for a removed attachment | 410 ATTACHMENT\_REMOVED (no file content returned) | `server/tests/lab-02/attachments.api.test.ts` | Pending |

| API-19 | API | AC-14, BR-18 | GET /api/requesters | 200; inactive Requester excluded from list | `server/tests/lab-02/requesters.api.test.ts` | Pending |

| API-20 | API | AC-15 | GET /api/requesters when no active Requesters exist | 200; empty array | `server/tests/lab-02/requesters.api.test.ts` | Pending |
| API-21 | API | FR-03, Section 6 | GET /api/related-systems | 200; active Related Systems returned in a predictable order | `server/tests/lab-02/reference-data.api.test.ts` | Pending |
| API-22 | API | Section 0 of api-spec.md | Any Ticket/Attachment endpoint called with missing or invalid requesterId | 400 INVALID_REQUESTER | `server/tests/lab-02/requester-identity.api.test.ts` | Pending |

| UI-01 | UI | AC-02 | Access My Tickets with no Requester selected | Redirects to / renders Requester Selection screen | `client/src/features/tickets/\_\_tests\_\_/MyTickets.test.tsx` | Pending |

| UI-02 | UI | AC-04 | Submit Create Ticket form with empty Summary | Field-level error shown; no API call made | `client/src/features/tickets/\_\_tests\_\_/CreateTicket.test.tsx` | Pending |

| UI-03 | UI | AC-05 | Click Submit on a valid Create Ticket form | Button shows busy state and is disabled during request | `client/src/features/tickets/\_\_tests\_\_/CreateTicket.test.tsx` | Pending |

| UI-04 | UI | AC-06 | Submit valid ticket while API is mocked to fail | Error banner shown; all field values preserved | `client/src/features/tickets/\_\_tests\_\_/CreateTicket.test.tsx` | Pending |

| UI-05 | UI | AC-07 | Select a 6 MB file in the attachment picker | Inline rejection message shown; file not added to list | `client/src/features/tickets/\_\_tests\_\_/CreateTicket.test.tsx` | Pending |

| UI-06 | UI | AC-01 | Successful ticket creation | Success panel shows the returned official Ticket Number | `client/src/features/tickets/\_\_tests\_\_/CreateTicket.test.tsx` | Pending |

| UI-07 | UI | AC-09, AC-17 | Switch Requester A -> B in My Tickets | List updates to show only Requester B's tickets | `client/src/features/tickets/\_\_tests\_\_/MyTickets.test.tsx` | Pending |

| UI-08 | UI | AC-10 | Search with a term matching no tickets | No-results state shown, distinct copy from Empty state | `client/src/features/tickets/\_\_tests\_\_/MyTickets.test.tsx` | Pending |

| UI-09 | UI | AC-11 | Load My Tickets for a Requester with zero tickets | Empty state with Create Ticket CTA shown | `client/src/features/tickets/\_\_tests\_\_/MyTickets.test.tsx` | Pending |

| UI-10 | UI | AC-14, AC-15 | Load Development Requester Selector | Inactive Requester excluded; empty state shown if none active | `client/src/features/requester/\_\_tests\_\_/RequesterSelector.test.tsx` | Pending |

| UI-11 | UI | AC-12 | Soft-remove an attachment with a reason in Ticket Detail | Attachment shows "Removed" state with reason; download disabled | `client/src/features/tickets/\_\_tests\_\_/RequesterTicketDetail.test.tsx` | Pending |

| UI-12 | UI | Section 8.3 | TokTickIT heading and Zen Green header render | Heading and primary color token present | `client/src/features/shell/\_\_tests\_\_/AppShell.test.tsx` | Pending |

| RESP-01 | Responsive | AC-16, Section 8.7 | My Tickets at Mobile viewport (<768px) | List renders as cards; no horizontal scroll | `e2e/lab-02/responsive-my-tickets.spec.ts` | Pending |

| RESP-02 | Responsive | Section 8.7 | Create Ticket at Tablet viewport (768-991px) | Two-column layout; no clipped labels | `e2e/lab-02/responsive-create-ticket.spec.ts` | Pending |

| RESP-03 | Responsive | Section 8.7 | Ticket Detail at Desktop viewport (>=992px) | Multi-column layout; header/attachments clearly separated | `e2e/lab-02/responsive-ticket-detail.spec.ts` | Pending |

| E2E-01 | E2E | AC-01, AC-09 | Full flow: select Requester -> create ticket -> find it in My Tickets | Ticket appears in My Tickets with matching Ticket Number | `e2e/lab-02/create-ticket-flow.spec.ts` | Pending |

| E2E-02 | E2E | AC-03, AC-17 | Full flow: Requester A creates a ticket; switch to Requester B | Requester B cannot see or open Requester A's ticket (404 / not listed) | `e2e/lab-02/ownership-isolation.spec.ts` | Pending |

| E2E-03 | E2E | AC-12, AC-13 | Full flow: add attachment -> soft-remove it -> attempt download | Attachment shows removed state; download blocked | `e2e/lab-02/attachment-lifecycle.spec.ts` | Pending |



\## 3. Acceptance-Criterion Traceability



| AC | Description (short) | Covered by Test IDs |

|---|---|---|

| AC-01 | Valid submission saves Ticket + shows official number | API-01, UI-06, E2E-01 |

| AC-02 | No Requester selected -> redirected to selector | UI-01 |

| AC-03 | Cross-Requester ticket access denied | API-11, E2E-02 |

| AC-04 | Summary too short -> field validation, no API call | API-02, UI-02 |

| AC-05 | Submit shows busy state | UI-03 |

| AC-06 | API failure preserves form values | UI-04 |

| AC-07 | Oversized file rejected before upload | API-13, UI-05 |

| AC-08 | 6th attachment rejected | API-15 |

| AC-09 | My Tickets scoped to owning Requester | API-06, UI-07, E2E-01 |

| AC-10 | Search with no matches -> no-results state | UI-08 |

| AC-11 | Zero tickets -> empty state | API-10, UI-09 |

| AC-12 | Soft-remove preserves metadata, blocks download | API-16, UI-11, E2E-03 |

| AC-13 | Removed attachment cannot be downloaded | API-18, E2E-03 |

| AC-14 | Inactive Requester excluded from selector | API-19, UI-10 |

| AC-15 | No active Requesters -> empty selector state | API-20, UI-10 |

| AC-16 | Mobile My Tickets collapses to cards, no h-scroll | RESP-01 |

| AC-17 | Switching Requester clears and reloads data | UI-07, E2E-02 |



\## 4. Responsive and Visual Checklist



See `docs/lab-02/ui-spec.md` Section 11 for the full checklist. Screenshots are stored under

`artifacts/lab-02/screenshots/{create-ticket,my-tickets,ticket-detail}/` at Desktop, Tablet, and

Mobile widths, captured via the Playwright specs listed under RESP-01 to RESP-03 above.



\## 5. Test Commands



```bash

\# Backend (API + Unit)

cd server

npm test



\# Frontend (UI component)

cd client

npm test



\# End-to-end (Playwright)

npx playwright test e2e/lab-02

```



\## 6. Final Results



To be filled in after implementation is complete, with actual pass/fail counts and a copy of the

final terminal output from each command above, run on the `main` branch.



\## 7. Known Limitations or Deferred Tests



\- Server-side idempotency-key based duplicate-submission prevention is out of scope for Lab 2

&#x20; (client-side disable-on-submit only, per specification.md Assumptions).

\- Concurrent-edit conflict testing (two tabs modifying the same Ticket) is deferred; Lab 2 has no

&#x20; ticket-editing feature beyond attachment management, so this risk is minimal.

