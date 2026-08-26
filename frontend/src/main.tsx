import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";

// 🚀 Automated PWA Instant Live Sync Engine
// Automatically checks for code updates, activates new service worker, and applies changes immediately
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // When a new build is detected on Vercel, immediately update & reload without prompt
    updateSW(true);
  },
  onOfflineReady() {
    console.log("⚡ SLID Portal is ready for offline operation.");
  },
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      // 1. Check for new updates every 15 seconds
      setInterval(() => {
        registration.update().catch(() => {});
      }, 15 * 1000);

      // 2. Check for new updates on window refocus, tab switch, and online event
      const checkUpdate = () => registration.update().catch(() => {});
      window.addEventListener("focus", checkUpdate);
      window.addEventListener("online", checkUpdate);
      window.addEventListener("pageshow", checkUpdate);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          checkUpdate();
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
