import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Plus, UserCheck, UserX, Trash2, KeyRound, Shield, Search, Pencil } from "lucide-react";
import { useGetUsers, useCreateUser, useUpdateUserStatus, useDeleteUser, useResetUserPassword, useUpdateUserPermissions, useUpdateUser, getGetUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeader } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";

const ALL_PERMISSIONS = [
  "view_workflows", "manage_workflows", "use_chat", "view_templates",
  "view_history", "manage_settings", "view_dashboard", "export_data",
  "import_workflows", "manage_notifications",
] as const;

interface User {
  id: number;
  username: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  permissions: Array<{ key: string; isEnabled: boolean }>;
}

export default function UsersPage() {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const authHeader = getAuthHeader();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ username: "", role: "user" });
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [formData, setFormData] = useState({ username: "", password: "", role: "user", permissions: [] as string[] });

  const { data: res, isLoading } = useGetUsers({
    request: { headers: authHeader },
    query: { queryKey: getGetUsersQueryKey() },
  } as Parameters<typeof useGetUsers>[0]);

  const { mutate: createUser } = useCreateUser({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() }); setShowCreateModal(false); setFormData({ username: "", password: "", role: "user", permissions: [] }); } },
    request: { headers: authHeader },
  } as Parameters<typeof useCreateUser>[0]);

  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() }); setEditUser(null); } },
    request: { headers: authHeader },
  } as Parameters<typeof useUpdateUser>[0]);

  const { mutate: updateStatus } = useUpdateUserStatus({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() }) },
    request: { headers: authHeader },
  } as Parameters<typeof useUpdateUserStatus>[0]);

  const { mutate: deleteUser } = useDeleteUser({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() }) },
    request: { headers: authHeader },
  } as Parameters<typeof useDeleteUser>[0]);

  const { mutate: resetPassword } = useResetUserPassword({
    mutation: {
      onSuccess: (data) => {
        const pwd = (data as { data?: { newPassword?: string } })?.data?.newPassword;
        if (pwd) setNewPassword(pwd);
      },
    },
    request: { headers: authHeader },
  } as Parameters<typeof useResetUserPassword>[0]);

  const { mutate: updatePerms } = useUpdateUserPermissions({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() }) },
    request: { headers: authHeader },
  } as Parameters<typeof useUpdateUserPermissions>[0]);

  const users: User[] = ((res as { data?: { users?: unknown[] } } | undefined)?.data?.users ?? []) as User[];
  const filtered = users.filter(u => {
    const matchSearch = !search || u.username.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openEditModal = (user: User) => {
    setEditUser(user);
    setEditForm({ username: user.username, role: user.role });
  };

  const handleEditSave = () => {
    if (!editUser) return;
    updateUser({ id: editUser.id.toString(), data: { username: editForm.username, role: editForm.role } } as Parameters<typeof updateUser>[0]);
  };

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "بحث..." : "Search..."}
              className="w-full ps-9 pe-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(["all", "admin", "user"] as const).map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${roleFilter === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {r === "all" ? (isRTL ? "الكل" : "All") : r === "admin" ? t("users.admin") : t("users.user")}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors"
        >
          <Plus size={16} />
          {t("users.addUser")}
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="h-8 w-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("users.username")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("users.role")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("users.status")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("users.lastLogin")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{isRTL ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {user.role === "admin" ? t("users.admin") : t("users.user")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-destructive/10 text-destructive"}`}>
                      {user.isActive ? t("users.active") : t("users.inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
                        title={isRTL ? "تعديل المستخدم" : "Edit user"}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => updateStatus({ id: user.id.toString(), isActive: !user.isActive } as Parameters<typeof updateStatus>[0])}
                        className={`p-1.5 rounded-md transition-colors ${user.isActive ? "text-yellow-500 hover:bg-yellow-50" : "text-emerald-500 hover:bg-emerald-50"}`}
                        title={user.isActive ? t("users.disable") : t("users.enable")}
                      >
                        {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                      <button
                        onClick={() => { setSelectedUser(user); }}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title={t("users.permissions")}
                      >
                        <Shield size={14} />
                      </button>
                      <button
                        onClick={() => resetPassword({ id: user.id.toString() } as Parameters<typeof resetPassword>[0])}
                        className="p-1.5 rounded-md text-accent hover:bg-accent/10 transition-colors"
                        title={t("users.resetPassword")}
                      >
                        <KeyRound size={14} />
                      </button>
                      <button
                        onClick={() => deleteUser({ id: user.id.toString() } as Parameters<typeof deleteUser>[0])}
                        className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl p-6 w-full max-w-md border border-border shadow-2xl">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t("users.addUser")}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{t("users.username")}</label>
                <input
                  value={formData.username}
                  onChange={e => setFormData(f => ({ ...f, username: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{t("auth.password")}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{t("users.role")}</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="user">{t("users.user")}</option>
                  <option value="admin">{t("users.admin")}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">{t("app.cancel")}</button>
              <button
                onClick={() => createUser({ username: formData.username, password: formData.password, role: formData.role } as Parameters<typeof createUser>[0])}
                className="flex-1 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors"
              >
                {t("users.addUser")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl p-6 w-full max-w-md border border-border shadow-2xl">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {isRTL ? "تعديل المستخدم" : "Edit User"}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              {isRTL ? `تعديل بيانات: ${editUser.username}` : `Editing: ${editUser.username}`}
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{t("users.username")}</label>
                <input
                  value={editForm.username}
                  onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{t("users.role")}</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="user">{t("users.user")}</option>
                  <option value="admin">{t("users.admin")}</option>
                </select>
              </div>
              <div className="pt-1">
                <p className="text-xs text-muted-foreground">
                  {isRTL
                    ? "لإعادة تعيين كلمة المرور، استخدم زر المفتاح في قائمة المستخدمين"
                    : "To reset the password, use the key button in the users list"}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditUser(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">{t("app.cancel")}</button>
              <button
                onClick={handleEditSave}
                disabled={isUpdating || !editForm.username.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {isUpdating ? (isRTL ? "جاري الحفظ..." : "Saving...") : t("app.save")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reset Password Result Modal */}
      {newPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl p-6 w-full max-w-sm border border-border shadow-2xl">
            <h2 className="text-lg font-semibold text-foreground mb-2">{t("users.resetPassword")}</h2>
            <p className="text-sm text-muted-foreground mb-4">{isRTL ? "كلمة المرور الجديدة (احفظها الآن، لن تُعرض مرة أخرى):" : "New password (save it now, it won't be shown again):"}</p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm text-foreground mb-4 text-center tracking-wider">{newPassword}</div>
            <button onClick={() => setNewPassword(null)} className="w-full px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors">{t("app.confirm")}</button>
          </motion.div>
        </div>
      )}

      {/* Permissions Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl p-6 w-full max-w-md border border-border shadow-2xl">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t("users.permissions")}: {selectedUser.username}</h2>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {ALL_PERMISSIONS.map(key => {
                const perm = selectedUser.permissions.find(p => p.key === key);
                return (
                  <label key={key} className="flex items-center justify-between py-2 border-b border-border/50 cursor-pointer">
                    <span className="text-sm text-foreground">{t(`users.permissionKeys.${key}` as Parameters<typeof t>[0])}</span>
                    <input
                      type="checkbox"
                      checked={perm?.isEnabled ?? false}
                      onChange={e => {
                        const updated = ALL_PERMISSIONS.map(k => ({
                          key: k,
                          enabled: k === key ? e.target.checked : (selectedUser.permissions.find(p => p.key === k)?.isEnabled ?? false),
                        }));
                        setSelectedUser(u => u ? { ...u, permissions: updated.map(p => ({ key: p.key, isEnabled: p.enabled })) } : null);
                      }}
                      className="w-4 h-4 accent-accent"
                    />
                  </label>
                );
              })}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setSelectedUser(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">{t("app.cancel")}</button>
              <button
                onClick={() => {
                  updatePerms({ id: selectedUser.id.toString(), permissions: selectedUser.permissions.map(p => ({ key: p.key, enabled: p.isEnabled })) } as Parameters<typeof updatePerms>[0]);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors"
              >
                {t("app.save")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
