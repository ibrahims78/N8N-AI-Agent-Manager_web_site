import type { Request, Response, NextFunction } from "express";
import { db, userPermissionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyAccessToken, type TokenPayload } from "../services/auth.service";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: "INVALID_TOKEN", message: "Invalid or expired token" } });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } });
    return;
  }
  if (req.user.role !== "admin") {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required" } });
    return;
  }
  next();
}

export function requirePermission(permissionKey: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    if (req.user.role === "admin") {
      next();
      return;
    }

    try {
      const perms = await db
        .select()
        .from(userPermissionsTable)
        .where(eq(userPermissionsTable.userId, req.user.userId));

      const perm = perms.find(p => p.permissionKey === permissionKey);
      if (!perm || !perm.isEnabled) {
        res.status(403).json({
          success: false,
          error: {
            code: "PERMISSION_DENIED",
            message: `ليس لديك صلاحية للوصول إلى هذا المورد`,
          },
        });
        return;
      }

      next();
    } catch {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Permission check failed" } });
    }
  };
}
