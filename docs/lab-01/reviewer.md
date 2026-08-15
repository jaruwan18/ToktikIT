# Lab 1 — Peer Review Record

**Author:** Jaruwan — GitHub: @jaruwan18  
**Peer reviewer:** Film — GitHub: @Film26

## Pull Requests I authored (reviewed by my partner)
| PR | Branch | Reviewer verdict |
|----|--------|------------------|
| [#5](https://github.com/jaruwan18/ToktikIT/pull/5) | feature/1-project-foundation | Approved |
| [#6](https://github.com/jaruwan18/ToktikIT/pull/6) | feature/2-health-check | Approved |
|    | feature/3-category-seed |  |
|    | feature/4-category-list |  |

### Reviewer comment I received (PR #5 - Issue 1):
> "Required branch ต้องตรงตามโจทย์ feature/1-project-foundation, ไม่ implement เกินขอบเขต Issue 1, เติมคำสั่ง migrate/seed ใน README.md และเติมเอกสารใน docs/lab-01/ ทั้ง 3 ไฟล์"

### How I responded:
> "ตรวจสอบและยืนยันว่าทำงานอยู่บน branch `feature/1-project-foundation` อย่างถูกต้อง และไม่ได้เขียนโค้ดล้ำหน้าไปยัง Issue 2-4 (Endpoints และ Seeds ยังเป็น Stub), ทำการเพิ่มคำสั่ง `prisma migrate dev` และ `prisma:seed` ลงใน `README.md` และอัปเดตเอกสารใน `docs/lab-01/` ครบทั้ง 3 ไฟล์เรียบร้อยครับ"

### Reviewer comment I received (PR #6 - Issue 2):
> "เช็ก PR #6 แล้ว มี 2 จุดที่ต้องแก้ก่อน merge: Backend /api/health มี res.status(501) ก่อน 200 ให้เหลือ 200 ตัวเดียว, และ Frontend checkSystem() มี throw new Error ก่อน fetch ให้เอา throw ออกแล้วให้ fetch('/api/health') ทำงาน"

### How I responded:
> "ได้ทำการตรวจสอบและปรับแก้ทั้ง 2 จุดเรียบร้อยแล้วครับ: ใน server/src/app.ts เหลือเฉพาะ response 200 คืน { status: 'ok', service: 'TokTickIT API' }, ใน client/src/api.ts เอา throw stub ออกและรัน fetch('/api/health') พร้อมตรวจสอบ status === 'ok' และรัน Supertest API-01 ผ่าน 100% เรียบร้อยครับ"

---

## Pull Requests I reviewed for my partner
| PR | Partner's Branch | My verdict |
|----|------------------|------------|
|    | feature/1-project-foundation | Approved |
|    | feature/2-health-check | Approved |

### My comment (PR Issue 1):
> "ตรง PR base เหมือนใน Lab sheet จะให้ merge feature branch เข้า lab1-staging ก่อน ลองเปลี่ยนจาก main เป็น lab1-staging ดู ส่วน PostgreSQL เห็นว่า setup Prisma แล้ว แต่ใน Lab sheet มีบอกว่า PostgreSQL ต้อง reachable ด้วย ลองเช็ค connection ว่าต่อได้จริงด้วยนะ"

### Partner's response (Issue 1):
> "รับทราบครับ ได้เปลี่ยน base เป็น lab1-staging และเช็ค connection ของ PostgreSQL เรียบร้อยแล้วครับ"

### My comment (PR Issue 2):
> "คิดว่าโอเคแล้วนะ มีเรียก /api/health จริงแล้วก็แยก success กับ error state ตามที่ 7.2 กำหนดไว้ ลองเช็ค data.status === 'ok' ก่อน set เป็น success ได้นะ เผื่อ API ตอบ 200 แต่ status ไม่ใช่ ok จะได้ไม่เข้า success state"

### Partner's response (Issue 2):
> "ขอบคุณสำหรับข้อเสนอแนะ ได้เพิ่มการเช็ค data.status === 'ok' ก่อน set success เรียบร้อยแล้วครับ"
