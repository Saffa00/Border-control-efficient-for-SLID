export type StampStatus =
  | "submitted"
  | "under_review"
  | "documents_requested"
  | "approved"
  | "rejected"
  | "draft"
  | "pending";

interface StatusStampProps {
  status: StampStatus | string;
}

const STAMP_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; rotate: string }
> = {
  submitted: { label: "Submitted", color: "text-status-pending border-status-pending", bg: "bg-status-pending-bg", rotate: "rotate-2" },
  pending: { label: "Pending", color: "text-status-pending border-status-pending", bg: "bg-status-pending-bg", rotate: "rotate-2" },
  under_review: { label: "Under Review", color: "text-status-pending border-status-pending", bg: "bg-status-pending-bg", rotate: "-rotate-1" },
  documents_requested: { label: "Docs Needed", color: "text-accent border-accent", bg: "bg-accent-light", rotate: "rotate-1" },
  approved: { label: "Approved", color: "text-status-approved border-status-approved", bg: "bg-status-approved-bg", rotate: "-rotate-3" },
  rejected: { label: "Rejected", color: "text-status-rejected border-status-rejected", bg: "bg-status-rejected-bg", rotate: "rotate-3" },
  draft: { label: "Draft", color: "text-ink-soft border-ink-soft", bg: "bg-canvas", rotate: "rotate-0" },
};

/**
 * Renders a visa/application status as an immigration-stamp-style badge:
 * circular, slightly rotated, double-ringed border — evokes a physical
 * entry stamp rather than a generic colored pill.
 */
export function StatusStamp({ status }: StatusStampProps) {
  const cfg = STAMP_CONFIG[status] || {
    label: status.replace("_", " "),
    color: "text-primary border-primary",
    bg: "bg-primary-light",
    rotate: "rotate-0",
  };

  return (
    <div
      className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${cfg.rotate}
                  border-2 ${cfg.color} ${cfg.bg}`}
      style={{ boxShadow: `inset 0 0 0 3px var(--tw-stamp-inner, transparent)` }}
    >
      <div className={`w-[84px] h-[84px] rounded-full border border-dashed ${cfg.color}
                        flex items-center justify-center text-center px-2`}>
        <span className={`font-mono text-[11px] font-semibold uppercase tracking-wide ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>
    </div>
  );
}
