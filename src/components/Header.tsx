import React from 'react';
import { SchoolSettings } from '../types';
import {
  Settings,
  ShieldCheck,
  Sparkles,
  Lock,
  Home,
  Users
} from 'lucide-react';

export type AppTab = 'home' | 'meal-safety' | 'morning' | 'morning-new' | 'admin';

interface HeaderProps {
  schoolSettings: SchoolSettings;
  onOpenSettings: () => void;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  schoolSettings,
  onOpenSettings,
  activeTab,
  onSelectTab
}) => {
  const hasSettings =
    Boolean(schoolSettings.schoolName) && schoolSettings.participants.length > 0;

  return (
    <header className="mb-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 py-1">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#EAEFEA]/80 border border-[#E2EBE5] rounded-2xl overflow-x-auto scrollbar-none min-h-[48px] sm:min-h-[50px]">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`px-3.5 py-2 rounded-[14px] font-bold text-[14px] sm:text-[15px] transition-all duration-150 flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[40px] ${
              activeTab === 'home'
                ? 'bg-white text-[#172033] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Home className="w-4 h-4 text-slate-600" />
            <span>홈</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('meal-safety')}
            className={`px-3.5 py-2 rounded-[14px] font-bold text-[14px] sm:text-[15px] transition-all duration-150 flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[40px] ${
              activeTab === 'meal-safety'
                ? 'bg-white text-[#172033] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            <span>1. 급식안심(월)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('morning')}
            className={`px-3.5 py-2 rounded-[14px] font-bold text-[14px] sm:text-[15px] transition-all duration-150 flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[40px] ${
              activeTab === 'morning'
                ? 'bg-white text-[#172033] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>2. 모닝위생(일)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('morning-new')}
            className={`px-3.5 py-2 rounded-[14px] font-bold text-[14px] sm:text-[15px] transition-all duration-150 flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[40px] ${
              activeTab === 'morning-new'
                ? 'bg-white text-[#172033] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>3. 모닝위생_신규(일)</span>
          </button>
        </div>

        {/* Right tools: Admin & Settings */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-[14px] font-semibold px-3.5 py-2 rounded-xl border border-[#E5EDE9] bg-white hover:bg-slate-50/80 text-slate-700 transition-colors shadow-2xs cursor-pointer min-h-[42px]"
            title="학교 및 조리종사자 설정"
          >
            <Settings className="w-4 h-4 text-[#64748B]" />
            <span className="max-w-[150px] truncate">
              {hasSettings ? schoolSettings.schoolName : '학교설정'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab(activeTab === 'admin' ? 'home' : 'admin')}
            className={`flex items-center gap-1.5 text-[14px] font-bold px-3.5 py-2 rounded-xl border transition-colors cursor-pointer min-h-[42px] ${
              activeTab === 'admin'
                ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-[#E5EDE9] bg-white hover:bg-slate-50/80 shadow-2xs'
            }`}
            title="관리자 설정"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>관리자</span>
          </button>
        </div>
      </div>
    </header>
  );
};
