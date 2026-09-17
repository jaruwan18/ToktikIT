\# TokTickIT — Lab 3 UI Specification



\## 1. Document Purpose



เอกสารนี้กำหนดรายละเอียดส่วนติดต่อผู้ใช้ (User Interface: UI) สำหรับ TokTickIT ใน Lab 3 โดยครอบคลุมการเข้าสู่ระบบ การเปลี่ยนรหัสผ่านครั้งแรก การใช้งานตามบทบาทของผู้ใช้ การจัดการ Ticket และหน้าจอสำหรับผู้ดูแลระบบ



UI ต้องสอดคล้องกับ Functional Requirements, Business Rules และ API Contract ของระบบ



\---



\## 2. UI Principles



ระบบต้องออกแบบตามหลักการต่อไปนี้:



1\. ใช้งานง่ายสำหรับผู้ใช้ที่ไม่ใช่ฝ่าย IT

2\. แสดงเฉพาะเมนูและการกระทำที่ผู้ใช้มีสิทธิ์ใช้งาน

3\. แสดงข้อความแจ้งเตือนที่เข้าใจง่าย

4\. ป้องกันการแสดงข้อมูลของ Ticket ที่ผู้ใช้ไม่มีสิทธิ์เข้าถึง

5\. รองรับการใช้งานบน Desktop, Tablet และ Mobile

6\. ไม่มีข้อความหรือปุ่มทับซ้อนกัน

7\. ไม่มีเนื้อหาถูกตัดออกจากหน้าจอโดยไม่จำเป็น

8\. ใช้รูปแบบสีหลักของระบบเป็น Zen Green

9\. ใช้รูปแบบปุ่ม ฟอร์ม ตาราง และข้อความแจ้งเตือนให้สม่ำเสมอ

10\. UI ต้องไม่เป็นช่องทางเดียวในการบังคับใช้สิทธิ์ โดย Backend ต้องตรวจสอบสิทธิ์ซ้ำเสมอ



\---



\## 3. User Roles



ระบบมีผู้ใช้งาน 3 บทบาท:



\### 3.1 Requester



Requester สามารถ:



\- เข้าสู่ระบบ

\- เปลี่ยนรหัสผ่านครั้งแรก

\- สร้าง Ticket

\- ดู Ticket ของตนเอง

\- ค้นหา Ticket ของตนเอง

\- ดูรายละเอียด Ticket ของตนเอง

\- เพิ่ม Public Comment ใน Ticket ของตนเอง

\- ระบุว่าอาการของปัญหาได้รับการแก้ไขแล้ว

\- ดูสถานะและลำดับความสำคัญของ Ticket ของตนเอง

\- ดูไฟล์แนบที่ยังไม่ถูกลบ



Requester ไม่สามารถ:



\- ดู Ticket ของ Requester คนอื่น

\- ดู Internal Note

\- เปลี่ยนสถานะ Ticket โดยตรง

\- เปลี่ยนผู้รับผิดชอบ Ticket

\- เปลี่ยน IT Priority

\- จัดการผู้ใช้งาน

\- เข้าถึงหน้าจอของ Admin



\### 3.2 IT Staff



IT Staff สามารถ:



\- เข้าสู่ระบบ

\- เปลี่ยนรหัสผ่านครั้งแรก

\- ดูรายการ Ticket ใน Queue

\- ค้นหาและกรอง Ticket ตามข้อมูลที่ระบบรองรับ

\- ดูรายละเอียด Ticket

\- รับผิดชอบ Ticket

\- เปลี่ยนสถานะ Ticket ตาม Transition Matrix

\- กำหนด IT Priority

\- เพิ่ม Public Comment

\- เพิ่ม Internal Note

\- ดูไฟล์แนบที่ยังไม่ถูกลบ



IT Staff ไม่สามารถ:



\- จัดการผู้ใช้งาน

\- เปลี่ยน Role ของผู้ใช้งาน

\- ปิดใช้งานหรือเปิดใช้งานผู้ใช้งาน

\- ดูข้อมูลที่ไม่เกี่ยวข้องกับสิทธิ์ของตนเอง

\- ใช้การกระทำของ Admin



\### 3.3 Admin



Admin สามารถ:



\- ใช้งานความสามารถของ IT Staff

\- ดูหน้าจัดการผู้ใช้งาน

\- สร้างผู้ใช้งาน

\- ดูรายการผู้ใช้งาน

\- แก้ไขข้อมูลผู้ใช้งานที่ระบบอนุญาต

\- กำหนด Role

\- เปิดใช้งานหรือปิดใช้งานผู้ใช้งาน

\- รีเซ็ตรหัสผ่านตามขอบเขตของระบบ

\- ป้องกันไม่ให้ระบบเหลือ Admin ที่ใช้งานได้เป็นศูนย์คน



Admin ไม่สามารถ:



\- ลบผู้ใช้งานแบบถาวร

\- เพิ่ม Role นอกเหนือจาก Requester, IT Staff และ Admin

\- ทำให้ระบบไม่มี Active Admin

\- ใช้งานฟังก์ชันที่อยู่นอกขอบเขตของ Lab 3



\---



\## 4. Common Layout



\### 4.1 Header



ทุกหน้าหลังเข้าสู่ระบบต้องมี Header ที่ประกอบด้วย:



\- ชื่อระบบ TokTickIT

\- เมนูหลักตามบทบาท

\- ชื่อผู้ใช้หรือข้อมูลระบุผู้ใช้

\- Role ของผู้ใช้

\- ปุ่ม Logout



Header ต้องใช้สีหลัก Zen Green และต้องแสดงผลได้ทั้งบน Desktop และ Mobile



บนหน้าจอขนาดเล็ก เมนูสามารถเปลี่ยนเป็นปุ่มเปิดเมนูแบบ Responsive ได้



\### 4.2 Navigation



เมนูที่แสดงต้องขึ้นอยู่กับ Role:



\#### Requester



\- My Tickets

\- Create Ticket

\- Profile หรือ Change Password

\- Logout



\#### IT Staff



\- Ticket Queue

\- My Assigned Tickets

\- Profile หรือ Change Password

\- Logout



\#### Admin



\- Ticket Queue

\- User Management

\- Profile หรือ Change Password

\- Logout



หากผู้ใช้ไม่มีสิทธิ์ เมนูนั้นต้องไม่แสดง และ Backend ต้องปฏิเสธการเรียก API ที่ไม่มีสิทธิ์ด้วย



\### 4.3 Main Content



พื้นที่เนื้อหาหลักต้อง:



\- มีระยะห่างจาก Header อย่างเหมาะสม

\- รองรับความกว้างหลายขนาด

\- ไม่บังคับให้ผู้ใช้เลื่อนแนวนอนบน Mobile

\- แสดง Loading State ระหว่างโหลดข้อมูล

\- แสดง Empty State เมื่อไม่มีข้อมูล

\- แสดง Error State เมื่อโหลดข้อมูลไม่สำเร็จ



\---



\## 5. Login Screen



\### 5.1 Purpose



ใช้สำหรับให้ผู้ใช้เข้าสู่ระบบด้วยบัญชีที่ Admin สร้างไว้



\### 5.2 Components



หน้าจอ Login ต้องมี:



\- ช่อง Username หรือ Email ตาม API Contract

\- ช่อง Password

\- ปุ่ม Login

\- พื้นที่แสดงข้อความ Error

\- ชื่อระบบ TokTickIT



\### 5.3 Validation



หากกรอกข้อมูลไม่ครบ ต้องแสดงข้อความแจ้งเตือนที่เข้าใจง่าย



หากข้อมูลเข้าสู่ระบบไม่ถูกต้อง ต้องแสดงข้อความทั่วไป เช่น:



> Username หรือ Password ไม่ถูกต้อง



ไม่ควรเปิดเผยว่าบัญชีใดมีอยู่ในระบบหรือไม่



\### 5.4 Login States



ต้องรองรับสถานะต่อไปนี้:



\- Initial State

\- Loading State

\- Invalid Credentials

\- Inactive User

\- Successful Login

\- Network Error



เมื่อ Login สำเร็จ:



\- หากผู้ใช้ต้องเปลี่ยนรหัสผ่านครั้งแรก ให้ไปหน้า First Login Password Change

\- หากไม่ต้องเปลี่ยนรหัสผ่าน ให้ไปหน้าหลักตาม Role



\---



\## 6. First Login Password Change



\### 6.1 Purpose



ผู้ใช้ที่ถูกสร้างใหม่และมี `mustChangePassword = true` ต้องเปลี่ยนรหัสผ่านก่อนใช้งานระบบ



\### 6.2 Components



หน้าจอต้องมี:



\- ช่อง Current Password หรือ Temporary Password ตาม API Contract

\- ช่อง New Password

\- ช่อง Confirm New Password

\- ปุ่ม Change Password

\- ข้อความอธิบายว่าต้องเปลี่ยนรหัสผ่านก่อนใช้งานระบบ



\### 6.3 Validation



ระบบต้องตรวจสอบ:



\- ช่องที่จำเป็นต้องไม่ว่าง

\- New Password และ Confirm New Password ต้องตรงกัน

\- รหัสผ่านใหม่ต้องผ่านเงื่อนไขที่กำหนดใน API Contract

\- รหัสผ่านใหม่ต้องไม่ใช้ค่าที่ไม่ถูกต้องตาม Backend



\### 6.4 Restrictions



ผู้ใช้ที่ยังเปลี่ยนรหัสผ่านไม่สำเร็จ:



\- ไม่สามารถเข้าหน้าหลักของระบบได้

\- ไม่สามารถสร้างหรือดู Ticket ได้

\- ไม่สามารถเข้าหน้า Admin หรือ IT Staff ได้



เมื่อเปลี่ยนรหัสผ่านสำเร็จ:



\- แสดงข้อความสำเร็จ

\- นำผู้ใช้ไปยังหน้าหลักตาม Role

\- ค่า `mustChangePassword` ต้องถูกเปลี่ยนเป็น `false`



\---



\## 7. Requester UI



\## 7.1 My Tickets Page



หน้าจอ My Tickets ใช้แสดง Ticket ของ Requester ที่ Login อยู่เท่านั้น



\### Components



\- Page Title: My Tickets

\- Search Input

\- ปุ่ม Search

\- ปุ่ม Create Ticket

\- ตารางหรือ Card รายการ Ticket

\- Pagination

\- Empty State

\- Loading State

\- Error State



\### Ticket Summary



แต่ละ Ticket ต้องแสดงข้อมูลอย่างน้อย:



\- Ticket Number

\- Subject

\- Current Status

\- Requested Priority

\- Created Date

\- Updated Date

\- IT Priority หากผู้ใช้มีสิทธิ์เห็น

\- Primary Owner หากมีการกำหนดแล้ว



Requester ต้องไม่เห็น Ticket ของผู้ใช้คนอื่น



\---



\## 7.2 Create Ticket Page



หน้าจอ Create Ticket ใช้สำหรับสร้าง Ticket ใหม่



\### Components



\- Subject

\- Description

\- Requested Priority

\- Attachment Upload

\- ปุ่ม Submit

\- ปุ่ม Cancel

\- Validation Message



\### Attachment UI



ต้องแสดง:



\- ชื่อไฟล์

\- ขนาดไฟล์

\- สถานะการอัปโหลด

\- ปุ่มลบไฟล์ออกจากรายการก่อน Submit



UI ต้องป้องกันหรือแจ้งเตือนเมื่อ:



\- มีไฟล์แนบเกินจำนวนที่กำหนด

\- ไฟล์มีขนาดเกิน 6 MB

\- ไฟล์เป็น GIF

\- ไฟล์มีชนิดที่ไม่รองรับ



\### Submit Result



เมื่อสร้าง Ticket สำเร็จ:



\- แสดง Ticket Number

\- แสดงสถานะเริ่มต้นเป็น `NEW`

\- นำผู้ใช้ไปหน้ารายละเอียด Ticket หรือ My Tickets

\- แสดงข้อความแจ้งเตือนว่าสร้าง Ticket สำเร็จ



\---



\## 7.3 Ticket Detail Page สำหรับ Requester



หน้าจอนี้แสดงรายละเอียด Ticket ของ Requester ที่ Login อยู่



\### Components



\- Ticket Number

\- Subject

\- Description

\- Requester

\- Created Date

\- Updated Date

\- Current Status

\- Requested Priority

\- IT Priority หากระบบอนุญาตให้เห็น

\- Primary Owner

\- Attachment List

\- Public Comment List

\- Comment Form

\- Resolved Indication Control



\### Public Comments



Requester สามารถ:



\- อ่าน Public Comment

\- เพิ่ม Public Comment ใหม่



Requester ไม่สามารถ:



\- อ่าน Internal Note

\- แก้ไข Comment

\- ลบ Comment

\- เพิ่ม Internal Note



\### Resolved Indication



Requester สามารถระบุว่า:



> ปัญหานี้ได้รับการแก้ไขแล้ว



การระบุนี้เป็นข้อมูลจาก Requester และไม่ใช่การเปลี่ยนสถานะ Ticket โดยตรง



UI ต้องแสดงสถานะของการระบุนี้อย่างชัดเจน เช่น:



\- Not Indicated

\- Requester Indicated Resolved



\---



\## 7.4 Attachment Display



ไฟล์แนบที่ยังใช้งานได้ต้องแสดง:



\- ชื่อไฟล์

\- ประเภทไฟล์

\- ขนาดไฟล์

\- ปุ่ม Preview หากรองรับ

\- ปุ่ม Download หากมีสิทธิ์



ไฟล์ที่ถูก Soft Remove ต้อง:



\- ไม่แสดงปุ่ม Download

\- ไม่แสดงปุ่ม Preview

\- แสดงสถานะ Removed

\- ไม่ลบ Metadata ที่จำเป็นออกจากหน้าจอ

\- หากผู้ใช้พยายามเข้าถึงไฟล์ที่ถูกลบ ต้องแสดงข้อความตาม Error Contract เช่น `ATTACHMENT\_REMOVED`



\---



\## 8. IT Staff UI



\## 8.1 Ticket Queue Page



หน้าจอ Ticket Queue ใช้สำหรับให้ IT Staff ดูและจัดการ Ticket ที่อยู่ในระบบ



\### Components



\- Page Title: Ticket Queue

\- Search Input

\- Status Filter

\- Priority Filter

\- Owner Filter

\- Pagination

\- Ticket Table หรือ Responsive Card List

\- Loading State

\- Empty State

\- Error State



\### Ticket List



ต้องแสดงข้อมูล:



\- Ticket Number

\- Subject

\- Requester

\- Current Status

\- Requested Priority

\- IT Priority

\- Primary Owner

\- Updated Date



รายการต้องรองรับการอ่านบน Mobile โดยอาจเปลี่ยนจาก Table เป็น Card List



\### Search and Pagination



UI ต้อง:



\- แสดงคำค้นหาปัจจุบัน

\- รักษาค่าการค้นหาเมื่อเปลี่ยนหน้า

\- แสดงจำนวนหน้าหรือปุ่ม Previous/Next

\- ไม่แสดงข้อมูลทั้งหมดในหน้าเดียวหากมีจำนวนมาก

\- แสดง Empty State เมื่อไม่พบผลลัพธ์



\---



\## 8.2 Ticket Detail Page สำหรับ IT Staff



IT Staff สามารถดูรายละเอียดและจัดการ Ticket ได้ตามสิทธิ์



\### Components



\- Ticket Information

\- Requester Information

\- Status Control

\- IT Priority Control

\- Primary Owner Control

\- Public Comment Form

\- Internal Note Form

\- Attachment List

\- Activity หรือ Comment Timeline ตาม API Contract



\### Status Control



แสดงเฉพาะสถานะที่สามารถเปลี่ยนได้ตาม Transition Matrix



หากการเปลี่ยนสถานะไม่ถูกต้อง:



\- ป้องกันการ Submit หรือ

\- แสดงข้อความ Error จาก Backend

\- ไม่เปลี่ยนข้อมูลบนหน้าจอเป็นค่าที่ไม่สำเร็จ



\### IT Priority



IT Staff สามารถกำหนดหรือเปลี่ยน IT Priority ได้ตาม Business Rules



ต้องแยกให้ชัดเจนระหว่าง:



\- Requested Priority ซึ่งมาจาก Requester

\- IT Priority ซึ่งเป็นค่าที่ IT Staff กำหนด



\### Primary Owner



ระบบต้องมีผู้รับผิดชอบหลักได้เพียงหนึ่งคน



UI ต้อง:



\- แสดง Primary Owner ปัจจุบัน

\- แสดงเฉพาะ Active IT Staff ที่สามารถเลือกได้

\- แสดง Unassigned หากยังไม่มีผู้รับผิดชอบ

\- ไม่ให้เลือก Requester เป็น Primary Owner

\- ไม่ให้เลือกผู้ใช้ที่ปิดใช้งานแล้ว



\---



\## 8.3 Public Comment



Public Comment เป็นข้อความที่ Requester และ IT Staff สามารถมองเห็นได้



UI ต้อง:



\- แสดงชื่อผู้เขียน

\- แสดงวันที่และเวลา

\- แสดงเนื้อหาข้อความ

\- แยก Comment แต่ละรายการอย่างชัดเจน

\- มีฟอร์มเพิ่ม Comment ใหม่



Public Comment ต้องไม่แสดงข้อมูลภายในที่มีไว้สำหรับ IT Staff หรือ Admin เท่านั้น



\---



\## 8.4 Internal Note



Internal Note เป็นข้อความสำหรับ IT Staff และ Admin เท่านั้น



UI ต้อง:



\- แสดงพื้นที่ Internal Notes แยกจาก Public Comments

\- ใช้ Label ที่ชัดเจน เช่น Internal Note

\- แสดงชื่อผู้เขียน

\- แสดงวันที่และเวลา

\- มีฟอร์มเพิ่ม Internal Note ใหม่



Requester ต้องไม่เห็น:



\- รายการ Internal Note

\- จำนวน Internal Note

\- เนื้อหาของ Internal Note

\- ช่องเพิ่ม Internal Note



การซ่อน Internal Note บน UI ไม่เพียงพอ Backend ต้องป้องกันการเข้าถึงด้วย



\---



\## 9. Admin UI



\## 9.1 User Management Page



หน้าจอ User Management ใช้สำหรับจัดการผู้ใช้งานในระบบ



\### Components



\- Page Title: User Management

\- Search Input

\- Role Filter หากมีใน API Contract

\- Active Status Filter หากมีใน API Contract

\- Create User Button

\- User List

\- Pagination หากจำเป็น

\- Loading State

\- Empty State

\- Error State



\### User List



ต้องแสดงข้อมูลอย่างน้อย:



\- Username หรือ Email

\- Display Name หากมี

\- Role

\- Active Status

\- Must Change Password Status

\- Created Date

\- Updated Date

\- Actions



\### Actions



Action ที่แสดงต้องขึ้นอยู่กับสิทธิ์และสถานะของผู้ใช้ เช่น:



\- Edit User

\- Change Role

\- Activate User

\- Deactivate User

\- Reset Password



ระบบต้องไม่แสดง Action ที่ไม่สามารถทำได้



\---



\## 9.2 Create User Page



Admin สามารถสร้างผู้ใช้งานใหม่ได้



\### Components



\- Username หรือ Email

\- Display Name หากมี

\- Role Selector

\- Active Status

\- ปุ่ม Create

\- ปุ่ม Cancel

\- Validation Message



\### Role Selector



Role ที่เลือกได้มีเพียง:



\- Requester

\- IT Staff

\- Admin



ระบบต้องไม่ให้ผู้ใช้กรอก Role เองเป็นข้อความอิสระ



\### Initial Password



ผู้ใช้ใหม่ต้องได้รับรหัสผ่านเริ่มต้นตามแนวทางที่กำหนดใน API Contract



ผู้ใช้ใหม่ต้องถูกกำหนดให้เปลี่ยนรหัสผ่านครั้งแรกผ่าน `mustChangePassword`



\---



\## 9.3 Edit User Page



Admin สามารถแก้ไขข้อมูลผู้ใช้ที่ระบบอนุญาต



\### Components



\- Username หรือ Email

\- Display Name หากมี

\- Role Selector

\- Active Status

\- Must Change Password Status หากระบบอนุญาต

\- ปุ่ม Save

\- ปุ่ม Cancel



\### Restrictions



UI ต้องป้องกันการแก้ไขที่ทำให้เกิดสถานะไม่ถูกต้อง เช่น:



\- ทำให้ระบบไม่มี Active Admin

\- กำหนด Role ที่ไม่มีอยู่

\- เปิดใช้งานผู้ใช้ที่ข้อมูลไม่ครบตาม Contract

\- แก้ไขข้อมูลที่ไม่อยู่ในขอบเขตของ Lab 3



\---



\## 9.4 Activate and Deactivate User



Admin สามารถเปลี่ยนสถานะ Active ของผู้ใช้ได้



\### Deactivate



เมื่อปิดใช้งานผู้ใช้:



\- แสดง Confirmation Dialog

\- อธิบายผลกระทบของการปิดใช้งาน

\- เปลี่ยนสถานะเป็น Inactive เมื่อสำเร็จ

\- ป้องกันไม่ให้ผู้ใช้ Inactive Login ได้



\### Activate



เมื่อเปิดใช้งานผู้ใช้:



\- แสดง Confirmation หรือข้อความยืนยันตามความเหมาะสม

\- เปลี่ยนสถานะเป็น Active เมื่อสำเร็จ

\- แสดงข้อความสำเร็จ



ระบบใช้การ Deactivate แทนการลบผู้ใช้งานแบบถาวร



\---



\## 9.5 Admin Protection



หาก Admin พยายามดำเนินการที่ทำให้ระบบไม่มี Active Admin เหลืออยู่:



\- UI ต้องแสดงข้อความเตือน

\- ปุ่ม Submit อาจถูก Disable

\- หาก Backend ปฏิเสธ ต้องแสดง Error ที่เข้าใจง่าย

\- ข้อมูลเดิมต้องไม่ถูกเปลี่ยนแปลง



ตัวอย่างข้อความ:



> ต้องมี Active Admin อย่างน้อยหนึ่งคนในระบบ



\---



\## 10. Responsive Design



ระบบต้องรองรับหน้าจออย่างน้อย:



\- Desktop

\- Tablet

\- Mobile



\### Desktop



\- แสดง Header และ Navigation แบบเต็ม

\- ตารางสามารถแสดงหลายคอลัมน์

\- ฟอร์มใช้ Layout แบบสองคอลัมน์ได้เมื่อเหมาะสม



\### Tablet



\- ลดระยะห่างและขนาดขององค์ประกอบ

\- ตารางอาจลดจำนวนคอลัมน์

\- เมนูต้องไม่ทับซ้อนกับเนื้อหา



\### Mobile



\- เปลี่ยน Table เป็น Card หรือรูปแบบที่อ่านง่าย

\- ปุ่มต้องกดได้ง่าย

\- ช่องกรอกข้อมูลต้องกว้างพอ

\- ปุ่มสำคัญต้องไม่ถูกตัด

\- ไม่ให้ข้อความยาวล้นหน้าจอ

\- ไม่บังคับให้เลื่อนแนวนอนโดยไม่จำเป็น

\- Dialog ต้องพอดีกับหน้าจอ

\- Attachment และ Comment ต้องแสดงแบบเรียงลงด้านล่าง



\---



\## 11. UI States



ทุกหน้าที่โหลดข้อมูลจาก API ต้องรองรับสถานะต่อไปนี้:



\### 11.1 Loading State



แสดง Spinner, Skeleton หรือข้อความ Loading



\### 11.2 Empty State



แสดงเมื่อไม่มีข้อมูล เช่น:



> ยังไม่มี Ticket



หรือ:



> ไม่พบผู้ใช้งานตามเงื่อนไขที่ค้นหา



\### 11.3 Error State



แสดงข้อความที่ผู้ใช้เข้าใจได้ และมีปุ่ม Retry หากเหมาะสม



\### 11.4 Success State



แสดงข้อความหลังการดำเนินการสำเร็จ เช่น:



\- สร้าง Ticket สำเร็จ

\- เปลี่ยนรหัสผ่านสำเร็จ

\- อัปเดต Ticket สำเร็จ

\- สร้างผู้ใช้งานสำเร็จ



\### 11.5 Unauthorized State



หากผู้ใช้ไม่มีสิทธิ์:



\- ไม่แสดงข้อมูล

\- แสดงข้อความ Access Denied หรือข้อความที่เทียบเท่า

\- นำผู้ใช้กลับไปหน้าที่มีสิทธิ์ หากจำเป็น



\### 11.6 Not Found State



หากไม่พบ Ticket หรือ User:



\- แสดงข้อความไม่พบข้อมูล

\- ไม่แสดงข้อมูลเก่าที่อาจทำให้เข้าใจผิด



\---



\## 12. Validation and Error Messages



ข้อความ Error ต้อง:



\- ใช้ภาษาที่เข้าใจง่าย

\- บอกว่าต้องแก้ไขอะไร

\- ไม่เปิดเผยข้อมูลภายในระบบ

\- ไม่แสดง Stack Trace

\- ไม่แสดงรายละเอียด Database

\- ไม่ใช้ข้อความ Error จาก Backend แบบดิบทั้งหมดโดยไม่จัดรูปแบบ



ตัวอย่างข้อความ:



| Situation | UI Message |

|---|---|

| Required field missing | กรุณากรอกข้อมูลให้ครบถ้วน |

| Invalid login | Username หรือ Password ไม่ถูกต้อง |

| Inactive account | บัญชีนี้ไม่สามารถเข้าสู่ระบบได้ |

| Password mismatch | รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน |

| Invalid requester | ไม่พบ Requester ที่สามารถใช้งานได้ |

| Invalid status transition | ไม่สามารถเปลี่ยนสถานะเป็นสถานะนี้ได้ |

| Attachment removed | ไฟล์แนบนี้ถูกนำออกแล้ว |

| Attachment too large | ไฟล์มีขนาดเกิน 6 MB |

| Too many attachments | สามารถแนบไฟล์ที่ยังใช้งานได้ไม่เกิน 5 ไฟล์ |

| GIF not allowed | ไม่รองรับไฟล์ GIF |

| Unauthorized | คุณไม่มีสิทธิ์ดำเนินการนี้ |

| Last active admin protection | ต้องมี Active Admin อย่างน้อยหนึ่งคน |



\---



\## 13. Accessibility



UI ควรปฏิบัติตามแนวทางต่อไปนี้:



1\. ทุกช่องกรอกข้อมูลต้องมี Label

2\. ปุ่มต้องมีข้อความที่สื่อความหมาย

3\. ใช้สีร่วมกับข้อความหรือ Icon ไม่ใช้สีเพียงอย่างเดียวในการสื่อความหมาย

4\. ข้อความต้องอ่านได้ชัดเจน

5\. Focus State ต้องมองเห็นได้

6\. Dialog ต้องใช้งานด้วย Keyboard ได้

7\. Error Message ต้องสัมพันธ์กับช่องที่มีปัญหา

8\. ปุ่มที่ถูก Disable ต้องมีเหตุผลที่ผู้ใช้เข้าใจได้

9\. ไม่ใช้ Placeholder แทน Label เพียงอย่างเดียว

10\. ต้องรองรับการ Zoom หน้าจอโดยไม่ทำให้เนื้อหาหาย



\---



\## 14. Security-related UI Rules



UI ต้องปฏิบัติตามกฎต่อไปนี้:



1\. ไม่เก็บ Password แบบ Plain Text ใน Local Storage

2\. ไม่แสดง Password ในหน้าจอ

3\. ไม่แสดง Internal Note ให้ Requester

4\. ไม่แสดง Ticket ของ Requester คนอื่น

5\. ไม่แสดงเมนู Admin ให้ผู้ใช้ที่ไม่ใช่ Admin

6\. ไม่เชื่อถือ Role ที่ส่งมาจาก Client โดยไม่มีการตรวจสอบจาก Backend

7\. เมื่อ Logout ต้องล้างข้อมูล Session ที่จำเป็น

8\. เมื่อ Session หมดอายุ ต้องนำผู้ใช้กลับไปหน้า Login

9\. ต้องไม่แสดงข้อมูลส่วนตัวเกินกว่าที่จำเป็น

10\. UI ต้องจัดการ Error จาก Backend โดยไม่เปิดเผยรายละเอียดระบบภายใน



\---



\## 15. UI Acceptance Criteria



\### UI-AC-01



ผู้ใช้สามารถเห็นหน้า Login และกรอกข้อมูลเข้าสู่ระบบได้



\### UI-AC-02



ผู้ใช้ที่ต้องเปลี่ยนรหัสผ่านครั้งแรกจะถูกนำไปหน้าเปลี่ยนรหัสผ่านก่อนเข้าหน้าหลัก



\### UI-AC-03



Requester เห็นเฉพาะ Ticket ของตนเอง



\### UI-AC-04



Requester สามารถสร้าง Ticket พร้อมข้อมูลที่จำเป็นได้



\### UI-AC-05



Ticket ใหม่แสดงสถานะเริ่มต้นเป็น `NEW`



\### UI-AC-06



Requester สามารถเพิ่ม Public Comment ได้



\### UI-AC-07



Requester ไม่เห็น Internal Note



\### UI-AC-08



Requester ไม่สามารถ Download หรือ Preview ไฟล์ที่ถูก Soft Remove



\### UI-AC-09



IT Staff สามารถดู Ticket Queue ได้



\### UI-AC-10



IT Staff สามารถดูและอัปเดตข้อมูล Ticket ตามสิทธิ์ได้



\### UI-AC-11



IT Staff สามารถเพิ่ม Public Comment และ Internal Note ได้



\### UI-AC-12



Requester และ IT Staff เห็น Public Comment ได้ตามสิทธิ์



\### UI-AC-13



Admin สามารถเข้าหน้า User Management ได้



\### UI-AC-14



Admin สามารถสร้างและแก้ไขผู้ใช้งานได้ตามขอบเขต



\### UI-AC-15



ระบบป้องกันการทำให้ไม่มี Active Admin เหลืออยู่



\### UI-AC-16



หน้าจอทั้งหมดใช้งานได้บน Desktop, Tablet และ Mobile



\### UI-AC-17



ระบบแสดง Loading, Empty, Error และ Success State อย่างเหมาะสม



\---



\## 16. Out of Scope



UI ของ Lab 3 ไม่ครอบคลุม:



\- MFA

\- Email Password Reset

\- Self Registration

\- Social Login หรือ SSO

\- Email Notification

\- SLA และ Escalation

\- Dashboard หรือ KPI

\- Multiple Roles ต่อผู้ใช้หนึ่งคน

\- การลบผู้ใช้งานแบบถาวร

\- Bulk User Import หรือ Export

\- Advanced User Management ที่ไม่ได้ระบุใน Contract

\- การส่ง Email จริง

\- ระบบ Production หรือ Cloud Deployment

\- ฟังก์ชันนอกเหนือจาก Lab 3



\---



\## 17. Definition of Done for UI



UI ถือว่าเสร็จเมื่อ:



1\. หน้าจอ Login ใช้งานได้

2\. First Login Password Change ใช้งานได้

3\. Requester สามารถสร้างและดู Ticket ของตนเองได้

4\. Requester สามารถเพิ่ม Public Comment ได้

5\. Internal Note ไม่แสดงให้ Requester เห็น

6\. IT Staff สามารถดู Queue และจัดการ Ticket ตามสิทธิ์ได้

7\. Admin สามารถจัดการผู้ใช้งานตามขอบเขตได้

8\. มีการตรวจสอบ Validation และแสดง Error Message

9\. รองรับ Responsive Layout

10\. ไม่มีข้อความหรือองค์ประกอบทับซ้อนกัน

11\. UI ไม่พึ่งพา Client-side Authorization เพียงอย่างเดียว

12\. มีการทดสอบ UI ตาม Test Plan

13\. ไม่มี Test ที่ถูก Skip ใน Final Main

14\. มี Screenshot หรือหลักฐานการทำงานตามที่กำหนดใน Lab Sheet

