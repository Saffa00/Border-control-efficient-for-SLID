import { Check, Clock, AlertTriangle, XCircle } from "lucide-react";

interface ProgressTrackerProps {
  status: "draft" | "submitted" | "under_review" | "documents_requested" | "approved" | "rejected";
  paymentStatus: "unpaid" | "paid";
}

export function ProgressTracker({ status, paymentStatus }: ProgressTrackerProps) {
  const steps = [
    { key: "submitted", label: "1. Submitted" },
    { key: "payment", label: "2. Payment Received" },
    { key: "under_review", label: "3. Under Review" },
    { key: "documents_checked", label: "4. Documents Checked" },
    { key: "decision", label: "5. Decision Issued" },
  ];

  // Determine current active step index (0..4)
  let currentStepIdx = 0;
  if (status === "draft") {
    currentStepIdx = 0;
  } else if (status === "submitted" && paymentStatus === "unpaid") {
    currentStepIdx = 0;
  } else if (status === "submitted" && paymentStatus === "paid") {
    currentStepIdx = 1;
  } else if (status === "under_review") {
    currentStepIdx = 2;
  } else if (status === "documents_requested") {
    currentStepIdx = 3;
  } else if (status === "approved" || status === "rejected") {
    currentStepIdx = 4;
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 my-4">
      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
        Application Progress Tracker
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
        {steps.map((step, idx) => {
          const isPassed = idx < currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          const isRejectedStep = isCurrent && status === "rejected";
          const isDocActionNeeded = isCurrent && status === "documents_requested";

          return (
            <div
              key={step.key}
              className={`p-2.5 rounded-lg border text-xs flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-2 transition ${
                isRejectedStep
                  ? "bg-rose-50 border-rose-300 text-rose-900 font-bold"
                  : isDocActionNeeded
                  ? "bg-amber-50 border-amber-300 text-amber-900 font-bold"
                  : isPassed
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                  : isCurrent
                  ? "bg-[#0B4F6C] border-[#0B4F6C] text-white font-bold shadow-xs"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isPassed ? (
                  <Check size={14} className="text-emerald-700 flex-shrink-0" />
                ) : isRejectedStep ? (
                  <XCircle size={14} className="text-rose-600 flex-shrink-0" />
                ) : isDocActionNeeded ? (
                  <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
                ) : isCurrent ? (
                  <Clock size={14} className="text-emerald-300 flex-shrink-0 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0"></span>
                )}
                <span className="text-[11px] leading-snug">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
