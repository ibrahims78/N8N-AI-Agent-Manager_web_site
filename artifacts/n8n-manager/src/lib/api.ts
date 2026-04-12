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

async function tryRefreshToken(): Promise<string | null> {
  try {
    const resp = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (resp.ok) {
      const data = await resp.json() as { success?: boolean; data?: { accessToken?: string } };
      const newToken = data?.data?.accessToken;
      if (newToken) {
        try {
          const stored = localStorage.getItem("auth-storage");
          if (stored) {
            const parsed = JSON.parse(stored) as { state?: Record<string, unknown>; version?: number };
            if (parsed.state) {
              parsed.state.token = newToken;
              localStorage.setItem("auth-storage", JSON.stringify(parsed));
            }
          }
        } catch {}
        return newToken;
      }
    }
  } catch {}
  return null;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const makeRequest = (authHeader: Record<string, string>) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
        ...(options.headers as Record<string, string> || {}),
      },
      credentials: "include",
    });

  let response = await makeRequest(getAuthHeader());

  if (response.status === 401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      response = await makeRequest({ Authorization: `Bearer ${newToken}` });
    }
    if (response.status === 401) {
      localStorage.removeItem("auth-storage");
      window.location.href = `${BASE_URL}/login`;
      throw new Error("Unauthorized");
    }
  }

  const data = await response.json() as T;
  return data;
}
