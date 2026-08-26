import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  QrCode,
  Camera,
  CameraOff,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ArrowRight,
  ShieldCheck,
  SwitchCamera,
  Check,
} from "lucide-react";
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
  qrToken: string;
}

const STATUS_STYLES: Record<DocStatus, { badge: string; icon: string; text: string }> = {
  active: {
    badge: "text-status-approved bg-status-approved-bg border-status-approved",
    icon: "✓",
    text: "AUTHENTIC & VALID FOR ENTRY",
  },
  used: {
    badge: "text-amber-800 bg-amber-100 border-amber-300",
    icon: "⚠️",
    text: "ALREADY PROCESSED / USED",
  },
  expired: {
    badge: "text-status-rejected bg-status-rejected-bg border-status-rejected",
    icon: "✕",
    text: "EXPIRED CERTIFICATE",
  },
  revoked: {
    badge: "text-status-rejected bg-status-rejected-bg border-status-rejected",
    icon: "🚫",
    text: "REVOKED / VOIDED",
  },
};

export default function QRVerificationPage() {
  const { token: tokenFromUrl } = useParams<{ token?: string }>();

  const [tokenInput, setTokenInput] = useState(tokenFromUrl ?? "");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  // Live Camera Scanner State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Play audio chime on successful scan
  function playScanBeep() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {}
  }

  async function verify(rawToken: string) {
    if (!rawToken || !rawToken.trim()) return;

    // Clean URL if full verify URL was scanned (e.g. https://domain.com/border/verify/token123)
    let cleanToken = rawToken.trim();
    if (cleanToken.includes("/border/verify/")) {
      cleanToken = cleanToken.split("/border/verify/").pop() || cleanToken;
    } else if (cleanToken.includes("/border/verify?token=")) {
      cleanToken = cleanToken.split("/border/verify?token=").pop() || cleanToken;
    }

    setTokenInput(cleanToken);
    setLoading(true);
    setResult(null);
    setNotFound(false);

    try {
      // 1. Check digital_visas table
      const { data: visa, error: vErr } = await supabase
        .from("digital_visas")
        .select(
          "visa_number, status, issue_date, expiry_date, entries_allowed, passports(passport_number, users(full_name))"
        )
        .eq("qr_code_token", cleanToken)
        .maybeSingle();

      if (visa) {
        playScanBeep();
        setResult({
          docType: "digital_visa",
          status: visa.status as DocStatus,
          travelerName: (visa.passports as any)?.users?.full_name ?? "Unknown Traveler",
          passportNumber: (visa.passports as any)?.passport_number ?? "—",
          documentNumber: visa.visa_number,
          issueDate: visa.issue_date,
          expiryDate: visa.expiry_date,
          extra: `${visa.entries_allowed === "single" ? "Single Entry" : "Multiple Entries"} • e-Visa Certificate`,
          qrToken: cleanToken,
        });
        setLoading(false);
        return;
      }

      // 2. Fall back to ecowas_entry_passes table
      const { data: pass } = await supabase
        .from("ecowas_entry_passes")
        .select(
          "pass_number, status, issue_date, expiry_date, passports(passport_number, users(full_name))"
        )
        .eq("qr_code_token", cleanToken)
        .maybeSingle();

      if (pass) {
        playScanBeep();
        setResult({
          docType: "ecowas_pass",
          status: pass.status as DocStatus,
          travelerName: (pass.passports as any)?.users?.full_name ?? "Unknown Traveler",
          passportNumber: (pass.passports as any)?.passport_number ?? "—",
          documentNumber: pass.pass_number,
          issueDate: pass.issue_date,
          expiryDate: pass.expiry_date,
          extra: "ECOWAS Free Movement Entry Pass",
          qrToken: cleanToken,
        });
        setLoading(false);
        return;
      }

      // 3. Fall back: If token is a passport number or reference
      const { data: passport } = await supabase
        .from("passports")
        .select("passport_number, status, issue_date, expiry_date, users(full_name)")
        .ilike("passport_number", cleanToken)
        .maybeSingle();

      if (passport) {
        playScanBeep();
        setResult({
          docType: "ecowas_pass",
          status: passport.status as DocStatus,
          travelerName: (passport.users as any)?.full_name ?? "Unknown Traveler",
          passportNumber: passport.passport_number,
          documentNumber: passport.passport_number,
          issueDate: passport.issue_date,
          expiryDate: passport.expiry_date,
          extra: "National Biometric Passport Registry",
          qrToken: cleanToken,
        });
        setLoading(false);
        return;
      }

      setNotFound(true);
    } catch (err: any) {
      console.error("Verification error:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tokenFromUrl) verify(tokenFromUrl);
  }, [tokenFromUrl]);

  // List available video cameras on device
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Default to back camera on mobile (often has "back" or "environment" in label)
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("rear") ||
              d.label.toLowerCase().includes("environment")
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch((e) => {
        console.warn("Could not list video devices:", e);
      });
  }, []);

  // Live Camera Scanner Lifecycle
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (cameraActive) {
      setCameraError(null);
      try {
        html5QrCode = new Html5Qrcode("qr-camera-viewfinder", {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
            Html5QrcodeSupportedFormats.PDF_417,
          ],
          verbose: false,
        });
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        };

        const cameraIdOrConfig = selectedCameraId
          ? selectedCameraId
          : { facingMode: isFrontCamera ? "user" : "environment" };

        html5QrCode
          .start(
            cameraIdOrConfig,
            config,
            (decodedText) => {
              // Successfully scanned QR!
              if (html5QrCodeRef.current?.isScanning) {
                html5QrCodeRef.current.stop().then(() => {
                  setCameraActive(false);
                  verify(decodedText);
                }).catch(() => {
                  setCameraActive(false);
                  verify(decodedText);
                });
              } else {
                setCameraActive(false);
                verify(decodedText);
              }
            },
            () => {
              // frame scanned without QR - normal
            }
          )
          .catch((err: any) => {
            console.error("Camera start error:", err);
            setCameraError(
              err?.message ||
                "Camera access denied or unavailable. Please enable camera permissions in your browser/device settings."
            );
            setCameraActive(false);
          });
      } catch (err: any) {
        console.error("Html5Qrcode instantiation error:", err);
        setCameraError(err.message || "Could not initialize device camera scanner.");
        setCameraActive(false);
      }
    }

    return () => {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
            html5QrCodeRef.current?.clear();
          });
        } else {
          html5QrCodeRef.current.clear();
        }
        html5QrCodeRef.current = null;
      }
    };
  }, [cameraActive, selectedCameraId, isFrontCamera]);

  function toggleCameraSwitch() {
    setIsFrontCamera(!isFrontCamera);
  }

  // Scan QR code from an uploaded Image/Photo
  async function handleFileScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setCameraError(null);

    try {
      const html5QrCode = new Html5Qrcode("qr-file-processor");
      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      verify(decodedText);
    } catch (err: any) {
      console.warn("File scan error:", err);
      setCameraError("No readable QR code found in the selected image. Please try another photo.");
      setLoading(false);
    }
  }

  const isExpired = result && new Date(result.expiryDate) < new Date();
  const effectiveStatus: DocStatus = isExpired && result?.status === "active" ? "expired" : result?.status || "active";

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <OfficerNavbar title="Biometric QR Verification Console" />

      {/* Hidden container for file scan processing */}
      <div id="qr-file-processor" className="hidden" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-36 space-y-6">
        {/* Page Title */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
              <QrCode className="text-[#0B4F6C]" />
              <span>Biometric QR Verification</span>
            </h1>
            <p className="text-xs text-ink-soft mt-0.5">
              Live camera document scanner for digital e-Visas, ECOWAS passes, and biometric credentials.
            </p>
          </div>
          <Link
            to="/border/check-in"
            className="text-xs text-[#0284C7] font-bold hover:underline inline-flex items-center gap-1 bg-white px-3.5 py-2 rounded-xl border border-primary-light shadow-2xs touch-manipulation"
          >
            <span>Border Check-in Desk</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* 1. Scanner & Camera Controls */}
        <SecurityPaperPanel className="p-4 sm:p-6" showRosette>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-[#1E8E5A]" />
              <span>Optical QR Code Verification</span>
            </span>

            <div className="flex items-center gap-2">
              {/* Image / Gallery Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileScan}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2.5 bg-canvas hover:bg-zinc-100 active:bg-zinc-200 border border-primary-light rounded-xl text-xs font-semibold text-ink flex items-center gap-1.5 transition cursor-pointer shadow-2xs touch-manipulation min-h-[42px]"
                title="Select QR code image from phone gallery"
              >
                <ImageIcon size={15} />
                <span className="hidden sm:inline">Upload Image</span>
              </button>

              {/* Live Camera Toggle Button */}
              <button
                type="button"
                onClick={() => setCameraActive(!cameraActive)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs touch-manipulation min-h-[42px] active:scale-95 ${
                  cameraActive
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-[#1E8E5A] hover:bg-[#166E46] text-white"
                }`}
              >
                {cameraActive ? (
                  <>
                    <CameraOff size={16} />
                    <span>Stop Camera</span>
                  </>
                ) : (
                  <>
                    <Camera size={16} />
                    <span>📷 Start Live Camera</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Camera Error Display */}
          {cameraError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* LIVE CAMERA VIEWFINDER (Active) */}
          {cameraActive && (
            <div className="mb-6 bg-zinc-950 p-4 rounded-2xl border-2 border-[#1E8E5A] text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Live Optical Scanner Active
                  </span>
                </div>

                {cameras.length > 1 && (
                  <button
                    type="button"
                    onClick={toggleCameraSwitch}
                    className="text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition text-zinc-200 touch-manipulation"
                  >
                    <SwitchCamera size={14} />
                    <span>Flip Camera</span>
                  </button>
                )}
              </div>

              {/* Viewfinder Canvas Target with Laser Animation */}
              <div className="relative max-w-sm mx-auto overflow-hidden rounded-xl bg-black aspect-square flex items-center justify-center">
                <div id="qr-camera-viewfinder" className="w-full h-full object-cover" />

                {/* Animated Green Laser Scan Bar */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-full h-0.5 bg-[#10B981] shadow-[0_0_12px_#10B981] animate-pulse" />
                </div>

                {/* Viewfinder Corners */}
                <div className="absolute inset-6 pointer-events-none border border-white/30 rounded-lg flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-[#10B981]" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-[#10B981]" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-[#10B981]" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-[#10B981]" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 text-center mt-3">
                Align the traveler's digital e-Visa certificate QR or paper pass within the frame.
              </p>
            </div>
          )}

          {/* Manual Input Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify(tokenInput);
            }}
            className="pt-2"
          >
            <label className="block text-[11px] font-bold text-ink-soft uppercase mb-1.5">
              Or Enter Verification Token / Passport Number Manually:
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="e.g. SL-VISA-2026-XXXX or QR Token Hash..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-primary-light rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary min-h-[44px]"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !tokenInput.trim()}
                className="bg-[#0B4F6C] hover:bg-[#07364B] active:scale-95 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5 touch-manipulation min-h-[44px]"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                <span>Verify</span>
              </button>
            </div>
          </form>
        </SecurityPaperPanel>

        {/* 2. Verification Result Card */}
        {result && (
          <div
            className={`border rounded-2xl p-5 sm:p-6 shadow-md transition-all animate-slide-up ${
              effectiveStatus === "active"
                ? "bg-emerald-50/70 border-emerald-300"
                : "bg-rose-50/70 border-rose-300"
            }`}
          >
            {/* Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-xs ${
                    effectiveStatus === "active" ? "bg-[#1E8E5A]" : "bg-rose-600"
                  }`}
                >
                  {effectiveStatus === "active" ? <Check size={26} /> : <XCircle size={26} />}
                </div>
                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider mb-1 ${
                      STATUS_STYLES[effectiveStatus]?.badge
                    }`}
                  >
                    {STATUS_STYLES[effectiveStatus]?.text}
                  </span>
                  <h3 className="font-display text-lg font-bold text-ink">{result.travelerName}</h3>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-ink-soft">Document No:</p>
                <p className="font-mono text-sm font-bold text-[#0B4F6C]">{result.documentNumber}</p>
              </div>
            </div>

            {/* Document Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-5 text-xs">
              <div className="bg-white/80 p-3 rounded-xl border border-zinc-200">
                <p className="text-[10px] uppercase font-bold text-ink-soft">Passport No</p>
                <p className="font-mono font-bold text-ink mt-0.5">{result.passportNumber}</p>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-zinc-200">
                <p className="text-[10px] uppercase font-bold text-ink-soft">Document Type</p>
                <p className="font-bold text-ink mt-0.5 capitalize">{result.docType.replace("_", " ")}</p>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-zinc-200">
                <p className="text-[10px] uppercase font-bold text-ink-soft">Issue Date</p>
                <p className="font-mono text-ink mt-0.5">{new Date(result.issueDate).toLocaleDateString()}</p>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-zinc-200">
                <p className="text-[10px] uppercase font-bold text-ink-soft">Expiration Date</p>
                <p className={`font-mono font-bold mt-0.5 ${isExpired ? "text-rose-600" : "text-emerald-700"}`}>
                  {new Date(result.expiryDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Extra notes */}
            <div className="p-3 bg-white/90 rounded-xl border border-zinc-200 flex items-center justify-between text-xs mb-4">
              <span className="text-ink-soft font-medium">Authorization Scope:</span>
              <span className="font-bold text-ink">{result.extra}</span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setTokenInput("");
                  setCameraActive(true);
                }}
                className="px-4 py-2 bg-white hover:bg-zinc-50 border border-primary-light text-ink text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Scan Next Traveler
              </button>

              <Link
                to={`/border/check-in`}
                className="bg-[#1E8E5A] hover:bg-[#166E46] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Proceed to Check-in Desk</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Not Found Alert */}
        {notFound && (
          <div className="p-5 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-900 shadow-sm animate-slide-up">
            <div className="flex items-center gap-2 font-bold mb-1 text-sm text-rose-700">
              <XCircle size={18} />
              <span>Document Not Found or Invalid</span>
            </div>
            <p className="text-rose-800 text-[11px] leading-relaxed">
              No matching digital visa or ECOWAS travel pass was found for token:{" "}
              <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-rose-200">
                {tokenInput}
              </span>
              . Please inspect traveler credentials physically.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
