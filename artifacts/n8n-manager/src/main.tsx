import "./i18n/config";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
setBaseUrl(`${BASE_URL}/api`);

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
