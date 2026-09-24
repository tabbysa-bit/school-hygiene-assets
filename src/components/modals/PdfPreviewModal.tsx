import React, { useRef, useState } from 'react';
import { Modal } from './Modal';
import { GeneratePdfOptions, downloadReportPdf, openPrintDialog } from '../../utils/pdfGenerator';
import { Download, Printer, Loader2, FileText } from 'lucide-react';
import { formatRecordDate, formatFullRecordDate } from '../../utils/records';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: GeneratePdfOptions;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  options
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { schoolSettings, month, records, printCards } = options;

  const sortedRecords = [...records].sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  const firstDate = sortedRecords[0]?.date || '';
  const lastDate = sortedRecords[sortedRecords.length - 1]?.date || '';
  const reportYear = firstDate.substring(0, 4) || new Date().getFullYear().toString();
  const period = `${formatFullRecordDate(firstDate)} ~ ${formatFullRecordDate(lastDate)}`;

  // Column count for print cards
  let cardColumnsClass = 'grid-cols-2';
  let cardHeightClass = 'h-44';
  if (printCards.length >= 5) {
    cardColumnsClass = 'grid-cols-3';
    cardHeightClass = 'h-32';
  }
  if (printCards.length >= 7) {
    cardColumnsClass = 'grid-cols-4';
    cardHeightClass = 'h-28';
  }

  const participants = schoolSettings.participants || [];
  const participantHalf = Math.ceil(participants.length / 2);
  const participantRows: { left: string; right: string }[] = [];
  for (let i = 0; i < participantHalf; i++) {
    participantRows.push({
      left: participants[i] || '',
      right: participants[i + participantHalf] || ''
    });
  }

  const fileName = `${schoolSettings.schoolName || '학교'}_${reportYear}년${String(month).padStart(2, '0')}월_위생교육기록.pdf`;

  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    try {
      setIsGenerating(true);
      await downloadReportPdf(printAreaRef.current, fileName);
    } catch (err) {
      console.error('PDF generation error', err);
      alert('PDF 생성 중 오류가 발생했습니다. 브라우저 인쇄 기능을 이용해 주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    openPrintDialog(options);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${month}월 위생교육 실시기록 PDF 미리보기`}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col space-y-4">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>A4 세로 서식 (여백 15mm 규격)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              직접 인쇄
            </button>
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#527765] hover:bg-[#436353] text-white text-xs font-bold rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              PDF 다운로드
            </button>
          </div>
        </div>

        {/* Scrollable Preview Sheet (styled exactly like A4 paper) */}
        <div className="overflow-x-auto p-2 bg-slate-100/80 rounded-xl flex justify-center">
          <div
            ref={printAreaRef}
            className="w-[595px] min-h-[750px] bg-white text-slate-900 p-8 shadow-md rounded-sm border border-slate-300 text-[10px] leading-tight flex flex-col justify-between"
            style={{ fontFamily: "'Malgun Gothic', 'Noto Sans KR', sans-serif" }}
          >
            <div>
              {/* Report Header */}
              <div className="text-center font-black text-lg text-slate-900 pb-2 mb-3 border-b-2 border-slate-900 tracking-tight">
                {reportYear}년 {month}월 위생교육 실시기록
              </div>

              {/* School Info */}
              <div className="flex justify-between items-center text-[10px] font-semibold text-slate-700 mb-3 px-1 border-b pb-1.5 border-slate-300">
                <div>
                  <span className="font-bold text-slate-900">학교명 :</span>{' '}
                  {schoolSettings.schoolName}
                </div>
              </div>

              {/* Section 1: Education Contents */}
              <div className="text-[11px] font-bold text-slate-900 mb-1 flex items-center gap-1">
                <span className="w-1.5 h-3 bg-[#527765] inline-block rounded-xs"></span>
                교육내용
              </div>
              <table className="w-full border-collapse border border-slate-600 text-center mb-3 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-600">
                    <th className="border border-slate-600 py-1 px-2 w-[22%]">교육일</th>
                    <th className="border border-slate-600 py-1 px-2 text-left w-[78%]">
                      교육내용
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRecords.map((r) => (
                    <tr key={r.id} className="border-b border-slate-300">
                      <td className="border border-slate-600 py-1 px-1 font-semibold text-slate-700">
                        {formatRecordDate(r.date)}
                      </td>
                      <td className="border border-slate-600 py-1 px-2 text-left text-slate-900">
                        {r.title}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Section 2: Education Materials Cards */}
              <div className="text-[11px] font-bold text-slate-900 mb-1 flex items-center gap-1">
                <span className="w-1.5 h-3 bg-[#527765] inline-block rounded-xs"></span>
                교육자료
              </div>
              <div className={`grid ${cardColumnsClass} gap-2 mb-3`}>
                {printCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-300 rounded-sm overflow-hidden bg-slate-50 flex flex-col items-center"
                  >
                    <img
                      src={card.url}
                      alt={card.title}
                      className={`w-full ${cardHeightClass} object-contain bg-white`}
                    />
                    <div className="w-full text-center py-0.5 px-1 text-[8.5px] font-bold border-t border-slate-200 text-slate-800 truncate">
                      {card.title}
                    </div>
                  </div>
                ))}
              </div>

              {/* Section 3: Participants Signatures */}
              <div className="text-[11px] font-bold text-slate-900 mb-1 flex items-center gap-1">
                <span className="w-1.5 h-3 bg-[#527765] inline-block rounded-xs"></span>
                교육이수대상자 확인 및 서명
              </div>
              <table className="w-full border-collapse border border-slate-600 text-center text-[10px]">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-600">
                    <th className="border border-slate-600 py-1 px-2 w-[22%]">성명</th>
                    <th className="border border-slate-600 py-1 px-2 w-[28%]">서명</th>
                    <th className="border border-slate-600 py-1 px-2 w-[22%]">성명</th>
                    <th className="border border-slate-600 py-1 px-2 w-[28%]">서명</th>
                  </tr>
                </thead>
                <tbody>
                  {participantRows.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-300 h-7">
                      <td className="border border-slate-600 py-1 font-semibold text-slate-800 bg-slate-50/50">
                        {row.left}
                      </td>
                      <td className="border border-slate-600 py-1"></td>
                      <td className="border border-slate-600 py-1 font-semibold text-slate-800 bg-slate-50/50">
                        {row.right}
                      </td>
                      <td className="border border-slate-600 py-1"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right text-[8.5px] text-slate-500 mt-2">
              ※ 위 교육내용을 확인한 후 서명합니다.
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
};
