import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "../../lib/supabaseClient";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { OfficerNavbar } from "../../components/OfficerNavbar";

type DocType = "digital_visa" | "ecowas_pass";
type DocStatus = "active" | "used" | "expired" | "revoked";

interface VerificationResult {
  docType: DocType;
  status: DocStatus;
  travelerName: string;
  passportNumber: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  extra: string;
}

const STATUS_STYLES: Record<DocStatus, string> = {
  active: "text-status-approved bg-status-approved-bg border-status-approved",
  used: "text-status-pending bg-status-pending-bg border-status-pending",
  expired: "text-status-rejected bg-status-rejected-bg border-status-rejected",
  revoked: "text-status-rejected bg-status-rejected-bg border-status-rejected",
};

export default function QRVerificationPage() {
  const { token: tokenFromUrl } = useParams<{ token?: string }>();

  const [tokenInput, setTokenInput] = useState(tokenFromUrl ?? "");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  async function verify(token: string) {
    if (!token.trim()) return;

    // Clean URL if full verify URL was scanned (e.g. https://domain.com/border/verify/xyz)
    let cleanToken = token.trim();
    if (cleanToken.includes("/border/verify/")) {
      cleanToken = cleanToken.split("/border/verify/").pop() || cleanToken;
    }

    setTokenInput(cleanToken);
    setLoading(true);
    setResult(null);
    setNotFound(false);

    // 1. Check digital_visas
    const { data: visa } = await supabase
      .from("digital_visas")
      .select(
        "visa_number, status, issue_date, expiry_date, entries_allowed, passports(passport_number, users(full_name))"
      )
      .eq("qr_code_token", cleanToken)
      .maybeSingle();

    if (visa) {
      setResult({
        docType: "digital_visa",
        status: visa.status,
        travelerName: (visa.passports as any)?.users?.full_name ?? "Unknown",
        passportNumber: (visa.passports as any)?.passport_number ?? "—",
        documentNumber: visa.visa_number,
        issueDate: visa.issue_date,
        expiryDate: visa.expiry_date,
        extra: `${visa.entries_allowed === "single" ? "Single entry" : "Multiple entries"}`,
      });
      setLoading(false);
      return;
    }

    // 2. Fall back to ecowas_entry_passes
    const { data: pass } = await supabase
      .from("ecowas_entry_passes")
      .select(
        "pass_number, status, issue_date, expiry_date, passports(passport_number, users(full_name))"
      )
      .eq("qr_code_token", cleanToken)
      .maybeSingle();

    if (pass) {
      setResult({
        docType: "ecowas_pass",
        status: pass.status as DocStatus,
        travelerName: (pass.passports as any)?.users?.full_name ?? "Unknown",
        passportNumber: (pass.passports as any)?.passport_number ?? "—",
        documentNumber: pass.pass_number,
        issueDate: pass.issue_date,
        expiryDate: pass.expiry_date,
        extra: "ECOWAS free movement pass",
      });
      setLoading(false);
      return;
    }

    setNotFound(true);
    setLoading(false);
  }

  useEffect(() => {
    if (tokenFromUrl) verify(tokenFromUrl);
  }, [tokenFromUrl]);

  // Live Camera Scanner Lifecycle
  useEffect(() => {
    if (cameraActive) {
      setCameraError(null);
      try {
        const scanner = new Html5QrcodeScanner(
          "qr-reader-container",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            // Successfully scanned
            scanner.clear().catch(console.error);
            setCameraActive(false);
            verify(decodedText);
          },
          (error) => {
            // Ignore frame-by-frame read failures until a QR is found
          }
        );

        scannerRef.current = scanner;
      } catch (err: any) {
        console.error("Camera scanner init failed:", err);
        setCameraError(err.message || "Could not access device camera. Please check browser permissions.");
        setCameraActive(false);
      }
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [cameraActive]);

  const isExpiredButActive =
    result?.status === "active" && new Date(result.expiryDate) < new Date();

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <OfficerNavbar title="Border Verification Console" />

      <main className="max-w-2xl mx-auto px-6 py-8 grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">QR Document Verification</h1>
            <p className="text-xs text-ink-soft">
              Scan traveler digital e-Visa certificates or ECOWAS travel passes for biometric border clearance.
            </p>
          </div>
          <Link
            to="/border/check-in"
            className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            &rarr; Border Check-in Desk
          </Link>
        </div>

        {/* Scanner & Manual Input Panel */}
        <SecurityPaperPanel className="p-6" showRosette>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-ink">
              1. Scan Biometric QR Code
            </label>
            <button
              type="button"
              onClick={() => setCameraActive(!cameraActive)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer shadow-xs inline-flex items-center gap-1.5 ${
                cameraActive
                  ? "bg-status-rejected text-white hover:opacity-90"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              <span>{cameraActive ? "⏹ Stop Camera" : "📷 Open Live Camera Scanner"}</span>
            </button>
          </div>

          {/* Live Camera Scanner Box */}
          {cameraActive && (
            <div className="mb-6 p-4 bg-canvas border border-primary-light rounded-lg">
              <p className="text-xs text-ink font-medium mb-3 text-center">
                Point camera at traveler's QR certificate on screen or printed pass:
              </p>
              <div id="qr-reader-container" className="overflow-hidden rounded-md max-w-sm mx-auto" />
            </div>
          )}

          {cameraError && (
            <div className="p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-md text-status-rejected text-xs font-medium mb-4">
              ⚠️ {cameraError}
            </div>
          )}

          {/* Manual Token Search */}
          <div className="pt-2 border-t border-primary-light/60">
            <label className="block text-[11px] font-medium text-ink-soft uppercase mb-1.5">
              Or Enter Encrypted QR Token / Document Ref
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-primary-light rounded-md px-3.5 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="e.g. 7f9a2b8c-49e1-4c12 or https://..."
                onKeyDown={(e) => e.key === "Enter" && verify(tokenInput)}
              />
              <button
                onClick={() => verify(tokenInput)}
                disabled={loading}
                className="bg-primary text-white px-5 py-2 rounded-md text-xs font-semibold hover:bg-primary-dark disabled:opacity-40 transition cursor-pointer shadow-xs"
              >
                {loading ? "Verifying..." : "Verify Token"}
              </button>
            </div>
          </div>
        </SecurityPaperPanel>

        {/* Verification Result: Not Found */}
        {notFound && (
          <section className="bg-status-rejected-bg border border-status-rejected/40 rounded-lg p-6 text-center animate-fade-in shadow-xs">
            <div className="text-3xl mb-2">⚠️</div>
            <h2 className="font-display text-lg font-bold text-status-rejected mb-1">
              Invalid or Unregistered Document
            </h2>
            <p className="text-xs text-ink-soft max-w-md mx-auto leading-relaxed">
              No active digital visa or ECOWAS travel pass matches token <code className="font-mono font-bold text-ink">{tokenInput}</code>. Do not clear entry on the strength of this code.
            </p>
          </section>
        )}

        {/* Verification Result: Document Match */}
        {result && (
          <section
            className={`bg-white border-2 rounded-xl p-6 shadow-sm animate-fade-in ${
              STATUS_STYLES[result.status]
            }`}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-current/20">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-white shadow-2xs">
                ● STATUS: {result.status.toUpperCase()}
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wide">
                {result.docType === "digital_visa" ? "Official Digital e-Visa" : "ECOWAS Free Movement Pass"}
              </span>
            </div>

            <div className="mb-5">
              <p className="font-display text-2xl font-bold text-ink">{result.travelerName}</p>
              <p className="font-mono text-sm text-ink-soft">
                Passport: <span className="font-bold text-ink">{result.passportNumber}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-canvas/80 p-4 rounded-lg border border-current/15 mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-ink-soft font-semibold mb-0.5">Document #</p>
                <p className="font-mono font-bold text-ink">{result.documentNumber}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-ink-soft font-semibold mb-0.5">Entries</p>
                <p className="font-medium text-ink">{result.extra}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-ink-soft font-semibold mb-0.5">Issue Date</p>
                <p className="font-mono text-ink">{new Date(result.issueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-ink-soft font-semibold mb-0.5">Valid Until</p>
                <p className="font-mono font-bold text-ink">{new Date(result.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>

            {isExpiredButActive && (
              <div className="p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-md text-status-rejected text-xs font-medium mb-4">
                ⚠️ WARNING: Status is marked active in database, but the expiry date has passed. Verify physical documents before granting entry clearance.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to="/border/check-in"
                className="bg-primary text-white text-xs font-semibold px-5 py-2.5 rounded-md hover:bg-primary-dark transition shadow-xs cursor-pointer"
              >
                Proceed to Check-In &amp; Entry Stamp &rarr;
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
