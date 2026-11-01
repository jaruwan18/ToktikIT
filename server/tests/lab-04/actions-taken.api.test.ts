import request from "supertest";
import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

const PASSWORD = "Password123!";

const cleanupKeys =
  new Set<string>();

async function login(
  email: string,
) {
  const response =
    await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: PASSWORD,
      });

  expect(response.status).toBe(200);

  return response.headers[
    "set-cookie"
  ];
}

afterEach(async () => {
  if (cleanupKeys.size === 0) {
    return;
  }

  await getPrisma().actionTaken.deleteMany({
    where: {
      idempotencyKey: {
        in: [...cleanupKeys],
      },
    },
  });

  cleanupKeys.clear();
});

describe(
  "Lab 4 - Actions Taken API",
  () => {
    it(
      "rejects unauthenticated access",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/tickets/1/actions",
            );

        expect(
          response.status,
        ).toBe(401);

        expect(
          response.body.error,
        ).toBe(
          "UNAUTHENTICATED",
        );
      },
    );

    it(
      "allows a Requester to view Actions Taken on an owned Ticket",
      async () => {
        const cookies =
          await login(
            "jennifer.anderson@example.com",
          );

        const response =
          await request(app)
            .get(
              "/api/tickets/1/actions",
            )
            .set(
              "Cookie",
              cookies,
            );

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.data,
        ).toHaveLength(2);
      },
    );

    it(
      "prevents a Requester from viewing another Requester's Actions Taken",
      async () => {
        const cookies =
          await login(
            "sarah.williams@example.com",
          );

        const response =
          await request(app)
            .get(
              "/api/tickets/1/actions",
            )
            .set(
              "Cookie",
              cookies,
            );

        expect(
          response.status,
        ).toBe(403);

        expect(
          response.body.error,
        ).toBe(
          "FORBIDDEN",
        );
      },
    );

    it(
      "prevents a Requester from creating an Action Taken",
      async () => {
        const cookies =
          await login(
            "jennifer.anderson@example.com",
          );

        const response =
          await request(app)
            .post(
              "/api/tickets/1/actions",
            )
            .set(
              "Cookie",
              cookies,
            )
            .send({
              actionDateTime:
                "2026-10-08T09:00:00.000Z",
              actionDescription:
                "Not allowed.",
              result:
                "Requester cannot create actions.",
              followUpRequired:
                false,
            });

        expect(
          response.status,
        ).toBe(403);

        expect(
          response.body.error,
        ).toBe(
          "FORBIDDEN",
        );
      },
    );

    it(
      "creates an Action Taken with the authenticated performer",
      async () => {
        const cookies =
          await login(
            "it.alex@example.com",
          );

        const key =
          "lab4-api-create-01";

        cleanupKeys.add(key);

        const response =
          await request(app)
            .post(
              "/api/tickets/1/actions",
            )
            .set(
              "Cookie",
              cookies,
            )
            .set(
              "Idempotency-Key",
              key,
            )
            .send({
              actionDateTime:
                "2026-10-08T09:00:00.000Z",
              actionDescription:
                "Checked the laptop power adapter.",
              result:
                "Adapter is functioning normally.",
              followUpRequired:
                false,
            });

        expect(
          response.status,
        ).toBe(201);

        expect(
          response.body.performedBy.email,
        ).toBe(
          "it.alex@example.com",
        );

        expect(
          response.body.ticketId,
        ).toBe(1);
      },
    );

    it(
      "requires a Follow-up Note when follow-up is required",
      async () => {
        const cookies =
          await login(
            "it.alex@example.com",
          );

        const response =
          await request(app)
            .post(
              "/api/tickets/1/actions",
            )
            .set(
              "Cookie",
              cookies,
            )
            .send({
              actionDateTime:
                "2026-10-08T09:00:00.000Z",
              actionDescription:
                "Waiting for requester.",
              result:
                "Requester confirmation is needed.",
              followUpRequired:
                true,
            });

        expect(
          response.status,
        ).toBe(400);

        expect(
          response.body.error,
        ).toBe(
          "VALIDATION_ERROR",
        );

        expect(
          response.body.fields.followUpNote,
        ).toBeDefined();
      },
    );

    it(
      "returns the existing record on an identical retry",
      async () => {
        const cookies =
          await login(
            "it.jordan@example.com",
          );

        const key =
          "lab4-api-idempotency-01";

        cleanupKeys.add(key);

        const payload = {
          actionDateTime:
            "2026-10-08T10:00:00.000Z",
          actionDescription:
            "Checked application service logs.",
          result:
            "No outage found.",
          followUpRequired:
            false,
        };

        const first =
          await request(app)
            .post(
              "/api/tickets/2/actions",
            )
            .set(
              "Cookie",
              cookies,
            )
            .set(
              "Idempotency-Key",
              key,
            )
            .send(payload);

        const second =
          await request(app)
            .post(
              "/api/tickets/2/actions",
            )
            .set(
              "Cookie",
              cookies,
            )
            .set(
              "Idempotency-Key",
              key,
            )
            .send(payload);

        expect(
          first.status,
        ).toBe(201);

        expect(
          second.status,
        ).toBe(200);

        expect(
          second.body.id,
        ).toBe(
          first.body.id,
        );

        expect(
          await getPrisma()
            .actionTaken.count({
              where: {
                idempotencyKey: key,
              },
            }),
        ).toBe(1);
      },
    );

    it(
      "rejects conflicting reuse of an idempotency key",
      async () => {
        const cookies =
          await login(
            "it.jordan@example.com",
          );

        const key =
          "lab4-api-idempotency-conflict-01";

        cleanupKeys.add(key);

        const payload = {
          actionDateTime:
            "2026-10-08T10:30:00.000Z",
          actionDescription:
            "Checked VPN service.",
          result:
            "VPN service is available.",
          followUpRequired:
            false,
        };

        const first =
          await request(app)
            .post(
              "/api/tickets/2/actions",
            )
            .set(
              "Cookie",
              cookies,
            )
            .set(
              "Idempotency-Key",
              key,
            )
            .send(payload);

        const second =
          await request(app)
            .post(
              "/api/tickets/1/actions",
            )
            .set(
              "Cookie",
              cookies,
            )
            .set(
              "Idempotency-Key",
              key,
            )
            .send(payload);

        expect(
          first.status,
        ).toBe(201);

        expect(
          second.status,
        ).toBe(409);

        expect(
          second.body.error,
        ).toBe(
          "IDEMPOTENCY_KEY_CONFLICT",
        );
      },
    );

    it(
      "allows Admin to create an Action Taken",
      async () => {
        const cookies =
          await login(
            "admin@example.com",
          );

        const key =
          "lab4-api-admin-01";

        cleanupKeys.add(key);

        const response =
          await request(app)
            .post(
              "/api/tickets/3/actions",
            )
            .set(
              "Cookie",
              cookies,
            )
            .set(
              "Idempotency-Key",
              key,
            )
            .send({
              actionDateTime:
                "2026-10-08T11:00:00.000Z",
              actionDescription:
                "Reviewed the unassigned ticket.",
              result:
                "Ticket reviewed.",
              followUpRequired:
                false,
            });

        expect(
          response.status,
        ).toBe(201);

        expect(
          response.body.performedBy.email,
        ).toBe(
          "admin@example.com",
        );
      },
    );

    it(
      "updates an Action Taken and rejects a stale update",
      async () => {
        const cookies =
          await login(
            "it.alex@example.com",
          );

        const key =
          "lab4-api-update-01";

        cleanupKeys.add(key);

        const created =
          await request(app)
            .post(
              "/api/tickets/1/actions",
            )
            .set(
              "Cookie",
              cookies,
            )
            .set(
              "Idempotency-Key",
              key,
            )
            .send({
              actionDateTime:
                "2026-10-08T12:00:00.000Z",
              actionDescription:
                "Performed diagnostics.",
              result:
                "Diagnostics completed.",
              followUpRequired:
                false,
            });

        expect(
          created.status,
        ).toBe(201);

        const updated =
          await request(app)
            .patch(
              `/api/tickets/1/actions/${created.body.id}`,
            )
            .set(
              "Cookie",
              cookies,
            )
            .send({
              updatedAt:
                created.body.updatedAt,
              actionDateTime:
                "2026-10-08T12:15:00.000Z",
              actionDescription:
                "Performed deeper diagnostics.",
              result:
                "No hardware fault found.",
              followUpRequired:
                true,
              followUpNote:
                "Requester should confirm the laptop boots normally.",
            });

        expect(
          updated.status,
        ).toBe(200);

        const stale =
          await request(app)
            .patch(
              `/api/tickets/1/actions/${created.body.id}`,
            )
            .set(
              "Cookie",
              cookies,
            )
            .send({
              updatedAt:
                created.body.updatedAt,
              actionDateTime:
                "2026-10-08T12:30:00.000Z",
              actionDescription:
                "Stale update.",
              result:
                "Must be rejected.",
              followUpRequired:
                false,
            });

        expect(
          stale.status,
        ).toBe(409);

        expect(
          stale.body.error,
        ).toBe(
          "STALE_UPDATE",
        );
      },
    );

    it(
      "returns 404 for a missing Ticket",
      async () => {
        const cookies =
          await login(
            "it.alex@example.com",
          );

        const response =
          await request(app)
            .get(
              "/api/tickets/999999/actions",
            )
            .set(
              "Cookie",
              cookies,
            );

        expect(
          response.status,
        ).toBe(404);

        expect(
          response.body.error,
        ).toBe(
          "TICKET_NOT_FOUND",
        );
      },
    );
  },
);