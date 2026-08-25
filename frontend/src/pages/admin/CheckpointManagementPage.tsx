import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { AdminNavbar } from "../../components/AdminNavbar";

type CheckpointType = "airport" | "land_border" | "seaport";

interface Checkpoint {
  checkpoint_id: string;
  name: string;
  location: string;
  checkpoint_type: CheckpointType;
  created_at: string;
}

const TYPE_LABELS: Record<CheckpointType, string> = {
  airport: "Airport",
  land_border: "Land Border",
  seaport: "Seaport",
};

const TYPE_ICONS: Record<CheckpointType, string> = {
  airport: "✈",
  land_border: "🛃",
  seaport: "⚓",
};

const emptyForm = { name: "", location: "", checkpoint_type: "land_border" as CheckpointType };

export default function CheckpointManagementPage() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadCheckpoints() {
    setLoading(true);
    const { data } = await supabase
      .from("checkpoints")
      .select("checkpoint_id, name, location, checkpoint_type, created_at")
      .order("name", { ascending: true });
    setCheckpoints(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadCheckpoints();
  }, []);

  function startNew() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function startEdit(cp: Checkpoint) {
    setEditingId(cp.checkpoint_id);
    setForm({ name: cp.name, location: cp.location, checkpoint_type: cp.checkpoint_type });
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    setError(null);
    if (!form.name || !form.location) {
      setError("Name and location are required.");
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name,
      location: form.location,
      checkpoint_type: form.checkpoint_type,
    };

    const { error: saveError } = editingId
      ? await supabase.from("checkpoints").update(payload).eq("checkpoint_id", editingId)
      : await supabase.from("checkpoints").insert(payload);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);
    loadCheckpoints();
  }

  async function handleDelete(cp: Checkpoint) {
    const confirmed = window.confirm(
      `Remove ${cp.name}? This will fail if border logs already reference this checkpoint — that's expected, since crossing history must never be deleted.`
    );
    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("checkpoints")
      .delete()
      .eq("checkpoint_id", cp.checkpoint_id);

    if (deleteError) {
      alert(
        "Could not delete this checkpoint — it likely has border crossing logs or assigned officers linked to it."
      );
      return;
    }
    loadCheckpoints();
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <AdminNavbar />

      <main className="max-w-4xl mx-auto px-6 py-8 grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Checkpoint Management</h1>
            <p className="text-sm text-ink-soft">
              Configure and monitor air, sea, and land border crossing control points.
            </p>
          </div>
          <button
            onClick={startNew}
            className="bg-primary text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-primary-dark transition cursor-pointer"
          >
            + Add Checkpoint
          </button>
        </div>
        {/* Add/edit form */}
        {showForm && (
          <SecurityPaperPanel className="p-6">
            <h2 className="font-display text-lg mb-4">
              {editingId ? "Edit checkpoint" : "New checkpoint"}
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Lungi International Airport"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Type</label>
                <select
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={form.checkpoint_type}
                  onChange={(e) => setForm({ ...form, checkpoint_type: e.target.value as CheckpointType })}
                >
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5">Location</label>
                <input
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Port Loko District"
                />
              </div>
            </div>
            {error && <p className="text-status-rejected text-sm mb-4">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-40 transition"
              >
                {saving ? "Saving..." : editingId ? "Save changes" : "Create checkpoint"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-ink-soft px-5 py-2.5 text-sm font-medium hover:text-ink transition"
              >
                Cancel
              </button>
            </div>
          </SecurityPaperPanel>
        )}

        {/* Checkpoint list */}
        <SecurityPaperPanel>
          {loading ? (
            <p className="p-8 text-ink-soft text-sm">Loading checkpoints...</p>
          ) : checkpoints.length === 0 ? (
            <p className="p-8 text-ink-soft text-sm text-center">
              No checkpoints yet. Add one to enable border check-in logging.
            </p>
          ) : (
            <ul className="divide-y divide-primary-light/60">
              {checkpoints.map((cp) => (
                <li key={cp.checkpoint_id} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{TYPE_ICONS[cp.checkpoint_type]}</span>
                    <div>
                      <p className="text-sm font-medium">{cp.name}</p>
                      <p className="text-xs text-ink-soft mt-0.5">
                        {cp.location} · {TYPE_LABELS[cp.checkpoint_type]}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(cp)}
                      className="text-primary text-sm font-medium underline underline-offset-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cp)}
                      className="text-status-rejected text-sm font-medium underline underline-offset-4"
                    >
                      Delete
                    </button>
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
