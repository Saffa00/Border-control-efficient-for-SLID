import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { exportToCSV, exportToPDF } from "../../lib/exportUtils";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { AdminNavbar } from "../../components/AdminNavbar";

type ReportType = "visa_issuance" | "border_traffic" | "overstays";

const REPORT_CONFIG: Record<
  ReportType,
  { label: string; usesDateRange: boolean; columns: { header: string; key: string }[] }
> = {
  visa_issuance: {
    label: "Visa Issuance Report",
    usesDateRange: true,
    columns: [
      { header: "Visa #", key: "visa_number" },
      { header: "Traveler", key: "full_name" },
      { header: "Passport #", key: "passport_number" },
      { header: "Visa Type", key: "visa_type" },
      { header: "Issue Date", key: "issue_date" },
      { header: "Expiry Date", key: "expiry_date" },
      { header: "Status", key: "status" },
    ],
  },
  border_traffic: {
    label: "Border Traffic Report",
    usesDateRange: true,
    columns: [
      { header: "Traveler", key: "full_name" },
      { header: "Passport #", key: "passport_number" },
      { header: "Checkpoint", key: "checkpoint" },
      { header: "Direction", key: "movement_type" },
      { header: "Decision", key: "decision" },
      { header: "Risk Score", key: "risk_score" },
      { header: "Logged At", key: "logged_at" },
    ],
  },
  overstays: {
    label: "Overstay Report",
    usesDateRange: false,
    columns: [
      { header: "Traveler", key: "full_name" },
      { header: "Passport #", key: "passport_number" },
      { header: "Entry Checkpoint", key: "entry_checkpoint" },
      { header: "Entry Date", key: "entry_at" },
      { header: "Authorization Expiry", key: "authorization_expiry" },
      { header: "Days Overstayed", key: "days_overstayed" },
    ],
  },
};

const today = new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("visa_issuance");
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [generating, setGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const config = REPORT_CONFIG[reportType];

  async function generateReport() {
    setGenerating(true);
    setHasGenerated(false);

    let result: Record<string, any>[] = [];

    if (reportType === "visa_issuance") {
      const { data } = await supabase
        .from("digital_visas")
        .select(
          "visa_number, issue_date, expiry_date, status, passports(passport_number, users(full_name)), application_id, visa_applications(visa_types(name))"
        )
        .gte("issue_date", startDate)
        .lte("issue_date", endDate)
        .order("issue_date", { ascending: false });

      result = (data ?? []).map((d: any) => ({
        visa_number: d.visa_number,
        full_name: d.passports?.users?.full_name,
        passport_number: d.passports?.passport_number,
        visa_type: d.visa_applications?.visa_types?.name,
        issue_date: d.issue_date,
        expiry_date: d.expiry_date,
        status: d.status,
      }));
    }

    if (reportType === "border_traffic") {
      const { data } = await supabase
        .from("border_logs")
        .select(
          "movement_type, decision, risk_score, logged_at, checkpoints(name), passports(passport_number, users(full_name))"
        )
        .gte("logged_at", startDate)
        .lte("logged_at", `${endDate}T23:59:59`)
        .order("logged_at", { ascending: false });

      result = (data ?? []).map((d: any) => ({
        full_name: d.passports?.users?.full_name,
        passport_number: d.passports?.passport_number,
        checkpoint: d.checkpoints?.name,
        movement_type: d.movement_type,
        decision: d.decision,
        risk_score: d.risk_score,
        logged_at: new Date(d.logged_at).toLocaleString(),
      }));
    }

    if (reportType === "overstays") {
      const { data } = await supabase
        .from("overstaying_travelers")
        .select("*")
        .order("days_overstayed", { ascending: false });

      result = (data ?? []).map((d: any) => ({
        full_name: d.full_name,
        passport_number: d.passport_number,
        entry_checkpoint: d.entry_checkpoint,
        entry_at: new Date(d.entry_at).toLocaleDateString(),
        authorization_expiry: new Date(d.authorization_expiry).toLocaleDateString(),
        days_overstayed: d.days_overstayed,
      }));
    }

    setRows(result);
    setGenerating(false);
    setHasGenerated(true);
  }

  function handleExportCSV() {
    exportToCSV(config.label.replace(/\s+/g, "-").toLowerCase(), rows);
  }

  function handleExportPDF() {
    const subtitle = config.usesDateRange
      ? `${startDate} to ${endDate}`
      : `Current as of ${new Date().toLocaleDateString()}`;
    exportToPDF(config.label, subtitle, config.columns, rows);
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <AdminNavbar />

      <main className="max-w-6xl mx-auto px-6 py-8 grid gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Immigration & Visa Reports</h1>
          <p className="text-sm text-ink-soft">
            Generate and export official PDF and CSV audit logs for visa issuance, border crossings, and overstay tracking.
          </p>
        </div>
        {/* Report controls */}
        <SecurityPaperPanel className="p-6">
          <div className="grid grid-cols-3 gap-4 items-end mb-2">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-sm font-medium mb-1.5">Report type</label>
              <select
                className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value as ReportType);
                  setHasGenerated(false);
                }}
              >
                {Object.entries(REPORT_CONFIG).map(([value, cfg]) => (
                  <option key={value} value={value}>{cfg.label}</option>
                ))}
              </select>
            </div>

            {config.usesDateRange ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1.5">From</label>
                  <input
                    type="date"
                    className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">To</label>
                  <input
                    type="date"
                    className="w-full border border-primary-light rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="col-span-2 flex items-center">
                <p className="text-xs text-ink-soft italic">
                  This report always reflects current data — no date range applies.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={generateReport}
            disabled={generating}
            className="bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-40 transition mt-3"
          >
            {generating ? "Generating..." : "Generate report"}
          </button>
        </SecurityPaperPanel>

        {/* Results + export */}
        {hasGenerated && (
          <SecurityPaperPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg">
                {config.label} <span className="text-ink-soft text-sm font-body">({rows.length} rows)</span>
              </h2>
              {rows.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="border border-primary text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-light transition"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="bg-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition"
                  >
                    Export PDF
                  </button>
                </div>
              )}
            </div>

            {rows.length === 0 ? (
              <p className="text-ink-soft text-sm text-center py-8">
                No data matches this report's criteria.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary-light text-left">
                      {config.columns.map((c) => (
                        <th key={c.key} className="py-2 pr-4 text-xs uppercase tracking-wide text-ink-soft font-medium">
                          {c.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 25).map((row, i) => (
                      <tr key={i} className="border-b border-primary-light/40">
                        {config.columns.map((c) => (
                          <td key={c.key} className="py-2 pr-4">{row[c.key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 25 && (
                  <p className="text-xs text-ink-soft text-center mt-3">
                    Showing first 25 of {rows.length} rows — export to see all.
                  </p>
                )}
              </div>
            )}
          </SecurityPaperPanel>
        )}
      </main>
    </div>
  );
}
