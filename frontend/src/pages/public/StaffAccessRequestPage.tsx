import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";

interface Checkpoint {
  checkpoint_id: string;
  name: string;
  code: string;
  type: string;
}

export default function StaffAccessRequestPage() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    requestedRole: "immigration_officer",
    rankTitle: "Immigration Officer",
    department: "Border Control & Entry Clearance",
    dutyStation: "Lungi International Airport",
    checkpointId: "",
    badgeNumber: "",
    reason: "",
  });

  useEffect(() => {
    async function loadCheckpoints() {
      const { data } = await supabase
        .from("checkpoints")
        .select("checkpoint_id, name, code, type")
        .order("name");
      if (data && data.length > 0) {
        setCheckpoints(data);
        setForm((prev) => ({
          ...prev,
          checkpointId: data[0].checkpoint_id,
          dutyStation: data[0].name,
        }));
      }
    }
    loadCheckpoints();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.fullName || !form.email || !form.requestedRole) {
      setError("Please complete all required fields (Full Name, Official Email, and Role).");
      return;
    }

    setSubmitting(true);
    try {
      const cleanEmail = form.email.trim().toLowerCase();
      const cleanName = form.fullName.trim();
      const cleanPhone = form.phone.trim();

      // 1. Direct Supabase insertion into staff_access_requests
      const { error: reqError } = await supabase.from("staff_access_requests").insert({
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || null,
        requested_role: form.requestedRole,
        rank_title: form.rankTitle || "Officer",
        department: form.department || "Immigration",
        duty_station: form.dutyStation || "Headquarters",
        checkpoint_id: form.checkpointId || null,
        badge_number: form.badgeNumber || null,
        reason: form.reason || null,
        status: "pending",
      });

      if (reqError) {
        console.warn("Direct staff_access_requests notice:", reqError.message);
      }

      // 2. Also register in public.users with is_active: false for instant Admin visibility
      try {
        const { data: existingUser } = await supabase
          .from("users")
          .select("user_id")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (!existingUser) {
          const tempId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `temp-${Date.now()}`;
          await supabase.from("users").insert({
            user_id: tempId,
            email: cleanEmail,
            full_name: cleanName,
            phone: cleanPhone || null,
            role: form.requestedRole as any,
            is_active: false,
          });
        }
      } catch (uErr) {
        console.warn("User placeholder note:", uErr);
      }

      // 3. Fire-and-forget backend notification with 3s timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        fetch("/api/staff/request-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));
      } catch {}

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-body py-12 px-6 pb-36">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <Link
            to="/staff/login"
            className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 mb-2"
          >
            &larr; Back to Staff Login
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-primary font-bold bg-primary-light px-2.5 py-0.5 rounded uppercase">
              Republic of Sierra Leone
            </span>
            <span className="text-xs text-ink-soft">Immigration Department</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Official Staff Access & Officer Clearance Request
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Submit your credentials to the System Administrator for official vetting, duty station assignment, and account provisioning.
          </p>
        </div>

        {submitted ? (
          <SecurityPaperPanel className="p-8 text-center" showRosette>
            <div className="w-16 h-16 bg-status-approved-bg text-status-approved rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-status-approved/30">
              ✓
            </div>
            <h2 className="font-display text-xl font-bold text-ink mb-2">
              Application Submitted Successfully
            </h2>
            <p className="text-sm text-ink-soft max-w-lg mx-auto mb-6">
              Your staff registration has been registered under reference:{" "}
              <strong className="text-ink font-mono">{form.email}</strong>. The Immigration Administrator will review your credentials and assign your station.
            </p>

            <div className="bg-primary-light/40 border border-primary-light p-4 rounded-md text-left text-xs max-w-md mx-auto mb-6">
              <p className="font-semibold text-primary mb-1">📧 Next Steps:</p>
              <p className="text-ink">
                Once approved, you will receive an official email containing your secure temporary password and direct authorization link to access your portal.
              </p>
            </div>

            <Link
              to="/staff/login"
              className="bg-primary text-white px-6 py-2.5 rounded-md text-xs font-semibold hover:bg-primary-dark transition inline-block"
            >
              Return to Staff Login
            </Link>
          </SecurityPaperPanel>
        ) : (
          <SecurityPaperPanel className="p-8" showRosette>
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Officer Ibrahim Koroma"
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                    Official Government / Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="i.koroma@slid.gov.sl"
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                    Official Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="076 987654 or +232 76 987654"
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                    Service / Badge ID Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SLID-OF-8492"
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
                    value={form.badgeNumber}
                    onChange={(e) => setForm({ ...form, badgeNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                    Requested Role Assignment *
                  </label>
                  <select
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={form.requestedRole}
                    onChange={(e) => {
                      const role = e.target.value;
                      setForm({
                        ...form,
                        requestedRole: role,
                        department: role === "visa_officer" ? "Visa Processing Directorate" : "Border Control & Entry Clearance",
                        rankTitle: role === "visa_officer" ? "Visa Adjudicator" : "Immigration Officer",
                      });
                    }}
                  >
                    <option value="immigration_officer">🛂 Border / Immigration Officer (Entry & Exit)</option>
                    <option value="visa_officer">📋 Visa Officer (e-Visa Adjudication)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                    Assigned Duty Station / Checkpoint
                  </label>
                  <select
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={form.checkpointId}
                    onChange={(e) => {
                      const cp = checkpoints.find((c) => c.checkpoint_id === e.target.value);
                      setForm({
                        ...form,
                        checkpointId: e.target.value,
                        dutyStation: cp ? cp.name : form.dutyStation,
                      });
                    }}
                  >
                    {checkpoints.map((cp) => (
                      <option key={cp.checkpoint_id} value={cp.checkpoint_id}>
                        {cp.name} ({cp.type})
                      </option>
                    ))}
                    <option value="">National Immigration Headquarters (Freetown)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                    Rank / Official Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Border Inspector"
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={form.rankTitle}
                    onChange={(e) => setForm({ ...form, rankTitle: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                    Department / Directorate
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Border Control & Surveillance"
                    className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                  Deployment Justification / Official Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide deployment order reference, station posting details, or supervisor endorsement..."
                  className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>

              {error && (
                <div className="p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-md text-status-rejected text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 transition cursor-pointer shadow-xs touch-manipulation min-h-[48px]"
                >
                  {submitting ? "Submitting Official Request..." : "Submit Access Application"}
                </button>
                <Link
                  to="/staff/login"
                  className="border border-primary-light text-ink-soft hover:text-ink px-4 py-3 rounded-xl text-sm font-medium transition text-center touch-manipulation min-h-[48px] flex items-center justify-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </SecurityPaperPanel>
        )}
      </div>
    </div>
  );
}
