# Lab 1 — Peer Review Record

**Author:** Jaruwan — GitHub: @jaruwan18  
**Peer reviewer:** Film — GitHub: @Film26

## Pull Requests I authored (reviewed by my partner)
| PR | Branch | Reviewer verdict |
|----|--------|------------------|
| [#5](https://github.com/jaruwan18/ToktikIT/pull/5) | feature/1-project-foundation | Approved |
| [#6](https://github.com/jaruwan18/ToktikIT/pull/6) | feature/2-health-check | Approved |
| [#7](https://github.com/jaruwan18/ToktikIT/pull/7) | feature/3-category-seed | Approved |
| [#8](https://github.com/jaruwan18/ToktikIT/pull/8) | feature/4-category-list | Approved |

### Reviewer comment I received (PR #5 - Issue 1):
> "Required branch ต้องตรงตามโจทย์ feature/1-project-foundation, ไม่ implement เกินขอบเขต Issue 1, เติมคำสั่ง migrate/seed ใน README.md และเติมเอกสารใน docs/lab-01/ ทั้ง 3 ไฟล์"

### How I responded:
> "ตรวจสอบและยืนยันว่าทำงานอยู่บน branch `feature/1-project-foundation` อย่างถูกต้อง และไม่ได้เขียนโค้ดล้ำหน้าไปยัง Issue 2-4 (Endpoints และ Seeds ยังเป็น Stub), ทำการเพิ่มคำสั่ง `prisma migrate dev` และ `prisma:seed` ลงใน `README.md` และอัปเดตเอกสารใน `docs/lab-01/` ครบทั้ง 3 ไฟล์เรียบร้อยครับ"

### Reviewer comment I received (PR #6 - Issue 2):
> "เช็ก PR #6 แล้ว มี 2 จุดที่ต้องแก้ก่อน merge: Backend /api/health มี res.status(501) ก่อน 200 ให้เหลือ 200 ตัวเดียว, และ Frontend checkSystem() มี throw new Error ก่อน fetch ให้เอา throw ออกแล้วให้ fetch('/api/health') ทำงาน"

### How I responded:
> "ได้ทำการตรวจสอบและปรับแก้ทั้ง 2 จุดเรียบร้อยแล้วครับ: ใน server/src/app.ts เหลือเฉพาะ response 200 คืน { status: 'ok', service: 'TokTickIT API' }, ใน client/src/api.ts เอา throw stub ออกและรัน fetch('/api/health') พร้อมตรวจสอบ status === 'ok' และรัน Supertest API-01 ผ่าน 100% เรียบร้อยครับ"

### Reviewer comment I received (PR #7 - Issue 3):
> "ตรวจตาม acceptance criteria ของ Issue 3 แล้ว ผ่านครบ 5 ข้อ ชื่อ branch ถูก scope ไม่ล้ำ Issue 4 ดีมาก แต่มีจุดที่ต้องแก้ดังนี้: README.md — เพิ่มคำสั่ง prisma migrate และ prisma:seed ตอนนี้ clone ไปใหม่จะได้ DB ว่าง, server/prisma/seed.ts บรรทัด 3–6 — comment โจทย์/hint ยังค้าง ลบออกค่ะ, docs/lab-01/ai_use.md — Reflection ต้องมี 2–3 ประโยค + จุดที่แก้/ปฏิเสธ AI และ prompt ต้องมี 6–10 ข้อ (ตอนนี้ 4), เสริม (ไม่บล็อก): export const CATEGORIES เผื่อเทสต์ Issue 4 ใช้ต่อ และแนบ output รัน seed สองรอบใน tests.md มีเท่านี้จ้า"

### How I responded:
> "ได้ดำเนินการแก้ไขตามข้อเสนอแนะครบทุกจุดเรียบร้อยแล้วครับ: 1) เพิ่มคำสั่ง `npx prisma migrate dev` และ `npm run prisma:seed` ใน `README.md` ให้ผู้ clone ใหม่รัน setup ได้ทันที 2) ลบ comment starter/hint ออกจาก `server/prisma/seed.ts` พร้อม `export const CATEGORIES` 3) ขยายตาราง Prompt เป็น 7 ข้อและเพิ่ม Reflection ชัดเจน 2-3 ประโยคพร้อมระบุจุดที่ปรับแก้การทำงานของ AI ใน `docs/lab-01/ai_use.md` 4) แนบ output บันทึกการรัน migrate และ seed 2 รอบเพื่อพิสูจน์ Idempotency ลงใน `docs/lab-01/tests.md` เรียบร้อยครับ"

### Reviewer comment I received (PR #8 - Issue 4):
> "issue 4 นี้ทำได้ดีครบตามบรีฟแต่มีจุดต้องลบ 1 จุดคือ ลบ describe.todo() / it.todo() ที่ค้างใน Supertest และ Vitest พร้อมรัน test ใหม่ให้ผ่านทั้งหมด แล้วถึง Merge"

### How I responded:
> "ตรวจสอบและยืนยันว่าได้ลบ `describe.todo()` และ `it.todo()` ออกทั้งหมดแล้ว และแปลงเป็น test case จริงครบทุกตัว (Supertest `API-01`, `API-02` และ Vitest `UI-01`, `UI-02`, `UI-03`), รันคำสั่ง `npm test` ทั้งฝั่ง client และ server ผ่าน 100% ครบทุก suite โดยไม่มี test ใดถูก skip หรือค้าง todo ครับ"

---

## Pull Requests I reviewed for my partner
| PR | Partner's Branch | My verdict |
|----|------------------|------------|
|    | feature/1-project-foundation | Approved |
|    | feature/2-health-check | Approved |
|    | feature/3-category-seed | Approved |
|    | feature/4-category-list | Approved |

### My comment (PR Issue 1):
> "ตรง PR base เหมือนใน Lab sheet จะให้ merge feature branch เข้า lab1-staging ก่อน ลองเปลี่ยนจาก main เป็น lab1-staging ดู ส่วน PostgreSQL เห็นว่า setup Prisma แล้ว แต่ใน Lab sheet มีบอกว่า PostgreSQL ต้อง reachable ด้วย ลองเช็ค connection ว่าต่อได้จริงด้วยนะ"

### Partner's response (Issue 1):
> "รับทราบครับ ได้เปลี่ยน base เป็น lab1-staging และเช็ค connection ของ PostgreSQL เรียบร้อยแล้วครับ"

### My comment (PR Issue 2):
> "คิดว่าโอเคแล้วนะ มีเรียก /api/health จริงแล้วก็แยก success กับ error state ตามที่ 7.2 กำหนดไว้ ลองเช็ค data.status === 'ok' ก่อน set เป็น success ได้นะ เผื่อ API ตอบ 200 แต่ status ไม่ใช่ ok จะได้ไม่เข้า success state"

### Partner's response (Issue 2):
> "ขอบคุณสำหรับข้อเสนอแนะ ได้เพิ่มการเช็ค data.status === 'ok' ก่อน set success เรียบร้อยแล้วครับ"

### My comment (PR Issue 3):
> "ตรวจสอบ PR Issue 3 ของเพื่อนแล้ว Model Category ถูกต้องตาม schema, migration ทำงานได้สมบูรณ์, seed script ใช้ upsert กัน duplicate เรียบร้อย และไม่มีการ commit secret ใน .env ครับ"

### Partner's response (Issue 3):
> "ขอบคุณครับ ได้ตรวจสอบ migration และ seed บน dev DB เรียบร้อยแล้วครับ"

### My comment (PR Issue 4):
> "ตรวจสอบ PR Issue 4 แล้ว GET /api/categories ดึงข้อมูลจากฐานข้อมูลจริงตาม order id ถูกต้อง, Frontend แสดงหมวดหมู่และ loading/error state ครบถ้วน, Supertest และ Vitest ผ่านทุกเคสครับ"

### Partner's response (Issue 4):
> "ขอบคุณครับ ได้ทดสอบทั้ง automated test และ live UI เรียบร้อยแล้วครับ"