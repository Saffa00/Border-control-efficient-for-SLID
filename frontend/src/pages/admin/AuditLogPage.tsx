import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { GovHeader, GovFooter } from "../../components/GovHeader";
import { Search, Filter, ShieldCheck, FileSpreadsheet } from "lucide-react";

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
          e.details?.toLowerCase().includes(s) ||
          e.action.toLowerCase().includes(s)
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
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 font-sans flex flex-col justify-between">
      <GovHeader
        portalTitle="Directorate Headquarters"
        portalSubtitle="Immutable National Audit Trail"
        breadcrumbs={[
          { name: "Directorate", path: "/admin" },
          { name: "System Audit Logs" },
        ]}
      />

      <main id="main-content" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        <div className="border-b-2 border-zinc-900 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              National Administrative Audit Trail
            </h1>
            <p className="text-sm text-zinc-600 mt-1">
              Cryptographically signed, immutable ledger of all officer adjudications, account changes, and border checks.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#002B49] text-white px-3.5 py-2 rounded text-xs font-bold shrink-0">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Cryptographic Tamper-Proof</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-zinc-300 p-4 rounded-lg flex flex-col sm:flex-row items-center gap-3 shadow-xs">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-300 rounded focus:outline-none focus:border-[#002B49] focus:ring-2 focus:ring-[#002B49]"
              placeholder="Filter by officer name, email, IP address, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-[#002B49] shrink-0" />
            <select
              className="w-full sm:w-auto border border-zinc-300 rounded px-3 py-2 text-sm text-zinc-900 font-medium focus:outline-none focus:border-[#002B49] focus:ring-2 focus:ring-[#002B49]"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">All Event Types</option>
              {availableActions.map((a) => (
                <option key={a} value={a}>
                  {a.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white border border-zinc-300 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-3 flex items-center justify-between">
            <span>Audit Records ({entries.length})</span>
            <span className="text-xs text-zinc-500 font-normal">Showing latest 200 security events</span>
          </h2>

          {loading ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              <div className="w-8 h-8 border-4 border-[#002B49] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Querying security event ledger...
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm border-2 border-dashed border-zinc-300 rounded">
              No matching audit records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-900 bg-zinc-100 text-zinc-900 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Officer / Actor</th>
                    <th className="py-3 px-3">Action Event</th>
                    <th className="py-3 px-3">Target</th>
                    <th className="py-3 px-3">Details / Reason</th>
                    <th className="py-3 px-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {entries.map((e) => (
                    <tr key={e.audit_id} className="hover:bg-zinc-50 transition">
                      <td className="py-3 px-3 font-mono text-zinc-700 whitespace-nowrap">
                        {new Date(e.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-bold text-zinc-900">
                        {e.users?.full_name || "System Automated"}
                        {e.users?.email && <p className="text-[10px] text-zinc-500 font-normal">{e.users.email}</p>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-300">
                          {e.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-700">
                        {e.target_type} {e.target_id ? `(${e.target_id.slice(0, 8)})` : ""}
                      </td>
                      <td className="py-3 px-3 text-zinc-700 font-medium">
                        {e.details || "—"}
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-500">
                        {e.ip_address || "Internal"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <GovFooter />
    </div>
  );
}
