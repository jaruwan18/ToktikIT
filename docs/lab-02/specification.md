###### \# Lab 2 Sprint Engineering Specification



\## 1. เป้าหมายของ Sprint (Sprint Goal)



ส่งมอบระบบ Ticketing MVP ฝั่ง Requester ที่ให้ Development Requester ที่ถูกเลือกไว้สามารถสร้าง

ตั๋วขอความช่วยเหลือด้าน IT แนบไฟล์หลักฐานประกอบ ได้รับหมายเลขตั๋ว (Ticket Number) อย่างเป็นทางการ

และสามารถค้นหา ดูรายละเอียด และจัดการไฟล์แนบของตั๋วนั้นผ่านหน้า My Tickets และ Ticket Detail

ได้ในภายหลัง — โดยต้องรับประกันว่า Requester คนหนึ่งจะไม่สามารถเห็นหรือแก้ไขข้อมูลของ Requester

คนอื่นได้เด็ดขาด



\## 2. การตีความคำร้องขอจากผู้ว่าจ้าง (Stakeholder Request Interpretation)



ฝ่าย IT ต้องการให้มีระบบที่ใช้งานได้จริงฝั่ง Requester ก่อนที่ระบบ login จริงจะพร้อม เนื่องจากระบบ

authentication ยังไม่มาจนกว่าจะถึง Lab 3 แอปจึงต้องจำลอง "ใครกำลังใช้งานระบบอยู่" ด้วยตัวเลือก

Development Requester ชั่วคราว เมื่อเลือก Requester แล้ว ตัวตนนั้นต้องทำงานเสมือนผู้ใช้ที่ login

จริงในทุกด้าน ทั้งการสร้างตั๋ว การแสดงรายการ และการเข้าถึงรายละเอียด/ไฟล์แนบ — พร้อมแยกข้อมูล

ระหว่าง Requester แต่ละคนอย่างสมบูรณ์



\## 3. ขอบเขตงาน (Scope)



\### สิ่งที่รวมอยู่ในขอบเขต (Included)

\- หน้าจอเลือก Development Requester (เป็นกลไกทดสอบเท่านั้น)

\- หน้าจอและ API สำหรับสร้างตั๋ว (Category, Related System, Priority, Summary, Description, ไฟล์แนบ)

\- หน้าจอและ API สำหรับ My Tickets (ค้นหา, กรอง, เรียงลำดับ, แบ่งหน้า, จำกัดเฉพาะเจ้าของตั๋ว)

\- หน้าจอ Requester Ticket Detail (ส่วนหัวตั๋วแบบอ่านอย่างเดียว + จัดการไฟล์แนบ)

\- วงจรชีวิตของไฟล์แนบ: อัปโหลด, แสดง metadata, ดาวน์โหลด, ลบแบบ soft removal

\- ธีม UI แบบ Zen Green และสถานะ component ที่ใช้ซ้ำได้ (loading, empty, error, busy, validation)

\- Layout แบบ responsive (desktop / tablet / mobile)



\### สิ่งที่ไม่รวมอยู่ในขอบเขต (Excluded)

\- ระบบ Authentication, session, password, token, การตรวจสอบสิทธิ์ตาม role จริง

\- หน้า Dashboard ของ IT Staff, การรับตั๋ว (claim ticket), การเปลี่ยน IT Priority, การโอนความเป็นเจ้าของตั๋ว

\- Public Comments, Internal Notes, Actions Taken

\- การเปลี่ยนสถานะตั๋วใดๆ นอกเหนือจากสถานะเริ่มต้น "New" (ไม่มี resolve/close/reopen)

\- ฟังก์ชันของ Administrator (จัดการผู้ใช้, จัดการข้อมูลอ้างอิง)



\## 4. ความต้องการเชิงฟังก์ชัน (Functional Requirements)



\- FR-01: ระบบต้องให้ผู้ใช้เลือก Development Requester ที่ active อย่างน้อยหนึ่งคน ก่อนเข้าใช้งาน

&#x20; หน้าจอใดๆ ที่เกี่ยวกับตั๋ว

\- FR-02: ระบบต้องสร้างตั๋วใหม่ให้กับ Requester ที่ถูกเลือกอยู่ พร้อมหมายเลขตั๋วที่ backend สร้างขึ้น

&#x20; และไม่ซ้ำกัน

\- FR-03: ระบบต้องให้ Requester แนบไฟล์ประกอบได้ 0 ไฟล์ขึ้นไปตอนสร้างตั๋ว ภายใต้กฎไฟล์แนบที่กำหนด

\- FR-04: ระบบต้องแสดงเฉพาะตั๋วที่เป็นของ Requester ที่ถูกเลือกอยู่ใน My Tickets เท่านั้น

\- FR-05: ระบบต้องรองรับการค้นหา (จากหมายเลขตั๋วหรือ Summary), การกรอง (Category, Requested

&#x20; Priority, Current Status), การเรียงลำดับ, และการแบ่งหน้าของรายการตั๋ว

\- FR-06: ระบบต้องดึงรายละเอียดตั๋วแบบเต็มได้ก็ต่อเมื่อตั๋วนั้นเป็นของ Requester ที่ถูกเลือกอยู่

&#x20; เท่านั้น มิฉะนั้นต้องปฏิเสธการเข้าถึง

\- FR-07: ระบบต้องให้ Requester เพิ่มไฟล์แนบใหม่ลงในตั๋วที่มีอยู่แล้วและเป็นของตนเองได้

\- FR-08: ระบบต้องให้ Requester ลบไฟล์แนบของตนเองแบบ soft removal ได้ โดยต้องระบุเหตุผลการลบ

&#x20; และต้องเก็บ metadata ของไฟล์นั้นไว้

\- FR-09: ระบบต้องบล็อกการดาวน์โหลด/พรีวิวไฟล์แนบที่ถูก soft-remove ไปแล้ว

\- FR-10: ระบบต้องไม่แสดง Development Requester ที่ inactive ในตัวเลือก

\- FR-11: ระบบต้องแสดงสถานะข้อผิดพลาดที่ชัดเจนและไม่บล็อกการใช้งาน หากข้อมูลอ้างอิง (Categories,

&#x20; Related Systems, Requesters) โหลดไม่สำเร็จ



\## 5. กฎทางธุรกิจ (Business Rules)



\- BR-01: หมายเลขตั๋วอย่างเป็นทางการถูกสร้างโดย backend (รูปแบบ `TKT-YYYY-NNNNNN` เรียงลำดับ

&#x20; และเติมเลข 0 ข้างหน้า) และต้องไม่ซ้ำกันทั้งระบบ

\- BR-02: ตั๋วใหม่ทุกใบต้องเริ่มต้นด้วย Current Status = `NEW` เสมอ

\- BR-03: ตัวเลือก Development Requester เป็นเพียงกลไกทดสอบเท่านั้น ไม่ใช่การยืนยันตัวตนจริง

&#x20; ตัวตนที่เลือกไม่มีการรับประกันด้านความปลอดภัยใดๆ และต้องแสดงข้อความอธิบายให้เห็นชัดเจน

\- BR-04: Ticket Summary เป็นฟิลด์บังคับ ต้องตัดช่องว่างหน้า-หลัง (trim) และมีความยาวระหว่าง 5-150

&#x20; ตัวอักษรหลัง trim แล้ว

\- BR-05: Ticket Description เป็นฟิลด์บังคับ ต้อง trim และมีความยาวระหว่าง 10-2000 ตัวอักษรหลัง trim

&#x20; แล้ว

\- BR-06: Category และ Related System เป็นฟิลด์บังคับที่ต้องเลือกจากข้อมูลอ้างอิงที่ active เท่านั้น

&#x20; หากเป็น ID ที่ inactive หรือไม่รู้จัก ระบบต้องปฏิเสธด้วย HTTP 400

\- BR-07: Requested Priority เป็นฟิลด์บังคับ และต้องเป็นค่าใดค่าหนึ่งใน `LOW`, `MEDIUM`, `HIGH`

\- BR-08: ความเป็นเจ้าของตั๋วเปลี่ยนแปลงไม่ได้หลังสร้างเสร็จ: ค่า `requesterId` ของตั๋วต้องไม่ถูก

&#x20; เปลี่ยนโดยการทำงานใดๆ ใน Lab 2

\- BR-09: การแยกสิทธิ์ตามเจ้าของ (Ownership Isolation) — ทุกการอ่านหรือเขียนข้อมูลตั๋วหรือไฟล์แนบ

&#x20; ต้องตรวจสอบว่า `requesterId` ของทรัพยากรนั้นตรงกับ Requester ที่ถูกเลือกอยู่ในปัจจุบัน หากไม่ตรง

&#x20; ให้ตอบกลับด้วย 404 (ไม่ใช่ 403) เพื่อไม่ให้เปิดเผยว่าทรัพยากรนั้นมีอยู่จริงแก่ผู้ที่ไม่ใช่เจ้าของ

\- BR-10: การสลับ Development Requester ต้องทำให้ข้อมูลตั๋ว/รายละเอียดที่ cache ไว้ก่อนหน้าถูกล้าง

&#x20; ทันที และโหลดข้อมูลใหม่ตาม Requester ที่เพิ่งเลือก

\- BR-11: การแบ่งหน้าของ My Tickets ค่าเริ่มต้นคือหน้า 1 ขนาดหน้า 10 รายการ (สูงสุด 50) หากค่า

&#x20; `page`/`pageSize` ที่ส่งมาไม่ถูกต้อง ให้ใช้ค่าเริ่มต้นแทนการแจ้ง error

\- BR-12: การค้นหาจะจับคู่กับหมายเลขตั๋ว (ตรงทั้งหมดหรือบางส่วน) หรือ Summary (ไม่สนตัวพิมพ์เล็ก-ใหญ่

&#x20; จับคู่บางส่วนได้) ส่วนตัวกรอง (Category, Requested Priority, Current Status) ใช้เงื่อนไข AND

&#x20; ร่วมกัน

\- BR-13: การป้องกันการส่งซ้ำ (Duplicate-submission prevention) — ปุ่ม Submit ของ Create Ticket

&#x20; ต้องถูกปิดใช้งานทันทีที่มีการส่ง request อยู่ ส่วน backend จะถือว่าการสร้างตั๋วที่ถูกส่งซ้ำเป็น

&#x20; รายการอิสระต่อกัน เว้นแต่จะมี idempotency key ตรงกัน (ขั้นต่ำของ Lab 2 คือการปิดปุ่มซ้ำที่ฝั่ง

&#x20; client)

\- BR-14: หากสร้างตั๋วสำเร็จแต่การอัปโหลดไฟล์แนบล้มเหลว ตั๋วยังคงถูกบันทึกไว้ตามปกติ โดย UI ต้อง

&#x20; รายงานว่าไฟล์แนบใดล้มเหลว และให้ Requester ลองอัปโหลดใหม่ได้จากหน้า Ticket Detail

\- BR-15: ประเภทไฟล์แนบที่อนุญาตคือ JPG/JPEG, PNG, WEBP และ PDF เท่านั้น ขนาดสูงสุด 5 MB ต่อไฟล์

&#x20; และมีไฟล์แนบที่ active ได้สูงสุด 5 ไฟล์ต่อตั๋ว

\- BR-16: ไฟล์แนบที่ถูก soft-remove ต้องยังคง metadata ไว้ (ชื่อไฟล์, ขนาด, ผู้อัปโหลด, เวลา,

&#x20; เหตุผลการลบ, เวลาที่ลบ) ให้เห็นในหน้า Ticket Detail แต่เนื้อหาไฟล์จะดาวน์โหลดหรือพรีวิวไม่ได้

\- BR-17: เฉพาะ Requester เจ้าของตั๋วเท่านั้นที่เพิ่มหรือ soft-remove ไฟล์แนบในตั๋วของตนเองได้

&#x20; หากมีการร้องขอกับตั๋ว/ไฟล์แนบของ Requester คนอื่น ให้ตอบกลับด้วย 404

\- BR-18: Development Requester ที่ inactive ต้องไม่ปรากฏในตัวเลือก และต้องไม่สามารถใช้สร้างหรือดู

&#x20; ตั๋วได้ แม้จะอ้างอิงถึง ID โดยตรงก็ตาม

\- BR-19: My Tickets ต้องแสดงสถานะ "ไม่มีข้อมูล" (empty state — Requester ยังไม่มีตั๋วเลย) แยกจาก

&#x20; สถานะ "ไม่พบผลลัพธ์" (no-results state — ค้นหา/กรองแล้วไม่พบรายการที่ตรงจากตั๋วที่มีอยู่)

\- BR-20: หน้า Requester Ticket Detail ในส่วนหัวตั๋วต้องเป็นแบบอ่านอย่างเดียวโดยเคร่งครัดใน Lab 2

&#x20; มีเพียงการกระทำต่อไฟล์แนบ (เพิ่ม, soft-remove, ดาวน์โหลด) เท่านั้นที่แก้ไขได้

\- BR-21: ใน Lab 3 ตัวเลือก Development Requester จะถูกแทนที่ด้วยระบบ authentication จริง การ

&#x20; ออกแบบ foreign key `requesterId` ต้องรองรับการเปลี่ยนแปลงนี้ได้โดยไม่ต้องแก้ schema แบบ breaking

&#x20; change



\## 6. สรุปข้อกำหนดด้าน UI (UI Specification Summary)



รายละเอียดฉบับเต็มอยู่ใน `docs/lab-02/ui-spec.md` สรุปโดยย่อ:

\- \*\*โครงหลักของแอป (Application shell):\*\* หัวเว็บ TokTickIT (สีเขียวหลัก `#006B3C`), เมนู My

&#x20; Tickets / Create Ticket, ชื่อ Requester ปัจจุบัน + ปุ่ม "Change Requester", มีการระบุหน้าที่กำลัง

&#x20; ใช้งานอยู่อย่างชัดเจน

\- \*\*หน้าเลือก Development Requester:\*\* dropdown รายชื่อ Requester ที่ active, มีสถานะ

&#x20; loading/empty/error, มีข้อความแจ้งชัดเจนว่า "ใช้เพื่อทดสอบเท่านั้น ไม่ใช่หน้า login", รองรับการใช้

&#x20; งานผ่านคีย์บอร์ด

\- \*\*หน้า Create Ticket:\*\* จัดกลุ่มฟิลด์ (ฟิลด์ที่ระบบสร้างอัตโนมัติ/อ่านอย่างเดียวต้องแยกด้วยสีเทา

&#x20; อมเขียวอ่อน), Summary/Description ให้พื้นที่เต็มความกว้าง, ส่วนไฟล์แนบอยู่ด้านล่างฟิลด์หลัก,

&#x20; ปุ่ม Submit มีสถานะ busy, ข้อความ validation แสดงติดกับฟิลด์นั้นๆ

\- \*\*หน้า My Tickets:\*\* ช่องค้นหา, ตัวกรอง (Category/Priority/Status), คอลัมน์ที่เรียงลำดับได้,

&#x20; ตัวควบคุมการแบ่งหน้า, ปุ่ม Create Ticket, แยกสถานะ empty กับ no-results ให้ชัดเจน, บนมือถือ

&#x20; ตารางจะยุบเป็นการ์ด

\- \*\*หน้า Ticket Detail:\*\* ส่วนหัวตั๋วแบบอ่านอย่างเดียวแยกจากส่วนรายการ/การกระทำไฟล์แนบอย่างชัดเจน,

&#x20; สถานะไฟล์แนบ (active, uploading, invalid, removed, unavailable) แต่ละแบบต้องดูออกต่างกัน

\- \*\*จุดตัด Responsive:\*\* Desktop ≥992px (หลายคอลัมน์), Tablet 768–991px (สองคอลัมน์),

&#x20; Mobile <768px (เรียงซ้อนแนวตั้ง, ปุ่มกดสะดวกบนมือถือ, ไม่มี scroll แนวนอน)



\## 7. การเปลี่ยนแปลงด้านข้อมูล (Data Changes)



Prisma model ใหม่ (นิยามฉบับสมบูรณ์อยู่ที่ `server/prisma/schema.prisma`):



\- \*\*Requester\*\* — `id`, `name`, `email` (unique), `isActive` (bool, ค่าเริ่มต้น true), `createdAt`

\- \*\*Category\*\* — ใช้ซ้ำจาก Lab 1 (`id`, `name` unique, `createdAt`)

\- \*\*RelatedSystem\*\* — `id`, `name` (unique), `isActive` (bool, ค่าเริ่มต้น true), `createdAt`

\- \*\*Ticket\*\* — `id`, `ticketNumber` (unique, สร้างโดย backend), `requesterId` (FK → Requester),

&#x20; `categoryId` (FK → Category), `relatedSystemId` (FK → RelatedSystem), `summary`, `description`,

&#x20; `requestedPriority` (enum: LOW/MEDIUM/HIGH), `currentStatus` (enum, ค่าเริ่มต้น NEW),

&#x20; `createdAt`, `updatedAt`

\- \*\*Attachment\*\* — `id`, `ticketId` (FK → Ticket), `originalFilename`, `storedFilename` (ชื่อไฟล์

&#x20; ที่ปลอดภัย/ไม่ซ้ำบนดิสก์), `mimeType`, `sizeBytes`, `uploadedAt`, `isRemoved` (bool, ค่าเริ่มต้น

&#x20; false), `removedAt` (nullable), `removalReason` (nullable, บังคับกรอกเมื่อ `isRemoved` = true)



Index ที่ต้องมี: `Ticket.requesterId` (ใช้กรองตามเจ้าของบ่อย), `Ticket.ticketNumber` (ค้นหาแบบ

unique), `Ticket.categoryId`/`relatedSystemId` (ใช้กรอง), `Attachment.ticketId` (แสดงรายการตามตั๋ว)



การลบแบบ soft removal ถูกแทนด้วยฟิลด์ `isRemoved` + `removedAt` + `removalReason` บน `Attachment`

แทนการลบข้อมูลจริง เพื่อให้ metadata และ audit trail ยังคงอยู่



\## 8. สัญญา API (API Contract)



รายละเอียดฉบับเต็มอยู่ใน `docs/lab-02/api-spec.md` endpoint ทั้งหมด:



| Method | Path | วัตถุประสงค์ |

|---|---|---|

| GET | `/api/categories` | ดึง Category ที่ active |

| GET | `/api/related-systems` | ดึง Related System ที่ active |

| GET | `/api/requesters` | ดึง Development Requester ที่ active |

| POST | `/api/tickets` | สร้างตั๋วให้ Requester ที่เลือกอยู่ |

| GET | `/api/tickets` | รายการตั๋วแบบแบ่งหน้า/กรอง/เรียงลำดับ เฉพาะของ `requesterId` |

| GET | `/api/tickets/:id` | รายละเอียดตั๋วที่เป็นเจ้าของ |

| POST | `/api/tickets/:id/attachments` | อัปโหลดไฟล์แนบเข้าตั๋วที่เป็นเจ้าของ |

| GET | `/api/tickets/:id/attachments` | ดึง metadata ไฟล์แนบของตั๋วที่เป็นเจ้าของ |

| GET | `/api/attachments/:id/download` | ดาวน์โหลดไฟล์แนบที่ active และเป็นเจ้าของ |

| DELETE | `/api/attachments/:id` | soft-remove ไฟล์แนบที่เป็นเจ้าของ (body: `reason`) |



ทุก endpoint ที่เกี่ยวกับ Ticket/Attachment ต้องมี `requesterId` (ส่งผ่าน query param หรือ header

ตามที่ระบุใน api-spec.md) เพื่อใช้ยืนยันตัวตนผู้เรียกสำหรับตรวจสอบความเป็นเจ้าของ หากไม่ตรงกับ

เจ้าของจริงจะตอบกลับด้วย 404



\## 9. เกณฑ์การยอมรับ (Acceptance Criteria)



\- AC-01: กำหนดให้ข้อมูลตั๋วถูกต้อง เมื่อ Requester กดส่งฟอร์ม ผลลัพธ์คือมีการบันทึกตั๋วหนึ่งใบ

&#x20; และแสดงหมายเลขตั๋วอย่างเป็นทางการ

\- AC-02: กำหนดให้ยังไม่มีการเลือก Development Requester เมื่อผู้ใช้พยายามเปิดหน้า My Tickets

&#x20; ผลลัพธ์คือระบบแสดงหน้าเลือก Requester

\- AC-03: กำหนดให้เลือก Requester B อยู่ เมื่อมีการร้องขอตั๋วที่เป็นของ Requester A ผลลัพธ์คือ

&#x20; ข้อมูลตั๋วนั้นจะไม่ถูกส่งกลับมา (404)

\- AC-04: กำหนดให้ Summary สั้นกว่า 5 ตัวอักษร เมื่อ Requester กดส่งฟอร์ม ผลลัพธ์คือมีข้อความ

&#x20; validation แสดงที่ฟิลด์นั้น และไม่มีการเรียก API

\- AC-05: กำหนดให้กำลังส่งข้อมูลที่ถูกต้องอยู่ เมื่อ Requester กดปุ่ม Submit ผลลัพธ์คือปุ่มแสดง

&#x20; สถานะ busy และถูกปิดใช้งานจนกว่า request จะเสร็จสิ้น

\- AC-06: กำหนดให้ backend ไม่สามารถเชื่อมต่อได้ เมื่อ Requester ส่งตั๋วที่ข้อมูลถูกต้อง ผลลัพธ์คือ

&#x20; มีข้อความ error ที่ปลอดภัยแสดงขึ้น และค่าที่กรอกไว้ทั้งหมดยังคงอยู่

\- AC-07: กำหนดให้มีไฟล์ขนาด 6 MB เมื่อ Requester พยายามแนบไฟล์นั้น ผลลัพธ์คือไฟล์ถูกปฏิเสธพร้อม

&#x20; ข้อความแจ้งขนาดไฟล์ที่ชัดเจนก่อนอัปโหลด

\- AC-08: กำหนดให้ตั๋วมีไฟล์แนบ active อยู่แล้ว 5 ไฟล์ เมื่อ Requester เพิ่มไฟล์ที่ 6 ผลลัพธ์คือ

&#x20; การเพิ่มถูกปฏิเสธพร้อมข้อความแจ้งขีดจำกัดที่ชัดเจน

\- AC-09: กำหนดให้ Requester A มีตั๋ว 3 ใบ และ Requester B มี 2 ใบ เมื่อเลือก Requester A ผลลัพธ์

&#x20; คือ My Tickets แสดงตั๋วของ Requester A ครบ 3 ใบเท่านั้น

\- AC-10: กำหนดให้คำค้นหาไม่ตรงกับตั๋วใดเลย เมื่อ Requester ค้นหา ผลลัพธ์คือแสดงสถานะ "ไม่พบ

&#x20; ผลลัพธ์" (แยกจากสถานะ empty ที่ไม่มีตั๋วเลย)

\- AC-11: กำหนดให้ Requester ยังไม่มีตั๋วเลย เมื่อ My Tickets โหลดขึ้นมา ผลลัพธ์คือแสดงสถานะ empty

&#x20; พร้อมปุ่มเรียกร้องให้สร้างตั๋ว

\- AC-12: กำหนดให้มีไฟล์แนบของตั๋วที่เป็นเจ้าของ เมื่อ Requester soft-remove ไฟล์นั้นพร้อมระบุเหตุผล

&#x20; ผลลัพธ์คือไฟล์แนบยังคงแสดงอยู่พร้อม metadata และเหตุผลการลบ แต่ดาวน์โหลด/พรีวิวไม่ได้

\- AC-13: กำหนดให้มีไฟล์แนบที่ถูก soft-remove แล้ว เมื่อผู้ใช้ใดพยายามดาวน์โหลด ผลลัพธ์คือ request

&#x20; ถูกปฏิเสธ (404 หรือ 410) แทนที่จะส่งเนื้อหาไฟล์กลับมา

\- AC-14: กำหนดให้มี Requester ที่ inactive เมื่อหน้าเลือก Development Requester โหลดขึ้นมา

&#x20; ผลลัพธ์คือ Requester นั้นไม่ปรากฏใน dropdown

\- AC-15: กำหนดให้ไม่มี Requester ที่ active เลย เมื่อหน้าเลือกโหลดขึ้นมา ผลลัพธ์คือแสดงสถานะ empty

&#x20; ที่ชัดเจนแทนที่จะเป็น dropdown ว่างเปล่า

\- AC-16: กำหนดให้ viewport เป็น Mobile (<768px) เมื่อดูหน้า My Tickets ผลลัพธ์คือรายการยุบเป็น

&#x20; การ์ด และไม่มี scroll แนวนอนของหน้า

\- AC-17: กำหนดให้ Requester สลับจาก A ไป B เมื่อสลับเสร็จสมบูรณ์ ผลลัพธ์คือข้อมูลตั๋วที่เคยโหลดไว้

&#x20; ของ Requester A ถูกล้างทิ้ง และข้อมูลของ Requester B ถูกโหลดใหม่



\## 10. คำนิยามความสำเร็จของงาน (Definition of Done)



\- ทุกรายการใน Section 4 (Functional Requirements) และ Section 5 (Business Rules) ถูก implement

&#x20; ครบถ้วน

\- ทุก Acceptance Criteria ใน Section 9 มี automated test อย่างน้อยหนึ่งตัวที่ผ่าน และ trace ได้ใน

&#x20; `docs/lab-02/tests.md`

\- ไม่มี test ใดถูก skip, disable หรือ comment out ใน branch `main` สุดท้าย

\- test ทุกระดับ (unit, API, UI component, E2E) ผ่านทั้งหมดจากคำสั่งที่บันทึกไว้บน `main`

\- สี Zen Green และสถานะ component ตรงกับ `ui-spec.md` ยืนยันด้วย visual checklist และ screenshot

&#x20; จาก Playwright ที่ desktop/tablet/mobile

\- แสดงหลักฐานการแยกสิทธิ์ตามเจ้าของ (Ownership Isolation) ทั้งในหน้า Ticket Detail และการเข้าถึง

&#x20; ไฟล์แนบ (การพยายามข้าม Requester ต้องได้ 404 ทั้งใน test และการตรวจสอบด้วยมือ)

\- เอกสาร README มีคำแนะนำการติดตั้งและรัน test ที่เป็นปัจจุบัน สำหรับส่วนเพิ่มเติมของ Lab 2 (พื้นที่

&#x20; เก็บไฟล์แนบ, environment variable ใหม่ถ้ามี)

\- Issue ทั้งหมดของ Lab 2 ต้องขึ้นสถานะ "Done" บน GitHub Project Kanban board, PR ผ่าน peer review

&#x20; และ merge ผ่าน `lab2-staging` เข้า `main`

\- `docs/lab-02/reviewer.md` และ `docs/lab-02/ai-use.md` เขียนครบถ้วนและ render ได้



\## 11. สมมติฐานและการตัดสินใจ (Assumptions and Decisions)



\- รูปแบบหมายเลขตั๋วคือ `TKT-YYYY-NNNNNN` (เรียงลำดับตามปี) — เลือกใช้แบบนี้เพื่อให้อ่านง่ายและ

&#x20; สอดคล้องกับตัวอย่าง UI ใน handout (เช่น `TKT-2025-001234`)

\- กรณี ownership ไม่ตรงกัน ใช้ HTTP 404 แทน 403 เพื่อไม่ให้เปิดเผยว่าทรัพยากรนั้นมีอยู่จริงแก่ผู้ที่

&#x20; ไม่ใช่เจ้าของ (ลดการรั่วไหลของข้อมูล)

\- ไฟล์แนบถูกเก็บไว้บนดิสก์ของ server ในโฟลเดอร์ upload โดยใช้ชื่อไฟล์แบบสุ่มที่ปลอดภัย มีเพียง

&#x20; metadata เท่านั้น (ไม่ใช่ path จริงบนดิสก์) ที่ถูกเปิดเผยผ่าน API

\- ตัวตน Requester สำหรับการเรียก API ถูกส่งมาโดยตรง (ผ่าน query param/header) แทนที่จะใช้

&#x20; session/cookie เนื่องจากยังไม่มีระบบ authentication ใน Lab 2 — มีการระบุไว้ว่าเป็นจุดที่ต้อง

&#x20; ย้ายไปใช้ระบบจริงใน Lab 3 (ดู BR-21)

\- การป้องกันการส่งซ้ำ (Duplicate-submission prevention) ใน Lab 2 ทำที่ฝั่ง client เท่านั้น

&#x20; (ปิดปุ่มขณะส่ง) ส่วน server-side idempotency key อยู่นอกขอบเขต แต่บันทึกไว้เป็นแนวทางปรับปรุง

###### &#x20; ในอนาคต

