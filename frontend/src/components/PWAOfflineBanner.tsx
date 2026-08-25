import { useState, useEffect } from "react";

export function PWAOfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setShowRestored(true);
      setTimeout(() => setShowRestored(false), 3500);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <aside
      aria-label="Network Status"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 animate-slide-down"
    >
      {!isOnline ? (
        <div className="bg-amber-600/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-amber-400/50">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>📡 Offline Mode — Showing Cached Immigration Records</span>
        </div>
      ) : showRestored ? (
        <div className="bg-emerald-600/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-emerald-400/50">
          <span>✓ Internet Connection Restored — Live Sync Active</span>
        </div>
      ) : null}
    </aside>
  );
}
