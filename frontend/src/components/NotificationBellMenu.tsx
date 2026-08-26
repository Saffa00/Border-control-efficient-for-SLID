import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, ShieldAlert, FileText, UserPlus, ChevronRight, Volume2, VolumeX, Smartphone } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string;
  type: "staff" | "visa" | "border" | "system";
  timestamp: string;
  read: boolean;
}

export function NotificationBellMenu() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Play subtle chime sound and vibrate mobile phone
  function playChimeAndVibrate() {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch {}
    }

    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {}
  }

  // Send real phone / device notification
  function sendDeviceNotification(title: string, body: string, link?: string) {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          const n = new Notification(title, {
            body,
            icon: "/slid-logo.png",
            badge: "/slid-logo.png",
            tag: `slid-alert-${Date.now()}`,
          });
          if (link) {
            n.onclick = () => {
              window.focus();
              window.location.href = link;
            };
          }
        } catch (e) {
          console.warn("Native notification dispatch error:", e);
        }
      }
    }
    playChimeAndVibrate();
  }

  function addNotification(item: Omit<NotificationItem, "id" | "timestamp" | "read">) {
    const newItem: NotificationItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };

    setNotifications((prev) => [newItem, ...prev.filter((p) => p.title !== item.title).slice(0, 19)]);
    sendDeviceNotification(item.title, item.message, item.link);
  }

  async function requestPushPermission() {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const res = await Notification.requestPermission();
        setPermission(res);
        if (res === "granted") {
          sendDeviceNotification("SLID Alerts Activated", "Real-time officer & application alerts will now show on your phone.");
        }
      } catch (err) {
        console.warn("Push permission request notice:", err);
      }
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial notifications immediately on mount
  useEffect(() => {
    if (!profile?.user_id) return;

    async function loadInitialAlerts() {
      const initialList: NotificationItem[] = [];

      // If Admin, query recent pending staff requests and visa applications
      if (profile?.role === "admin") {
        try {
          // 1. Pending Staff Requests
          const { data: staffReqs } = await supabase
            .from("staff_access_requests")
            .select("request_id, full_name, requested_role, created_at, status")
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(5);

          if (staffReqs && staffReqs.length > 0) {
            for (const r of staffReqs) {
              initialList.push({
                id: `req-${r.request_id}`,
                title: "Pending Staff Application",
                message: `${r.full_name} applied for ${r.requested_role?.replace("_", " ")}. Click to review and approve.`,
                link: "/admin/users",
                type: "staff",
                timestamp: new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                read: false,
              });
            }
          }

          // 2. Pending Inactive Users
          const { data: inactiveUsers } = await supabase
            .from("users")
            .select("user_id, full_name, role, created_at")
            .eq("is_active", false)
            .neq("role", "applicant")
            .limit(5);

          if (inactiveUsers && inactiveUsers.length > 0) {
            for (const u of inactiveUsers) {
              if (!initialList.some((n) => n.message.includes(u.full_name))) {
                initialList.push({
                  id: `user-${u.user_id}`,
                  title: "Staff Clearance Required",
                  message: `${u.full_name} registered as ${u.role?.replace("_", " ")}. Awaiting clearance.`,
                  link: "/admin/users",
                  type: "staff",
                  timestamp: new Date(u.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  read: false,
                });
              }
            }
          }

          // 3. Recent Visa Applications
          const { data: visas } = await supabase
            .from("visa_applications")
            .select("application_ref, visa_type, created_at")
            .order("created_at", { ascending: false })
            .limit(3);

          if (visas && visas.length > 0) {
            for (const v of visas) {
              initialList.push({
                id: `visa-${v.application_ref}`,
                title: "Visa Application Received",
                message: `Ref: ${v.application_ref} (${v.visa_type}) submitted for adjudication.`,
                link: "/visa-officer",
                type: "visa",
                timestamp: new Date(v.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                read: true,
              });
            }
          }
        } catch (e) {
          console.warn("Initial alerts load notice:", e);
        }
      }

      // Add system greeting
      initialList.push({
        id: "system-active",
        title: "SLID Security System Active",
        message: `Welcome, ${profile?.full_name}. Real-time monitoring is active.`,
        type: "system",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: true,
      });

      setNotifications(initialList);
    }

    loadInitialAlerts();

    // Set up Real-time Channels
    let adminChannel: any = null;
    if (profile.role === "admin") {
      adminChannel = supabase
        .channel("admin-realtime-broadcast")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "staff_access_requests",
          },
          (payload) => {
            const req = payload.new as any;
            addNotification({
              title: "New Staff Registration Request",
              message: `${req.full_name} submitted an access request for ${req.requested_role?.replace("_", " ")}.`,
              link: "/admin/users",
              type: "staff",
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "users",
          },
          (payload) => {
            const user = payload.new as any;
            if (!user.is_active && user.role !== "applicant") {
              addNotification({
                title: "New Officer Registration",
                message: `${user.full_name} requested ${user.role?.replace("_", " ")} clearance.`,
                link: "/admin/users",
                type: "staff",
              });
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "visa_applications",
          },
          (payload) => {
            const app = payload.new as any;
            addNotification({
              title: "New Visa Application Filed",
              message: `Application (${app.application_ref || "New Ref"}) filed for entry visa.`,
              link: "/visa-officer",
              type: "visa",
            });
          }
        )
        .subscribe();
    }

    return () => {
      if (adminChannel) supabase.removeChannel(adminChannel);
    };
  }, [profile]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) markAllRead();
        }}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-canvas hover:bg-zinc-100 border border-primary-light/70 text-ink flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40"
        title="Notifications & Live Alerts"
        aria-label="Notifications"
      >
        <Bell size={18} className={unreadCount > 0 ? "text-primary animate-bounce" : "text-ink-soft"} />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[310px] sm:w-[380px] bg-white border border-primary-light rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up font-['Tahoma']">
          {/* Header */}
          <div className="bg-[#0B4F6C] text-white px-4 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <Bell size={16} />
              <span className="text-xs font-bold">Live Alerts &amp; Notifications</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition"
                title={soundEnabled ? "Sound Enabled" : "Sound Muted"}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
              <button
                type="button"
                onClick={markAllRead}
                className="text-[10px] text-white/90 hover:text-white font-semibold underline cursor-pointer"
              >
                Mark Read
              </button>
            </div>
          </div>

          {/* Tri-color Accent */}
          <div className="h-1 w-full grid grid-cols-3">
            <div className="bg-[#1EB53A]"></div>
            <div className="bg-white"></div>
            <div className="bg-[#0072C6]"></div>
          </div>

          {/* Device Push Permission Prompt if not granted */}
          {permission !== "granted" && (
            <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-950">
                <Smartphone size={15} className="text-amber-700 flex-shrink-0" />
                <span>Enable phone lockscreen alerts</span>
              </div>
              <button
                type="button"
                onClick={requestPushPermission}
                className="bg-[#1E8E5A] hover:bg-[#166E46] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer shadow-xs"
              >
                Allow
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-primary-light/40">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-soft">
                No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  to={n.link || "#"}
                  onClick={() => setIsOpen(false)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-canvas transition block ${
                    !n.read ? "bg-sky-50/70" : ""
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl flex-shrink-0 text-white ${
                      n.type === "staff"
                        ? "bg-purple-600"
                        : n.type === "visa"
                        ? "bg-[#0B4F6C]"
                        : "bg-[#1E8E5A]"
                    }`}
                  >
                    {n.type === "staff" ? (
                      <UserPlus size={15} />
                    ) : n.type === "visa" ? (
                      <FileText size={15} />
                    ) : (
                      <ShieldAlert size={15} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-ink truncate">{n.title}</h4>
                      <span className="text-[9px] text-ink-soft font-mono flex-shrink-0">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-ink-soft leading-snug line-clamp-2">{n.message}</p>
                  </div>

                  {n.link && <ChevronRight size={14} className="text-zinc-400 self-center flex-shrink-0" />}
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 bg-canvas/70 border-t border-primary-light text-center">
            <span className="text-[10px] text-ink-soft font-medium">
              Live updates synced with Supabase Realtime
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
