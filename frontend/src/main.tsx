import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";

// 🚀 Instant PWA Update Engine
// Automatically checks for code updates, activates new service worker, and applies changes immediately
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // When a new build is detected on Vercel/production, immediately update & reload
    updateSW(true);
  },
  onOfflineReady() {
    console.log("⚡ SLID PWA is ready for offline operation.");
  },
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      // 1. Check for new updates every 30 seconds
      setInterval(() => {
        registration.update().catch((err) => console.debug("PWA update check failed:", err));
      }, 30 * 1000);

      // 2. Check for new updates immediately whenever user returns to the app / refocuses window
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          registration.update().catch((err) => console.debug("PWA visibility update check failed:", err));
        }
      });
    }
  },
});

// Auto-reload on controller change so updated code takes effect instantly across all views
let refreshing = false;
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
