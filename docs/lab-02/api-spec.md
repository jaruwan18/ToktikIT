\# Lab 2 API Specification



All endpoints are prefixed with /api. Content type for request/response bodies is application/json

unless noted otherwise (file upload uses multipart/form-data).



\## 0. Requester Identity (applies to all Ticket/Attachment endpoints)



Since Lab 2 has no authentication, the calling Requester's identity is passed explicitly:



\- Query parameter: ?requesterId=<id> (used for GET requests), OR

\- Header: X-Requester-Id: <id> (used for POST/DELETE requests)



If requesterId is missing, malformed, or refers to an inactive/non-existent Requester, respond:

{ "error": "INVALID\_REQUESTER", "message": "A valid, active Requester identity is required." }

Status: 400



\---



\## 1. GET /api/categories



Retrieve active Categories for the Create Ticket and My Tickets filter dropdowns.



Response 200

\[

&#x20; { "id": 1, "name": "Account and Access" },

&#x20; { "id": 2, "name": "Hardware" },

&#x20; { "id": 3, "name": "Software" },

&#x20; { "id": 4, "name": "Network" }

]



Response 500 (unexpected failure)

{ "error": "INTERNAL\_ERROR", "message": "Unable to retrieve categories." }



\---



\## 2. GET /api/related-systems



Retrieve active Related Systems.



Response 200

\[

&#x20; { "id": 1, "name": "Email" },

&#x20; { "id": 2, "name": "Campus Wi-Fi" },

&#x20; { "id": 3, "name": "VPN" },

&#x20; { "id": 4, "name": "LEB2 App" },

&#x20; { "id": 5, "name": "Grade Submission App" },

&#x20; { "id": 6, "name": "Printer" },

&#x20; { "id": 7, "name": "Corporate Laptop" }

]



Response 500 - same shape as Section 1.



\---



\## 3. GET /api/requesters



Retrieve active Development Requesters for the selector screen. Inactive Requesters are excluded.



Response 200

\[

&#x20; { "id": 1, "name": "Jennifer Anderson", "email": "jennifer.anderson@example.com" },

&#x20; { "id": 2, "name": "Michael Brown", "email": "michael.brown@example.com" }

]



Response 200 (empty) - when no active Requesters exist:

\[]



Response 500 - same shape as Section 1.



\---



\## 4. POST /api/tickets



Create a new Ticket for the calling Requester (X-Requester-Id header).



Request Body

{

&#x20; "categoryId": 2,

&#x20; "relatedSystemId": 7,

&#x20; "summary": "Laptop battery drains quickly",

&#x20; "description": "My laptop battery is draining much faster than usual, even when idle.",

&#x20; "requestedPriority": "MEDIUM"

}



Validation rules (see specification.md BR-04 to BR-07):

\- summary: required, trimmed length 5-150.

\- description: required, trimmed length 10-2000.

\- categoryId: required, must reference an active Category.

\- relatedSystemId: required, must reference an active Related System.

\- requestedPriority: required, one of LOW, MEDIUM, HIGH.



Response 201 (success)

{

&#x20; "id": 101,

&#x20; "ticketNumber": "TKT-2026-000101",

&#x20; "requesterId": 1,

&#x20; "categoryId": 2,

&#x20; "relatedSystemId": 7,

&#x20; "summary": "Laptop battery drains quickly",

&#x20; "description": "My laptop battery is draining much faster than usual, even when idle.",

&#x20; "requestedPriority": "MEDIUM",

&#x20; "currentStatus": "NEW",

&#x20; "createdAt": "2026-08-30T10:15:00.000Z",

&#x20; "updatedAt": "2026-08-30T10:15:00.000Z"

}



Response 400 (validation failure)

{

&#x20; "error": "VALIDATION\_ERROR",

&#x20; "message": "One or more fields are invalid.",

&#x20; "fields": {

&#x20;   "summary": "Summary must be between 5 and 150 characters.",

&#x20;   "categoryId": "Category is required and must be active."

&#x20; }

}



Response 400 (invalid/inactive reference)

{ "error": "INVALID\_REFERENCE", "message": "The selected Category or Related System is not available." }



Response 500 - same shape as Section 1.



\---



\## 5. GET /api/tickets



Retrieve a paginated, filtered, sorted list of Tickets owned by the calling Requester.



Query Parameters



| Param | Type | Default | Notes |

|---|---|---|---|

| requesterId | int | - | required |

| search | string | - | matches Ticket Number (partial) OR Summary (case-insensitive partial) |

| categoryId | int | - | filter |

| requestedPriority | enum | - | filter: LOW / MEDIUM / HIGH |

| currentStatus | enum | - | filter: NEW (only value in Lab 2) |

| sortBy | enum | createdAt | one of: ticketNumber, createdAt, updatedAt, summary |

| sortOrder | enum | desc | asc or desc |

| page | int | 1 | invalid/out-of-range falls back to 1 |

| pageSize | int | 10 | max 50; invalid falls back to 10 |



Example: GET /api/tickets?requesterId=1\&search=laptop\&page=1\&pageSize=10



Response 200

{

&#x20; "data": \[

&#x20;   {

&#x20;     "id": 101,

&#x20;     "ticketNumber": "TKT-2026-000101",

&#x20;     "summary": "Laptop battery drains quickly",

&#x20;     "categoryId": 2,

&#x20;     "categoryName": "Hardware",

&#x20;     "requestedPriority": "MEDIUM",

&#x20;     "currentStatus": "NEW",

&#x20;     "createdAt": "2026-08-30T10:15:00.000Z",

&#x20;     "updatedAt": "2026-08-30T10:15:00.000Z"

&#x20;   }

&#x20; ],

&#x20; "pagination": {

&#x20;   "page": 1,

&#x20;   "pageSize": 10,

&#x20;   "totalItems": 1,

&#x20;   "totalPages": 1

&#x20; }

}



Response 200 (empty result set - zero tickets owned)

{ "data": \[], "pagination": { "page": 1, "pageSize": 10, "totalItems": 0, "totalPages": 0 } }



Note: the API does not distinguish "empty" vs. "no-results" - that distinction is a frontend concern

(Section 7.3 of ui-spec.md): the frontend shows Empty state when search/filters are absent, and

No-results state when filters are active but totalItems is 0.



Response 400 - same shape as Section 4 (invalid requesterId).



Response 500 - same shape as Section 1.



\---



\## 6. GET /api/tickets/:id



Retrieve full detail of one Ticket, only if owned by the calling Requester.



Response 200

{

&#x20; "id": 101,

&#x20; "ticketNumber": "TKT-2026-000101",

&#x20; "requesterId": 1,

&#x20; "requesterName": "Jennifer Anderson",

&#x20; "categoryId": 2,

&#x20; "categoryName": "Hardware",

&#x20; "relatedSystemId": 7,

&#x20; "relatedSystemName": "Corporate Laptop",

&#x20; "summary": "Laptop battery drains quickly",

&#x20; "description": "My laptop battery is draining much faster than usual, even when idle.",

&#x20; "requestedPriority": "MEDIUM",

&#x20; "currentStatus": "NEW",

&#x20; "createdAt": "2026-08-30T10:15:00.000Z",

&#x20; "updatedAt": "2026-08-30T10:15:00.000Z",

&#x20; "attachments": \[

&#x20;   {

&#x20;     "id": 55,

&#x20;     "originalFilename": "battery-report.pdf",

&#x20;     "mimeType": "application/pdf",

&#x20;     "sizeBytes": 204800,

&#x20;     "uploadedAt": "2026-08-30T10:16:00.000Z",

&#x20;     "isRemoved": false

&#x20;   }

&#x20; ]

}



Response 404 (not found OR not owned by the calling Requester - same response either way, per BR-09)

{ "error": "TICKET\_NOT\_FOUND", "message": "Ticket not found." }



Response 500 - same shape as Section 1.



\---



\## 7. POST /api/tickets/:id/attachments



Upload one attachment to an existing, owned Ticket. multipart/form-data with a single file field.



Validation rules (see specification.md BR-15):

\- Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf.

\- Max size: 5 MB (5,242,880 bytes).

\- Max 5 active attachments per Ticket (rejects the 6th).



Response 201

{

&#x20; "id": 56,

&#x20; "ticketId": 101,

&#x20; "originalFilename": "screenshot.png",

&#x20; "mimeType": "image/png",

&#x20; "sizeBytes": 102400,

&#x20; "uploadedAt": "2026-08-30T11:00:00.000Z",

&#x20; "isRemoved": false

}



Response 400 (unsupported type)

{ "error": "UNSUPPORTED\_FILE\_TYPE", "message": "Allowed file types are JPG, PNG, WEBP, and PDF." }



Response 400 (file too large)

{ "error": "FILE\_TOO\_LARGE", "message": "File exceeds the 5 MB size limit." }



Response 409 (attachment limit reached)

{ "error": "ATTACHMENT\_LIMIT\_REACHED", "message": "This ticket already has the maximum of 5 active attachments." }



Response 404 (Ticket not found / not owned) - same shape as Section 6.



Response 500 - same shape as Section 1.



\---



\## 8. GET /api/tickets/:id/attachments



List attachment metadata (active and removed) for an owned Ticket.



Response 200

\[

&#x20; {

&#x20;   "id": 55,

&#x20;   "originalFilename": "battery-report.pdf",

&#x20;   "mimeType": "application/pdf",

&#x20;   "sizeBytes": 204800,

&#x20;   "uploadedAt": "2026-08-30T10:16:00.000Z",

&#x20;   "isRemoved": false,

&#x20;   "removedAt": null,

&#x20;   "removalReason": null

&#x20; },

&#x20; {

&#x20;   "id": 40,

&#x20;   "originalFilename": "old-screenshot.jpg",

&#x20;   "mimeType": "image/jpeg",

&#x20;   "sizeBytes": 51200,

&#x20;   "uploadedAt": "2026-08-28T09:00:00.000Z",

&#x20;   "isRemoved": true,

&#x20;   "removedAt": "2026-08-29T14:00:00.000Z",

&#x20;   "removalReason": "Uploaded the wrong screenshot by mistake."

&#x20; }

]



Response 404 (Ticket not found / not owned) - same shape as Section 6.



\---



\## 9. GET /api/attachments/:id/download



Download the raw file content of one active attachment, only if the parent Ticket is owned by the

calling Requester.



Response 200 - binary file stream with appropriate Content-Type and

Content-Disposition: attachment; filename="<originalFilename>".



Response 404 (attachment or parent Ticket not found / not owned) - same shape as Section 6.



Response 410 (attachment exists but has been soft-removed)

{ "error": "ATTACHMENT\_REMOVED", "message": "This attachment has been removed and is no longer available." }



\---



\## 10. DELETE /api/attachments/:id



Soft-remove an attachment. Requires a removal reason in the body.



Request Body

{ "reason": "Uploaded the wrong screenshot by mistake." }



Validation: reason required, trimmed, min 5 characters.



Response 200

{

&#x20; "id": 55,

&#x20; "isRemoved": true,

&#x20; "removedAt": "2026-08-30T12:00:00.000Z",

&#x20; "removalReason": "Uploaded the wrong screenshot by mistake."

}



Response 400 (missing/too-short reason)

{ "error": "VALIDATION\_ERROR", "message": "A removal reason of at least 5 characters is required." }



Response 404 (attachment or parent Ticket not found / not owned) - same shape as Section 6.



Response 409 (already removed)

{ "error": "ALREADY\_REMOVED", "message": "This attachment has already been removed." }



\---



\## 11. HTTP Status Code Summary



| Status | Meaning in this API |

|---|---|

| 200 | Successful retrieval or update |

| 201 | Resource created (Ticket, Attachment) |

| 400 | Invalid input: validation failure, unsupported file type, file too large, invalid/inactive reference, invalid Requester identity |

| 404 | Resource not found, OR resource exists but is not owned by the calling Requester (ownership failures are indistinguishable from not-found, per BR-09) |

| 409 | Conflict: attachment limit reached, attachment already removed |

| 410 | Resource existed but has been soft-removed (download of a removed attachment) |

| 500 | Unexpected server error; message never leaks internal details (stack traces, SQL, file paths) |



\## 12. Error Response Shape (general contract)



Every non-2xx response follows this shape:

{ "error": "<MACHINE\_READABLE\_CODE>", "message": "<human-readable message>" }



Validation errors additionally include a fields object mapping field name to its specific message

(see Section 4). No response body ever includes stack traces, raw database errors, or file-system paths.

