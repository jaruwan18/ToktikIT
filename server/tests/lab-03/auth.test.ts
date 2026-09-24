import request from "supertest";
import bcrypt from "bcrypt";
import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";
import { Role } from "@prisma/client";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

const testEmail =
  "auth-change-password-test@example.com";

const currentPassword = "Password123!";
const newPassword = "NewPassword123!";

async function createPasswordChangeTestUser() {
  const prisma = getPrisma();

  await prisma.user.deleteMany({
    where: {
      email: testEmail,
    },
  });

  const passwordHash = await bcrypt.hash(
    currentPassword,
    10,
  );

  return prisma.user.create({
    data: {
      email: testEmail,
      displayName: "Authentication Test User",
      passwordHash,
      role: Role.REQUESTER,
      mustChangePassword: true,
      isActive: true,
    },
  });
}

afterEach(async () => {
  await getPrisma().user.deleteMany({
    where: {
      email: testEmail,
    },
  });
});

describe("Lab 3 - Authentication API", () => {
  it("should reject login when email is missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        password: "Password123!",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "VALIDATION_ERROR",
    );
  });

  it("should reject login when password is missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "VALIDATION_ERROR",
    );
  });

  it("should reject login with incorrect credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "WrongPassword123!",
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      "INVALID_CREDENTIALS",
    );
  });

  it("should login with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "Password123!",
      });

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(
      "admin@example.com",
    );
    expect(response.body.user.role).toBe("ADMIN");
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("should reject change password when the user is not authenticated", async () => {
    const response = await request(app)
      .post("/api/auth/change-password")
      .send({
        currentPassword,
        newPassword,
      });

    expect(response.status).toBe(401);
  });

  it("should reject change password when current password is missing", async () => {
    await createPasswordChangeTestUser();

    const agent = request.agent(app);

    await agent
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: currentPassword,
      });

    const response = await agent
      .post("/api/auth/change-password")
      .send({
        newPassword,
      });

    expect(response.status).toBe(400);
  });

  it("should reject change password when new password is missing", async () => {
    await createPasswordChangeTestUser();

    const agent = request.agent(app);

    await agent
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: currentPassword,
      });

    const response = await agent
      .post("/api/auth/change-password")
      .send({
        currentPassword,
      });

    expect(response.status).toBe(400);
  });

  it("should reject change password when current password is incorrect", async () => {
    await createPasswordChangeTestUser();

    const agent = request.agent(app);

    await agent
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: currentPassword,
      });

    const response = await agent
      .post("/api/auth/change-password")
      .send({
        currentPassword: "WrongPassword123!",
        newPassword,
      });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe(
      "CURRENT_PASSWORD_INCORRECT",
    );
  });

  it("should reject change password when the new password does not meet the minimum length", async () => {
    await createPasswordChangeTestUser();

    const agent = request.agent(app);

    await agent
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: currentPassword,
      });

    const response = await agent
      .post("/api/auth/change-password")
      .send({
        currentPassword,
        newPassword: "short",
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(
      "INVALID_PASSWORD",
    );
  });

  it("should reject change password when the new password is the same as the current password", async () => {
    await createPasswordChangeTestUser();

    const agent = request.agent(app);

    await agent
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: currentPassword,
      });

    const response = await agent
      .post("/api/auth/change-password")
      .send({
        currentPassword,
        newPassword: currentPassword,
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(
      "INVALID_PASSWORD",
    );
  });

  it("should change the password and clear mustChangePassword", async () => {
    await createPasswordChangeTestUser();

    const agent = request.agent(app);

    const loginResponse = await agent
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: currentPassword,
      });

    expect(loginResponse.status).toBe(200);
    expect(
      loginResponse.body.user.mustChangePassword,
    ).toBe(true);

    const response = await agent
      .post("/api/auth/change-password")
      .send({
        currentPassword,
        newPassword,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Password changed successfully",
    );

    const user = await getPrisma().user.findUnique({
      where: {
        email: testEmail,
      },
    });

    expect(user).not.toBeNull();
    expect(user?.mustChangePassword).toBe(false);

    expect(
      await bcrypt.compare(
        newPassword,
        user?.passwordHash ?? "",
      ),
    ).toBe(true);

    expect(
      await bcrypt.compare(
        currentPassword,
        user?.passwordHash ?? "",
      ),
    ).toBe(false);
  });
});