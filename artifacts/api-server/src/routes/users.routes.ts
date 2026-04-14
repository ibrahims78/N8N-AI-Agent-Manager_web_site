import { Router } from "express";
import { db, usersTable, userPermissionsTable, ALL_PERMISSIONS } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { hashPassword } from "../services/auth.service";
import { logAudit } from "../lib/auditLog";
import { logger } from "../lib/logger";
import type { Request, Response } from "express";

const router = Router();

function generatePassword(): string {
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%";
  const all = upper + lower + digits + special;
  let pass = upper[Math.floor(Math.random() * upper.length)]!;
  pass += lower[Math.floor(Math.random() * lower.length)]!;
  pass += digits[Math.floor(Math.random() * digits.length)]!;
  pass += special[Math.floor(Math.random() * special.length)]!;
  for (let i = 4; i < 12; i++) {
    pass += all[Math.floor(Math.random() * all.length)]!;
  }
  return pass.split("").sort(() => Math.random() - 0.5).join("");
}

router.get("/", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await db.select({
      id: usersTable.id,
      username: usersTable.username,
      role: usersTable.role,
      isActive: usersTable.isActive,
      forcePasswordChange: usersTable.forcePasswordChange,
      lastLogin: usersTable.lastLogin,
      createdAt: usersTable.createdAt,
    }).from(usersTable);

    const usersWithPermissions = await Promise.all(users.map(async u => {
      const perms = await db.select().from(userPermissionsTable).where(eq(userPermissionsTable.userId, u.id));
      return { ...u, permissions: perms.map(p => ({ key: p.permissionKey, isEnabled: p.isEnabled })) };
    }));

    res.json({ success: true, data: { users: usersWithPermissions, total: usersWithPermissions.length } });
  } catch (err) {
    logger.error({ err }, "GET /users failed");
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: String(err) } });
  }
});

router.post("/", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const { username, password, role, permissions } = req.body as {
    username: string;
    password: string;
    role?: string;
    permissions?: string[];
  };

  if (!username || !password) {
    res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "اسم المستخدم وكلمة المرور مطلوبان" } });
    return;
  }

  if (username.trim().length < 3) {
    res.status(400).json({ success: false, error: { code: "INVALID_USERNAME", message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" } });
    return;
  }

  const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, username.trim())).limit(1);
  if (existing[0]) {
    res.status(400).json({ success: false, error: { code: "USERNAME_EXISTS", message: "اسم المستخدم موجود مسبقاً" } });
    return;
  }

  const hash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    username: username.trim(),
    passwordHash: hash,
    role: role === "admin" ? "admin" : "user",
    isActive: true,
    forcePasswordChange: true,
  }).returning();

  if (user) {
    const enabledPerms = permissions ?? [];
    await db.insert(userPermissionsTable).values(
      ALL_PERMISSIONS.map(key => ({
        userId: user.id,
        permissionKey: key,
        isEnabled: enabledPerms.includes(key),
      }))
    );

    await logAudit(req.user.userId, "CREATE_USER", "user", user.id, { username: user.username, role: user.role }, req);
  }

  res.status(201).json({ success: true, data: user });
});

router.put("/:id", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid user ID" } }); return; }

  const { username, role, password } = req.body as { username?: string; role?: string; password?: string };
  const update: Partial<typeof usersTable.$inferInsert> = {};
  if (username) update.username = username.trim();
  if (role && (role === "admin" || role === "user")) update.role = role;
  if (password && password.length >= 6) update.passwordHash = await hashPassword(password);

  if (Object.keys(update).length > 0) {
    await db.update(usersTable).set(update).where(eq(usersTable.id, userId));
    const auditData: Record<string, unknown> = { ...update };
    if (auditData.passwordHash) auditData.passwordHash = "[CHANGED]";
    await logAudit(req.user.userId, "UPDATE_USER", "user", userId, auditData, req);
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  res.json({ success: true, data: users[0] });
});

router.delete("/:id", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid user ID" } }); return; }

  if (userId === req.user.userId) {
    res.status(400).json({ success: false, error: { code: "CANNOT_DELETE_SELF", message: "لا يمكنك حذف حسابك الخاص" } });
    return;
  }

  const target = await db.select({ username: usersTable.username }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!target[0]) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "المستخدم غير موجود" } });
    return;
  }

  await db.delete(userPermissionsTable).where(eq(userPermissionsTable.userId, userId));
  await db.delete(usersTable).where(eq(usersTable.id, userId));
  await logAudit(req.user.userId, "DELETE_USER", "user", userId, { deletedUsername: target[0].username }, req);

  res.json({ success: true, message: "تم حذف المستخدم بنجاح" });
});

router.put("/:id/status", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid user ID" } }); return; }

  if (userId === req.user.userId) {
    res.status(400).json({ success: false, error: { code: "CANNOT_DISABLE_SELF", message: "لا يمكنك تعطيل حسابك الخاص" } });
    return;
  }

  const { isActive } = req.body as { isActive: boolean };
  if (typeof isActive !== "boolean") {
    res.status(400).json({ success: false, error: { code: "INVALID_STATUS", message: "isActive must be a boolean" } });
    return;
  }

  await db.update(usersTable).set({ isActive }).where(eq(usersTable.id, userId));
  await logAudit(req.user.userId, isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER", "user", userId, { isActive }, req);

  res.json({ success: true, message: isActive ? "تم تفعيل الحساب" : "تم تعطيل الحساب" });
});

router.put("/:id/permissions", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid user ID" } }); return; }

  const { permissions } = req.body as { permissions: Array<{ key: string; enabled?: boolean; isEnabled?: boolean }> };
  if (!Array.isArray(permissions)) {
    res.status(400).json({ success: false, error: { code: "INVALID_PERMISSIONS", message: "permissions must be an array" } });
    return;
  }

  for (const perm of permissions) {
    if (!ALL_PERMISSIONS.includes(perm.key as (typeof ALL_PERMISSIONS)[number])) continue;
    const enabledValue = perm.enabled !== undefined ? perm.enabled : (perm.isEnabled ?? false);

    const existing = await db.select({ id: userPermissionsTable.id })
      .from(userPermissionsTable)
      .where(and(
        eq(userPermissionsTable.userId, userId),
        eq(userPermissionsTable.permissionKey, perm.key)
      ))
      .limit(1);

    if (existing.length > 0) {
      await db.update(userPermissionsTable)
        .set({ isEnabled: enabledValue })
        .where(and(
          eq(userPermissionsTable.userId, userId),
          eq(userPermissionsTable.permissionKey, perm.key)
        ));
    } else {
      await db.insert(userPermissionsTable).values({
        userId,
        permissionKey: perm.key,
        isEnabled: enabledValue,
      });
    }
  }

  await logAudit(req.user.userId, "UPDATE_PERMISSIONS", "user", userId, {
    permissionsChanged: permissions.filter(p => (p.enabled ?? p.isEnabled)).map(p => p.key),
  }, req);

  res.json({ success: true, message: "تم تحديث الصلاحيات بنجاح" });
});

router.post("/:id/reset-password", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid user ID" } }); return; }

  const target = await db.select({ username: usersTable.username }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!target[0]) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "المستخدم غير موجود" } });
    return;
  }

  const newPassword = generatePassword();
  const hash = await hashPassword(newPassword);

  await db.update(usersTable).set({
    passwordHash: hash,
    forcePasswordChange: true,
  }).where(eq(usersTable.id, userId));

  await logAudit(req.user.userId, "RESET_PASSWORD", "user", userId, { targetUsername: target[0].username }, req);

  res.json({ success: true, data: { newPassword } });
});

export { router as usersRouter };
