import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { OfficerNavbar } from "../../components/OfficerNavbar";

interface OverstayRow {
  passport_id: string;
  passport_number: string;
  full_name: string;
  entry_at: string;
  entry_checkpoint: string;
  authorization_expiry: string;
  days_overstayed: number;
}

type SortKey = "days_overstayed" | "entry_at";

export default function OverstayReportPage() {
  const [rows, setRows] = useState<OverstayRow[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("days_overstayed");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Queries the overstaying_travelers view directly — no extra logic
      // needed here, the SQL view does the entry/exit/expiry matching.
      const { data } = await supabase
        .from("overstaying_travelers")
        .select("*")
        .order(sortKey, { ascending: false });
      setRows(data ?? []);
      setLoading(false);
    }
    load();
  }, [sortKey]);

  const filtered = rows.filter(
    (r) =>
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.passport_number.toLowerCase().includes(search.toLowerCase())
  );

  function severityStyle(days: number) {
    if (days > 30) return "text-status-rejected bg-status-rejected-bg";
    if (days > 7) return "text-status-pending bg-status-pending-bg";
    return "text-ink-soft bg-primary-light";
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <OfficerNavbar title="Overstay Enforcement Console" />

      <main className="max-w-4xl mx-auto px-8 py-10 grid gap-6">
        <div className="flex items-center justify-between gap-4">
          <input
            className="flex-1 border border-primary-light rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="Search by name or passport number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-primary-light rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="days_overstayed">Sort: days overstayed</option>
            <option value="entry_at">Sort: entry date</option>
          </select>
        </div>

        <SecurityPaperPanel>
          <div className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3 border-b border-primary-light bg-primary-light/40 text-xs font-medium uppercase tracking-wide text-ink-soft">
            <span>{filtered.length} traveler{filtered.length !== 1 ? "s" : ""} currently overstaying</span>
          </div>

          {loading ? (
            <p className="p-8 text-ink-soft text-sm">Loading report...</p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-ink-soft text-sm text-center">
              {search ? "No matching travelers." : "No travelers are currently overstaying."}
            </p>
          ) : (
            <ul className="divide-y divide-primary-light/60">
              {filtered.map((row) => (
                <li key={row.passport_id} className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{row.full_name}</p>
                    <p className="font-mono text-xs text-primary mt-0.5">{row.passport_number}</p>
                    <p className="text-xs text-ink-soft mt-1">
                      Entered {new Date(row.entry_at).toLocaleDateString()} via {row.entry_checkpoint} ·
                      Authorization expired {new Date(row.authorization_expiry).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${severityStyle(row.days_overstayed)}`}
                  >
                    {row.days_overstayed}d overstayed
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SecurityPaperPanel>
      </main>
    </div>
  );
}
