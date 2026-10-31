# Lab 4 AI Use and Reflection

## 1. AI Tools Used

| Date / Work | AI tool | How I used it |
| --- | --- | --- |
| 30–31 Oct 2026 (PRs #71, #73, #75, #77) | **Claude** (Anthropic) via Claude Code | Specification agent: compared my implementation with SELab4.pdf and `docs/lab-04` and listed what was missing. Coding agent: implemented the Ticket workflow UI, dashboard API/UI and E2E tests from my specs, and helped investigate bugs that were hard to trace. |
| 7–14 Oct 2026 (PRs #62–#69) | **ChatGPT** (OpenAI) | Helped me understand the Lab 4 requirements, investigate implementation issues, and develop the Actions Taken features and Ticket workflow. |

How I worked with the AI:

- SELab4.pdf and `docs/lab-04/*.md` were the source of truth. I rejected suggestions that conflicted with them, or updated the spec first.
- I read every diff and ran the tests on my own machine before committing. I did all git, Issue, PR and merge steps myself.
- I checked every peer review point from @Film26 against the code and test output before deciding what to fix.

---

## 2. Selected Key Prompts

Prompts were written in Thai; they are translated and shortened here.

| No. | Prompt (summarised) | What the AI produced | How I verified it |
| --- | --- | --- | --- |
| 1 | "Check my Lab 4 status against SELab4.pdf as the source of truth. What is missing or wrong?" | A gap report (status-change UI, both dashboards, seed data for all statuses, docs, E2E, screenshots). Also found that `OPEN → IN_PROGRESS` was wrongly rejected compared with api-spec §5.3. | Compared each gap with §12 of the handout and the transition table in api-spec. |
| 2 | "My friend's review of PR #71 says two Staff could change the same Ticket at the same time. Check whether this is a real problem and fix it." | A stale-update check (`expectedStatus` → 409 `STALE_UPDATE`) with tests. | Server and client tests passed locally (163/163, 78/78). |
| 3 | (pasted failing test output) "The Lab 3 requester-auth test fails with 409 TICKET_NUMBER_CONFLICT. Why?" | Root cause: Lab 2 numbered Tickets by count + 1, which collides after Tickets are deleted. Fix: highest number + 1, plus a regression test. | Confirmed the new test fails on the old code and passes on the new code. |
| 4 | "The reviewer of PR #73 asks whether the dashboard counts match the lists you see when you click a card. Check it." | Found that some card counts did not match their drill-down lists. Added shared filters, a `drillDown` map and a test comparing every card with its list. | Turned the new filters off to confirm the tests fail (3 failures), then turned them back on. |
| 5 | "The reviewer of PR #75 says Create Ticket fails after login. Find out why." | Testing in a real browser showed Create Ticket was broken since Lab 3 (missing `credentials: "include"`). Fixed it and added a regression test and a keyboard-navigation test. | Ran the E2E suite against the real app: 12/12 passed, including the Lab 2 Create Ticket test. |
| 6 | "Do the E2E tests in PR #77 really cover the acceptance criteria, and does the backend reject invalid transitions?" | Mapped each E2E test to acceptance criteria in tests.md §18.4 and §19, and fixed a test that expected 400 when the API correctly returns 409. | Ran the E2E suite twice in a row on my machine: 12/12 both times. |

---

## 3. What the AI got wrong or I had to correct

- The first ticket-number regression test did not actually reproduce the bug. It only failed after the occupying Ticket was dated in an earlier period. A test has to be checked against the old code, not only the new one.
- Files written with Windows line endings (CRLF) made whole files appear changed in two PRs. From then on files were written with LF and I checked the PR diff size before opening each PR.
- The first Dashboard E2E draft included an "empty state" login for `emily.johnson`, who is inactive in the seed data, so it could not log in. The case was dropped from E2E because the API and UI tests already cover it.

---

## 4. My Reflection

During Lab 4, I realized that I relied on AI quite heavily when developing some parts of the project. Although AI helped me solve technical problems and complete tasks faster, I sometimes focused more on getting the code to work than on fully understanding how it worked. This made me realize that finishing a task does not necessarily mean that I have learned everything behind the implementation.

I also learned that AI-generated solutions and tests are not always correct or sufficient. For example, the first ticket-number regression test did not reproduce the original bug properly. This showed me that I needed to check whether the tests actually covered the problem instead of simply trusting the suggested solution. Reviewing the code, comparing it with the specifications, and checking the test results were important parts of this process.

In future projects, I want to use AI more as a tool to help me understand problems rather than relying on it to produce solutions for me. I will spend more time understanding the existing code, investigating the causes of errors, and making sure I can explain why a proposed solution works. I also want to implement simpler parts of the project myself so that I can improve my programming skills and become more independent.
