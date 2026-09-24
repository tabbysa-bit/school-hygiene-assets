import React from 'react';
import { SchoolSettings } from '../types';
import { Settings, ShieldCheck, Sparkles, Lock } from 'lucide-react';

interface HeaderProps {
  schoolSettings: SchoolSettings;
  onOpenSettings: () => void;
  activeTab: 'monthly' | 'morning' | 'admin';
  onSelectTab: (tab: 'monthly' | 'morning' | 'admin') => void;
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
      {/* Top utility bar */}
      <div className="flex items-center justify-between py-2 text-xs">
        {/* Future sub-app routing tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
          <button
            type="button"
            onClick={() => onSelectTab('monthly')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'monthly'
                ? 'bg-white text-[#263238] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#527765]" />
            월별 위생교육
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('morning')}
            className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'morning'
                ? 'bg-white text-[#263238] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            모닝위생
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-700 rounded-full font-bold">
              준비중
            </span>
          </button>
        </div>

        {/* Right tools: Admin & Settings */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectTab(activeTab === 'admin' ? 'monthly' : 'admin')}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
              activeTab === 'admin'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-200/50'
            }`}
            title="관리자 페이지"
          >
            <Lock className="w-3 h-3" />
            관리자
          </button>
        </div>
      </div>

      {/* Main Hero Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden mt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#355c49] text-xs font-bold rounded-full mb-3 border border-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          학교급식종사자 위생·HACCP 교육
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1e293b] tracking-tight mb-2">
          달달(月月)이 급식안심
        </h1>

        <p className="text-base sm:text-lg text-[#68767e] font-medium leading-relaxed">
          위생은 꼼꼼하게, 급식은 당당하게!
        </p>

        {/* School Settings status action */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onOpenSettings}
            className="group flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#e7180b] hover:text-[#b71409] transition-colors py-1 px-2 rounded-lg hover:bg-rose-50/60"
          >
            <Settings className="w-4 h-4 transition-transform group-hover:rotate-45" />
            <span>
              {hasSettings
                ? `${schoolSettings.schoolName} · 교육이수대상자 ${schoolSettings.participants.length}명`
                : '학교 / 교육이수대상자 설정'}
            </span>
          </button>
        </div>
      </section>
    </header>
  );
};
