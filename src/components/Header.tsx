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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 py-2 text-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-2xl overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-slate-600" />
            홈
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('meal-safety')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'meal-safety'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            1. 급식안심(월)
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('morning')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'morning'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            2. 모닝위생(일)
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('morning-new')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'morning-new'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            3. 모닝위생_신규(일)
          </button>
        </div>

        {/* Right tools: Admin & Settings */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="학교 및 조리종사자 설정"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span className="max-w-[130px] truncate">
              {hasSettings ? schoolSettings.schoolName : '학교설정'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab(activeTab === 'admin' ? 'home' : 'admin')}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs'
            }`}
            title="관리자 설정"
          >
            <Lock className="w-3 h-3" />
            관리자
          </button>
        </div>
      </div>
    </header>
  );
};
