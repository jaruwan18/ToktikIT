import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { Prisma, Role } from "@prisma/client";
import { getPrisma } from "./prisma.js";
import { requireRole } from "./authorization.js";

export const adminUsersRouter = Router();

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 100;

const USER_ROLES = [
  Role.REQUESTER,
  Role.IT_STAFF,
  Role.ADMIN,
] as const;

function isValidRole(value: unknown): value is Role {
  return (
    typeof value === "string" &&
    USER_ROLES.includes(value as Role)
  );
}

function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const email = value.trim().toLowerCase();

  return (
    email.length > 0 &&
    email.length <= 255 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function isValidPassword(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= PASSWORD_MIN_LENGTH &&
    value.length <= PASSWORD_MAX_LENGTH
  );
}

function userResponse(user: {
  id: number;
  email: string;
  displayName: string;
  role: Role;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// GET /api/admin/users
// Administrator User Management - List Users
// ---------------------------------------------------------------------------

adminUsersRouter.get(
  "/users",
  requireRole(Role.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const search =
        typeof req.query.search === "string"
          ? req.query.search.trim()
          : "";

      const where: Prisma.UserWhereInput = {};

      if (search.length > 0) {
        where.OR = [
          {
            displayName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      const users = await getPrisma().user.findMany({
        where,
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          mustChangePassword: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          id: "asc",
        },
      });

      return res.status(200).json({
        users,
      });
    } catch (error) {
      console.error(
        "GET /api/admin/users failed:",
        error,
      );

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Unable to retrieve users.",
      });
    }
  },
);

// ---------------------------------------------------------------------------
// POST /api/admin/users
// Administrator User Management - Create User
// ---------------------------------------------------------------------------

adminUsersRouter.post(
  "/users",
  requireRole(Role.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const {
        displayName,
        email,
        role,
        password,
      } = req.body ?? {};

      const fields: Record<string, string> = {};

      const normalizedDisplayName =
        typeof displayName === "string"
          ? displayName.trim()
          : "";

      if (
        normalizedDisplayName.length < 1 ||
        normalizedDisplayName.length > 100
      ) {
        fields.displayName =
          "Display name is required and must not exceed 100 characters.";
      }

      if (!isValidEmail(email)) {
        fields.email =
          "A valid email address is required.";
      }

      if (!isValidRole(role)) {
        fields.role =
          "Role must be REQUESTER, IT_STAFF, or ADMIN.";
      }

      if (!isValidPassword(password)) {
        fields.password =
          `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`;
      }

      if (Object.keys(fields).length > 0) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "One or more fields are invalid.",
          fields,
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const existingUser =
        await getPrisma().user.findUnique({
          where: {
            email: normalizedEmail,
          },
          select: {
            id: true,
          },
        });

      if (existingUser) {
        return res.status(409).json({
          error: "DUPLICATE_EMAIL",
          message:
            "A user with this email address already exists.",
        });
      }

      const passwordHash =
        await bcrypt.hash(password, 10);

      const user =
        await getPrisma().user.create({
          data: {
            email: normalizedEmail,
            displayName: normalizedDisplayName,
            passwordHash,
            role,
            mustChangePassword: true,
            isActive: true,

            ...(role === Role.REQUESTER
              ? {
                  requester: {
                    create: {
                      name: normalizedDisplayName,
                      email: normalizedEmail,
                      isActive: true,
                    },
                  },
                }
              : {}),
          },

          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            mustChangePassword: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      return res.status(201).json({
        user,
      });
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return res.status(409).json({
          error: "DUPLICATE_EMAIL",
          message:
            "A user with this email address already exists.",
        });
      }

      console.error(
        "POST /api/admin/users failed:",
        error,
      );

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Unable to create user.",
      });
    }
  },
);

// ---------------------------------------------------------------------------
// PATCH /api/admin/users/:id
// Administrator User Management - Update User
// ---------------------------------------------------------------------------

adminUsersRouter.patch(
  "/users/:id",
  requireRole(Role.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);

      if (
        !Number.isInteger(userId) ||
        userId < 1
      ) {
        return res.status(404).json({
          error: "USER_NOT_FOUND",
          message: "User not found.",
        });
      }

      const existingUser =
        await getPrisma().user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            isActive: true,
          },
        });

      if (!existingUser) {
        return res.status(404).json({
          error: "USER_NOT_FOUND",
          message: "User not found.",
        });
      }

      const {
        displayName,
        email,
        role,
        isActive,
      } = req.body ?? {};

      const fields: Record<string, string> = {};

      if (
        displayName !== undefined &&
        (
          typeof displayName !== "string" ||
          displayName.trim().length < 1 ||
          displayName.trim().length > 100
        )
      ) {
        fields.displayName =
          "Display name must be between 1 and 100 characters.";
      }

      if (
        email !== undefined &&
        !isValidEmail(email)
      ) {
        fields.email =
          "A valid email address is required.";
      }

      if (
        role !== undefined &&
        !isValidRole(role)
      ) {
        fields.role =
          "Role must be REQUESTER, IT_STAFF, or ADMIN.";
      }

      if (
        isActive !== undefined &&
        typeof isActive !== "boolean"
      ) {
        fields.isActive =
          "isActive must be true or false.";
      }

      if (Object.keys(fields).length > 0) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "One or more fields are invalid.",
          fields,
        });
      }

      const sessionUserId =
        req.session.userId;

      const changingOwnStatus =
        sessionUserId === userId &&
        isActive === false;

      if (changingOwnStatus) {
        return res.status(403).json({
          error: "FORBIDDEN",
          message:
            "An Administrator cannot deactivate their own account.",
        });
      }

      const resultingRole =
        role !== undefined
          ? role
          : existingUser.role;

      const resultingIsActive =
        isActive !== undefined
          ? isActive
          : existingUser.isActive;

      // An active Administrator must not be changed
      // to another role while they would become the
      // last active Administrator.
      if (
        existingUser.role === Role.ADMIN &&
        existingUser.isActive &&
        (
          resultingRole !== Role.ADMIN ||
          resultingIsActive === false
        )
      ) {
        const activeAdminCount =
          await getPrisma().user.count({
            where: {
              role: Role.ADMIN,
              isActive: true,
            },
          });

        if (activeAdminCount <= 1) {
          return res.status(403).json({
            error: "LAST_ACTIVE_ADMIN",
            message:
              "The last active Administrator cannot be deactivated or removed from the Administrator role.",
          });
        }
      }

      if (
        resultingRole === Role.ADMIN &&
        resultingIsActive === false
      ) {
        const activeAdminCount =
          await getPrisma().user.count({
            where: {
              role: Role.ADMIN,
              isActive: true,
            },
          });

        if (activeAdminCount <= 1) {
          return res.status(403).json({
            error: "LAST_ACTIVE_ADMIN",
            message:
              "The last active Administrator cannot be deactivated.",
          });
        }
      }

      let normalizedEmail:
        | string
        | undefined;

      if (email !== undefined) {
        normalizedEmail =
          email.trim().toLowerCase();

        const emailOwner =
          await getPrisma().user.findFirst({
            where: {
              email: normalizedEmail,
              NOT: {
                id: userId,
              },
            },
            select: {
              id: true,
            },
          });

        if (emailOwner) {
          return res.status(409).json({
            error: "DUPLICATE_EMAIL",
            message:
              "A user with this email address already exists.",
          });
        }
      }

      const updateData: Prisma.UserUpdateInput = {};

      if (displayName !== undefined) {
        updateData.displayName =
          displayName.trim();
      }

      if (normalizedEmail !== undefined) {
        updateData.email = normalizedEmail;
      }

      if (role !== undefined) {
        updateData.role = role;
      }

      if (isActive !== undefined) {
        updateData.isActive = isActive;
      }

      const updatedUser =
        await getPrisma().user.update({
          where: {
            id: userId,
          },
          data: updateData,
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            mustChangePassword: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      return res.status(200).json({
        user: updatedUser,
      });
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return res.status(409).json({
          error: "DUPLICATE_EMAIL",
          message:
            "A user with this email address already exists.",
        });
      }

      console.error(
        "PATCH /api/admin/users/:id failed:",
        error,
      );

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Unable to update user.",
      });
    }
  },
);

// ---------------------------------------------------------------------------
// POST /api/admin/users/:id/initial-password
// Administrator User Management - Set Initial Password
// ---------------------------------------------------------------------------

adminUsersRouter.post(
  "/users/:id/initial-password",
  requireRole(Role.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);

      if (
        !Number.isInteger(userId) ||
        userId < 1
      ) {
        return res.status(404).json({
          error: "USER_NOT_FOUND",
          message: "User not found.",
        });
      }

      const {
        password,
      } = req.body ?? {};

      if (!isValidPassword(password)) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message:
            `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`,
        });
      }

      const existingUser =
        await getPrisma().user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        });

      if (!existingUser) {
        return res.status(404).json({
          error: "USER_NOT_FOUND",
          message: "User not found.",
        });
      }

      const passwordHash =
        await bcrypt.hash(password, 10);

      const updatedUser =
        await getPrisma().user.update({
          where: {
            id: userId,
          },

          data: {
            passwordHash,
            mustChangePassword: true,
          },

          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            mustChangePassword: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      return res.status(200).json({
        user: updatedUser,
      });
    } catch (error) {
      console.error(
        "POST /api/admin/users/:id/initial-password failed:",
        error,
      );

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message:
          "Unable to set initial password.",
      });
    }
  },
);
