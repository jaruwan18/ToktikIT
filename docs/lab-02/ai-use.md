# Lab 2 AI Use and Reflection

## 1. LLM Used

The Large Language Model (LLM) used during Lab 2 development was:

**ChatGPT**

The LLM was used as an engineering assistant during specification review, implementation planning, test planning, debugging, documentation, Git workflow verification, and peer-review response preparation.

The final implementation, repository changes, test execution, and merge decisions were reviewed and performed by the student.

---

## 2. Selected Key Prompts

| No. | Selected Prompt | Purpose |
|---|---|---|
| 1 | "Follow Lab 2 as the main basis. Do not go back and modify Lab 1 work that is already done." | Keep the implementation within the approved Lab 2 scope and avoid unnecessary changes to Lab 1. |
| 2 | "Stay within the PDF/labsheet, initial Phase 1–4 prompt, and merged Lab 2 contract files; avoid adding steps/features beyond scope." | Use the Labsheet and approved engineering contract as the main source of truth. |
| 3 | "Review the Lab 2 specification and identify the Business Rules and Acceptance Criteria that must be reflected in the implementation and tests." | Validate the relationship between the specification, Business Rules, Acceptance Criteria, implementation, and tests. |
| 4 | "Review the Lab 2 test plan and check whether the planned tests cover the required unit, API/integration, UI component, UI style, responsive, and E2E testing levels." | Evaluate whether the testing approach addresses the testing requirements specified by the Labsheet. |
| 5 | "Analyze the test results and explain which failures are related to the current Lab 2 implementation and which are legacy Lab 1 tests." | Distinguish current Lab 2 issues from existing Lab 1 test behavior before making changes. |
| 6 | "Review the Git workflow for Lab 2 and check whether the feature branches, lab2-staging, pull requests, peer review, and release PR follow the required workflow." | Verify that the repository workflow follows the Git and peer-review requirements in the Labsheet. |
| 7 | "Review the Lab 2 implementation against the Labsheet and identify any missing documentation, test evidence, or Acceptance Criteria coverage before the release PR is merged." | Perform a final completeness review and identify remaining evidence or documentation gaps before release. |
| 8 | "Review the Lab 2 implementation against the Labsheet and peer-review comments before merging PR #21." | Check implementation, tests, documentation, Git workflow, and release evidence before the final merge. |

---

## 3. How AI Was Used

AI assistance was used in several parts of the Lab 2 workflow:

### Specification and Scope

ChatGPT was used to help interpret the Lab 2 Labsheet and maintain alignment with:

- Functional requirements
- Business Rules
- Acceptance Criteria
- Definition of Done
- API specification
- UI specification
- Test plan

The approved Lab 2 contract remained the main source of truth.

### Implementation Planning

ChatGPT was used to organize the implementation into manageable issues and to check whether changes belonged to the approved Lab 2 scope.

The AI was also used to review the relationship between the specification and implementation so that development decisions remained consistent with the approved requirements.

### Testing

ChatGPT was used to help:

- Map Acceptance Criteria to tests.
- Review unit, API/integration, UI, responsive, and E2E test coverage.
- Interpret test failures.
- Identify missing test evidence.
- Organize the final test evidence for `docs/lab-02/tests.md`.

The actual test results were verified by running the project locally rather than relying only on AI suggestions.

### Debugging

ChatGPT was used to interpret errors and suggest possible corrections while working with:

- React
- TypeScript
- Express
- Prisma
- Vitest
- Supertest
- Playwright
- Git and GitHub

The suggested changes were checked by running the project locally and reviewing the resulting behavior.

### Git Workflow and Peer Review

ChatGPT was used to verify:

- Feature branch workflow
- `lab2-staging`
- Release PR #21
- Review comments
- Review responses
- Required documentation
- Test evidence
- Final merge sequence

AI assistance was also used during the final review to identify missing documentation and areas where test evidence needed to be checked against the Labsheet.

---

## 4. My Reflection

Using an LLM helped me understand the Lab 2 development workflow and reduced the time needed to identify implementation, testing, documentation, and Git workflow issues. It was especially useful when checking the relationship between the Labsheet, specification, Business Rules, Acceptance Criteria, tests, and repository workflow.

One useful part was using AI as a review assistant before the release PR was merged. The review helped identify missing documentation such as `reviewer.md` and `ai-use.md`, as well as the need to check whether the different testing levels required by the Labsheet had supporting evidence.

AI assistance was also useful when interpreting test failures and determining whether a problem was related to the current Lab 2 implementation or to existing Lab 1 tests. This helped avoid making unnecessary changes to completed Lab 1 work.

However, I did not treat the AI output as automatically correct. I checked the suggested changes against the Labsheet, the approved Lab 2 specification, the repository, and actual test results.

The main lesson from using AI was that it is useful as a development and review assistant, but it should not replace engineering judgment. The final responsibility for scope, implementation, testing, documentation, evidence, and merge decisions remains with me.