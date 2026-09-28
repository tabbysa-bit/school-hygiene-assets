import React from 'react';
import { ChevronRight, BookOpen, ShieldAlert } from 'lucide-react';

interface AppendixMenuProps {
  onSelectGroup: (groupKey: 'foodborne' | 'ccpcp') => void;
}

export const AppendixMenu: React.FC<AppendixMenuProps> = ({ onSelectGroup }) => {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => onSelectGroup('foodborne')}
        className="w-full p-5 bg-white border border-[#E5EDE9] hover:border-slate-300 rounded-2xl flex items-center justify-between text-left shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:bg-[#F8FAF9] transition-all group cursor-pointer"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold text-[#172033]">
              계절별 주요 식중독
            </div>
            <div className="text-xs text-[#64748B] mt-0.5">
              봄·여름·가을·겨울철 호발 식중독 균과 예방 지침 4종
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
      </button>

      <button
        type="button"
        onClick={() => onSelectGroup('ccpcp')}
        className="w-full p-5 bg-white border border-[#E5EDE9] hover:border-slate-300 rounded-2xl flex items-center justify-between text-left shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:bg-[#F8FAF9] transition-all group cursor-pointer"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold text-[#172033]">
              CCP 및 CP 기록지 작성요령
            </div>
            <div className="text-xs text-[#64748B] mt-0.5">
              HACCP 중요관리점 검수·가열·소독 및 일반위생관리 작성법 4종
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
      </button>
    </div>
  );
};
