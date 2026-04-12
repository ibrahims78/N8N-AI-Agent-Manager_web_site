const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

export const API_BASE = `${BASE_URL}/api`;

export function getAuthHeader(): Record<string, string> {
  try {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const parsed = JSON.parse(stored) as { state?: { token?: string } };
      const token = parsed?.state?.token;
      if (token) return { Authorization: `Bearer ${token}` };
    }
  } catch {}
  return {};
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...(options.headers as Record<string, string> || {}),
    },
    credentials: "include",
  });

  if (response.status === 401) {
    localStorage.removeItem("auth-storage");
    window.location.href = `${BASE_URL}/login`;
    throw new Error("Unauthorized");
  }

  const data = await response.json() as T;
  return data;
}
