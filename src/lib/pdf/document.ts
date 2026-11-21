import PDFDocument from "pdfkit";
import { join } from "node:path";

export function openAssessmentDocument(title: string) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 42,
    info: { Title: title },
  });
  const chunks: Buffer[] = [];
  const complete = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  doc.font(join(process.cwd(), "assets/fonts/NotoSans-Regular.ttf"));
  function text(value: string) {
    doc.fillColor("#17152c").fontSize(10).text(value, { lineGap: 2 });
  }
  function heading(value: string) {
    if (doc.y > doc.page.height - 110) doc.addPage();
    doc
      .moveDown(0.8)
      .fillColor("#46318c")
      .fontSize(13)
      .text(value)
      .moveDown(0.35);
  }
  function signature(label: string) {
    doc.moveDown(0.45);
    text(`........................................................  ${label}`);
  }
  async function finish() {
    doc.end();
    return complete;
  }
  doc.fillColor("#46318c").fontSize(10).text("AZYMUT / DANE SYNTETYCZNE");
  doc.moveDown(0.6).fillColor("#17152c").fontSize(19).text(title);
  return { doc, text, heading, signature, finish };
}
export function displayDate(value: string) {
  return value.split("-").reverse().join(".");
}
