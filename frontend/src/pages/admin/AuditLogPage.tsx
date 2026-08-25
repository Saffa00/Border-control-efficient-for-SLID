import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { AdminNavbar } from "../../components/AdminNavbar";

interface AuditEntry {
  audit_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
  users: { full_name: string; email: string } | null;
}

const ACTION_STYLES: Record<string, string> = {
  staff_account_created: "text-status-approved bg-status-approved-bg",
  user_updated: "text-primary bg-primary-light",
};

function actionStyle(action: string) {
  return ACTION_STYLES[action] ?? "text-ink-soft bg-primary-light";
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadEntries() {
    setLoading(true);
    let query = supabase
      .from("admin_audit_log")
      .select("audit_id, action, target_type, target_id, details, ip_address, created_at, users(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (actionFilter !== "all") query = query.eq("action", actionFilter);

    const { data } = await query;
    let results = (data as any) ?? [];

    if (search.trim()) {
      const s = search.toLowerCase();
      results = results.filter(
        (e: AuditEntry) =>
          e.users?.full_name?.toLowerCase().includes(s) ||
          e.users?.email?.toLowerCase().includes(s) ||
          e.details?.toLowerCase().includes(s)
      );
    }

    setEntries(results);
    setLoading(false);
  }

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, actionFilter]);

  useEffect(() => {
    supabase
      .from("admin_audit_log")
      .select("action")
      .then(({ data }) => {
        const unique = Array.from(new Set((data ?? []).map((d) => d.action)));
        setAvailableActions(unique);
      });
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <AdminNavbar />

      <main className="max-w-6xl mx-auto px-6 py-8 grid gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Administrative Audit Log</h1>
          <p className="text-sm text-ink-soft">
            Immutable, read-only audit records tracking every officer action and administrative change.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            className="flex-1 border border-primary-light rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="Search by actor name, email, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-primary-light rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">All actions</option>
            {availableActions.map((a) => (
              <option key={a} value={a}>
                {a.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <SecurityPaperPanel>
          {loading ? (
            <p className="p-8 text-ink-soft text-sm">Loading audit log...</p>
          ) : entries.length === 0 ? (
            <p className="p-8 text-ink-soft text-sm text-center">No matching entries.</p>
          ) : (
            <ul className="divide-y divide-primary-light/60">
              {entries.map((e) => (
                <li key={e.audit_id} className="p-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium uppercase tracking-wide px-2.5 py-1 rounded-full ${actionStyle(e.action)}`}
                      >
                        {e.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-ink-soft">
                        on {e.target_type}
                        {e.target_id ? ` · ${e.target_id.slice(0, 8)}...` : ""}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">{e.users?.full_name ?? "Unknown user"}</span>
                      <span className="text-ink-soft"> ({e.users?.email})</span>
                    </p>
                    {e.details && (
                      <p className="text-xs text-ink-soft font-mono mt-1 break-all">{e.details}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-mono text-ink-soft">
                      {new Date(e.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs font-mono text-ink-soft">
                      {new Date(e.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SecurityPaperPanel>

        <p className="text-xs text-ink-soft text-center">
          Showing up to 200 most recent entries.
        </p>
      </main>
    </div>
  );
}
