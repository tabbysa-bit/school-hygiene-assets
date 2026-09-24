import React from 'react';
import { EducationMonth } from '../types';
import { FileDown, Printer } from 'lucide-react';

interface ReportPrintAreaProps {
  month: EducationMonth;
  onOpenReport: () => void;
}

export const ReportPrintArea: React.FC<ReportPrintAreaProps> = ({
  month,
  onOpenReport
}) => {
  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={onOpenReport}
        className="w-full py-4 px-5 bg-[#edf3f7] hover:bg-[#e2ebf0] text-[#455a64] font-bold rounded-2xl text-base transition-all duration-150 flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs active:scale-[0.99]"
      >
        <FileDown className="w-5 h-5 text-[#546e7a]" />
        <span>📄 {month}월 교육일지 PDF / 출력</span>
      </button>
    </div>
  );
};
