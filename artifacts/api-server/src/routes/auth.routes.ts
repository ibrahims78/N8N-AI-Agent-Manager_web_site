import { Router } from "express";
import { db, usersTable, userPermissionsTable, ALL_PERMISSIONS } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  validatePasswordStrength,
} from "../services/auth.service";
import { authenticate } from "../middleware/auth.middleware";
import type { Request, Response } from "express";

const router = Router();

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) {
    res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "Username and password required" } });
    return;
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  const user = users[0];

  if (!user) {
    res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "اسم المستخدم أو كلمة المرور غير صحيحة" } });
    return;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    res.status(423).json({ success: false, error: { code: "ACCOUNT_LOCKED", message: `الحساب مقفل. حاول بعد ${remaining} دقيقة` } });
    return;
  }

  if (!user.isActive) {
    res.status(401).json({ success: false, error: { code: "ACCOUNT_DISABLED", message: "الحساب معطل. تواصل مع مدير النظام" } });
    return;
  }

  const passwordValid = await comparePassword(password, user.passwordHash);
  if (!passwordValid) {
    const newAttempts = user.failedLoginAttempts + 1;
    if (newAttempts >= 5) {
      await db.update(usersTable).set({
        failedLoginAttempts: newAttempts,
        lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
      }).where(eq(usersTable.id, user.id));
      res.status(423).json({ success: false, error: { code: "ACCOUNT_LOCKED", message: "تم قفل الحساب بسبب 5 محاولات فاشلة. حاول بعد 15 دقيقة" } });
    } else {
      await db.update(usersTable).set({ failedLoginAttempts: newAttempts }).where(eq(usersTable.id, user.id));
      res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: `اسم المستخدم أو كلمة المرور غير صحيحة. ${5 - newAttempts} محاولات متبقية` } });
    }
    return;
  }

  await db.update(usersTable).set({
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLogin: new Date(),
  }).where(eq(usersTable.id, user.id));

  const permissions = await db.select().from(userPermissionsTable).where(eq(userPermissionsTable.userId, user.id));

  const payload = { userId: user.id, username: user.username, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const requiresOnboarding = user.role === "admin" && !user.onboardingComplete;

  res.json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        forcePasswordChange: user.forcePasswordChange,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        permissions: permissions.map(p => ({ key: p.permissionKey, isEnabled: p.isEnabled })),
      },
      requiresPasswordChange: user.forcePasswordChange,
      requiresOnboarding,
    },
  });
});

router.post("/logout", (_req: Request, res: Response): void => {
  res.clearCookie("refresh_token");
  res.json({ success: true, message: "Logged out" });
});

router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refresh_token as string | undefined;
  if (!token) {
    res.status(401).json({ success: false, error: { code: "NO_REFRESH_TOKEN", message: "No refresh token" } });
    return;
  }

  try {
    const payload = verifyRefreshToken(token);
    const users = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    const user = users[0];
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, error: { code: "USER_INACTIVE", message: "User not found or inactive" } });
      return;
    }

    const newPayload = { userId: user.id, username: user.username, role: user.role };
    const accessToken = generateAccessToken(newPayload);
    const permissions = await db.select().from(userPermissionsTable).where(eq(userPermissionsTable.userId, user.id));

    res.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          forcePasswordChange: user.forcePasswordChange,
          permissions: permissions.map(p => ({ key: p.permissionKey, isEnabled: p.isEnabled })),
        },
      },
    });
  } catch {
    res.status(401).json({ success: false, error: { code: "INVALID_REFRESH_TOKEN", message: "Invalid refresh token" } });
  }
});

router.post("/change-password", authenticate, async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.user.userId)).limit(1);
  const user = users[0];
  if (!user) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }); return; }

  const passwordValid = await comparePassword(currentPassword, user.passwordHash);
  if (!passwordValid) {
    res.status(400).json({ success: false, error: { code: "WRONG_PASSWORD", message: "كلمة المرور الحالية غير صحيحة" } });
    return;
  }

  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    res.status(400).json({ success: false, error: { code: "WEAK_PASSWORD", message: validation.message } });
    return;
  }

  const newHash = await hashPassword(newPassword);
  await db.update(usersTable).set({
    passwordHash: newHash,
    forcePasswordChange: false,
  }).where(eq(usersTable.id, user.id));

  res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
});

router.get("/me", authenticate, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.user.userId)).limit(1);
  const user = users[0];
  if (!user) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }); return; }

  const permissions = await db.select().from(userPermissionsTable).where(eq(userPermissionsTable.userId, user.id));

  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      forcePasswordChange: user.forcePasswordChange,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      permissions: permissions.map(p => ({ key: p.permissionKey, isEnabled: p.isEnabled })),
    },
  });
});

export { router as authRouter };
