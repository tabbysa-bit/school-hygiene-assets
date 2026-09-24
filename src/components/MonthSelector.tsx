import React from 'react';
import { AVAILABLE_MONTHS, EducationMonth } from '../types';

interface MonthSelectorProps {
  currentMonth: EducationMonth;
  onSelectMonth: (month: EducationMonth) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonth,
  onSelectMonth
}) => {
  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
          교육 월을 선택하세요.
        </h2>
        <span className="text-xs text-slate-400 font-medium">
          학년도 기준 (3월~2월, 1·8월 방학 제외)
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {AVAILABLE_MONTHS.map((month) => {
          const isActive = month === currentMonth;
          return (
            <button
              key={month}
              type="button"
              onClick={() => onSelectMonth(month)}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 shadow-2xs ${
                isActive
                  ? 'bg-[#527765] text-white shadow-sm ring-2 ring-[#527765] ring-offset-2'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {month}월
            </button>
          );
        })}
      </div>
    </div>
  );
};
