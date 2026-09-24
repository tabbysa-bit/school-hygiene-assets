import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { getTodayISO } from '../../utils/records';
import { Calendar, AlertCircle } from 'lucide-react';

interface EducationDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMonth: number;
  title: string;
  itemTitle?: string;
  type: 'basic' | 'appendix';
  onConfirm: (date: string) => void;
}

export const EducationDateModal: React.FC<EducationDateModalProps> = ({
  isOpen,
  onClose,
  targetMonth,
  title,
  itemTitle,
  type,
  onConfirm
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      const today = new Date();
      // If current system calendar month matches the active education month, prefill today's date
      if (today.getMonth() + 1 === Number(targetMonth)) {
        setSelectedDate(getTodayISO());
      } else {
        // Otherwise set to current year and the target month 1st day or empty
        const year = today.getFullYear();
        const monthPad = String(targetMonth).padStart(2, '0');
        setSelectedDate(`${year}-${monthPad}-01`);
      }
    }
  }, [isOpen, targetMonth]);

  const handleConfirm = () => {
    if (!selectedDate) {
      setErrorMessage('교육실시 일자를 선택해 주세요.');
      return;
    }

    const parts = selectedDate.split('-');
    if (parts.length !== 3) {
      setErrorMessage('올바른 날짜 형식을 입력해 주세요.');
      return;
    }

    const inputMonth = Number(parts[1]);
    if (inputMonth !== Number(targetMonth)) {
      setErrorMessage(
        `현재 선택된 교육 월은 ${targetMonth}월입니다. ${targetMonth}월에 해당하는 교육일을 선택해 주세요.`
      );
      return;
    }

    onConfirm(selectedDate);
    onClose();
  };

  const modalTitle = type === 'basic' ? '월별 기본교육 기록' : '추가 위생교육 기록';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div className="space-y-4 py-1">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="text-xs font-bold text-[#527765] mb-1">
            {targetMonth}월 {type === 'basic' ? '기본교육' : '추가교육'}
          </div>
          <div className="text-sm font-extrabold text-slate-800 leading-snug">
            {itemTitle || title}
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        <div>
          <label
            htmlFor="educationDateInput"
            className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-1.5"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            교육 실시일 <span className="text-rose-500">*</span>
          </label>
          <input
            id="educationDateInput"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#527765] focus:border-transparent text-sm"
          />
          <p className="text-[11px] text-slate-500 mt-1.5">
            ※ 반드시 {targetMonth}월 중 실시한 날짜를 지정해야 합니다.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-[#527765] hover:bg-[#436353] text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
          >
            교육기록 추가
          </button>
        </div>
      </div>
    </Modal>
  );
};
