````markdown

\# TokTickIT — Lab 3 API Specification



\## 1. Document Purpose



เอกสารนี้กำหนด API Contract สำหรับ TokTickIT Lab 3 โดยระบุ:



\- Endpoint ที่ระบบต้องรองรับ

\- HTTP Method

\- Request และ Response

\- Authentication

\- Authorization

\- Validation

\- Error Code

\- Business Rules ที่เกี่ยวข้องกับ API



Backend ต้องตรวจสอบ Authentication และ Authorization ทุกครั้ง ไม่พึ่งพาการซ่อนปุ่มหรือเมนูจาก Frontend เพียงอย่างเดียว



\---



\## 2. API Conventions



\### 2.1 Base URL



ระหว่างการพัฒนา API ใช้ Base URL:



```text

/api

````



ตัวอย่าง:



```http

POST /api/auth/login

GET /api/tickets

GET /api/users

```



\### 2.2 Content Type



Request ที่มี JSON Body ต้องใช้:



```http

Content-Type: application/json

```



Response ที่เป็น JSON ใช้:



```http

Content-Type: application/json

```



\### 2.3 JSON Format



ระบบใช้ JSON สำหรับ Request และ Response เป็นหลัก



ตัวอย่าง:



```json

{

&#x20; "email": "user@example.com",

&#x20; "password": "password123"

}

```



\### 2.4 Authentication



ระบบใช้ Session หรือ Cookie-based Authentication ตาม implementation ของ Backend



เมื่อผู้ใช้ Login สำเร็จ ระบบต้องสร้าง Authentication Session และใช้ Session นี้ตรวจสอบตัวตนในการเรียก API ที่ต้องเข้าสู่ระบบ



Frontend ไม่ควรส่ง `userId` เพื่ออ้างตัวตนของผู้ใช้แทน Session



Backend ต้องอ่านตัวตนของผู้ใช้จาก Authentication Session หรือกลไก Authentication ที่ระบบกำหนดไว้



\### 2.5 Authorization



Backend ต้องตรวจสอบ Role ของผู้ใช้ก่อนอนุญาตให้เข้าถึงข้อมูลหรือดำเนินการใด ๆ



Roles ที่ระบบรองรับ:



\* `REQUESTER`

\* `IT\_STAFF`

\* `ADMIN`



ผู้ใช้แต่ละคนมี Role หลักเพียงหนึ่ง Role ใน Lab 3



\### 2.6 Common HTTP Status Codes



| Status Code                  | Meaning                                           |

| ---------------------------- | ------------------------------------------------- |

| `200 OK`                     | ดำเนินการสำเร็จ                                   |

| `201 Created`                | สร้างข้อมูลสำเร็จ                                 |

| `204 No Content`             | ดำเนินการสำเร็จและไม่มี Response Body             |

| `400 Bad Request`            | Request ไม่ถูกต้องหรือ Validation ไม่ผ่าน         |

| `401 Unauthorized`           | ยังไม่ได้เข้าสู่ระบบหรือ Session ไม่ถูกต้อง       |

| `403 Forbidden`              | เข้าสู่ระบบแล้วแต่ไม่มีสิทธิ์                     |

| `404 Not Found`              | ไม่พบข้อมูล                                       |

| `409 Conflict`               | ขัดแย้งกับข้อมูลหรือ Business Rule                |

| `410 Gone`                   | ข้อมูลเคยมีอยู่แต่ถูกถอดออกหรือถูก Soft Remove    |

| `413 Payload Too Large`      | ขนาดไฟล์หรือ Request ใหญ่เกินกำหนด                |

| `415 Unsupported Media Type` | ไม่รองรับประเภทไฟล์หรือ Content Type              |

| `422 Unprocessable Entity`   | รูปแบบ Request ถูกต้องแต่ไม่ผ่านเงื่อนไขทางธุรกิจ |

| `500 Internal Server Error`  | เกิดข้อผิดพลาดภายใน Server                        |



\---



\## 3. Authentication API



\### 3.1 Login



\#### Endpoint



```http

POST /api/auth/login

```



\#### Authentication



ไม่ต้องเข้าสู่ระบบก่อนเรียก Endpoint นี้



\#### Request Body



```json

{

&#x20; "email": "user@example.com",

&#x20; "password": "password123"

}

```



\#### Request Fields



| Field      | Type   | Required | Description        |

| ---------- | ------ | -------- | ------------------ |

| `email`    | string | Yes      | Email ของผู้ใช้    |

| `password` | string | Yes      | Password ของผู้ใช้ |



\#### Validation



\* ต้องระบุ `email`

\* ต้องระบุ `password`

\* `email` ต้องมีรูปแบบ Email ที่ถูกต้อง

\* ผู้ใช้ต้องมีอยู่ในระบบ

\* ผู้ใช้ต้องมี `isActive = true`

\* Password ต้องตรงกับ Password ที่เก็บไว้แบบ Hash

\* ห้าม Login ด้วยบัญชีที่ถูก Deactivate



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "user": {

&#x20;   "id": "user-id",

&#x20;   "email": "user@example.com",

&#x20;   "displayName": "Example User",

&#x20;   "role": "REQUESTER",

&#x20;   "mustChangePassword": false

&#x20; }

}

```



\#### First Login Response



ถ้าผู้ใช้ต้องเปลี่ยน Password ก่อนใช้งาน ระบบต้องส่งค่า:



```json

{

&#x20; "user": {

&#x20;   "id": "user-id",

&#x20;   "email": "user@example.com",

&#x20;   "displayName": "Example User",

&#x20;   "role": "REQUESTER",

&#x20;   "mustChangePassword": true

&#x20; }

}

```



Frontend ต้องพาผู้ใช้ไปยังหน้าเปลี่ยน Password ก่อนเข้าหน้าหลัก



\#### Error Responses



\##### Invalid Credentials



```http

401 Unauthorized

```



```json

{

&#x20; "error": {

&#x20;   "code": "INVALID\_CREDENTIALS",

&#x20;   "message": "Email or password is incorrect"

&#x20; }

}

```



\##### Inactive User



```http

403 Forbidden

```



```json

{

&#x20; "error": {

&#x20;   "code": "USER\_INACTIVE",

&#x20;   "message": "This user account is inactive"

&#x20; }

}

```



\##### Invalid Request



```http

400 Bad Request

```



```json

{

&#x20; "error": {

&#x20;   "code": "INVALID\_REQUEST",

&#x20;   "message": "Email and password are required"

&#x20; }

}

```



\### 3.2 Logout



\#### Endpoint



```http

POST /api/auth/logout

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Success Response



```http

204 No Content

```



\#### Behavior



\* ยกเลิกหรือทำลาย Session ปัจจุบัน

\* ผู้ใช้ไม่สามารถเรียก API ที่ต้องเข้าสู่ระบบด้วย Session เดิมได้

\* Frontend ต้องนำผู้ใช้กลับไปยังหน้า Login



\### 3.3 Get Current User



\#### Endpoint



```http

GET /api/auth/me

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "user": {

&#x20;   "id": "user-id",

&#x20;   "email": "user@example.com",

&#x20;   "displayName": "Example User",

&#x20;   "role": "IT\_STAFF",

&#x20;   "isActive": true,

&#x20;   "mustChangePassword": false

&#x20; }

}

```



\#### Error Response



```http

401 Unauthorized

```



```json

{

&#x20; "error": {

&#x20;   "code": "UNAUTHENTICATED",

&#x20;   "message": "Authentication is required"

&#x20; }

}

```



\### 3.4 Change Password



\#### Endpoint



```http

POST /api/auth/change-password

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Request Body



```json

{

&#x20; "currentPassword": "temporary-password",

&#x20; "newPassword": "new-password123"

}

```



\#### Request Fields



| Field             | Type   | Required | Description       |

| ----------------- | ------ | -------- | ----------------- |

| `currentPassword` | string | Yes      | Password ปัจจุบัน |

| `newPassword`     | string | Yes      | Password ใหม่     |



\#### Validation



\* ต้องระบุ Password ปัจจุบัน

\* ต้องระบุ Password ใหม่

\* Password ปัจจุบันต้องถูกต้อง

\* Password ใหม่ต้องไม่เป็นค่าว่าง

\* Password ใหม่ต้องผ่าน Minimum Length ที่ระบบกำหนด

\* Password ใหม่ต้องไม่เหมือน Password เดิม

\* ต้องเก็บ Password ใหม่เป็น Hash

\* เมื่อเปลี่ยนสำเร็จ ต้องเปลี่ยน `mustChangePassword` เป็น `false`



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "message": "Password changed successfully"

}

```



\#### Error Responses



```http

400 Bad Request

```



```json

{

&#x20; "error": {

&#x20;   "code": "INVALID\_PASSWORD",

&#x20;   "message": "New password does not meet the password requirements"

&#x20; }

}

```



```http

401 Unauthorized

```



```json

{

&#x20; "error": {

&#x20;   "code": "CURRENT\_PASSWORD\_INCORRECT",

&#x20;   "message": "Current password is incorrect"

&#x20; }

}

```



\---



\## 4. Authentication and Authorization Rules



\### 4.1 Unauthenticated Requests



API ที่ต้องเข้าสู่ระบบต้องตอบกลับด้วย:



```http

401 Unauthorized

```



เมื่อ:



\* ไม่มี Session

\* Session หมดอายุ

\* Session ไม่ถูกต้อง

\* Authentication Cookie ไม่ถูกต้อง



\### 4.2 Inactive User



ผู้ใช้ที่มี `isActive = false`:



\* ไม่สามารถ Login ได้

\* ไม่สามารถสร้าง Session ใหม่ได้

\* ไม่สามารถเรียก API ที่ต้องเข้าสู่ระบบได้

\* ไม่ควรปรากฏในรายการผู้ใช้ที่เลือกเป็นผู้รับผิดชอบงาน



\### 4.3 First Login



ถ้า `mustChangePassword = true`:



\* ผู้ใช้ต้องเปลี่ยน Password ก่อนใช้งานระบบตามปกติ

\* API ที่เกี่ยวกับการเปลี่ยน Password ต้องยังใช้งานได้

\* API อื่นอาจถูกจำกัดจนกว่าจะเปลี่ยน Password สำเร็จ ตามกติกาที่กำหนดในระบบ



\### 4.4 Role Authorization



| Role        | สิทธิ์หลัก                                                                                                   |

| ----------- | ------------------------------------------------------------------------------------------------------------ |

| `REQUESTER` | สร้างและดู Ticket ของตนเอง เพิ่ม Public Comment และระบุผลการแก้ไข                                            |

| `IT\_STAFF`  | ดู Queue, ดู Ticket ที่ได้รับอนุญาต, เปลี่ยน Status, Priority, Owner, เพิ่ม Public Comment และ Internal Note |

| `ADMIN`     | จัดการผู้ใช้และมีสิทธิ์ตามที่ระบุใน Admin API                                                                |



Backend ต้องตรวจสอบ Role จาก Session ไม่ใช้ Role ที่ส่งมาจาก Frontend เป็นแหล่งข้อมูลที่เชื่อถือได้



\---



\## 5. User API



\### 5.1 List Users



\#### Endpoint



```http

GET /api/users

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



เฉพาะ `ADMIN`



\#### Query Parameters



| Parameter  | Type    | Required | Description                      |

| ---------- | ------- | -------- | -------------------------------- |

| `role`     | string  | No       | กรองตาม Role                     |

| `isActive` | boolean | No       | กรองตามสถานะ Active              |

| `search`   | string  | No       | ค้นหาจาก Email หรือ Display Name |



\#### Example Request



```http

GET /api/users?role=IT\_STAFF\&isActive=true

```



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "users": \[

&#x20;   {

&#x20;     "id": "user-id-1",

&#x20;     "email": "staff@example.com",

&#x20;     "displayName": "IT Staff",

&#x20;     "role": "IT\_STAFF",

&#x20;     "isActive": true,

&#x20;     "mustChangePassword": false

&#x20;   }

&#x20; ]

}

```



\#### Rules



\* ผู้ใช้ที่ Deactivate แล้วต้องแสดงสถานะให้ชัดเจน

\* ผู้ใช้ที่ Deactivate แล้วไม่ควรถูกเลือกเป็น Owner ใหม่

\* ผู้ใช้ที่ไม่ใช่ Active IT Staff ไม่สามารถถูกเลือกเป็น Ticket Owner

\* การแสดงรายการต้องไม่เปิดเผย Password หรือ `passwordHash`



\### 5.2 Get User by ID



\#### Endpoint



```http

GET /api/users/:userId

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



เฉพาะ `ADMIN`



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "user": {

&#x20;   "id": "user-id",

&#x20;   "email": "user@example.com",

&#x20;   "displayName": "Example User",

&#x20;   "role": "REQUESTER",

&#x20;   "isActive": true,

&#x20;   "mustChangePassword": false

&#x20; }

}

```



\#### Error Response



```http

404 Not Found

```



```json

{

&#x20; "error": {

&#x20;   "code": "USER\_NOT\_FOUND",

&#x20;   "message": "User was not found"

&#x20; }

}

```



\### 5.3 Create User



\#### Endpoint



```http

POST /api/users

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



เฉพาะ `ADMIN`



\#### Request Body



```json

{

&#x20; "email": "newuser@example.com",

&#x20; "displayName": "New User",

&#x20; "role": "REQUESTER"

}

```



\#### Request Fields



| Field         | Type   | Required | Description                          |

| ------------- | ------ | -------- | ------------------------------------ |

| `email`       | string | Yes      | Email ของผู้ใช้                      |

| `displayName` | string | Yes      | ชื่อที่แสดง                          |

| `role`        | string | Yes      | `REQUESTER`, `IT\_STAFF` หรือ `ADMIN` |



\#### Validation



\* Email ต้องมีรูปแบบถูกต้อง

\* Email ต้องไม่ซ้ำ

\* Display Name ต้องไม่เป็นค่าว่าง

\* Role ต้องเป็น Role ที่ระบบรองรับ

\* ผู้ใช้ใหม่ต้องมีสถานะ Active

\* ระบบต้องกำหนด Password เริ่มต้นหรือวิธีตั้ง Password ตาม Contract ของระบบ

\* ผู้ใช้ใหม่ควรมี `mustChangePassword = true` หากใช้ Password ชั่วคราว



\#### Success Response



```http

201 Created

```



```json

{

&#x20; "user": {

&#x20;   "id": "new-user-id",

&#x20;   "email": "newuser@example.com",

&#x20;   "displayName": "New User",

&#x20;   "role": "REQUESTER",

&#x20;   "isActive": true,

&#x20;   "mustChangePassword": true

&#x20; }

}

```



\#### Error Response



```http

409 Conflict

```



```json

{

&#x20; "error": {

&#x20;   "code": "EMAIL\_ALREADY\_EXISTS",

&#x20;   "message": "Email is already registered"

&#x20; }

}

```



\### 5.4 Update User



\#### Endpoint



```http

PATCH /api/users/:userId

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



เฉพาะ `ADMIN`



\#### Request Body



```json

{

&#x20; "displayName": "Updated Name",

&#x20; "role": "IT\_STAFF"

}

```



\#### Allowed Fields



\* `displayName`

\* `role`



\#### Rules



\* ไม่อนุญาตให้แก้ไข `passwordHash` ผ่าน API นี้

\* ไม่อนุญาตให้แก้ไข User ID

\* Role ต้องเป็น Role ที่ระบบรองรับ

\* ต้องไม่ทำให้ระบบเหลือ Active Admin เป็นศูนย์

\* ถ้า Admin แก้ไข Role ของตนเอง ต้องตรวจสอบไม่ให้เกิดสถานะที่ผิด Business Rule



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "user": {

&#x20;   "id": "user-id",

&#x20;   "email": "user@example.com",

&#x20;   "displayName": "Updated Name",

&#x20;   "role": "IT\_STAFF",

&#x20;   "isActive": true,

&#x20;   "mustChangePassword": false

&#x20; }

}

```



\### 5.5 Activate User



\#### Endpoint



```http

PATCH /api/users/:userId/activate

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



เฉพาะ `ADMIN`



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "message": "User activated successfully"

}

```



\#### Rules



\* ผู้ใช้ที่ถูก Activate สามารถ Login ได้

\* ต้องไม่สร้าง User ซ้ำ

\* ข้อมูลเดิมของผู้ใช้ต้องยังคงอยู่



\### 5.6 Deactivate User



\#### Endpoint



```http

PATCH /api/users/:userId/deactivate

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



เฉพาะ `ADMIN`



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "message": "User deactivated successfully"

}

```



\#### Rules



\* ใช้ Soft Deactivation ไม่ใช่การลบข้อมูล

\* ผู้ใช้ที่ถูก Deactivate ไม่สามารถ Login ได้

\* ห้าม Deactivate Admin คนสุดท้ายที่ยัง Active

\* ผู้ใช้ที่ถูก Deactivate ไม่สามารถเป็น Owner ใหม่ได้

\* ข้อมูล Ticket และประวัติการทำงานของผู้ใช้ต้องยังคงอยู่



\#### Error Response



```http

409 Conflict

```



```json

{

&#x20; "error": {

&#x20;   "code": "LAST\_ACTIVE\_ADMIN",

&#x20;   "message": "The last active admin cannot be deactivated"

&#x20; }

}

```



\---



\## 6. Requester API



\### 6.1 Create Ticket



\#### Endpoint



```http

POST /api/tickets

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



เฉพาะ `REQUESTER`



\#### Request Body



```json

{

&#x20; "subject": "Cannot connect to Wi-Fi",

&#x20; "description": "The laptop cannot connect to the office Wi-Fi",

&#x20; "categoryId": "category-id",

&#x20; "requestedPriority": "MEDIUM"

}

```



\#### Request Fields



| Field               | Type   | Required | Description                 |

| ------------------- | ------ | -------- | --------------------------- |

| `subject`           | string | Yes      | หัวข้อ Ticket               |

| `description`       | string | Yes      | รายละเอียดปัญหา             |

| `categoryId`        | string | Yes      | Category ของ Ticket         |

| `requestedPriority` | string | Yes      | `LOW`, `MEDIUM` หรือ `HIGH` |



\#### Validation



\* Subject ต้องไม่เป็นค่าว่าง

\* Description ต้องไม่เป็นค่าว่าง

\* Category ต้องมีอยู่จริง

\* Category ต้อง Active

\* Requested Priority ต้องเป็นค่าที่รองรับ

\* `requesterId` ต้องมาจากผู้ใช้ที่ Login อยู่

\* ห้ามให้ Frontend กำหนด `requesterId` เป็นของผู้ใช้อื่น

\* Ticket ใหม่ต้องมี Status เป็น `NEW`

\* Ticket ใหม่ยังไม่มี Primary Owner



\#### Success Response



```http

201 Created

```



```json

{

&#x20; "ticket": {

&#x20;   "id": "ticket-id",

&#x20;   "ticketNumber": "TKT-2026-000001",

&#x20;   "subject": "Cannot connect to Wi-Fi",

&#x20;   "description": "The laptop cannot connect to the office Wi-Fi",

&#x20;   "categoryId": "category-id",

&#x20;   "requesterId": "requester-id",

&#x20;   "requestedPriority": "MEDIUM",

&#x20;   "itPriority": null,

&#x20;   "status": "NEW",

&#x20;   "primaryOwnerId": null

&#x20; }

}

```



\### 6.2 List Own Tickets



\#### Endpoint



```http

GET /api/tickets

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



สำหรับ `REQUESTER` ให้แสดงเฉพาะ Ticket ของผู้ใช้ที่ Login อยู่



\#### Query Parameters



| Parameter  | Type    | Required | Description                         |

| ---------- | ------- | -------- | ----------------------------------- |

| `status`   | string  | No       | กรองตาม Status                      |

| `priority` | string  | No       | กรองตาม Priority                    |

| `search`   | string  | No       | ค้นหาจาก Ticket Number หรือ Subject |

| `page`     | integer | No       | หมายเลขหน้า                         |

| `pageSize` | integer | No       | จำนวนรายการต่อหน้า                  |



\#### Example Request



```http

GET /api/tickets?status=NEW\&page=1\&pageSize=10

```



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "tickets": \[

&#x20;   {

&#x20;     "id": "ticket-id",

&#x20;     "ticketNumber": "TKT-2026-000001",

&#x20;     "subject": "Cannot connect to Wi-Fi",

&#x20;     "status": "NEW",

&#x20;     "requestedPriority": "MEDIUM",

&#x20;     "itPriority": null,

&#x20;     "requesterId": "requester-id",

&#x20;     "primaryOwnerId": null,

&#x20;     "createdAt": "2026-01-01T10:00:00.000Z",

&#x20;     "updatedAt": "2026-01-01T10:00:00.000Z"

&#x20;   }

&#x20; ],

&#x20; "pagination": {

&#x20;   "page": 1,

&#x20;   "pageSize": 10,

&#x20;   "total": 1,

&#x20;   "totalPages": 1

&#x20; }

}

```



\#### Ownership Rule



Requester ต้องไม่สามารถเห็น Ticket ของ Requester คนอื่นได้ แม้จะเปลี่ยน Query Parameter หรือส่ง `requesterId` อื่นเข้ามา



\### 6.3 Get Ticket Detail



\#### Endpoint



```http

GET /api/tickets/:ticketId

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



\* `REQUESTER` ดูได้เฉพาะ Ticket ของตนเอง

\* `IT\_STAFF` ดูได้ตามสิทธิ์ของ Staff

\* `ADMIN` ดูได้ตามสิทธิ์ของ Admin



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "ticket": {

&#x20;   "id": "ticket-id",

&#x20;   "ticketNumber": "TKT-2026-000001",

&#x20;   "subject": "Cannot connect to Wi-Fi",

&#x20;   "description": "The laptop cannot connect to the office Wi-Fi",

&#x20;   "category": {

&#x20;     "id": "category-id",

&#x20;     "name": "Network"

&#x20;   },

&#x20;   "requester": {

&#x20;     "id": "requester-id",

&#x20;     "displayName": "Requester Name",

&#x20;     "email": "requester@example.com"

&#x20;   },

&#x20;   "requestedPriority": "MEDIUM",

&#x20;   "itPriority": "HIGH",

&#x20;   "status": "IN\_PROGRESS",

&#x20;   "primaryOwner": {

&#x20;     "id": "staff-id",

&#x20;     "displayName": "IT Staff"

&#x20;   },

&#x20;   "requesterResolvedIndication": false,

&#x20;   "comments": \[],

&#x20;   "attachments": \[],

&#x20;   "createdAt": "2026-01-01T10:00:00.000Z",

&#x20;   "updatedAt": "2026-01-01T10:00:00.000Z"

&#x20; }

}

```



\#### Visibility Rules



\* Requester เห็น Public Comments

\* Requester ไม่เห็น Internal Notes

\* IT Staff เห็น Public Comments และ Internal Notes ตามสิทธิ์

\* Admin สามารถดูข้อมูลตามสิทธิ์ที่ระบบกำหนด

\* Password และข้อมูลลับต้องไม่ถูกส่งกลับใน Response



\#### Error Responses



```http

404 Not Found

```



```json

{

&#x20; "error": {

&#x20;   "code": "TICKET\_NOT\_FOUND",

&#x20;   "message": "Ticket was not found"

&#x20; }

}

```



```http

403 Forbidden

```



```json

{

&#x20; "error": {

&#x20;   "code": "TICKET\_ACCESS\_DENIED",

&#x20;   "message": "You do not have permission to access this ticket"

&#x20; }

}

```



\### 6.4 Add Public Comment



\#### Endpoint



```http

POST /api/tickets/:ticketId/comments

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



\* `REQUESTER` เพิ่ม Comment ได้เฉพาะ Ticket ของตนเอง

\* `IT\_STAFF` เพิ่ม Public Comment ได้ใน Ticket ที่ตนมีสิทธิ์

\* `ADMIN` เพิ่มได้ตามสิทธิ์ที่ระบบกำหนด



\#### Request Body



```json

{

&#x20; "body": "I have tried restarting the laptop."

}

```



\#### Request Fields



| Field  | Type   | Required | Description            |

| ------ | ------ | -------- | ---------------------- |

| `body` | string | Yes      | ข้อความ Public Comment |



\#### Validation



\* Body ต้องไม่เป็นค่าว่าง

\* Body ต้องมีความยาวไม่เกินค่าที่ระบบกำหนด

\* Comment ต้องเชื่อมกับ Ticket ที่มีอยู่จริง

\* ผู้ใช้ต้องมีสิทธิ์เข้าถึง Ticket

\* Public Comment ต้องมองเห็นได้โดย Requester ที่เป็นเจ้าของ Ticket



\#### Success Response



```http

201 Created

```



```json

{

&#x20; "comment": {

&#x20;   "id": "comment-id",

&#x20;   "ticketId": "ticket-id",

&#x20;   "authorId": "user-id",

&#x20;   "body": "I have tried restarting the laptop.",

&#x20;   "visibility": "PUBLIC",

&#x20;   "createdAt": "2026-01-01T11:00:00.000Z"

&#x20; }

}

```



\#### Rules



\* Comment เป็นข้อมูลแบบ Append-only

\* ไม่อนุญาตให้แก้ไข Comment เดิม

\* ไม่อนุญาตให้ลบ Comment ผ่าน API นี้

\* Public Comment ไม่สามารถใช้แทน Internal Note ได้



\### 6.5 Requester Resolution Indication



\#### Endpoint



```http

POST /api/tickets/:ticketId/requester-resolution

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



เฉพาะ `REQUESTER` ที่เป็นเจ้าของ Ticket



\#### Request Body



```json

{

&#x20; "resolved": true

}

```



\#### Request Fields



| Field      | Type    | Required | Description                                  |

| ---------- | ------- | -------- | -------------------------------------------- |

| `resolved` | boolean | Yes      | ผู้แจ้งระบุว่าปัญหาได้รับการแก้ไขแล้วหรือไม่ |



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "ticket": {

&#x20;   "id": "ticket-id",

&#x20;   "requesterResolvedIndication": true

&#x20; }

}

```



\#### Rules



\* Requester เปลี่ยนค่าได้เฉพาะ Ticket ของตนเอง

\* การระบุว่าแก้ไขแล้วไม่ควรเปลี่ยน Status ของ Ticket โดยอัตโนมัติ หากยังไม่เป็นไปตาม Status Transition Rule

\* IT Staff ยังสามารถตรวจสอบและดำเนินการ Ticket ต่อได้

\* ต้องเก็บข้อมูลการระบุผลลัพธ์ไว้กับ Ticket



\---



\## 7. IT Staff API



\### 7.1 List IT Queue



\#### Endpoint



```http

GET /api/it/queue

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



เฉพาะ `IT\_STAFF` และ `ADMIN`



\#### Query Parameters



| Parameter    | Type    | Required | Description                      |

| ------------ | ------- | -------- | -------------------------------- |

| `status`     | string  | No       | กรองตาม Status                   |

| `priority`   | string  | No       | กรองตาม IT Priority              |

| `ownerId`    | string  | No       | กรองตาม Owner                    |

| `categoryId` | string  | No       | กรองตาม Category                 |

| `search`     | string  | No       | ค้นหา Ticket Number หรือ Subject |

| `page`       | integer | No       | หมายเลขหน้า                      |

| `pageSize`   | integer | No       | จำนวนรายการต่อหน้า               |



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "tickets": \[

&#x20;   {

&#x20;     "id": "ticket-id",

&#x20;     "ticketNumber": "TKT-2026-000001",

&#x20;     "subject": "Cannot connect to Wi-Fi",

&#x20;     "status": "NEW",

&#x20;     "requestedPriority": "MEDIUM",

&#x20;     "itPriority": "HIGH",

&#x20;     "primaryOwnerId": null,

&#x20;     "createdAt": "2026-01-01T10:00:00.000Z",

&#x20;     "updatedAt": "2026-01-01T10:00:00.000Z"

&#x20;   }

&#x20; ],

&#x20; "pagination": {

&#x20;   "page": 1,

&#x20;   "pageSize": 10,

&#x20;   "total": 1,

&#x20;   "totalPages": 1

&#x20; }

}

```



\#### Rules



\* Queue ต้องแสดง Ticket ที่ Staff มีสิทธิ์เข้าถึง

\* Ticket ใหม่ต้องอยู่ใน Queue

\* Ticket ที่ยังไม่มี Owner ต้องสามารถค้นหาได้

\* Inactive IT Staff ไม่ควรเป็นตัวเลือก Owner ใหม่

\* ต้องรองรับ Search และ Pagination ตาม Contract



\### 7.2 Update Ticket Status



\#### Endpoint



```http

PATCH /api/tickets/:ticketId/status

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



เฉพาะ `IT\_STAFF` และ `ADMIN`



\#### Request Body



```json

{

&#x20; "status": "IN\_PROGRESS"

}

```



\#### Supported Status



ตัวอย่าง Status ที่ระบบรองรับ:



\* `NEW`

\* `IN\_PROGRESS`

\* `WAITING\_FOR\_REQUESTER`

\* `RESOLVED`

\* `CLOSED`



รายการจริงต้องตรงกับ Status ที่กำหนดใน Specification และ Database



\#### Validation



\* Status ต้องเป็นค่าที่ระบบรองรับ

\* ต้องตรวจสอบ Status Transition

\* ผู้ใช้ต้องมีสิทธิ์แก้ไข Ticket

\* ไม่อนุญาตให้เปลี่ยน Status ข้ามขั้นตอนที่ไม่ถูกต้อง

\* ต้องบันทึก `updatedAt`



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "ticket": {

&#x20;   "id": "ticket-id",

&#x20;   "status": "IN\_PROGRESS",

&#x20;   "updatedAt": "2026-01-01T12:00:00.000Z"

&#x20; }

}

```



\#### Invalid Transition Response



```http

422 Unprocessable Entity

```



```json

{

&#x20; "error": {

&#x20;   "code": "INVALID\_STATUS\_TRANSITION",

&#x20;   "message": "This status transition is not allowed"

&#x20; }

}

```



\### 7.3 Update IT Priority



\#### Endpoint



```http

PATCH /api/tickets/:ticketId/it-priority

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



เฉพาะ `IT\_STAFF` และ `ADMIN`



\#### Request Body



```json

{

&#x20; "itPriority": "HIGH"

}

```



\#### Supported Values



\* `LOW`

\* `MEDIUM`

\* `HIGH`

\* `URGENT` หากกำหนดไว้ใน Specification



\#### Rules



\* IT Priority เป็นค่าที่ IT Staff ใช้ประเมินความเร่งด่วน

\* Requested Priority ของ Requester ต้องไม่ถูกเขียนทับโดยอัตโนมัติ

\* ต้องตรวจสอบค่าที่ส่งเข้ามา

\* ต้องบันทึกผู้แก้ไขและเวลาที่แก้ไขตาม Data Model



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "ticket": {

&#x20;   "id": "ticket-id",

&#x20;   "itPriority": "HIGH",

&#x20;   "updatedAt": "2026-01-01T12:00:00.000Z"

&#x20; }

}

```



\### 7.4 Assign Primary Owner



\#### Endpoint



```http

PATCH /api/tickets/:ticketId/owner

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



เฉพาะ `IT\_STAFF` และ `ADMIN`



\#### Request Body



```json

{

&#x20; "primaryOwnerId": "staff-user-id"

}

```



\#### Request Fields



| Field            | Type           | Required | Description                      |

| ---------------- | -------------- | -------- | -------------------------------- |

| `primaryOwnerId` | string or null | Yes      | ID ของ IT Staff ที่รับผิดชอบหลัก |



\#### Validation



\* Owner ต้องมีอยู่จริง

\* Owner ต้องมี Role เป็น `IT\_STAFF`

\* Owner ต้องมี `isActive = true`

\* ไม่อนุญาตให้กำหนด Requester เป็น Owner

\* Ticket หนึ่งรายการมี Primary Owner ได้เพียงหนึ่งคน

\* สามารถส่ง `null` ได้หากต้องการยกเลิกการมอบหมายตามสิทธิ์ที่กำหนด



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "ticket": {

&#x20;   "id": "ticket-id",

&#x20;   "primaryOwner": {

&#x20;     "id": "staff-user-id",

&#x20;     "displayName": "IT Staff"

&#x20;   },

&#x20;   "updatedAt": "2026-01-01T12:00:00.000Z"

&#x20; }

}

```



\#### Invalid Owner Response



```http

422 Unprocessable Entity

```



```json

{

&#x20; "error": {

&#x20;   "code": "INVALID\_TICKET\_OWNER",

&#x20;   "message": "The selected owner must be an active IT Staff user"

&#x20; }

}

```



\### 7.5 Add Internal Note



\#### Endpoint



```http

POST /api/tickets/:ticketId/internal-notes

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



เฉพาะ `IT\_STAFF` และ `ADMIN`



\#### Request Body



```json

{

&#x20; "body": "Checked the network switch and found a faulty port."

}

```



\#### Request Fields



| Field  | Type   | Required | Description           |

| ------ | ------ | -------- | --------------------- |

| `body` | string | Yes      | ข้อความ Internal Note |



\#### Validation



\* Body ต้องไม่เป็นค่าว่าง

\* Body ต้องมีความยาวไม่เกินค่าที่ระบบกำหนด

\* ผู้ใช้ต้องมีสิทธิ์เข้าถึง Ticket

\* Internal Note ต้องไม่ถูกเปิดเผยแก่ Requester



\#### Success Response



```http

201 Created

```



```json

{

&#x20; "note": {

&#x20;   "id": "note-id",

&#x20;   "ticketId": "ticket-id",

&#x20;   "authorId": "staff-user-id",

&#x20;   "body": "Checked the network switch and found a faulty port.",

&#x20;   "visibility": "INTERNAL",

&#x20;   "createdAt": "2026-01-01T13:00:00.000Z"

&#x20; }

}

```



\#### Rules



\* Internal Note มองเห็นได้เฉพาะ IT Staff และ Admin ที่มีสิทธิ์

\* Requester ห้ามเห็น Internal Note

\* Internal Note เป็นข้อมูลแบบ Append-only

\* ไม่อนุญาตให้แก้ไขหรือลบผ่าน API นี้



\---



\## 8. Attachment API



\### 8.1 Upload Attachment



\#### Endpoint



```http

POST /api/tickets/:ticketId/attachments

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



ผู้ใช้ต้องมีสิทธิ์เข้าถึง Ticket



\#### Request



ใช้ `multipart/form-data`



Field ที่ใช้ส่งไฟล์:



```text

file

```



\#### Rules



\* Ticket หนึ่งรายการมี Active Attachments ได้ไม่เกิน 5 ไฟล์

\* ไฟล์หนึ่งไฟล์มีขนาดไม่เกิน 6 MB

\* ไม่อนุญาตไฟล์ GIF

\* ต้องตรวจสอบ MIME Type และ File Extension

\* ต้องตรวจสอบจำนวน Active Attachments ก่อน Upload

\* ไฟล์ที่ถูก Soft Remove แล้วไม่นับเป็น Active Attachment

\* ห้ามให้ผู้ใช้ Upload ไฟล์ไปยัง Ticket ที่ไม่มีสิทธิ์เข้าถึง



\#### Success Response



```http

201 Created

```



```json

{

&#x20; "attachment": {

&#x20;   "id": "attachment-id",

&#x20;   "ticketId": "ticket-id",

&#x20;   "fileName": "network-error.png",

&#x20;   "mimeType": "image/png",

&#x20;   "size": 102400,

&#x20;   "isRemoved": false,

&#x20;   "createdAt": "2026-01-01T14:00:00.000Z"

&#x20; }

}

```



\#### Error Responses



\##### Too Many Attachments



```http

409 Conflict

```



```json

{

&#x20; "error": {

&#x20;   "code": "ATTACHMENT\_LIMIT\_EXCEEDED",

&#x20;   "message": "A ticket cannot have more than 5 active attachments"

&#x20; }

}

```



\##### File Too Large



```http

413 Payload Too Large

```



```json

{

&#x20; "error": {

&#x20;   "code": "ATTACHMENT\_TOO\_LARGE",

&#x20;   "message": "Attachment size must not exceed 6 MB"

&#x20; }

}

```



\##### GIF Not Allowed



```http

415 Unsupported Media Type

```



```json

{

&#x20; "error": {

&#x20;   "code": "ATTACHMENT\_TYPE\_NOT\_ALLOWED",

&#x20;   "message": "GIF attachments are not allowed"

&#x20; }

}

```



\### 8.2 List Ticket Attachments



\#### Endpoint



```http

GET /api/tickets/:ticketId/attachments

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



ผู้ใช้ต้องมีสิทธิ์เข้าถึง Ticket



\#### Success Response



```http

200 OK

```



```json

{

&#x20; "attachments": \[

&#x20;   {

&#x20;     "id": "attachment-id",

&#x20;     "fileName": "network-error.png",

&#x20;     "mimeType": "image/png",

&#x20;     "size": 102400,

&#x20;     "isRemoved": false,

&#x20;     "createdAt": "2026-01-01T14:00:00.000Z"

&#x20;   }

&#x20; ]

}

```



\#### Rules



\* ไม่ควรส่งไฟล์ที่ถูก Soft Remove เป็นไฟล์ที่ใช้งานได้

\* Metadata ของไฟล์ที่ถูก Remove ต้องยังคงอยู่ตาม Data Model

\* Response ต้องระบุสถานะของ Attachment ให้ชัดเจน



\### 8.3 Preview Attachment



\#### Endpoint



```http

GET /api/attachments/:attachmentId/preview

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



ผู้ใช้ต้องมีสิทธิ์เข้าถึง Ticket ที่ Attachment เชื่อมอยู่



\#### Success Response



ส่งข้อมูลไฟล์หรือ Stream ตาม MIME Type ที่รองรับ



\#### Removed Attachment Response



```http

410 Gone

```



```json

{

&#x20; "error": {

&#x20;   "code": "ATTACHMENT\_REMOVED",

&#x20;   "message": "This attachment has been removed"

&#x20; }

}

```



\#### Rules



\* Attachment ที่ถูก Remove แล้วต้อง Preview ไม่ได้

\* ห้ามส่งไฟล์จริงกลับมาเมื่อ Attachment ถูก Remove

\* ต้องตรวจสอบสิทธิ์ก่อนส่งไฟล์



\### 8.4 Download Attachment



\#### Endpoint



```http

GET /api/attachments/:attachmentId/download

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



ผู้ใช้ต้องมีสิทธิ์เข้าถึง Ticket ที่ Attachment เชื่อมอยู่



\#### Success Response



ส่งไฟล์พร้อม Header ที่เหมาะสม เช่น:



```http

Content-Disposition: attachment

```



\#### Removed Attachment Response



```http

410 Gone

```



```json

{

&#x20; "error": {

&#x20;   "code": "ATTACHMENT\_REMOVED",

&#x20;   "message": "This attachment has been removed"

&#x20; }

}

```



\#### Rules



\* Attachment ที่ถูก Remove แล้ว Download ไม่ได้

\* Metadata ของ Attachment ที่ถูก Remove แล้วยังเก็บไว้

\* ห้ามใช้ URL เดิมเพื่อหลีกเลี่ยงการตรวจสอบสิทธิ์



\### 8.5 Soft Remove Attachment



\#### Endpoint



```http

DELETE /api/attachments/:attachmentId

```



\#### Authentication



ต้องเข้าสู่ระบบ



\#### Authorization



เฉพาะ `IT\_STAFF` และ `ADMIN` ที่มีสิทธิ์



\#### Behavior



การลบ Attachment เป็น Soft Remove ไม่ใช่การลบ Row ออกจาก Database



ระบบต้อง:



\* เปลี่ยนสถานะ Attachment เป็น Removed

\* เก็บ Metadata เดิมไว้

\* ไม่อนุญาตให้ Preview

\* ไม่อนุญาตให้ Download

\* ไม่ให้นับเป็น Active Attachment



\#### Success Response



```http

204 No Content

```



\#### Repeated Remove



หาก Attachment ถูก Remove ไปแล้ว ระบบควรตอบกลับตาม Contract ที่กำหนด เช่น:



```http

410 Gone

```



```json

{

&#x20; "error": {

&#x20;   "code": "ATTACHMENT\_REMOVED",

&#x20;   "message": "This attachment has already been removed"

&#x20; }

}

```



\---



\## 9. Ticket Data and Business Rules



\### 9.1 Ticket Number



Ticket Number ต้องมีรูปแบบ:



```text

TKT-YYYY-NNNNNN

```



ตัวอย่าง:



```text

TKT-2026-000001

```



โดย:



\* `TKT` เป็น Prefix

\* `YYYY` เป็นปี ค.ศ.

\* `NNNNNN` เป็นเลขลำดับ 6 หลัก

\* Ticket Number ต้องไม่ซ้ำกัน



\### 9.2 Requester Isolation



Requester ต้อง:



\* เห็นเฉพาะ Ticket ของตนเอง

\* ดูรายละเอียดได้เฉพาะ Ticket ของตนเอง

\* เพิ่ม Public Comment ได้เฉพาะ Ticket ของตนเอง

\* ระบุผลการแก้ไขได้เฉพาะ Ticket ของตนเอง

\* ไม่สามารถเปลี่ยน Owner, IT Priority หรือ Internal Note



\### 9.3 Ticket Creation



เมื่อสร้าง Ticket ใหม่:



\* `status = NEW`

\* `primaryOwnerId = null`

\* `requesterId` มาจาก Session

\* `createdAt` ถูกสร้างโดย Backend

\* `updatedAt` ถูกสร้างโดย Backend



\### 9.4 Requested Priority and IT Priority



Requester Priority และ IT Priority เป็นคนละข้อมูลกัน



\* `requestedPriority` คือ Priority ที่ Requester ระบุ

\* `itPriority` คือ Priority ที่ IT Staff ประเมิน

\* การแก้ไข IT Priority ต้องไม่เปลี่ยน Requested Priority โดยอัตโนมัติ



\### 9.5 Primary Owner



\* Ticket หนึ่งรายการมี Primary Owner ได้หนึ่งคน

\* Owner ต้องเป็น Active IT Staff

\* Requester ไม่สามารถกำหนดตนเองเป็น Owner

\* Inactive User ไม่สามารถเป็น Owner ใหม่

\* หาก Owner ถูก Deactivate ต้องมีวิธีจัดการตาม Business Rule ของระบบ



\### 9.6 Comments and Notes



Public Comment:



\* Requester และ IT Staff ที่มีสิทธิ์สามารถเห็นได้

\* ใช้สื่อสารกับผู้แจ้ง

\* เป็นข้อมูลแบบ Append-only



Internal Note:



\* เห็นเฉพาะ IT Staff และ Admin ที่มีสิทธิ์

\* Requester ห้ามเห็น

\* ใช้สำหรับการสื่อสารภายในทีม

\* เป็นข้อมูลแบบ Append-only



\---



\## 10. Common Error Response



API ทุก Endpoint ควรใช้รูปแบบ Error Response เดียวกัน:



```json

{

&#x20; "error": {

&#x20;   "code": "ERROR\_CODE",

&#x20;   "message": "Human-readable error message",

&#x20;   "details": {}

&#x20; }

}

```



`details` เป็น Optional Field สำหรับรายละเอียดเพิ่มเติม เช่น Validation Errors



ตัวอย่าง:



```json

{

&#x20; "error": {

&#x20;   "code": "VALIDATION\_ERROR",

&#x20;   "message": "Request validation failed",

&#x20;   "details": {

&#x20;     "fields": {

&#x20;       "email": "Email is required",

&#x20;       "displayName": "Display name is required"

&#x20;     }

&#x20;   }

&#x20; }

}

```



\---



\## 11. Common Error Codes



| Error Code                    | Meaning                              |

| ----------------------------- | ------------------------------------ |

| `INVALID\_REQUEST`             | Request ไม่ถูกต้อง                   |

| `VALIDATION\_ERROR`            | Validation ไม่ผ่าน                   |

| `UNAUTHENTICATED`             | ยังไม่ได้เข้าสู่ระบบ                 |

| `INVALID\_CREDENTIALS`         | Email หรือ Password ไม่ถูกต้อง       |

| `CURRENT\_PASSWORD\_INCORRECT`  | Password ปัจจุบันไม่ถูกต้อง          |

| `USER\_INACTIVE`               | บัญชีผู้ใช้ถูก Deactivate            |

| `FORBIDDEN`                   | ไม่มีสิทธิ์                          |

| `ROLE\_NOT\_ALLOWED`            | Role ไม่มีสิทธิ์ดำเนินการ            |

| `USER\_NOT\_FOUND`              | ไม่พบ User                           |

| `EMAIL\_ALREADY\_EXISTS`        | Email ถูกใช้งานแล้ว                  |

| `LAST\_ACTIVE\_ADMIN`           | ไม่สามารถทำให้ไม่มี Active Admin ได้ |

| `TICKET\_NOT\_FOUND`            | ไม่พบ Ticket                         |

| `TICKET\_ACCESS\_DENIED`        | ไม่มีสิทธิ์เข้าถึง Ticket            |

| `INVALID\_REQUESTER`           | Requester ไม่ถูกต้อง                 |

| `INVALID\_STATUS\_TRANSITION`   | เปลี่ยน Status ไม่ถูกต้อง            |

| `INVALID\_TICKET\_OWNER`        | Owner ไม่ถูกต้อง                     |

| `CATEGORY\_NOT\_FOUND`          | ไม่พบ Category                       |

| `ATTACHMENT\_LIMIT\_EXCEEDED`   | จำนวน Attachment เกินกำหนด           |

| `ATTACHMENT\_TOO\_LARGE`        | Attachment ใหญ่เกินกำหนด             |

| `ATTACHMENT\_TYPE\_NOT\_ALLOWED` | ไม่อนุญาตประเภทไฟล์                  |

| `ATTACHMENT\_REMOVED`          | Attachment ถูก Soft Remove แล้ว      |

| `INTERNAL\_SERVER\_ERROR`       | เกิดข้อผิดพลาดภายใน Server           |



\---



\## 12. Validation Rules



\### 12.1 User Validation



\* Email ต้องมีรูปแบบถูกต้อง

\* Email ต้องไม่ซ้ำ

\* Display Name ต้องไม่เป็นค่าว่าง

\* Role ต้องเป็นค่าที่ระบบรองรับ

\* User ที่ถูก Deactivate ต้องไม่สามารถ Login ได้



\### 12.2 Ticket Validation



\* Subject ต้องไม่เป็นค่าว่าง

\* Description ต้องไม่เป็นค่าว่าง

\* Category ต้องมีอยู่จริง

\* Requester ต้องมาจาก Session

\* Status ต้องเป็นค่าที่ระบบรองรับ

\* Priority ต้องเป็นค่าที่ระบบรองรับ

\* Owner ต้องเป็น Active IT Staff



\### 12.3 Comment and Note Validation



\* Body ต้องไม่เป็นค่าว่าง

\* Body ต้องไม่เกิน Maximum Length

\* ผู้ใช้ต้องมีสิทธิ์เข้าถึง Ticket

\* ประเภท Visibility ต้องถูกต้อง

\* Requester ไม่สามารถสร้าง Internal Note



\### 12.4 Attachment Validation



\* จำนวน Active Attachments ไม่เกิน 5

\* ขนาดไฟล์ไม่เกิน 6 MB

\* GIF ไม่ได้รับอนุญาต

\* ต้องตรวจสอบ File Type

\* ต้องตรวจสอบสิทธิ์ของผู้ Upload



\---



\## 13. Security Requirements



Backend ต้องปฏิบัติตามข้อกำหนดต่อไปนี้:



\* Password ต้องเก็บเป็น Hash

\* ห้ามส่ง `passwordHash` กลับไปยัง Frontend

\* ห้ามเชื่อถือ `userId` หรือ `role` ที่ส่งมาจาก Frontend

\* ต้องตรวจสอบ Authentication ทุกครั้ง

\* ต้องตรวจสอบ Authorization ทุกครั้ง

\* ต้องป้องกัน Requester จากการเข้าถึง Ticket ของผู้อื่น

\* ต้องป้องกัน Requester จากการเห็น Internal Notes

\* ต้องตรวจสอบสิทธิ์ก่อน Preview หรือ Download Attachment

\* ต้องป้องกันการเข้าถึง Attachment ที่ถูก Soft Remove

\* ต้องไม่เปิดเผยข้อมูลลับใน Error Message

\* ต้องตรวจสอบ Input ก่อนนำไปใช้กับ Database

\* ต้องใช้ Parameterized Query หรือ ORM ที่ป้องกัน SQL Injection

\* ต้องไม่เก็บ Password แบบ Plain Text

\* ต้องไม่อนุญาตให้ Deactivate Admin คนสุดท้าย



\---



\## 14. API Acceptance Criteria



\### AC-API-01 Authentication



ผู้ใช้ที่ยังไม่ได้ Login ไม่สามารถเรียก API ที่ต้องเข้าสู่ระบบได้



\### AC-API-02 Login



ผู้ใช้ที่มี Email และ Password ถูกต้องสามารถ Login ได้



\### AC-API-03 Invalid Login



ผู้ใช้ที่ใส่ Email หรือ Password ไม่ถูกต้องได้รับ Error ที่เหมาะสม



\### AC-API-04 First Login



ผู้ใช้ที่มี `mustChangePassword = true` ต้องเปลี่ยน Password ก่อนใช้งานระบบตามปกติ



\### AC-API-05 Role Authorization



Requester ไม่สามารถเรียก API ของ IT Staff หรือ Admin ได้



\### AC-API-06 User Management



เฉพาะ Admin เท่านั้นที่สามารถสร้าง แก้ไข Activate หรือ Deactivate User ได้



\### AC-API-07 Admin Protection



ระบบต้องไม่อนุญาตให้ Deactivate Admin คนสุดท้ายที่ยัง Active



\### AC-API-08 Ticket Ownership



Requester เห็นเฉพาะ Ticket ของตนเอง



\### AC-API-09 Ticket Creation



Ticket ใหม่ต้องมี Status เป็น `NEW` และยังไม่มี Primary Owner



\### AC-API-10 Requester Validation



Requester ที่ไม่ถูกต้องหรือไม่ตรงกับ Session ต้องได้รับ Error:



```text

INVALID\_REQUESTER

```



\### AC-API-11 IT Queue



IT Staff สามารถดู Queue และค้นหา Ticket ได้



\### AC-API-12 Ticket Assignment



เฉพาะ Active IT Staff เท่านั้นที่สามารถเป็น Primary Owner ได้



\### AC-API-13 Status Update



ระบบต้องตรวจสอบ Status Transition ก่อนเปลี่ยน Status



\### AC-API-14 Priority Update



IT Staff สามารถแก้ไข IT Priority ได้โดยไม่เขียนทับ Requested Priority



\### AC-API-15 Public Comment



Public Comment ต้องมองเห็นได้ตามสิทธิ์ที่กำหนด



\### AC-API-16 Internal Note



Requester ต้องไม่สามารถเห็น Internal Note



\### AC-API-17 Attachment Removal



Attachment ที่ถูก Soft Remove ต้อง Preview และ Download ไม่ได้ และต้องตอบกลับด้วย:



```text

ATTACHMENT\_REMOVED

```



\### AC-API-18 Attachment Limits



ระบบต้องไม่อนุญาต:



\* Active Attachments มากกว่า 5 ไฟล์

\* ไฟล์ใหญ่กว่า 6 MB

\* ไฟล์ GIF



\### AC-API-19 API Error Format



API ต้องใช้ Error Response รูปแบบเดียวกัน



\### AC-API-20 Backend Enforcement



สิทธิ์ทั้งหมดต้องถูกตรวจสอบที่ Backend ไม่ใช่เฉพาะ Frontend



\---



\## 15. Database and Migration Requirements



Database ต้องรองรับข้อมูลที่จำเป็นสำหรับ Lab 3



\### User



ตัวอย่าง Field ที่ต้องรองรับ:



\* `id`

\* `email`

\* `displayName`

\* `passwordHash`

\* `role`

\* `isActive`

\* `mustChangePassword`

\* `createdAt`

\* `updatedAt`



\### Ticket



ตัวอย่าง Field ที่ต้องรองรับ:



\* `id`

\* `ticketNumber`

\* `subject`

\* `description`

\* `categoryId`

\* `requesterId`

\* `primaryOwnerId`

\* `requestedPriority`

\* `itPriority`

\* `status`

\* `requesterResolvedIndication`

\* `createdAt`

\* `updatedAt`



\### Comment



ตัวอย่าง Field ที่ต้องรองรับ:



\* `id`

\* `ticketId`

\* `authorId`

\* `body`

\* `visibility`

\* `createdAt`



\### Attachment



ตัวอย่าง Field ที่ต้องรองรับ:



\* `id`

\* `ticketId`

\* `fileName`

\* `mimeType`

\* `size`

\* `storagePath` หรือข้อมูลที่ใช้ระบุไฟล์

\* `isRemoved`

\* `createdAt`

\* `removedAt` หากจำเป็น



\### Migration Rules



\* ต้องสร้าง Migration สำหรับ Schema ที่เปลี่ยนแปลง

\* Migration ต้องสามารถรันซ้ำตาม Workflow ของ Project ได้

\* ห้ามทำให้ข้อมูลเดิมของ Lab 1 และ Lab 2 เสียหาย

\* ต้องรักษาความสัมพันธ์ระหว่าง User, Ticket, Comment, Attachment และ Category

\* ต้องใช้ Foreign Key ตามความเหมาะสม

\* ต้องกำหนด Unique Constraint ให้กับ Email และ Ticket Number



\---



\## 16. Seed Requirements



Seed Data ต้องมีข้อมูลสำหรับทดสอบอย่างน้อย:



\* Active Requester

\* Active IT Staff

\* Active Admin

\* Inactive User

\* Category ที่ใช้งานได้

\* ตัวอย่าง Ticket

\* ตัวอย่าง Public Comment

\* ตัวอย่าง Internal Note

\* ตัวอย่าง Attachment หากจำเป็น



Seed Data ต้อง:



\* ใช้ Password ที่กำหนดไว้สำหรับการทดสอบ

\* เก็บ Password เป็น Hash

\* ไม่สร้างผู้ใช้ที่มี Email ซ้ำ

\* มี Active Admin อย่างน้อยหนึ่งคน

\* มีข้อมูลเพียงพอสำหรับทดสอบ Role และ Ownership Isolation



\---



\## 17. Out of Scope



รายการต่อไปนี้ไม่อยู่ในขอบเขตของ Lab 3:



\* Multi-Factor Authentication

\* Email Verification

\* Email Password Reset

\* Self-Registration

\* Social Login

\* Single Sign-On

\* Email Notification

\* SLA และ Escalation

\* Dashboard และ KPI

\* Multiple Roles ต่อผู้ใช้หนึ่งคน

\* การลบ User แบบถาวร

\* การลบ Ticket แบบถาวร

\* Bulk User Import

\* Bulk User Export

\* Advanced User Management

\* User Unlock Workflow

\* Admin Approval Workflow

\* การส่ง Email จริง

\* การจัดการไฟล์บน Cloud Production

\* การ Deploy Production

\* การรองรับหลาย Tenant

\* การจัดการ Actions Taken

\* การจัดการ SLA

\* ระบบรายงานขั้นสูง

\* การแก้ไขหรือลบ Comment และ Internal Note

\* การจัดการ Attachment แบบถาวร

\* การทำงานที่นอกเหนือจาก Acceptance Criteria ของ Lab 3



\---



\## 18. Definition of Done



API Contract ของ Lab 3 ถือว่าเสร็จเมื่อ:



\* ระบุ Endpoint ที่จำเป็นครบ

\* ระบุ HTTP Method ครบ

\* ระบุ Authentication และ Authorization ครบ

\* ระบุ Request และ Response ที่สำคัญครบ

\* ระบุ Validation Rules ครบ

\* ระบุ Error Codes และ HTTP Status Codes ครบ

\* ระบุ Business Rules ที่เกี่ยวข้องครบ

\* ระบุ Role และ Ownership Isolation ครบ

\* ระบุ Public Comment และ Internal Note แยกกันชัดเจน

\* ระบุ Attachment Soft Remove และ Error `ATTACHMENT\_REMOVED`

\* ระบุข้อจำกัด Attachment ครบ

\* ระบุ Database และ Migration Requirements

\* ระบุ Seed Requirements

\* ระบุ Out of Scope

\* สามารถใช้เอกสารนี้เป็น Contract สำหรับการพัฒนา Backend, Frontend และ Test ได้



```

```



