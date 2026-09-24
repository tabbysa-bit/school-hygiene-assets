import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { EducationRecord, PrintCard, SchoolSettings } from '../types';
import { formatFullRecordDate, formatRecordDate } from './records';

export interface GeneratePdfOptions {
  schoolSettings: SchoolSettings;
  month: number;
  records: EducationRecord[];
  printCards: PrintCard[];
}

export function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Builds the standalone, printable HTML document for A4 portrait report.
 * Guaranteed to have zero browser headers/footers in print media.
 */
export function buildReportHtml(options: GeneratePdfOptions): string {
  const { schoolSettings, month, records, printCards } = options;

  const sortedRecords = [...records].sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  const firstDate = sortedRecords[0]?.date || '';
  const lastDate = sortedRecords[sortedRecords.length - 1]?.date || '';
  const reportYear = firstDate.substring(0, 4) || new Date().getFullYear().toString();
  const period = `${formatFullRecordDate(firstDate)} ~ ${formatFullRecordDate(lastDate)}`;

  // Table rows for education contents (single-line table as requested: 교육일 | 교육내용)
  const educationRows = sortedRecords
    .map(
      (r) => `
    <tr>
      <td class="edu-date">${escapeHtml(formatRecordDate(r.date))}</td>
      <td class="edu-title">${escapeHtml(r.title)}</td>
    </tr>
  `
    )
    .join('');

  // Cards layout: 2, 3, or 4 columns based on card count
  let cardColumns = 2;
  let cardHeight = '48mm';
  if (printCards.length >= 5) {
    cardColumns = 3;
    cardHeight = '38mm';
  }
  if (printCards.length >= 7) {
    cardColumns = 4;
    cardHeight = '32mm';
  }

  const cardHtml =
    printCards.length > 0
      ? printCards
          .map(
            (card) => `
      <div class="print-card">
        <img src="${card.url}" alt="${escapeHtml(card.title)}" />
        <div class="print-card-title">${escapeHtml(card.title)}</div>
      </div>
    `
          )
          .join('')
      : '<div class="no-card">저장된 교육카드 이미지 정보가 없습니다.</div>';

  // Participants 2-column layout (성명 | 서명 | 성명 | 서명)
  const participants = schoolSettings.participants || [];
  const participantHalf = Math.ceil(participants.length / 2);
  let participantRows = '';

  for (let i = 0; i < participantHalf; i++) {
    const left = participants[i] || '';
    const right = participants[i + participantHalf] || '';
    participantRows += `
      <tr>
        <td class="participant-name">${escapeHtml(left)}</td>
        <td class="participant-sign"></td>
        <td class="participant-name">${escapeHtml(right)}</td>
        <td class="participant-sign"></td>
      </tr>
    `;
  }

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(schoolSettings.schoolName)}_${reportYear}년${month}월_위생교육기록</title>
<style>
@page {
  size: A4 portrait;
  margin: 20mm 15mm 15mm 15mm;
}
* {
  box-sizing: border-box;
}
html, body {
  margin: 0;
  padding: 0;
  background: white;
  color: #111;
  font-family: -apple-system, BlinkMacSystemFont, "Malgun Gothic", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  font-size: 8.5pt;
  line-height: 1.3;
}
.report-wrap {
  width: 100%;
  max-width: 180mm;
  margin: 0 auto;
}
.report-title {
  margin: 0 0 3.5mm;
  text-align: center;
  font-size: 16pt;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #0f172a;
}
.report-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2.5mm;
  font-size: 8.8pt;
  border-bottom: 1.5px solid #334155;
  padding-bottom: 1.5mm;
}
.info-item {
  font-weight: 500;
}
.report-section-title {
  margin: 2.5mm 0 1.2mm;
  font-size: 9.5pt;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 4px;
}
.report-section-title::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 11px;
  background-color: #2e7d32;
  border-radius: 2px;
}
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin-bottom: 2mm;
}
th, td {
  border: 1px solid #475569;
  padding: 1.4mm 1.5mm;
  text-align: center;
  vertical-align: middle;
  line-height: 1.25;
}
th {
  background: #f1f5f9;
  font-weight: 700;
  color: #1e293b;
}
.education-table .edu-date {
  width: 22%;
  white-space: nowrap;
  font-weight: 600;
}
.education-table .edu-title {
  width: 78%;
  text-align: left;
  padding-left: 3mm;
  word-break: keep-all;
}
.print-card-grid {
  display: grid;
  grid-template-columns: repeat(${cardColumns}, 1fr);
  gap: 2mm;
  margin-bottom: 2.5mm;
}
.print-card {
  border: 1px solid #cbd5e1;
  border-radius: 2mm;
  overflow: hidden;
  text-align: center;
  background: #ffffff;
}
.print-card img {
  display: block;
  width: 100%;
  height: ${cardHeight};
  object-fit: contain;
  background: #f8fafc;
}
.print-card-title {
  padding: 1mm 1.5mm;
  border-top: 1px solid #e2e8f0;
  font-size: 6.8pt;
  line-height: 1.15;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #334155;
}
.no-card {
  padding: 4mm;
  border: 1px solid #ddd;
  text-align: center;
  color: #777;
}
.participant-name {
  width: 22%;
  font-weight: 600;
  background: #fcfcfc;
}
.participant-sign {
  width: 28%;
  height: 8.5mm;
}
.report-note {
  margin-top: 1.5mm;
  font-size: 7.5pt;
  color: #64748b;
  text-align: right;
}
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
</head>
<body>
<div class="report-wrap">
  <div class="report-title">${escapeHtml(reportYear)}년 ${escapeHtml(month.toString())}월 위생교육 실시기록</div>
  
  <div class="report-info">
    <div class="info-item"><strong>학교명</strong> : ${escapeHtml(schoolSettings.schoolName)}</div>
  </div>

  <div class="report-section-title">교육내용</div>
  <table class="education-table">
    <thead>
      <tr>
        <th style="width: 22%;">교육일</th>
        <th style="width: 78%;">교육내용</th>
      </tr>
    </thead>
    <tbody>
      ${educationRows}
    </tbody>
  </table>

  <div class="report-section-title">교육자료</div>
  <div class="print-card-grid">
    ${cardHtml}
  </div>

  <div class="report-section-title">교육이수대상자 확인 및 서명</div>
  <table>
    <thead>
      <tr>
        <th>성명</th>
        <th>서명</th>
        <th>성명</th>
        <th>서명</th>
      </tr>
    </thead>
    <tbody>
      ${participantRows}
    </tbody>
  </table>

  <div class="report-note">※ 위 교육내용을 확인한 후 서명합니다.</div>
</div>
</body>
</html>`;
}

/**
 * Downloads the A4 report as an authentic standalone .pdf file.
 */
export async function downloadReportPdf(
  containerElement: HTMLElement,
  fileName: string
): Promise<void> {
  const canvas = await html2canvas(containerElement, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 210;
  const pdfHeight = 297;
  const marginTop = 20;
  const marginSide = 15;
  const contentWidth = pdfWidth - marginSide * 2;
  const contentHeight = (canvas.height * contentWidth) / canvas.width;

  pdf.addImage(imgData, 'JPEG', marginSide, marginTop, contentWidth, Math.min(contentHeight, pdfHeight - marginTop - 15));
  pdf.save(fileName);
}

/**
 * Opens a print dialog via clean hidden iframe or dedicated window
 * without browser headers/footers.
 */
export function openPrintDialog(options: GeneratePdfOptions): void {
  const html = buildReportHtml(options);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('브라우저 팝업이 차단되었습니다. 팝업을 허용해 주세요.');
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 350);
  };
}
