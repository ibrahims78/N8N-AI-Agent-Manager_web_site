import "./i18n/config";
import { setBaseUrl, setAuthTokenGetter, setTokenRefreshCallback } from "@workspace/api-client-react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { useAuthStore } from "@/stores/useAuthStore";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// The generated API client paths already include /api/v1/ prefix.
// The Vite proxy rewrites /api/v1/ → /api/ for the Express server.
// Do NOT set a baseUrl — it would double-prefix the paths.
setBaseUrl(null);

setAuthTokenGetter(() => {
  try {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const parsed = JSON.parse(stored) as { state?: { token?: string } };
      return parsed?.state?.token ?? null;
    }
  } catch {}
  return null;
});

setTokenRefreshCallback(async () => {
  try {
    const resp = await fetch(`${BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (resp.ok) {
      const data = await resp.json() as { success?: boolean; data?: { accessToken?: string; user?: unknown } };
      const newToken = data?.data?.accessToken;
      if (newToken) {
        const { user, setAuth } = useAuthStore.getState();
        if (user) {
          setAuth(user, newToken);
        }
        return newToken;
      }
    }
  } catch {}
  localStorage.removeItem("auth-storage");
  window.location.href = `${BASE}/login`;
  return null;
});

createRoot(document.getElementById("root")!).render(<App />);
