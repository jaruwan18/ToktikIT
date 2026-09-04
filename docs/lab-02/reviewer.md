# Lab 2 Reviewer Record

## 1. Review Information

| Item | Details |
|---|---|
| Lab | Lab 2 – Requester Ticketing MVP |
| Feature/Staging Branch | `lab2-staging` |
| Release Pull Request | PR #21: `lab2-staging → main` |
| Peer Reviewer | Film26 |
| Review Status | Review comments received and addressed; final approval pending |
| Merge Status | Pending final approval and merge |

---

## 2. PR and Development Workflow

The Lab 2 implementation followed the required Git workflow by developing and integrating feature work through the staging branch before the final release pull request.

```text
Feature Branches
      ↓
lab2-staging
      ↓
Release PR #21
      ↓
main
```

The `lab2-staging` branch was used to integrate the Lab 2 implementation before requesting the final merge into `main`.

The release PR was reviewed by the peer reviewer before the final merge.

---

## 3. Pull Requests Reviewed

The following pull requests were part of the Lab 2 development and integration workflow.

| PR | Purpose / Scope |
|---|---|
| PR #10 | Lab 2 initial implementation work |
| PR #12 | Lab 2 feature implementation |
| PR #14 | Create Ticket related implementation |
| PR #15 | My Tickets related implementation |
| PR #16 | Ticket Detail and Attachment related implementation |
| PR #17 | Ownership isolation and related API work |
| PR #18 | UI and responsive-related implementation |
| PR #19 | Automated tests and verification |
| PR #20 | Lab 2 integration and fixes |
| PR #21 | Release PR: `lab2-staging → main` |

The final release PR for Lab 2 is PR #21.

---

## 4. Peer Review Comments Received

Before the final merge, the peer reviewer reviewed the Lab 2 release PR and identified three points that required additional verification or documentation.

### Comment 1 – GitHub Checks and Test Evidence

**Reviewer comment:**

The release PR page showed `GitHub Checks = 0`, although the project documentation stated that 50 tests had passed. The reviewer requested verifiable test evidence for the release PR.

**Response / Action Taken:**

The test results were verified locally using the project's documented test commands.

The verification included:

* Server test suite: 50 tests passed
* Lab 2 UI tests: 6 tests passed
* E2E tests: 3 tests passed
* Client build: passed

The test plan in `docs/lab-02/tests.md` records the test files and final test status.

The local test results provide evidence of the test execution. The GitHub PR Checks section is not claimed as passed because the PR currently shows zero GitHub Checks.

**Status:** Test execution verified locally; GitHub Checks evidence remains dependent on the GitHub PR configuration.

---

### Comment 2 – Missing `reviewer.md` and `ai-use.md`

**Reviewer comment:**

The `docs/lab-02` directory contained the specification and test documents, but `reviewer.md` and `ai-use.md` required by the Labsheet were not present.

**Response / Action Taken:**

The required Lab 2 documentation files were created:

```text
docs/lab-02/reviewer.md
docs/lab-02/ai-use.md
```

This file records the peer review information, reviewed pull requests, review comments, responses, and approval status.

The `ai-use.md` file records the LLM used during development, selected key prompts, and reflection on AI-assisted development.

**Status:** Addressed.

---

### Comment 3 – Automated Test Coverage and Acceptance Criteria

**Reviewer comment:**

The Labsheet requires multiple test levels, including unit, API/integration, UI component, UI style, responsive, and E2E testing. The reviewer requested confirmation that the Acceptance Criteria were supported by automated tests and/or evidence rather than only relying on API tests.

**Response / Action Taken:**

The Lab 2 test plan in `docs/lab-02/tests.md` was reviewed against the Acceptance Criteria.

The implemented automated coverage includes:

* Unit tests for Ticket Number generation
* API tests for Create Ticket
* API tests for My Tickets
* API tests for requester ownership isolation
* API tests for Ticket Detail
* API tests for attachment operations
* API tests for requester data
* API tests for related-system data
* UI component tests for selected Lab 2 UI behavior
* E2E tests for the requester ticket flow

The test plan also identifies test areas that do not currently have separate dedicated automated tests. These limitations are documented in `docs/lab-02/tests.md` instead of being reported as passed without supporting evidence.

This keeps the test documentation consistent with the actual implemented test files and results.

**Status:** Coverage reviewed and documented; remaining dedicated test/evidence gaps are explicitly recorded in `docs/lab-02/tests.md`.

---

## 5. Reviewer Response Summary

| Review Item | Response / Action | Status |
|---|---|---|
| GitHub Checks / test evidence | Verified local test execution and documented results in `tests.md`; GitHub Checks currently shows 0 | Partially addressed |
| Missing `reviewer.md` | Created this required reviewer record | Addressed |
| Missing `ai-use.md` | Created the required AI-use documentation | Addressed |
| Acceptance Criteria / test coverage | Reviewed test traceability and documented implemented coverage and remaining dedicated-test gaps | Addressed with documented limitations |

---

## 6. Acceptance Criteria Review

The Lab 2 Acceptance Criteria were checked against the test plan and implemented test files.

| AC | Requirement | Evidence / Test Coverage |
|---|---|---|
| AC-01 | Valid ticket submission saves one ticket and displays the official Ticket Number | API Create Ticket tests and E2E requester ticket flow |
| AC-02 | My Tickets requires requester selection when no requester is selected | UI behavior and requester selector implementation |
| AC-03 | Requester B cannot access Requester A's ticket | Ownership isolation API coverage |
| AC-04 | Summary shorter than 5 characters is rejected before API submission | Create Ticket validation coverage |
| AC-05 | Submit is disabled while request is in progress | UI behavior and E2E flow |
| AC-06 | Backend failure shows a safe error and preserves form values | Create Ticket error handling implementation |
| AC-07 | A 6 MB attachment is rejected before upload | Attachment validation implementation |
| AC-08 | A sixth active attachment is rejected when five active attachments already exist | Attachment API coverage and validation |
| AC-09 | Requester A sees only Requester A's tickets | My Tickets requester isolation coverage |
| AC-10 | No search matches produce a distinct no-results state | My Tickets implementation and test-plan coverage |
| AC-11 | Zero tickets produce an empty state with a Create Ticket CTA | My Tickets implementation and test-plan coverage |
| AC-12 | Soft-removed attachment metadata remains while download/preview is blocked | Attachment API coverage and implementation |
| AC-13 | Removed attachment download is rejected | Attachment API coverage |
| AC-14 | Inactive requester is absent from requester selection | Requester API coverage |
| AC-15 | No active requesters produce a clear empty state | Requester API/UI behavior |
| AC-16 | Mobile My Tickets layout uses cards without horizontal page scrolling | Responsive implementation; dedicated responsive test evidence is documented as a remaining gap |
| AC-17 | Switching requester clears old requester data and loads the new requester's data | Requester switching implementation and test-plan coverage |

The table above is used as a traceability summary. Detailed test paths and final test status are maintained in:

```text
docs/lab-02/tests.md
```

---

## 7. Automated Test Evidence

The Lab 2 implementation contains automated tests at multiple levels.

### 7.1 Unit Tests

Ticket Number generation is tested at:

```text
server/tests/lab-02/ticket-number.test.ts
```

The test verifies the required Ticket Number generation behavior.

---

### 7.2 API / Integration Tests

Create Ticket:

```text
server/tests/lab-02/create-ticket.api.test.ts
```

My Tickets:

```text
server/tests/lab-02/my-tickets.api.test.ts
```

Ticket Detail:

```text
server/tests/lab-02/ticket-detail.api.test.ts
```

Attachments:

```text
server/tests/lab-02/attachments.api.test.ts
```

Requester-related behavior:

```text
server/tests/lab-02/requesters.test.ts
```

Related-system behavior:

```text
server/tests/lab-02/related-systems.test.ts
```

---

### 7.3 UI Tests

The implemented Lab 2 UI tests are located at:

```text
client/tests/lab-02/App.lab2.test.tsx
```

The test suite covers selected Lab 2 UI behaviors.

Some UI requirements do not currently have separate dedicated component tests. These limitations are recorded in:

```text
docs/lab-02/tests.md
```

---

### 7.4 End-to-End Tests

The requester ticket flow is tested at:

```text
e2e/lab-02/requester-ticket-flow.spec.ts
```

The E2E suite verifies the main requester ticketing flow.

---

## 8. Test Result Summary

The final local verification recorded for Lab 2 includes:

| Test / Verification | Result |
|---|---|
| Server test suite | 50 tests passed |
| Lab 2 UI tests | 6 tests passed |
| E2E tests | 3 tests passed |
| Client build | Passed |

The complete test commands, actual test-file paths, planned tests, and final status are documented in:

```text
docs/lab-02/tests.md
```

The project does not claim GitHub Checks as passing because the release PR currently reports zero GitHub Checks.

---

## 9. Review of Documentation Requirements

The required Lab 2 documentation files are now present under:

```text
docs/lab-02/
```

Current documentation includes:

```text
docs/lab-02/
├── api-spec.md
├── specification.md
├── tests.md
├── ui-spec.md
├── reviewer.md
└── ai-use.md
```

### Purpose of Each Document

| Document | Purpose |
|---|---|
| `specification.md` | Lab 2 product requirements, business rules, acceptance criteria, and DoD |
| `api-spec.md` | API contract and endpoint behavior |
| `ui-spec.md` | UI and responsive requirements |
| `tests.md` | Test plan, test paths, AC traceability, and final test status |
| `reviewer.md` | Peer review record, comments, responses, and approval status |
| `ai-use.md` | AI/LLM usage record, selected prompts, and reflection |

---

## 10. Final Review Notes

The peer review focused on the approved Lab 2 scope and the required development workflow.

The main requester-facing ticketing MVP implementation includes:

* Create Ticket
* My Tickets
* Ticket Detail
* Attachment management
* Requester ownership isolation
* Zen Green UI
* Automated testing

The implementation and test documentation are intended to remain consistent with the actual repository state.

Test coverage that does not have a separate dedicated automated test is explicitly documented as a limitation in `docs/lab-02/tests.md`.

No test is reported as passed solely because it is planned. Test status is based on the actual implemented test files and recorded execution results.

---

## 11. Approval and Merge Status

At the time of this review record:

* Peer review comments have been documented.
* The required `reviewer.md` and `ai-use.md` files have been created.
* Local test results have been verified and documented.
* Test coverage and remaining dedicated-test gaps have been documented.
* GitHub Checks are not claimed as passed because the release PR currently shows zero Checks.
* Final peer approval is pending.
* Release PR #21 remains pending final approval and merge into `main`.

After final approval is obtained, the approval status and merge status should be updated to reflect the actual GitHub PR state.