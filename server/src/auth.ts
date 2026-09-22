import { Router, Request, Response } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { getPrisma } from "./prisma.js";

export const authRouter = Router();

// ---------------------------------------------------------------------------
// Session configuration
// ---------------------------------------------------------------------------

export const sessionMiddleware = session({
  secret:
    process.env.SESSION_SECRET ||
    "development-only-session-secret",

  resave: false,

  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 8,
  },
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

authRouter.post(
  "/login",
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const fields: Record<string, string> = {};

      if (
        typeof email !== "string" ||
        email.trim().length === 0
      ) {
        fields.email = "Email is required.";
      }

      if (
        typeof password !== "string" ||
        password.length === 0
      ) {
        fields.password = "Password is required.";
      }

      if (Object.keys(fields).length > 0) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Email and password are required.",
          fields,
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await getPrisma().user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          error: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        });
      }

      const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash,
      );

      if (!passwordMatches) {
        return res.status(401).json({
          error: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        });
      }

      req.session.userId = user.id;
      req.session.role = user.role;

      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        },
      });
    } catch (error) {
      console.error(
        "POST /api/auth/login failed:",
        error,
      );

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Unable to login.",
      });
    }
  },
);

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------

authRouter.post(
  "/logout",
  (req: Request, res: Response) => {
    req.session.destroy((error) => {
      if (error) {
        console.error(
          "POST /api/auth/logout failed:",
          error,
        );

        return res.status(500).json({
          error: "INTERNAL_ERROR",
          message: "Unable to logout.",
        });
      }

      res.clearCookie("connect.sid");

      return res.status(200).json({
        message: "Logged out successfully.",
      });
    });
  },
);

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------

authRouter.get(
  "/me",
  async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          error: "UNAUTHENTICATED",
          message: "You must be logged in.",
        });
      }

      const user = await getPrisma().user.findUnique({
        where: {
          id: req.session.userId,
        },

        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          mustChangePassword: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        req.session.destroy(() => undefined);

        return res.status(401).json({
          error: "UNAUTHENTICATED",
          message: "You must be logged in.",
        });
      }

      return res.status(200).json({
        user,
      });
    } catch (error) {
      console.error(
        "GET /api/auth/me failed:",
        error,
      );

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Unable to retrieve current user.",
      });
    }
  },
);

// ---------------------------------------------------------------------------
// POST /api/auth/change-password
// ---------------------------------------------------------------------------

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 100;

authRouter.post(
  "/change-password",
  async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          error: "UNAUTHENTICATED",
          message: "Authentication is required",
        });
      }

      const {
        currentPassword,
        newPassword,
      } = req.body ?? {};

      const fields: Record<string, string> = {};

      if (
        typeof currentPassword !== "string" ||
        currentPassword.length === 0
      ) {
        fields.currentPassword =
          "Current password is required.";
      }

      if (
        typeof newPassword !== "string" ||
        newPassword.length === 0
      ) {
        fields.newPassword =
          "New password is required.";
      }

      if (Object.keys(fields).length > 0) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "One or more fields are invalid.",
          fields,
        });
      }

      if (
        newPassword.length < PASSWORD_MIN_LENGTH ||
        newPassword.length > PASSWORD_MAX_LENGTH
      ) {
        return res.status(400).json({
          error: "INVALID_PASSWORD",
          code: "INVALID_PASSWORD",
          message:
            "New password does not meet the password requirements",
        });
      }

      const user = await getPrisma().user.findUnique({
        where: {
          id: req.session.userId,
        },
      });

      if (!user || !user.isActive) {
        req.session.destroy(() => undefined);

        return res.status(401).json({
          error: "UNAUTHENTICATED",
          message: "Authentication is required",
        });
      }

      const currentPasswordMatches =
        await bcrypt.compare(
          currentPassword,
          user.passwordHash,
        );

      if (!currentPasswordMatches) {
        return res.status(401).json({
          error: "CURRENT_PASSWORD_INCORRECT",
          code: "CURRENT_PASSWORD_INCORRECT",
          message: "Current password is incorrect",
        });
      }

      const newPasswordMatchesCurrent =
        await bcrypt.compare(
          newPassword,
          user.passwordHash,
        );

      if (newPasswordMatchesCurrent) {
        return res.status(400).json({
          error: "INVALID_PASSWORD",
          code: "INVALID_PASSWORD",
          message:
            "New password does not meet the password requirements",
        });
      }

      const passwordHash = await bcrypt.hash(
        newPassword,
        10,
      );

      await getPrisma().user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash,
          mustChangePassword: false,
        },
      });

      return res.status(200).json({
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error(
        "POST /api/auth/change-password failed:",
        error,
      );

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Unable to change password.",
      });
    }
  },
);