import PDFDocument from "pdfkit";
import { join } from "node:path";

const ink = "#172231";
const secondary = "#4d5662";
const rule = "#a4adb7";
const margin = { top: 78, bottom: 54, left: 46, right: 46 };
const paper = "#f0f2f5";

export function openAssessmentDocument(title: string, formLabel: string, employee: string) {
  const doc = new PDFDocument({
    size: "A4",
    margins: margin,
    bufferPages: true,
    info: { Title: title, Creator: "Azymut" },
  });
  const chunks: Buffer[] = [];
  const complete = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  doc.font(join(process.cwd(), "assets/fonts/NotoSans-Regular.ttf"));
  const width = doc.page.width - margin.left - margin.right;
  const right = margin.left + width;

  function nextPageIfNeeded(height: number) {
    if (doc.y + height > doc.page.height - margin.bottom) doc.addPage();
  }

  function ruleAt(y: number, color = rule) {
    doc.save().lineWidth(0.65).strokeColor(color)
      .moveTo(margin.left, y).lineTo(right, y).stroke().restore();
  }

  function textHeight(value: string) {
    return value ? doc.fontSize(10).heightOfString(value, { width, lineGap: 3 }) : 0;
  }

  function text(value: string) {
    doc.x = margin.left;
    doc.fillColor(ink).fontSize(10).text(value, { width, lineGap: 3 });
  }

  function reference(value: string) {
    doc.y += 10;
    doc.fillColor(secondary).fontSize(8.5).text(value, { width, lineGap: 2 });
    doc.y += 11;
  }

  function section(value: string) {
    nextPageIfNeeded(55);
    doc.y += 9;
    const y = doc.y;
    doc.save().rect(margin.left, y, width, 25).fill(paper).restore();
    doc.fillColor(ink).fontSize(11).text(value, margin.left + 9, y + 6, { width: width - 18 });
    doc.x = margin.left;
    doc.y = y + 32;
  }

  function heading(value: string) {
    nextPageIfNeeded(40);
    doc.y += 9;
    doc.x = margin.left;
    doc.fillColor(ink).fontSize(11.5).text(value, { width, lineGap: 2 });
    doc.y += 5;
  }

  function field(label: string, value: string) {
    const captionWidth = 155;
    const valueWidth = width - captionWidth - 12;
    const labelHeight = doc.fontSize(9).heightOfString(label, { width: captionWidth });
    const valueHeight = doc.fontSize(10).heightOfString(value, { width: valueWidth, lineGap: 2 });
    const height = Math.max(23, Math.max(labelHeight, valueHeight) + 8);
    nextPageIfNeeded(height);
    const y = doc.y;
    doc.fillColor(secondary).fontSize(9).text(label, margin.left, y + 4, { width: captionWidth });
    doc.fillColor(ink).fontSize(10).text(value, margin.left + captionWidth + 12, y + 4, { width: valueWidth, lineGap: 2 });
    ruleAt(y + height, "#d6dbe1");
    doc.x = margin.left;
    doc.y = y + height;
  }

  function signatures(groupTitle: string, labels: string[], acknowledgement?: string) {
    const rows = labels.length * 54;
    const statementHeight = acknowledgement
      ? textHeight(acknowledgement) + 6
      : 0;
    nextPageIfNeeded(rows + statementHeight + 43);
    heading(groupTitle);
    if (acknowledgement) {
      text(acknowledgement);
      doc.y += 6;
    }

    for (const label of labels) {
      const y = doc.y;
      const labelWidth = 166;
      const boxX = margin.left + labelWidth + 10;
      const labelHeight = doc.fontSize(9.5).heightOfString(label, { width: labelWidth });
      doc.fillColor(ink).text(label, margin.left, y + (44 - labelHeight) / 2, { width: labelWidth });
      doc.save().lineWidth(0.7).strokeColor(rule)
        .rect(boxX, y, right - boxX, 44).stroke().restore();
      doc.x = margin.left;
      doc.y = y + 54;
    }
  }

  function writingLines(count: number) {
    nextPageIfNeeded(count * 18);
    for (let line = 0; line < count; line++) {
      doc.y += 18;
      ruleAt(doc.y);
    }
  }

  function pageFurniture(index: number, total: number) {
    doc.switchToPage(index);
    const footer = doc.page.height - 34;
    doc.fontSize(8).fillColor(secondary);
    doc.text("URZĄD DEMONSTRACYJNY", margin.left, 32, { lineBreak: false });
    doc.text(formLabel, right - doc.widthOfString(formLabel), 32, { lineBreak: false });
    ruleAt(51);
    ruleAt(footer - 8);
    const number = `Strona ${index + 1} z ${total}`;
    doc.text(`Azymut  |  Dokument demonstracyjny  |  ${employee}`, margin.left, footer, { lineBreak: false });
    doc.text(number, right - doc.widthOfString(number), footer, { lineBreak: false });
  }

  async function finish() {
    const { start, count } = doc.bufferedPageRange();
    for (let index = start; index < start + count; index++) pageFurniture(index, count);
    doc.end();
    return complete;
  }

  doc.fillColor(ink).fontSize(19).text(title, { width, lineGap: 3 });
  return { doc, text, textHeight, nextPageIfNeeded, reference, section, heading, field, signatures, writingLines, finish };
}

export function displayDate(value: string) {
  return value.split("-").reverse().join(".");
}
