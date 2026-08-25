import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";

interface NotificationRow {
  notification_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("notification_id, message, is_read, created_at")
      .eq("user_id", profile.user_id)
      .order("created_at", { ascending: false });
    setNotifications(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function markAsRead(notificationId: string) {
    // Optimistic update — flip locally immediately, then persist
    setNotifications((prev) =>
      prev.map((n) => (n.notification_id === notificationId ? { ...n, is_read: true } : n))
    );
    await supabase.from("notifications").update({ is_read: true }).eq("notification_id", notificationId);
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.notification_id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).in("notification_id", unreadIds);
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <header className="border-b border-primary-light px-8 py-6 bg-white flex items-center justify-between">
        <div>
          <p className="font-mono text-xs tracking-widest text-primary uppercase mb-1">
            Sierra Leone Immigration Department
          </p>
          <h1 className="font-display text-2xl">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-primary text-sm font-medium underline underline-offset-4"
          >
            Mark all as read
          </button>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-8 py-10">
        <SecurityPaperPanel>
          {loading ? (
            <p className="p-8 text-ink-soft text-sm">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="p-8 text-ink-soft text-sm text-center">No notifications yet.</p>
          ) : (
            <ul className="divide-y divide-primary-light/60">
              {notifications.map((n) => (
                <li
                  key={n.notification_id}
                  onClick={() => !n.is_read && markAsRead(n.notification_id)}
                  className={`p-5 flex items-start gap-3 ${!n.is_read ? "cursor-pointer hover:bg-primary-light/20" : ""} transition`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      n.is_read ? "bg-primary-light" : "bg-accent"
                    }`}
                  />
                  <div className="flex-1">
                    <p className={`text-sm ${n.is_read ? "text-ink-soft" : "text-ink font-medium"}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-ink-soft mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SecurityPaperPanel>
      </main>
    </div>
  );
}
