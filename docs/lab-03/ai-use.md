# Lab 3 AI Use and Reflection

## 1. LLM Used

The Large Language Model (LLM) used during Lab 3 was:

**ChatGPT**

I mainly used ChatGPT to help with understanding the Lab 3 requirements, checking implementation ideas, debugging errors, writing tests, and reviewing my work.

I checked the suggested solutions with the Labsheet, project specifications, existing code, and actual test results before applying them.

---

## 2. Selected Prompts (Summarised)

| No. | Selected Prompt | Purpose |
|---|---|---|
| 1 | "Help me check the Lab 3 scope and make sure I do not change completed Lab 1 and Lab 2 work unnecessarily." | Check the scope before making changes. |
| 2 | "Help me understand the requirements for the IT Staff Ticket Queue." | Understand the required queue features before implementation. |
| 3 | "Check the Ticket Detail flow from the IT Staff Ticket Queue." | Make sure the queue and ticket detail work together correctly. |
| 4 | "Why is the IT Staff Ticket Queue not showing ticket data in the browser?" | Find the cause of the API request problem. |
| 5 | "Check why the React tests cannot find document and window." | Fix the test environment problem. |
| 6 | "Help me write an E2E test for Login, Ticket Queue, Ticket Detail, public comment, and internal note." | Create the final E2E workflow test. |
| 7 | "Check the E2E test for desktop, tablet, and mobile screen sizes." | Verify responsive behavior. |
| 8 | "Check the final Lab 3 tests and build results." | Review the final verification before finishing the work. |

---

## 3. How AI Was Used

I used ChatGPT mainly as a helper during development.

### Understanding Requirements

At the beginning of each feature, I used ChatGPT to help explain the Lab 3 requirements and check what needed to be implemented.

I also used it to check whether a proposed change was still within the Lab 3 scope.

### Implementation

ChatGPT was used to help with parts of the implementation, including:

- Login and authentication
- First password change
- Requester ownership
- IT Staff Ticket Queue
- IT Staff Ticket Detail
- Public comments
- Internal notes
- Priority and status
- User Management
- Queue and Ticket Detail UI

I compared the suggestions with the existing project code before making changes.

### Debugging

One problem I found was that the IT Staff Ticket Queue did not show ticket data when testing it in the browser.

After checking the API request, I found that the request needed to send the login session. The request was updated to include:

```text
credentials: "include"

I also checked the queue at different screen sizes:

Desktop
Tablet
Mobile

The final Lab 3 client tests passed:

51/51 tests passed

The final E2E tests passed:

2/2 tests passed

The client build also completed successfully.

Git and GitHub

ChatGPT was also used to help with Git commands, branch management, commit messages, and checking the changes before pushing them to GitHub.

I performed the Git operations myself and checked the changes before committing and pushing.

4. My Reflection

Using ChatGPT during Lab 3 helped me when I was not sure about a requirement or when I encountered an error that I could not immediately understand.

For example, the IT Staff Ticket Queue was not showing ticket data in the browser. After checking the problem, I found that the API request was missing the login session credentials. Adding credentials: "include" fixed the problem.

ChatGPT was also helpful when creating the E2E test because it helped me think about the whole user flow instead of checking each page separately. I was able to test the flow from Login to the Ticket Queue, then to Ticket Detail, adding a public comment and an internal note.

I also learned that I should not just copy the answer from AI. Some suggestions needed to be checked against the project requirements and the existing code. I used the actual test results and build results to make sure the changes worked.

Overall, ChatGPT helped me save time when debugging and checking my work, but I still had to understand the changes and verify them myself.