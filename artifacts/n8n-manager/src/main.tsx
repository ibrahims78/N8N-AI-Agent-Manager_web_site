import "./i18n/config";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

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

createRoot(document.getElementById("root")!).render(<App />);
