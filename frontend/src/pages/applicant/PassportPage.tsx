import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { ApplicantNavbar } from "../../components/ApplicantNavbar";

interface Passport {
  passport_id: string;
  passport_number: string;
  issuing_country: string;
  date_of_birth: string;
  sex: "M" | "F";
  issue_date: string;
  expiry_date: string;
  photo_path: string | null;
}

const emptyForm = {
  passport_number: "",
  issuing_country: "Sierra Leone",
  date_of_birth: "",
  sex: "M" as "M" | "F",
  issue_date: "",
  expiry_date: "",
};

export default function PassportPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [passport, setPassport] = useState<Passport | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const { data } = await supabase
        .from("passports")
        .select("passport_id, passport_number, issuing_country, date_of_birth, sex, issue_date, expiry_date, photo_path")
        .eq("user_id", profile.user_id)
        .maybeSingle();

      if (data) {
        setPassport(data);
        if (data.photo_path) {
          const { data: signed } = await supabase.storage
            .from("passport-photos")
            .createSignedUrl(data.photo_path, 3600);
          setPhotoUrl(signed?.signedUrl ?? null);
        }
      } else {
        setEditing(true); // no passport yet — go straight to the form
      }
      setLoading(false);
    }

    load();
  }, [profile]);

  async function handleSave() {
    setError(null);
    if (!form.date_of_birth || !form.issue_date || !form.expiry_date) {
      setError("Date of birth, issue date, and expiry date are required.");
      return;
    }
    if (new Date(form.expiry_date) <= new Date(form.issue_date)) {
      setError("Expiry date must be after issue date.");
      return;
    }
    setSaving(true);

    let photoPath: string | null = passport?.photo_path ?? null;

    if (photoFile && profile) {
      const path = `${profile.user_id}/${Date.now()}-${photoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("passport-photos")
        .upload(path, photoFile, { upsert: true });

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }
      photoPath = path;
    }

    // If passport_number is left blank, assign null so DB trigger generates SL-P... number
    const passportNumberVal = form.passport_number.trim() || null;

    const payload: Record<string, any> = {
      user_id: profile?.user_id,
      issuing_country: form.issuing_country,
      date_of_birth: form.date_of_birth,
      sex: form.sex,
      issue_date: form.issue_date,
      expiry_date: form.expiry_date,
      photo_path: photoPath,
    };

    if (passportNumberVal) {
      payload.passport_number = passportNumberVal;
    }

    const { error: saveError } = passport
      ? await supabase.from("passports").update(payload).eq("passport_id", passport.passport_id)
      : await supabase.from("passports").insert(payload);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    navigate("/dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas text-ink font-body">
        <ApplicantNavbar />
        <div className="p-10 text-ink-soft text-center">Loading passport details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <ApplicantNavbar />

      <main className="max-w-xl mx-auto px-6 py-8 pb-24 sm:pb-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
            &larr; Back to dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold mt-1">Biometric Passport Profile</h1>
          <p className="text-sm text-ink-soft">
            Your registered travel document used for visa applications and border clearance.
          </p>
        </div>

        {!editing && passport ? (
          <SecurityPaperPanel className="p-6" showRosette>
            <div className="flex items-center gap-6 mb-6">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Passport photo"
                  className="w-24 h-28 object-cover rounded-md border-2 border-primary-light shadow-xs"
                />
              ) : (
                <div className="w-24 h-28 rounded-md bg-primary-light flex items-center justify-center text-ink-soft text-xs text-center border border-primary/20">
                  No photo
                </div>
              )}
              <div>
                <span className="text-[10px] font-mono uppercase bg-primary text-white px-2 py-0.5 rounded font-bold">
                  Official Travel Document
                </span>
                <p className="font-mono text-xl font-bold text-ink mt-1">{passport.passport_number}</p>
                <p className="text-sm text-ink-soft mt-1">Nationality / Issuing: {passport.issuing_country}</p>
                <p className="text-xs text-ink-soft mt-1">
                  Expires: <span className="font-mono font-semibold">{new Date(passport.expiry_date).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setForm({
                  passport_number: passport.passport_number,
                  issuing_country: passport.issuing_country,
                  date_of_birth: passport.date_of_birth,
                  sex: passport.sex,
                  issue_date: passport.issue_date,
                  expiry_date: passport.expiry_date,
                });
                setEditing(true);
              }}
              className="bg-primary text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-primary-dark transition cursor-pointer"
            >
              Edit Passport Details
            </button>
          </SecurityPaperPanel>
        ) : (
          <SecurityPaperPanel className="p-6" showRosette>
            <h2 className="font-display text-lg font-bold mb-4">
              {passport ? "Edit Passport Details" : "Register Biometric Passport"}
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium">Passport Number</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, passport_number: `SL-P${Math.floor(1000000 + Math.random() * 9000000)}` })}
                    className="text-xs text-primary hover:underline font-mono"
                  >
                    🎲 Generate SL Number
                  </button>
                </div>
                <input
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                  placeholder="e.g. SL-P1049283 (or leave blank to auto-generate)"
                  value={form.passport_number}
                  onChange={(e) => setForm({ ...form, passport_number: e.target.value })}
                />
                <p className="text-[11px] text-ink-soft mt-1">
                  Leave blank to have the database trigger automatically issue your official SL-P number.
                </p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5">Issuing Country</label>
                <input
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                  value={form.issuing_country}
                  onChange={(e) => setForm({ ...form, issuing_country: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Sex</label>
                <select
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                  value={form.sex}
                  onChange={(e) => setForm({ ...form, sex: e.target.value as "M" | "F" })}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Issue Date</label>
                <input
                  type="date"
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                  value={form.issue_date}
                  onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Expiry Date</label>
                <input
                  type="date"
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5">Passport Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary hover:file:text-white transition cursor-pointer"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            {error && <p className="text-status-rejected text-sm mb-4 font-medium">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-40 transition cursor-pointer shadow-xs"
              >
                {saving ? "Saving..." : passport ? "Save Changes" : "Register Passport"}
              </button>
              {passport && (
                <button
                  onClick={() => setEditing(false)}
                  className="text-ink-soft px-5 py-2.5 text-sm font-medium hover:text-ink transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </SecurityPaperPanel>
        )}
      </main>
    </div>
  );
}
