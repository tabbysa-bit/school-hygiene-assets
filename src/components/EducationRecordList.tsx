import React from 'react';
import { EducationMonth, EducationRecord } from '../types';
import { formatRecordDate } from '../utils/records';
import { Trash2, FileText, X, RotateCcw, Loader2, AlertCircle } from 'lucide-react';

interface EducationRecordListProps {
  month: EducationMonth;
  records: EducationRecord[];
  isOpen: boolean;
  onClose: () => void;
  onRequestDelete: (record: EducationRecord) => void;
  onResetMonth?: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  isSaving?: boolean;
}

export const EducationRecordList: React.FC<EducationRecordListProps> = ({
  month,
  records,
  isOpen,
  onClose,
  onRequestDelete,
  onResetMonth,
  isLoading = false,
  errorMessage = null,
  isSaving = false
}) => {
  if (!isOpen) return null;

  return (
    <section className="mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-5 bg-white border border-[#E5EDE9] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F1F5F3]">
          <h3 className="font-bold text-[#172033] text-base flex items-center gap-1.5">
            <span>📋 {month}월 교육실시기록 목록</span>
            <span className="text-xs bg-[#E6F4EA] text-[#0F766E] px-2.5 py-0.5 rounded-full font-bold">
              총 {records.length}건
            </span>
            {isSaving && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#0F766E] bg-emerald-50 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                저장 중...
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              닫기
            </button>
          </div>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-sm font-medium gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#0F766E]" />
            <span>교육 기록을 불러오는 중입니다...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm font-medium">
            아직 {month}월에 등록된 교육기록이 없습니다.
            <p className="text-xs text-slate-400 mt-1">
              상단의 [기본교육 완료] 버튼이나 하단 부록 자료에서 교육을 추가할 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F3]">
            {records.map((record) => (
              <div
                key={record.id}
                className="py-3 px-1 flex items-center justify-between gap-3 group hover:bg-slate-50/70 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-sm font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                    {formatRecordDate(record.date)}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#172033] truncate">
                      {record.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <FileText className="w-3 h-3 text-slate-400" />
                      {record.type === 'basic' ? (
                        <span className="text-[#0F766E] font-semibold">월별 기본교육</span>
                      ) : (
                        <span className="text-blue-600 font-semibold">부록 추가교육</span>
                      )}
                      <span>· 실시일: {record.date}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRequestDelete(record)}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  title="기록 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>삭제</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Action: Reset all records for the current month */}
        {records.length > 0 && onResetMonth && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
            <button
              type="button"
              onClick={onResetMonth}
              disabled={isSaving}
              className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
              title={`${month}월 등록 교육기록 전체 초기화`}
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>{month}월 교육기록 전체 초기화</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
