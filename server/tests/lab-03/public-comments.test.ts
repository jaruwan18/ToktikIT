import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

const TEST_COMMENT = "The requester has provided additional information.";

async function login(email: string, password = "Password123!") {
  return request(app)
    .post("/api/auth/login")
    .send({ email, password });
}

async function getUserId(email: string) {
  const user = await getPrisma().user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  return user.id;
}

async function getRequesterIdByEmail(email: string) {
  const requester = await getPrisma().requester.findUnique({
    where: { email },
    select: { id: true, userId: true },
  });

  if (!requester) {
    throw new Error(`Requester not found: ${email}`);
  }

  return requester;
}

async function getTicketOwnedByRequester(requesterId: number) {
  const ticket = await getPrisma().ticket.findFirst({
    where: { requesterId },
    orderBy: { id: "asc" },
    select: { id: true, ticketNumber: true },
  });

  if (!ticket) {
    throw new Error(`No ticket found for requester ${requesterId}`);
  }

  return ticket;
}

afterEach(async () => {
  const prisma = getPrisma();

  await prisma.ticketMessage.deleteMany({
    where: {
      body: TEST_COMMENT,
    },
  });
});

describe("Lab 3 - Public Comments", () => {
  describe("POST /api/tickets/:ticketId/comments", () => {
    it("rejects unauthenticated users with 401", async () => {
      const response = await request(app)
        .post("/api/tickets/1/comments")
        .send({ body: TEST_COMMENT });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("UNAUTHENTICATED");
    });

    it("rejects an invalid ticket id with 404", async () => {
      const loginResponse = await login("it.alex@example.com");

      expect(loginResponse.status).toBe(200);

      const response = await request(app)
        .post("/api/tickets/999999/comments")
        .set("Cookie", loginResponse.headers["set-cookie"])
        .send({ body: TEST_COMMENT });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("TICKET_NOT_FOUND");
    });

    it("rejects an empty comment body with 400", async () => {
      const loginResponse = await login("it.alex@example.com");

      expect(loginResponse.status).toBe(200);

      const response = await request(app)
        .post("/api/tickets/1/comments")
        .set("Cookie", loginResponse.headers["set-cookie"])
        .send({ body: "   " });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("INVALID_COMMENT");
    });

    it("allows a requester to comment on their own ticket", async () => {
      const requesterEmail = "sarah.williams@example.com";
      const requester = await getRequesterIdByEmail(requesterEmail);

      const loginResponse = await login(requesterEmail);

      expect(loginResponse.status).toBe(200);

      const ticket = await getTicketOwnedByRequester(requester.id);

      const response = await request(app)
        .post(`/api/tickets/${ticket.id}/comments`)
        .set("Cookie", loginResponse.headers["set-cookie"])
        .send({ body: TEST_COMMENT });

      expect(response.status).toBe(201);
      expect(response.body.message.type).toBe("COMMENT");
      expect(response.body.message.body).toBe(TEST_COMMENT);
      expect(response.body.message.author.email).toBe(requesterEmail);
    });

    it("rejects a requester from commenting on another requester's ticket", async () => {
      const requesterEmail = "sarah.williams@example.com";
      const requester = await getRequesterIdByEmail(requesterEmail);

      const loginResponse = await login(requesterEmail);

      expect(loginResponse.status).toBe(200);

      const ticket = await getPrisma().ticket.findFirst({
        where: {
          requesterId: {
            not: requester.id,
          },
        },
        orderBy: { id: "asc" },
        select: { id: true },
      });

      expect(ticket).not.toBeNull();

      const response = await request(app)
        .post(`/api/tickets/${ticket!.id}/comments`)
        .set("Cookie", loginResponse.headers["set-cookie"])
        .send({ body: TEST_COMMENT });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("FORBIDDEN");
    });

    it("allows IT Staff to add a public comment", async () => {
      const loginResponse = await login("it.alex@example.com");

      expect(loginResponse.status).toBe(200);

      const response = await request(app)
        .post("/api/tickets/1/comments")
        .set("Cookie", loginResponse.headers["set-cookie"])
        .send({ body: TEST_COMMENT });

      expect(response.status).toBe(201);
      expect(response.body.message.type).toBe("COMMENT");
      expect(response.body.message.body).toBe(TEST_COMMENT);
      expect(response.body.message.author.email).toBe("it.alex@example.com");
    });

    it("allows Admin to add a public comment", async () => {
      const loginResponse = await login("admin@example.com");

      expect(loginResponse.status).toBe(200);

      const response = await request(app)
        .post("/api/tickets/1/comments")
        .set("Cookie", loginResponse.headers["set-cookie"])
        .send({ body: TEST_COMMENT });

      expect(response.status).toBe(201);
      expect(response.body.message.type).toBe("COMMENT");
      expect(response.body.message.body).toBe(TEST_COMMENT);
      expect(response.body.message.author.email).toBe("admin@example.com");
    });

    it("stores the author from the session instead of the request body", async () => {
      const loginResponse = await login("it.alex@example.com");

      expect(loginResponse.status).toBe(200);

      const response = await request(app)
        .post("/api/tickets/1/comments")
        .set("Cookie", loginResponse.headers["set-cookie"])
        .send({
          body: TEST_COMMENT,
          authorId: 999999,
        });

      expect(response.status).toBe(201);
      expect(response.body.message.author.email).toBe("it.alex@example.com");
    });

    it("creates an append-only comment that can be retrieved from the ticket", async () => {
      const loginResponse = await login("it.alex@example.com");

      expect(loginResponse.status).toBe(200);

      const createResponse = await request(app)
        .post("/api/tickets/1/comments")
        .set("Cookie", loginResponse.headers["set-cookie"])
        .send({ body: TEST_COMMENT });

      expect(createResponse.status).toBe(201);

      const commentId = createResponse.body.message.id;

      const storedMessage = await getPrisma().ticketMessage.findUnique({
        where: { id: commentId },
        select: {
          id: true,
          ticketId: true,
          authorId: true,
          type: true,
          body: true,
        },
      });

      expect(storedMessage).toEqual({
        id: commentId,
        ticketId: 1,
        authorId: await getUserId("it.alex@example.com"),
        type: "COMMENT",
        body: TEST_COMMENT,
      });
    });
  });
});
