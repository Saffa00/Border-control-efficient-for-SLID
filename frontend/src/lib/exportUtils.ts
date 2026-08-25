import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Converts an array of flat objects into a downloadable CSV file.
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const escape = (value: any) => {
    const str = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const csvLines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];

  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}.csv`);
}

/**
 * Helper to load an image URL as HTMLImageElement for jsPDF
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

/**
 * Generates an official Sierra Leone Government A4 PDF Report
 * with Centered Crest Logo, National Tri-Color Header, and Law Enforcement Sensitive Watermark.
 */
export async function exportToPDF(
  title: string,
  subtitle: string,
  columns: { header: string; key: string }[],
  rows: Record<string, any>[]
) {
  // A4 dimensions: 210mm x 297mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;

  // 1. National Tri-Color Top Accent Strip (Green - White - Blue)
  const stripeWidth = pageWidth / 3;
  doc.setFillColor(30, 181, 58); // #1EB53A Green
  doc.rect(0, 0, stripeWidth, 2.5, "F");
  doc.setFillColor(255, 255, 255); // White
  doc.rect(stripeWidth, 0, stripeWidth, 2.5, "F");
  doc.setFillColor(0, 114, 198); // #0072C6 Blue
  doc.rect(stripeWidth * 2, 0, stripeWidth, 2.5, "F");

  // 2. Centered Official SLID Logo on A4 Paper
  const logoSize = 22; // 22mm x 22mm
  const logoX = (pageWidth - logoSize) / 2;
  const logoY = 8;

  try {
    const logoImg = await loadImage("/slid-logo.png");
    doc.addImage(logoImg, "PNG", logoX, logoY, logoSize, logoSize);
  } catch (err) {
    console.warn("Could not load /slid-logo.png for PDF header, using text fallback");
  }

  // 3. Centered Government Headers
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(11, 79, 108); // Primary
  doc.text("REPUBLIC OF SIERRA LEONE", pageWidth / 2, 34, { align: "center" });

  doc.setFontSize(13);
  doc.setTextColor(31, 41, 55); // Ink
  doc.text("DEPARTMENT OF IMMIGRATION (SLID)", pageWidth / 2, 40, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(11, 79, 108);
  doc.text(title.toUpperCase(), pageWidth / 2, 48, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle, pageWidth / 2, 54, { align: "center" });

  // Security Classification & Generation Metadata
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(140, 150, 160);
  doc.text(
    `Official Dispatch • Generated: ${new Date().toLocaleString()} • Classification: OFFICIAL USE ONLY`,
    pageWidth / 2,
    60,
    { align: "center" }
  );

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 63, pageWidth - 14, 63);

  // 4. Data Table
  autoTable(doc, {
    startY: 67,
    margin: { left: 14, right: 14 },
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => row[c.key] ?? "—")),
    headStyles: {
      fillColor: [11, 79, 108], // primary
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
      halign: "left",
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.8,
      overflow: "linebreak",
      font: "helvetica",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: (data) => {
      // Centered Footer on every page
      const pageCount = (doc as any).internal.getNumberOfPages();
      const pageCurrent = (doc as any).internal.getCurrentPageInfo().pageNumber;

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);

      doc.text(
        `Sierra Leone Immigration Department (SLID) — Official Government Record`,
        14,
        290
      );
      doc.text(`Page ${pageCurrent} of ${pageCount}`, pageWidth - 14, 290, { align: "right" });
    },
  });

  doc.save(`${title.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
