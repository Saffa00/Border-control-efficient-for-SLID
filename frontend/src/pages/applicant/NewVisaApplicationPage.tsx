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

    try {
      // 1. Look up the applicant's passport (or create provisional if not yet registered)
      let { data: passport } = await supabase
        .from("passports")
        .select("passport_id")
        .eq("user_id", profile.user_id)
        .maybeSingle();

      if (!passport) {
        const dummyNum = `P-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        const { data: createdPassport } = await supabase
          .from("passports")
          .insert({
            user_id: profile.user_id,
            passport_number: dummyNum,
            nationality: "Sierra Leonean",
            expiry_date: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            issue_date: new Date().toISOString().slice(0, 10),
            status: "active",
          })
          .select("passport_id")
          .maybeSingle();

        passport = createdPassport;
      }

      const passportId = passport?.passport_id;

      // 2. Create the application
      const applicationRef = `SL-${Date.now().toString(36).toUpperCase()}`;
      const { data: application, error } = await supabase
        .from("visa_applications")
        .insert({
          application_ref: applicationRef,
          user_id: profile.user_id,
          passport_id: passportId,
          visa_type_id: form.visaTypeId,
          purpose_of_travel: form.purposeOfTravel,
          intended_arrival_date: form.intendedArrivalDate || null,
          intended_stay_days: Number(form.intendedStayDays) || 30,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit application: ${error.message}`);
      }

      // 3. Upload documents to Supabase Storage if present
      if (form.documents.length > 0) {
        for (const file of form.documents) {
          try {
            const path = `${application.application_id}/${file.name}`;
            const { error: uploadError } = await supabase.storage
              .from("visa-documents")
              .upload(path, file);

            if (!uploadError) {
              await supabase.from("application_documents").insert({
                application_id: application.application_id,
                doc_type: file.type || "supporting_document",
                file_path: path,
              });
            }
          } catch (uploadErr) {
            console.warn("Document upload note:", uploadErr);
          }
        }
      }

      navigate(`/visa/${application.application_id}/status`);
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-primary-light px-8 py-6">
        <p className="font-mono text-xs tracking-widest text-primary uppercase mb-1">
          Republic of Sierra Leone — Immigration Portal
        </p>
        <h1 className="font-display text-2xl">New visa application</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-10 pb-36">
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
