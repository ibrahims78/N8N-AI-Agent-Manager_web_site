import { Router } from "express";
import { db, usersTable, userPermissionsTable, ALL_PERMISSIONS } from "@workspace/db";
import { eq, ne } from "drizzle-orm";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { hashPassword } from "../services/auth.service";
import type { Request, Response } from "express";

const router = Router();

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let pass = "";
  for (let i = 0; i < 12; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

router.get("/", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
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
});

router.post("/", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { username, password, role, permissions } = req.body as {
    username: string;
    password: string;
    role: string;
    permissions?: string[];
  };

  if (!username || !password) {
    res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "Username and password required" } });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (existing[0]) {
    res.status(400).json({ success: false, error: { code: "USERNAME_EXISTS", message: "اسم المستخدم موجود مسبقاً" } });
    return;
  }

  const hash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    username,
    passwordHash: hash,
    role: role ?? "user",
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
  }

  res.json({ success: true, data: user });
});

router.put("/:id", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id, 10);
  const { username, role } = req.body as { username?: string; role?: string };

  const update: Partial<typeof usersTable.$inferInsert> = {};
  if (username) update.username = username;
  if (role) update.role = role;

  if (Object.keys(update).length > 0) {
    await db.update(usersTable).set(update).where(eq(usersTable.id, userId));
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  res.json({ success: true, data: users[0] });
});

router.delete("/:id", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const userId = parseInt(req.params.id, 10);
  if (userId === req.user.userId) {
    res.status(400).json({ success: false, error: { code: "CANNOT_DELETE_SELF", message: "لا يمكنك حذف حسابك الخاص" } });
    return;
  }

  await db.delete(usersTable).where(eq(usersTable.id, userId));
  res.json({ success: true, message: "User deleted" });
});

router.put("/:id/status", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const userId = parseInt(req.params.id, 10);
  if (userId === req.user.userId) {
    res.status(400).json({ success: false, error: { code: "CANNOT_DISABLE_SELF", message: "لا يمكنك تعطيل حسابك الخاص" } });
    return;
  }

  const { isActive } = req.body as { isActive: boolean };
  await db.update(usersTable).set({ isActive }).where(eq(usersTable.id, userId));
  res.json({ success: true, message: `User ${isActive ? "activated" : "deactivated"}` });
});

router.put("/:id/permissions", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id, 10);
  const { permissions } = req.body as { permissions: Array<{ key: string; enabled: boolean }> };

  for (const perm of permissions) {
    const existing = await db.select().from(userPermissionsTable)
      .where(eq(userPermissionsTable.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db.update(userPermissionsTable)
        .set({ isEnabled: perm.enabled })
        .where(eq(userPermissionsTable.userId, userId));
    } else {
      await db.insert(userPermissionsTable).values({
        userId,
        permissionKey: perm.key,
        isEnabled: perm.enabled,
      });
    }
  }

  res.json({ success: true, message: "Permissions updated" });
});

router.post("/:id/reset-password", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id, 10);
  const newPassword = generatePassword();
  const hash = await hashPassword(newPassword);

  await db.update(usersTable).set({
    passwordHash: hash,
    forcePasswordChange: true,
  }).where(eq(usersTable.id, userId));

  res.json({ success: true, data: { newPassword } });
});

export { router as usersRouter };
