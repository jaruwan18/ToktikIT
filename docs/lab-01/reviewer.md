# Lab 1 — Peer Review Record

**Author:** Jaruwan — GitHub: @jaruwan18  
**Peer reviewer:** Film — GitHub: @Film26

## Pull Requests I authored (reviewed by my partner)
| PR | Branch | Reviewer verdict |
|----|--------|------------------|
| [#5](https://github.com/jaruwan18/ToktikIT/pull/5) | feature/1-project-foundation | Approved |
| [#6](https://github.com/jaruwan18/ToktikIT/pull/6) | feature/2-health-check | In Review |
|    | feature/3-category-seed |  |
|    | feature/4-category-list |  |

### Reviewer comment I received (PR #5 - Issue 1):
> "Required branch ต้องตรงตามโจทย์ feature/1-project-foundation, ไม่ implement เกินขอบเขต Issue 1, เติมคำสั่ง migrate/seed ใน README.md และเติมเอกสารใน docs/lab-01/ ทั้ง 3 ไฟล์"

### How I responded:
> "ตรวจสอบและยืนยันว่าทำงานอยู่บน branch `feature/1-project-foundation` อย่างถูกต้อง และไม่ได้เขียนโค้ดล้ำหน้าไปยัง Issue 2-4 (Endpoints และ Seeds ยังเป็น Stub), ทำการเพิ่มคำสั่ง `prisma migrate dev` และ `prisma:seed` ลงใน `README.md` และอัปเดตเอกสารใน `docs/lab-01/` ครบทั้ง 3 ไฟล์เรียบร้อยครับ"

---

## Pull Requests I reviewed for my partner
| PR | Partner's Branch | My verdict |
|----|------------------|------------|
|    | feature/1-project-foundation | Approved |
|    | feature/2-health-check |  |

### My comment (PR Issue 1):
> "ตรง PR base เหมือนใน Lab sheet จะให้ merge feature branch เข้า lab1-staging ก่อน ลองเปลี่ยนจาก main เป็น lab1-staging ดู ส่วน PostgreSQL เห็นว่า setup Prisma แล้ว แต่ใน Lab sheet มีบอกว่า PostgreSQL ต้อง reachable ด้วย ลองเช็ค connection ว่าต่อได้จริงด้วยนะ"

### Partner's response:
> "รับทราบครับ ได้เปลี่ยน base เป็น lab1-staging และเช็ค connection ของ PostgreSQL เรียบร้อยแล้วครับ"
