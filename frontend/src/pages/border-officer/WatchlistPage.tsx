import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";

interface WatchlistEntry {
  watchlist_id: string;
  passport_number: string;
  full_name: string | null;
  reason: string;
  risk_level: "low" | "medium" | "high";
  added_at: string;
}

const RISK_BADGE = {
  low: "text-status-approved bg-status-approved-bg",
  medium: "text-status-pending bg-status-pending-bg",
  high: "text-status-rejected bg-status-rejected-bg",
};

export default function WatchlistPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    passportNumber: "",
    fullName: "",
    reason: "",
    riskLevel: "medium" as "low" | "medium" | "high",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadEntries() {
    setLoading(true);
    let query = supabase
      .from("watchlist")
      .select("watchlist_id, passport_number, full_name, reason, risk_level, added_at")
      .order("added_at", { ascending: false });

    if (search.trim()) {
      query = query.or(`passport_number.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data } = await query;
    setEntries(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleAddEntry() {
    setError(null);
    if (!form.passportNumber || !form.reason) {
      setError("Passport number and reason are required.");
      return;
    }
    setSubmitting(true);

    const { error: insertError } = await supabase.from("watchlist").insert({
      passport_number: form.passportNumber,
      full_name: form.fullName || null,
      reason: form.reason,
      risk_level: form.riskLevel,
      added_by: profile?.user_id,
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setForm({ passportNumber: "", fullName: "", reason: "", riskLevel: "medium" });
    setShowAddForm(false);
    setSubmitting(false);
    loadEntries();
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <header className="border-b border-primary-light px-8 py-6 bg-white">
        <p className="font-mono text-xs tracking-widest text-primary uppercase mb-1">
          Sierra Leone Immigration Department
        </p>
        <h1 className="font-display text-2xl">Watchlist</h1>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-10 grid gap-6">
        <div className="flex items-center justify-between gap-4">
          <input
            className="flex-1 border border-primary-light rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="Search by passport number or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isAdmin && (
            <button
              onClick={() => setShowAddForm((s) => !s)}
              className="bg-accent text-white px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition whitespace-nowrap"
            >
              {showAddForm ? "Cancel" : "Add entry"}
            </button>
          )}
        </div>

        {/* Add entry form — admin only, matches watchlist_insert_admin RLS policy */}
        {isAdmin && showAddForm && (
          <SecurityPaperPanel className="p-6">
            <h2 className="font-display text-lg mb-4">Add watchlist entry</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Passport number</label>
                <input
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={form.passportNumber}
                  onChange={(e) => setForm({ ...form, passportNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Full name (if known)</label>
                <input
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5">Reason</label>
                <textarea
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  rows={2}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Risk level</label>
                <select
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={form.riskLevel}
                  onChange={(e) => setForm({ ...form, riskLevel: e.target.value as any })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            {error && <p className="text-status-rejected text-sm mb-4">{error}</p>}
            <button
              onClick={handleAddEntry}
              disabled={submitting}
              className="bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-40 transition"
            >
              {submitting ? "Adding..." : "Add to watchlist"}
            </button>
          </SecurityPaperPanel>
        )}

        {/* Entries table */}
        <SecurityPaperPanel>
          {loading ? (
            <p className="p-8 text-ink-soft text-sm">Loading watchlist...</p>
          ) : entries.length === 0 ? (
            <p className="p-8 text-ink-soft text-sm text-center">
              {search ? "No matching entries." : "Watchlist is empty."}
            </p>
          ) : (
            <ul className="divide-y divide-primary-light/60">
              {entries.map((entry) => (
                <li key={entry.watchlist_id} className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-sm">{entry.passport_number}</p>
                    {entry.full_name && (
                      <p className="text-sm font-medium mt-0.5">{entry.full_name}</p>
                    )}
                    <p className="text-xs text-ink-soft mt-1">{entry.reason}</p>
                  </div>
                  <span
                    className={`text-xs font-medium uppercase tracking-wide px-3 py-1.5 rounded-full whitespace-nowrap ${RISK_BADGE[entry.risk_level]}`}
                  >
                    {entry.risk_level} risk
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
