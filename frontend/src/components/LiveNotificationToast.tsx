import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

interface LiveAlert {
  id: string;
  title: string;
  message: string;
  link?: string;
  type: "visa" | "staff" | "security" | "system";
  timestamp: string;
}

export function LiveNotificationToast() {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);

  function addAlert(alert: Omit<LiveAlert, "id" | "timestamp">) {
    const newAlert: LiveAlert = {
      ...alert,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
    };

    setAlerts((prev) => [newAlert, ...prev.slice(0, 3)]);

    // Auto-dismiss after 7 seconds
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== newAlert.id));
    }, 7000);
  }

  useEffect(() => {
    if (!profile?.user_id) return;

    // 1. Listen for user-specific notifications
    const userChannel = supabase
      .channel(`user-notifications-${profile.user_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.user_id}`,
        },
        (payload) => {
          const newNotif = payload.new as any;
          addAlert({
            title: newNotif.title || "Notification Received",
            message: newNotif.message || "You have a new update on your immigration account.",
            link: "/notifications",
            type: "visa",
          });
        }
      )
      .subscribe();

    // 2. If Admin, listen for new staff clearance requests and submitted visas
    let adminChannel: any = null;
    if (profile.role === "admin") {
      adminChannel = supabase
        .channel("admin-live-feed")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "staff_access_requests",
          },
          (payload) => {
            const req = payload.new as any;
            addAlert({
              title: "New Officer Clearance Request",
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
            table: "visa_applications",
          },
          (payload) => {
            const app = payload.new as any;
            addAlert({
              title: "New Visa Application Submitted",
              message: `Application ${app.application_ref} received for ${app.visa_type} visa.`,
              link: "/visa-officer",
              type: "visa",
            });
          }
        )
        .subscribe();
    }

    // 3. If Visa Officer, listen for new submitted applications
    let officerChannel: any = null;
    if (profile.role === "visa_officer") {
      officerChannel = supabase
        .channel("visa-officer-live-feed")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "visa_applications",
          },
          (payload) => {
            const app = payload.new as any;
            addAlert({
              title: "New Application Pending Review",
              message: `Reference #${app.application_ref} is awaiting officer adjudication.`,
              link: `/visa-officer/review/${app.application_id}`,
              type: "visa",
            });
          }
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(userChannel);
      if (adminChannel) supabase.removeChannel(adminChannel);
      if (officerChannel) supabase.removeChannel(officerChannel);
    };
  }, [profile?.user_id, profile?.role]);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto bg-white border border-primary-light/90 rounded-xl p-4 shadow-xl text-ink font-body flex gap-3.5 items-start relative overflow-hidden"
        >
          {/* Tri-color Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 grid grid-cols-3">
            <div className="bg-[#1E8E5A]"></div>
            <div className="bg-white"></div>
            <div className="bg-[#0B4F6C]"></div>
          </div>

          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm mt-0.5 font-bold">
            {alert.type === "staff" ? "🛡️" : alert.type === "visa" ? "✈️" : "🔔"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-ink truncate">{alert.title}</p>
              <span className="text-[10px] text-ink-soft font-mono flex-shrink-0">{alert.timestamp}</span>
            </div>
            <p className="text-xs text-ink-soft mt-0.5 line-clamp-2 leading-relaxed">{alert.message}</p>

            {alert.link && (
              <div className="mt-2">
                <Link
                  to={alert.link}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-dark transition"
                >
                  View Details &rarr;
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
            className="text-ink-soft hover:text-ink text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
