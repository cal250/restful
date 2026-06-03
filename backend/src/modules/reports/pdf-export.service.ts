import PDFDocument from "pdfkit";

/** Renders dashboard report metrics into a PDF document stream. */
export function reportToPdf(report: Record<string, Record<string, unknown>>): PDFKit.PDFDocument {
  const document = new PDFDocument({ margin: 48 });
  document.fontSize(20).text("TZW Fire Extinguisher Management Report");
  document.moveDown();
  for (const [section, metrics] of Object.entries(report)) {
    document.fontSize(14).text(section.toUpperCase());
    for (const [metric, value] of Object.entries(metrics)) {
      if (!Array.isArray(value)) document.fontSize(10).text(`${metric}: ${value}`);
    }
    document.moveDown();
  }
  return document;
}
