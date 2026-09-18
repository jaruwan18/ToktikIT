import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { getPrisma } from "./prisma.js";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.session.userId) {
    return res.status(401).json({
      error: "UNAUTHENTICATED",
      message: "You must be logged in.",
    });
  }

  return next();
}

export function requireRole(...allowedRoles: Role[]) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
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
          role: true,
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

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          error: "FORBIDDEN",
          message: "You do not have permission to access this resource.",
        });
      }

      req.session.role = user.role;

      return next();
    } catch (error) {
      console.error("Authorization failed:", error);

      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Unable to verify authorization.",
      });
    }
  };
}