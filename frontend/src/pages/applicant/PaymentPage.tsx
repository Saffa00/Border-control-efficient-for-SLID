import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";

type Provider = "orange_money" | "afrimoney";

interface ApplicationForPayment {
  application_id: string;
  application_ref: string;
  payment_status: "unpaid" | "paid";
  visa_types: { name: string; fee_amount: number } | null;
}

// Static placeholder rate — no live FX API integration is in scope for this
// project (see Chapter 1, Scope). A production system would call a real
// exchange rate provider or the mobile money provider's own quoted rate.
const USD_TO_NLE_RATE = 22.5;

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<ApplicationForPayment | null>(null);
  const [provider, setProvider] = useState<Provider>("orange_money");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const { data } = await supabase
        .from("visa_applications")
        .select("application_id, application_ref, payment_status, visa_types(name, fee_amount)")
        .eq("application_id", id)
        .single();

      setApplication(data as any);
      setLoading(false);
    }

    load();
  }, [id]);

  async function handlePay() {
    if (!application) return;
    setError(null);

    if (!/^0\d{8}$/.test(phoneNumber)) {
      setError("Enter a valid mobile money number (e.g. 076123456).");
      return;
    }

    setProcessing(true);

    const amountUsd = application.visa_types?.fee_amount ?? 0;
    const amountNle = Math.round(amountUsd * USD_TO_NLE_RATE * 100) / 100;
    const reference = `PMT-${Date.now().toString(36).toUpperCase()}`;

    // SIMULATED: no real mobile money gateway is called here. In a
    // production system this step would initiate a real payment request
    // to the provider's API and wait for a webhook/callback confirming
    // completion, rather than marking the transaction complete immediately.
    const { error: txError } = await supabase.from("payment_transactions").insert({
      application_id: application.application_id,
      provider,
      phone_number: phoneNumber,
      amount_usd: amountUsd,
      amount_nle: amountNle,
      exchange_rate: USD_TO_NLE_RATE,
      reference,
      status: "completed",
    });

    if (txError) {
      setError(txError.message);
      setProcessing(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("visa_applications")
      .update({ payment_status: "paid" })
      .eq("application_id", application.application_id);

    if (updateError) {
      setError(updateError.message);
      setProcessing(false);
      return;
    }

    // Real email confirmation — fire-and-forget so a slow/failed email
    // doesn't block the applicant from seeing their payment succeeded.
    fetch("/api/notify/payment-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: application.application_id,
        amountUsd,
        reference,
      }),
    }).catch((e) => console.error("Payment confirmation email failed to send:", e));

    setProcessing(false);
    setCompleted(true);
  }

  if (loading) return <div className="p-10 text-ink-soft font-body">Loading...</div>;
  if (!application) return <div className="p-10 text-ink-soft font-body">Application not found.</div>;

  const amountUsd = application.visa_types?.fee_amount ?? 0;
  const amountNle = Math.round(amountUsd * USD_TO_NLE_RATE * 100) / 100;

  if (application.payment_status === "paid" || completed) {
    return (
      <div className="min-h-screen bg-canvas text-ink font-body flex items-center justify-center px-8">
        <SecurityPaperPanel className="p-8 text-center max-w-md">
          <p className="font-display text-xl text-status-approved mb-2">Payment received</p>
          <p className="text-sm text-ink-soft mb-6">
            {application.application_ref} is fully paid. You'll be notified once it's reviewed.
          </p>
          <Link
            to={`/visa/${application.application_id}/status`}
            className="bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary-dark transition inline-block"
          >
            View application status
          </Link>
        </SecurityPaperPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <header className="border-b border-primary-light px-8 py-6 bg-white">
        <p className="font-mono text-xs tracking-widest text-primary uppercase mb-1">
          Sierra Leone Immigration Department
        </p>
        <h1 className="font-display text-2xl">Visa fee payment</h1>
      </header>

      <main className="max-w-md mx-auto px-8 py-10">
        <SecurityPaperPanel className="p-6">
          <div className="flex justify-between items-baseline mb-1">
            <p className="text-sm text-ink-soft">{application.application_ref}</p>
            <p className="text-sm text-ink-soft">{application.visa_types?.name}</p>
          </div>
          <p className="font-mono text-3xl font-semibold mb-1">${amountUsd.toFixed(2)}</p>
          <p className="text-xs text-ink-soft mb-6">≈ NLe {amountNle.toFixed(2)} at today's rate</p>

          <label className="block text-sm font-medium mb-1.5">Payment method</label>
          <div className="flex gap-3 mb-4">
            {(["orange_money", "afrimoney"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium border-2 transition-colors ${
                  provider === p
                    ? "border-primary bg-primary text-white"
                    : "border-primary-light text-ink-soft hover:border-primary/40"
                }`}
              >
                {p === "orange_money" ? "Orange Money" : "Afrimoney"}
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium mb-1.5">Mobile money number</label>
          <input
            className="w-full border border-primary-light rounded-md px-3 py-2 text-sm font-mono mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="076123456"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          {error && <p className="text-status-rejected text-sm mb-4">{error}</p>}

          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full bg-accent text-white px-5 py-3 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-40 transition"
          >
            {processing ? "Processing..." : `Pay $${amountUsd.toFixed(2)}`}
          </button>

          <p className="text-xs text-ink-soft italic mt-4 text-center">
            This is a simulated payment for demonstration purposes — no real transaction occurs.
          </p>
        </SecurityPaperPanel>
      </main>
    </div>
  );
}
