import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { StepIndicator } from "../../components/StepIndicator";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";

const STEPS = ["Visa type", "Travel details", "Documents", "Review"];

interface VisaType {
  visa_type_id: string;
  name: string;
  description: string;
  fee_amount: number;
  validity_days: number;
}

export default function NewVisaApplicationPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    visaTypeId: "",
    purposeOfTravel: "",
    intendedArrivalDate: "",
    intendedStayDays: "",
    documents: [] as File[],
  });

  useEffect(() => {
    supabase
      .from("visa_types")
      .select("visa_type_id, name, description, fee_amount, validity_days")
      .then(({ data }) => setVisaTypes(data ?? []));
  }, []);

  const selectedType = visaTypes.find((v) => v.visa_type_id === form.visaTypeId);

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    if (!profile) return;
    setSubmitting(true);

    // 1. Look up the applicant's passport (required before applying)
    const { data: passport } = await supabase
      .from("passports")
      .select("passport_id")
      .eq("user_id", profile.user_id)
      .single();

    if (!passport) {
      alert("Please register your passport before applying for a visa.");
      setSubmitting(false);
      return;
    }

    // 2. Create the application
    const applicationRef = `SL-${Date.now().toString(36).toUpperCase()}`;
    const { data: application, error } = await supabase
      .from("visa_applications")
      .insert({
        application_ref: applicationRef,
        user_id: profile.user_id,
        passport_id: passport.passport_id,
        visa_type_id: form.visaTypeId,
        purpose_of_travel: form.purposeOfTravel,
        intended_arrival_date: form.intendedArrivalDate,
        intended_stay_days: Number(form.intendedStayDays),
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      alert(`Something went wrong submitting your application: ${error.message}`);
      setSubmitting(false);
      return;
    }

    // 3. Upload documents to Supabase Storage, then record them
    for (const file of form.documents) {
      const path = `${application.application_id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("visa-documents")
        .upload(path, file);

      if (!uploadError) {
        await supabase.from("application_documents").insert({
          application_id: application.application_id,
          doc_type: file.type || "unknown",
          file_path: path,
        });
      }
    }

    setSubmitting(false);
    navigate(`/visa/${application.application_id}/status`);
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-primary-light px-8 py-6">
        <p className="font-mono text-xs tracking-widest text-primary uppercase mb-1">
          Republic of Sierra Leone — Immigration Portal
        </p>
        <h1 className="font-display text-2xl">New visa application</h1>
      </header>

      <main className="max-w-2xl mx-auto px-8 py-10">
        <StepIndicator steps={STEPS} currentStep={step} />

        <SecurityPaperPanel className="p-8">
          {/* Step 0: Visa type */}
          {step === 0 && (
            <div className="grid gap-4">
              <h2 className="font-display text-lg mb-2">Which visa type do you need?</h2>
              {visaTypes.map((vt) => (
                <label
                  key={vt.visa_type_id}
                  className={`flex items-start gap-3 p-4 border rounded-md cursor-pointer transition-colors ${
                    form.visaTypeId === vt.visa_type_id
                      ? "border-primary bg-primary/5"
                      : "border-primary-light hover:border-ink-soft/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="visaType"
                    className="mt-1"
                    checked={form.visaTypeId === vt.visa_type_id}
                    onChange={() => setForm({ ...form, visaTypeId: vt.visa_type_id })}
                  />
                  <div>
                    <p className="font-medium text-sm">{vt.name}</p>
                    <p className="text-sm text-ink-soft mt-0.5">{vt.description}</p>
                    <p className="font-mono text-xs text-ink-soft mt-2">
                      ${vt.fee_amount} · Valid {vt.validity_days} days
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Step 1: Travel details */}
          {step === 1 && (
            <div className="grid gap-5">
              <h2 className="font-display text-lg mb-2">Tell us about your trip</h2>
              <div>
                <label className="block text-sm font-medium mb-1.5">Purpose of travel</label>
                <textarea
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  rows={3}
                  value={form.purposeOfTravel}
                  onChange={(e) => setForm({ ...form, purposeOfTravel: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Intended arrival date</label>
                <input
                  type="date"
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={form.intendedArrivalDate}
                  onChange={(e) => setForm({ ...form, intendedArrivalDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Length of stay (days)</label>
                <input
                  type="number"
                  min={1}
                  max={selectedType?.validity_days ?? 90}
                  className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={form.intendedStayDays}
                  onChange={(e) => setForm({ ...form, intendedStayDays: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <div className="grid gap-4">
              <h2 className="font-display text-lg mb-2">Upload supporting documents</h2>
              <p className="text-sm text-ink-soft">
                Include a scan of your passport bio page and any documents relevant to your visa type (invitation letter, proof of enrollment, etc).
              </p>
              <input
                type="file"
                multiple
                className="text-sm"
                onChange={(e) =>
                  setForm({ ...form, documents: Array.from(e.target.files ?? []) })
                }
              />
              {form.documents.length > 0 && (
                <ul className="text-sm text-ink-soft grid gap-1">
                  {form.documents.map((f) => (
                    <li key={f.name} className="font-mono text-xs">{f.name}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="grid gap-4">
              <h2 className="font-display text-lg mb-2">Review your application</h2>
              <dl className="grid gap-3 text-sm">
                <div className="flex justify-between border-b border-primary-light/60 pb-2">
                  <dt className="text-ink-soft">Visa type</dt>
                  <dd className="font-medium">{selectedType?.name}</dd>
                </div>
                <div className="flex justify-between border-b border-primary-light/60 pb-2">
                  <dt className="text-ink-soft">Arrival date</dt>
                  <dd className="font-mono">{form.intendedArrivalDate}</dd>
                </div>
                <div className="flex justify-between border-b border-primary-light/60 pb-2">
                  <dt className="text-ink-soft">Length of stay</dt>
                  <dd className="font-mono">{form.intendedStayDays} days</dd>
                </div>
                <div className="flex justify-between border-b border-primary-light/60 pb-2">
                  <dt className="text-ink-soft">Documents attached</dt>
                  <dd className="font-mono">{form.documents.length}</dd>
                </div>
                <div className="flex justify-between pt-1">
                  <dt className="text-ink-soft">Fee due</dt>
                  <dd className="font-mono text-base">${selectedType?.fee_amount}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-primary-light/60">
            <button
              onClick={back}
              disabled={step === 0}
              className="text-sm font-medium text-ink-soft disabled:opacity-0"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                disabled={step === 0 && !form.visaTypeId}
                className="bg-primary text-canvas px-6 py-2.5 rounded-md font-medium text-sm hover:bg-primary-dark disabled:opacity-40 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="bg-primary text-canvas px-6 py-2.5 rounded-md font-medium text-sm hover:bg-primary-dark disabled:opacity-40 transition-colors"
              >
                {submitting ? "Submitting…" : "Submit application"}
              </button>
            )}
          </div>
        </SecurityPaperPanel>
      </main>
    </div>
  );
}
