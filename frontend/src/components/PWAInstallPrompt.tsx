import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running in installed standalone mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIPhoneOrIPad = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIPhoneOrIPad);

    // Standard PWA Install event for Chrome, Android, Edge, Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Don't show immediately if user recently dismissed
      const dismissedUntil = localStorage.getItem("slid_pwa_dismissed");
      if (!dismissedUntil || Date.now() > parseInt(dismissedUntil, 10)) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // App installed event
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem("slid_pwa_installed", "true");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSTip(true);
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error("PWA install error:", err);
    }
  }

  function handleDismiss() {
    setShowPrompt(false);
    setShowIOSTip(false);
    // Dismiss for 7 days
    localStorage.setItem("slid_pwa_dismissed", (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
  }

  if (isStandalone) return null;

  return (
    <>
      {/* 1. Android / Desktop / Chrome Native Install Banner */}
      {showPrompt && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-fade-in">
          <div className="bg-[#0B4F6C]/95 backdrop-blur-md border border-[#1E8E5A]/40 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3.5">
            {/* App Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E8E5A] to-[#0B4F6C] p-0.5 flex-shrink-0 shadow-md">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center p-1">
                <img src="/slid-logo.png" alt="SLID Crest" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h4 className="text-sm font-bold truncate text-white">SLID Official App</h4>
                <span className="bg-[#1E8E5A] text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-white">
                  Fast & Offline
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1">
                Install for instant passport & visa clearance access
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="bg-[#1E8E5A] hover:bg-[#157347] active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-md cursor-pointer"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. iOS Safari Add to Home Screen Instructions Modal */}
      {showIOSTip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#1C2430] border border-slate-700 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                <h3 className="text-base font-bold">Install on iPhone / iPad</h3>
              </div>
              <button onClick={() => setShowIOSTip(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <ol className="text-xs text-slate-300 space-y-3 mb-6">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1E8E5A] text-white flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white">Share</strong> button (
                  <span className="text-blue-400 font-mono">⎋</span> or box with arrow) in Safari's toolbar.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1E8E5A] text-white flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <span>
                  Scroll down and select <strong className="text-white">"Add to Home Screen ➕"</strong>.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1E8E5A] text-white flex items-center justify-center font-bold text-[10px]">
                  3
                </span>
                <span>
                  Tap <strong className="text-white">Add</strong> in the top right corner to launch as a standalone app!
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSTip(false)}
              className="w-full bg-[#1E8E5A] hover:bg-[#157347] text-white text-xs font-bold py-2.5 rounded-xl transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
