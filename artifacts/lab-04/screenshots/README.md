# Lab 4 Screenshots

Captured on 31 Oct 2026 with Playwright (Chromium) against the running app and the seeded database (`npx prisma db seed`).

| Viewport | Size |
| --- | --- |
| desktop | 1440 × 900 |
| tablet | 768 × 1024 |
| mobile | 390 × 844 |

Each folder has the same screens at all three viewports (`desktop-`, `tablet-`, `mobile-` prefixes). Images are full-page captures.

## staff-dashboard (logged in as `it.alex@example.com`)

| File | Shows |
| --- | --- |
| `*-01-dashboard.png` | Operational metrics, status and IT Priority summaries, Urgent and Recently Updated Tickets |
| `*-02-drilldown-unassigned.png` | IT Ticket Queue opened from the Unassigned card. The total matches the card. |
| `*-03-loading.png` | Loading state: skeleton cards, no zero values (API response delayed on purpose) |
| `*-04-api-failure.png` | Safe failure message with Retry (API forced to return 500) |

## requester-dashboard (logged in as `jennifer.anderson@example.com`)

| File | Shows |
| --- | --- |
| `*-01-dashboard.png` | The Requester's own metrics and recent Tickets |
| `*-02-drilldown-total-open.png` | My Tickets opened from the Total Open card. The total matches the card. |
| `*-03-empty.png` | Empty state with zero values (API response replaced with an empty dashboard) |
| `*-04-forbidden.png` | Forbidden message with no dashboard data (API forced to return 403) |

## actions-taken (Ticket TKT-2026-000001)

| File | Shows |
| --- | --- |
| `*-01-staff-list.png` | IT Staff Ticket Detail with two Actions Taken (one with a follow-up note) and the Ticket Workflow panel |
| `*-02-create-validation.png` | Add Action Taken form with validation messages |
| `*-03-edit.png` | Edit mode for an existing Action Taken |
| `*-04-requester-read-only.png` | The Requester's Ticket Detail: Actions Taken visible, no Add or Edit controls |

The loading, failure, empty and forbidden screens use Playwright request interception, so each state can be shown on demand. The same states are covered by the UI tests in `client/tests/lab-04/`.
