# Lab 4 — Peer Review Record

**Author:** Jaruwan — GitHub: [@jaruwan18](https://github.com/jaruwan18)
**Peer reviewer:** Film — GitHub: [@Film26](https://github.com/Film26)

Every Lab 4 feature branch was merged into `lab4-staging` through a pull request that the peer reviewer approved on GitHub. Reviewer comments are quoted exactly as written. Responses for PRs #62-#69 are quoted exactly; responses for PRs #71-#77 are summarised. Every response links to the original comment on GitHub. Dates are in UTC, as GitHub stores them.

For PRs #71, #73, #75 and #77 the reviewer approved the first commit and listed points to check before merging. I answered each point in a PR comment and pushed the follow-up commits named in the response before merging.

## Summary

| PR | Branch | Review | Merged into `lab4-staging` (UTC) | Changes made after review |
| --- | --- | --- | --- | --- |
| [#62](https://github.com/jaruwan18/ToktikIT/pull/62) | `feature/lab4-engineering-contract` | [Approved](https://github.com/jaruwan18/ToktikIT/pull/62#pullrequestreview-5445474731) by @Film26 | 2026-10-07 | Specification clarified |
| [#64](https://github.com/jaruwan18/ToktikIT/pull/64) | `feature/lab4-actions-foundation` | [Approved](https://github.com/jaruwan18/ToktikIT/pull/64#pullrequestreview-5449678547) by @Film26 | 2026-10-08 | None needed |
| [#66](https://github.com/jaruwan18/ToktikIT/pull/66) | `feature/lab4-actions-ui` | [Approved](https://github.com/jaruwan18/ToktikIT/pull/66#pullrequestreview-5471809731) by @Film26 | 2026-10-09 | None needed |
| [#67](https://github.com/jaruwan18/ToktikIT/pull/67) | `fix/lab4-actions-api-errors` | [Approved](https://github.com/jaruwan18/ToktikIT/pull/67#pullrequestreview-5479431689) by @Film26 | 2026-10-10 | None needed |
| [#69](https://github.com/jaruwan18/ToktikIT/pull/69) | `feature/lab4-ticket-workflow` | [Approved](https://github.com/jaruwan18/ToktikIT/pull/69#pullrequestreview-5501012491) by @Film26 | 2026-10-14 | Tests added |
| [#71](https://github.com/jaruwan18/ToktikIT/pull/71) | `feature/lab4-ticket-workflow-ui` | [Approved](https://github.com/jaruwan18/ToktikIT/pull/71#pullrequestreview-5717085011) by @Film26 | 2026-10-31 | Stale-update check, ticket-number fix, tests |
| [#73](https://github.com/jaruwan18/ToktikIT/pull/73) | `feature/lab4-dashboard-api` | [Approved](https://github.com/jaruwan18/ToktikIT/pull/73#pullrequestreview-5717283638) by @Film26 | 2026-10-31 | Drill-down filters, error test |
| [#75](https://github.com/jaruwan18/ToktikIT/pull/75) | `feature/lab4-dashboard-ui` | [Approved](https://github.com/jaruwan18/ToktikIT/pull/75#pullrequestreview-5722256558) by @Film26 | 2026-10-31 | Create Ticket session fix, keyboard test |
| [#77](https://github.com/jaruwan18/ToktikIT/pull/77) | `feature/lab4-e2e` | [Approved](https://github.com/jaruwan18/ToktikIT/pull/77#pullrequestreview-5722457363) by @Film26 | 2026-10-31 | Acceptance-criteria mapping in tests.md |

---

## PR [#62](https://github.com/jaruwan18/ToktikIT/pull/62) — Lab 4: Engineering Contract and Specification

**Reviewer comment (Approved):**

> โดยรวมครอบคลุมหัวข้อที่กำหนดไว้ ทั้ง Functional Requirements, Business Rules, Ticket Status Transition, Dashboard, API, Authorization, Test Traceability, UI, Responsive และ Accessibility
> มีจุดที่อยากให้ตรวจสอบเพิ่มเติม คือควรระบุเงื่อนไขในการเปลี่ยนสถานะ Ticket เป็น Resolved ให้ชัดเจน เพื่อให้สามารถนำไปบังคับใช้และเขียน Test ได้ตรงตาม Specification
> โดยรวม Specification มีความสอดคล้องกับข้อกำหนดของ Lab 4 และสามารถดำเนินการต่อได้เลยฮะ

**My response** ([comment](https://github.com/jaruwan18/ToktikIT/pull/62#issuecomment-6045204680)):

> ขอบคุณสำหรับรีวิวค่ะ ได้เพิ่มรายละเอียดเงื่อนไขการเปลี่ยนสถานะเป็น Resolved ใน Specification แล้ว โดยระบุเงื่อนไขที่ backend ต้องตรวจสอบให้ชัดเจน เพื่อให้ตอน implement และเขียน Test ใช้เงื่อนไขเดียวกันได้ค่ะ

**Outcome:** Added the exact Resolved conditions to specification.md before merge.

## PR [#64](https://github.com/jaruwan18/ToktikIT/pull/64) — feat: implement lab 4 actions taken foundation

**Reviewer comment (Approved):**

> ตรวจสอบผลการทดสอบแล้ว Actions Taken API ผ่าน 11/11 และ Lab 3 Regression ผ่าน 70/70 ซึ่งครอบคลุมส่วนที่เกี่ยวข้องกับการเปลี่ยนแปลงใน PR นี้โดยรวมการ Implement ตรงตามขอบเขตของงานและสามารถดำเนินการต่อในส่วนถัดไปได้

**My response** ([comment](https://github.com/jaruwan18/ToktikIT/pull/64#issuecomment-6065713171)):

> ขอบคุณสำหรับรีวิวค่ะ และขอบคุณที่ช่วยตรวจสอบผลการทดสอบให้ด้วย เดี๋ยวจะดำเนินการในส่วนถัดไปตามแผนต่อค่ะ

**Outcome:** No change requested.

## PR [#66](https://github.com/jaruwan18/ToktikIT/pull/66) — Lab 4: Add Actions Taken UI

**Reviewer comment (Approved):**

> ผลการทดสอบ Frontend ผ่าน 68 tests และ Build ผ่านแล้ว
> ขอให้ตรวจสอบเพิ่มเติมว่าฟอร์มมีการ Validate ฟิลด์ที่จำเป็น โดยเฉพาะ Follow-up Note เมื่อเลือก Follow-Up Required และการแสดงผลเมื่อเกิดข้อผิดพลาดหรือมีการแก้ไขข้อมูลพร้อมกัน
> โดยรวมการเปลี่ยนแปลงตรงตามขอบเขตของ PR และสามารถดำเนินการต่อได้ค่ะ

**My response** ([comment](https://github.com/jaruwan18/ToktikIT/pull/66#issuecomment-6083602748)):

> ขอบคุณสำหรับรีวิวค่ะ ได้ตรวจสอบเพิ่มเติมในส่วนของฟอร์มและการจัดการข้อผิดพลาดแล้ว โดยมีการ Validate ฟิลด์ที่จำเป็น รวมถึง Follow-up Note เมื่อเลือก Follow-Up Required และมีชุดทดสอบสำหรับกรณีดังกล่าวแล้วค่ะ
>
> ในส่วนของข้อผิดพลาด มีการแสดงข้อความแจ้งเตือนและรองรับการ Retry เมื่อโหลดข้อมูลไม่สำเร็จ ส่วนกรณีแก้ไขข้อมูลพร้อมกัน ระบบจะแจ้งเตือนเมื่อเกิด Conflict และเก็บข้อมูลที่กำลังแก้ไขไว้เพื่อไม่ให้ผู้ใช้ต้องกรอกใหม่ค่ะ
>
> ผลการทดสอบ Frontend ผ่าน 68 tests และ Build ผ่านแล้วค่ะ

**Outcome:** Confirmed existing validation, retry and conflict handling with tests; no code change needed.

## PR [#67](https://github.com/jaruwan18/ToktikIT/pull/67) — fix(lab4): Correct Actions Taken API integration

**Reviewer comment (Approved):**

> ผลการทดสอบ Server ผ่าน 131 tests จาก 17 test files และ Client Tests กับ Build ผ่านแล้ว นอกจากนี้ยังมีการตรวจสอบการทำงานของ Actions Taken สำหรับ Requester และ IT Staff ด้วยโดยรวมการแก้ไขครอบคลุมปัญหาที่ระบุไว้ และสามารถดำเนินการต่อได้ฮะ

**My response** ([comment](https://github.com/jaruwan18/ToktikIT/pull/67#issuecomment-6099104223)):

> ขอบคุณสำหรับการรีวิวค่ะ ผลการทดสอบทั้งฝั่ง Server และ Client ผ่าน รวมถึงการตรวจสอบการทำงานของ Actions Taken สำหรับ Requester และ IT Staff ด้วยค่ะ จะดำเนินการตามขั้นตอนถัดไปของ Lab 4 ต่อไปค่ะ

**Outcome:** No change requested.

## PR [#69](https://github.com/jaruwan18/ToktikIT/pull/69) — Lab 4: Implement Ticket Resolution Gate and Status Transitions

**Reviewer comment (Approved):**

> ขอให้ตรวจสอบ Status Transition Matrix อีกครั้ง โดยเฉพาะการเปลี่ยนสถานะจาก Open เป็น In Progress ว่ายังคงเป็นไปตาม Specification ของ Lab 4 หรือไม่ และตรวจสอบให้แน่ใจว่า Test ครอบคลุมทั้งกรณีที่สามารถและไม่สามารถเปลี่ยนเป็น Resolved ได้ โดยรวมแนวทางการแก้ไขสอดคล้องกับเป้าหมายของ Lab 4 แต่ควรยืนยันเงื่อนไขเหล่านี้ก่อน Merge นะ

**My response** ([comment](https://github.com/jaruwan18/ToktikIT/pull/69#issuecomment-6166018939)):

> ได้เพิ่ม Test เพื่อตรวจสอบว่า API ปฏิเสธการเปลี่ยนสถานะจาก `OPEN` เป็น `IN_PROGRESS` ตาม Transition Matrix ของ Lab 4 และเพิ่ม Test เพื่อยืนยันว่า Resolution Gate ตรวจสอบ Action Taken รายการล่าสุด โดยต้องปฏิเสธการเปลี่ยนสถานะเป็น `RESOLVED` หากรายการล่าสุดมีคำอธิบายที่ไม่ถูกต้อง แม้ว่ารายการก่อนหน้าจะมีข้อมูลถูกต้องก็ตาม
>
> ทดสอบทั้งหมดผ่านแล้ว 139/139 tests และ `git diff --check` ผ่านโดยไม่มีข้อผิดพลาด ขอบคุณสำหรับคำแนะนำค่ะ

**Outcome:** Added resolution-gate tests. Note: the `OPEN` transitions in this PR did not match api-spec §5.3 (OPEN must allow IN_PROGRESS); this was found during the Lab 4 status check and corrected in PR #71.

## PR [#71](https://github.com/jaruwan18/ToktikIT/pull/71) — Ticket Workflow UI and OPEN transition fix

**Reviewer comment (Approved):**

> จากการตรวจสอบ PR นี้เทียบกับข้อกำหนด Lab 4 พบว่าการปรับปรุง Ticket Workflow, การกำหนดสถานะที่สามารถเปลี่ยนได้, การตรวจสอบ Resolution Gate, การจัดการข้อผิดพลาด และการเพิ่ม Unit/API Tests สอดคล้องกับขอบเขตงานในส่วน Ticket Workflow and Resolution Feedback
> แต่ยังมีประเด็นที่อยากให้ตรวจสอบเพิ่มเติมก่อน Merge ดังนี้
>
> 1. ตรวจสอบว่า Backend บังคับใช้กฎ Status Transition และ Resolution Gate อย่างถูกต้อง โดยไม่สามารถข้ามเงื่อนไขผ่านการเรียก API โดยตรงได้
> 2. ตรวจสอบสิทธิ์ของ Requester, IT Staff และ Administrator ให้เป็นไปตาม Authorization Matrix รวมถึงกรณีที่ไม่มีสิทธิ์เปลี่ยนสถานะ
> 3. ตรวจสอบการจัดการ Stale Update, Conflict และ Network Failure ว่าสามารถแจ้งข้อผิดพลาดได้อย่างเหมาะสม และไม่ทำให้ข้อมูล Ticket สูญหายหรือถูกเขียนทับโดยไม่ตั้งใจ
> 4. ตรวจสอบผลการทดสอบ Workflow ทั้งกรณีที่อนุญาตและไม่อนุญาตให้เปลี่ยนสถานะ รวมถึง Regression Tests ของฟังก์ชันเดิม
> 5. เนื่องจาก PR นี้ระบุว่า Closes #70 ขอให้ตรวจสอบเพิ่มเติมว่า Issue ดังกล่าวตรงกับขอบเขตงานที่แก้ไขใน PR นี้หรือไม่
>
> โดยรวม แนวทางการพัฒนาสอดคล้องกับข้อกำหนด Lab 4 ในส่วน Ticket Workflow แต่ควรยืนยันประเด็นข้างต้นและผลการทดสอบจริงก่อนอนุมัติ Merge นะจ้ะ

**My response** ([full comment](https://github.com/jaruwan18/ToktikIT/pull/71#issuecomment-6531505311)), summarised:

1. All rules are checked in `PATCH /api/tickets/:ticketId/status`. The API tests call the endpoint directly: all 15 allowed transitions return 200, rejected ones return 409 `INVALID_STATUS_TRANSITION`, and the 6 resolution-gate cases return 409 `RESOLUTION_NOT_ALLOWED`.
2. The status endpoint returns 401 when not logged in and 403 for a Requester, and works for IT Staff and Admin. All four cases are tested.
3. **Fixed:** a user could overwrite a status change they had not seen. The client now sends `expectedStatus`, and the API returns 409 `STALE_UPDATE` with a Refresh option. Network failures keep the user's selection.
4. **Fixed:** regression found a Lab 2 ticket-number collision (409 `TICKET_NUMBER_CONFLICT`). Numbering now uses the highest number + 1, with a regression test. Server 163/163 and client 78/78 passed.
5. Scope matches Issue #70.

## PR [#73](https://github.com/jaruwan18/ToktikIT/pull/73) — Requester and IT Staff Dashboard APIs

**Reviewer comment (Approved):**

> จากการตรวจสอบ PR นี้เทียบกับข้อกำหนด Lab 4 พบว่าการเพิ่ม Requester Dashboard API และ IT Staff Dashboard API รวมถึงการกำหนด Dashboard Metrics, Drill-down Filters, Seed Data และ Automated Tests สอดคล้องกับขอบเขตงานที่กำหนดไว้ แต่ยังมีประเด็นที่อยากให้ตรวจสอบเพิ่มเติมดังนี้
>
> 1. ตรวจสอบ Data Ownership ของ Requester ว่าระบบดึงข้อมูลจาก Session ของผู้ใช้ที่เข้าสู่ระบบเท่านั้น และไม่สามารถเข้าถึง Ticket ของ Requester คนอื่นได้ผ่านการส่ง Query Parameter โดยตรง
> 2. ตรวจสอบการคำนวณ Dashboard Metrics ให้ตรงกับข้อมูลจริงในฐานข้อมูล โดยเฉพาะการนับ Ticket ตามสถานะ ช่วงเวลา 7 วัน และรายการ Urgent Tickets
> 3. ตรวจสอบ Drill-down Filters ว่าการเลือกการ์ด Dashboard นำไปยังรายการ Ticket ที่ตรงกับเงื่อนไขและจำนวนที่แสดง
> 4. ทดสอบ Empty State สำหรับผู้ใช้ที่ไม่มี Ticket รวมถึงการจัดการข้อผิดพลาดและสิทธิ์การเข้าถึง API
> 5. ตรวจสอบ Regression Tests เพื่อให้มั่นใจว่าการเพิ่ม Dashboard APIs ไม่กระทบการทำงานเดิมของระบบ
>
> โดยรวม แนวทางการพัฒนาสอดคล้องกับขอบเขต Lab 4 ในส่วน Dashboard APIs และมีการระบุผลการทดสอบไว้ใน PR แล้ว แต่ควรยืนยันความถูกต้องของการคำนวณ การควบคุมสิทธิ์ และผลการทดสอบจริงก่อนอนุมัติ Merge ฮะ

**My response** ([full comment](https://github.com/jaruwan18/ToktikIT/pull/73#issuecomment-6541511402)), summarised:

1. The Requester comes only from the session, and a `requesterId` query parameter is ignored (tested).
2. Tests create Tickets with known statuses and timestamps, including some older than 7 days, and compare exact values. Urgent shows only active HIGH Tickets, at most 5.
3. **Fixed:** some card counts did not match the lists they opened. Added `statusGroup` and `updatedWithinDays` filters, a `drillDown` map in each response, and a test that each list total equals its card.
4. **Fixed:** added a test for database failure (500 `INTERNAL_ERROR`, no internal details). The empty state returns zeros, and permissions return 401 or 403 as specified.
5. Server 158/158 passed. Merged with `lab4-staging`: 184/184, no conflicts.

## PR [#75](https://github.com/jaruwan18/ToktikIT/pull/75) — Requester and IT Staff Dashboard UI

**Reviewer comment (Approved):**

> จากการตรวจสอบ พบว่าการพัฒนา Requester Dashboard และ IT Staff Dashboard รวมถึง Metric Cards, Drill-down Navigation, Loading/Empty/Error States และ Responsive UI สอดคล้องกับขอบเขตงานที่กำหนดไว้
> นอกจากนี้ ยังมีการเพิ่ม Client Tests และแก้ไขการโหลด User Profile หลัง Login ซึ่งช่วยปรับปรุงการทำงานของระบบให้สมบูรณ์ยิ่งขึ้น
> แต่ยังมีประเด็นที่อยากให้ตรวจสอบเพิ่มเติมดังนี้
>
> 1. ตรวจสอบว่าตัวเลขบน Dashboard Cards ตรงกับจำนวน Ticket ในรายการที่กรองแล้ว โดยเฉพาะ Unassigned Tickets, My Owned Tickets และ Total Open Tickets ของ Requester
> 2. ตรวจสอบการควบคุมสิทธิ์และ Data Ownership ให้ Requester เข้าถึงได้เฉพาะ Ticket ของตนเอง และการเข้าถึงข้อมูลของแต่ละบทบาทเป็นไปตามข้อกำหนด
> 3. ทดสอบการทำงานหลัง Login ว่า Dashboard โหลดข้อมูลได้ตามปกติโดยไม่ต้อง Refresh หน้า และฟังก์ชัน Create Ticket ยังคงใช้งานได้
> 4. ตรวจสอบ Responsive UI และ Accessibility เพิ่มเติม โดยเฉพาะ Keyboard Navigation, Focus Indicator และการแสดงผลบนหน้าจอขนาดเล็ก
> 5. เนื่องจาก Dashboard E2E Tests ยังไม่ได้รวมใน PR นี้ ขอให้ตรวจสอบว่ามีแผนดำเนินการใน PR อื่น และมีการทดสอบร่วมกับ API จริงก่อนส่งมอบงาน Lab 4
>
> โดยรวม PR นี้มีขอบเขตงานตรงกับข้อกำหนด Lab 4 ในส่วน Dashboard UI และมีการเพิ่มการทดสอบที่เกี่ยวข้องแล้ว ควรยืนยันประเด็นข้างต้นและตรวจสอบ Regression ของระบบเดิมก่อนอนุมัติ Merge

**My response** ([full comment](https://github.com/jaruwan18/ToktikIT/pull/75#issuecomment-6542165441)), summarised:

1. Checked against the real API with Playwright: every Requester card and five Staff cards open lists whose totals match the card.
2. There is no requester id input, and the API uses the session. Another Requester's new Ticket is not shown, and a Requester gets 403 from the Staff dashboard.
3. **Fixed:** the review prompted a check of Create Ticket, which had been failing since Lab 3 ("You must be logged in.") because requests did not send the session cookie. Fixed in `api.ts`, with a regression test that fails without the fix.
4. Actionable cards are real buttons with a focus ring. Added a keyboard test (Tab, then Enter). No horizontal scroll at 390px.
5. Dashboard E2E is planned in Issue #76. Client 105/105 passed.

## PR [#77](https://github.com/jaruwan18/ToktikIT/pull/77) — Lab 4 E2E tests

**Reviewer comment (Approved):**

> การทดสอบครอบคลุมการสร้างและแก้ไข Action Taken, การตรวจสอบ Follow-up Note, การควบคุมสิทธิ์ของ Requester, การเปลี่ยนสถานะ Ticket ตาม Workflow, Resolution Gate, Dashboard Data Ownership, Drill-down และ Responsive UI
>
> นอกจากนี้ ยังมีการปรับปรุง Regression Test ของ Lab 2 และเพิ่มรายละเอียด Test Scenarios ใน docs/lab-04/tests.md ซึ่งช่วยให้การทดสอบมีความต่อเนื่องและตรวจสอบย้อนกลับได้
> แต่ก่อน Mareg ให้ตรวจสอบเพิ่มเติมดังนี้
>
> 1. ยืนยันว่า Backend ปฏิเสธการเปลี่ยนสถานะ Ticket ที่ไม่เป็นไปตาม Workflow จริง ไม่ใช่เพียงการจำกัดตัวเลือกใน UI
> 2. ตรวจสอบว่า E2E Tests ทั้ง 7 รายการของ Lab 4 ครอบคลุม Acceptance Criteria ที่เกี่ยวข้องใน tests.md
> 3. ยืนยันว่า Regression Fix ใน PR #75 ถูกรวมเข้ากับ Branch ที่ใช้รันทดสอบแล้ว และการทดสอบยังผ่านเมื่อรันซ้ำ

**My response** ([full comment](https://github.com/jaruwan18/ToktikIT/pull/77#issuecomment-6542891722)), summarised:

1. One E2E test calls the API directly (NEW to CLOSED) and gets 409 `INVALID_STATUS_TRANSITION`. The server tests also cover the full transition matrix.
2. **Updated:** added an Acceptance Criteria column to tests.md §18.4 and E2E references to the §19 traceability table.
3. The branch includes the #75 fix (`bfe7a2a`). All 12 E2E tests (Lab 2: 3, Lab 3: 2, Lab 4: 7) passed on two consecutive runs.

## PR [#79](https://github.com/jaruwan18/ToktikIT/pull/79) — Lab 4 final documentation

**Reviewer comment ([Approved](https://github.com/jaruwan18/ToktikIT/pull/79#pullrequestreview-5723894267)):**

> 1. ตรวจสอบ docs/lab-04/reviewer.md ว่าลิงก์ PR ทั้งหมดถูกต้อง และความคิดเห็น การตอบกลับ รวมถึงการแก้ไขหลัง Peer Review ตรงกับข้อมูลจริงบน GitHub
> 2. ตรวจสอบว่ามีหลักฐาน Formal Approval จากผู้รีวิวใน PR ที่เกี่ยวข้องครบถ้วน ไม่ใช่มีเพียง Comment หรือการตอบกลับ
> 3. ตรวจสอบ docs/lab-04/ai-use.md ว่ามีการระบุ LLM, Key Prompts จำนวน 6–10 รายการ, ผลลัพธ์ วิธีตรวจสอบ และ My Reflection ครบตามข้อกำหนด
> 4. ตรวจสอบภาพหน้าจอ Desktop, Tablet และ Mobile ว่าอ่านได้ชัดเจน ครอบคลุม Dashboard และ Actions Taken รวมถึง Loading, Empty, Error และ Forbidden States
> 5. ตรวจสอบ README.md ว่าคำสั่ง Setup, Migration, Seed, Test และขั้นตอน Demonstration สอดคล้องกับสถานะปัจจุบันของระบบ และสามารถทำตามได้จริง

**My response** ([comment](https://github.com/jaruwan18/ToktikIT/pull/79#issuecomment-6554623021)):

> ขอบคุณสำหรับการรีวิวค่ะ ตรวจครบ 5 ข้อแล้ว และเพิ่ม commit แก้ไข 1 commit
>
> 1. **reviewer.md:** เทียบลิงก์ PR, ลิงก์รีวิว และคอมเมนต์ตอบกลับทุกอันกับ GitHub แล้ว ตรงกันทั้งหมด เพิ่มลิงก์ไปยังคอมเมนต์ตอบกลับของ #62–#69 และระบุว่าวันที่เป็นเวลา UTC
> 2. **Formal Approval:** ทุก PR ตั้งแต่ #62 ถึง #79 ได้สถานะ **Approved** จาก @Film26 และในตารางของ reviewer.md ลิงก์ไปที่ review นั้นโดยตรง
> 3. **ai-use.md:** ระบุ LLM 2 ตัว (Claude และ ChatGPT) มี Key Prompts 6 ข้อ แต่ละข้อบอกผลลัพธ์และวิธีตรวจสอบ และมี My Reflection ครบ
> 4. **ภาพหน้าจอ (แก้เพิ่ม):** เพิ่มภาพ Actions Taken ตอนไม่มีข้อมูล (Empty) และตอนโหลดไม่สำเร็จ (Error) ครบทั้ง 3 ขนาดจอ ตอนนี้ Dashboard และ Actions Taken มีภาพสถานะ Loading, Empty, Error และ Forbidden ครบ
> 5. **README:** ลองทำตามทีละขั้นบน clone ใหม่และฐานข้อมูลใหม่ ทั้ง migrate, seed (รัน 2 รอบ), server 184/184, client 105/105, build และ E2E 12/12 ผ่านทั้งหมด แก้ขั้นตอน demo เรื่อง Resolved ให้รวมเงื่อนไข follow-up note ด้วย

**Outcome:** The follow-up commit (`661838b`) was pushed after PR #79 had been merged, so it was merged into `lab4-staging` through a separate follow-up PR.
