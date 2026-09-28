import React from 'react';
import { SchoolSettings } from '../types';
import {
  ShieldCheck,
  Sparkles,
  Users,
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
  Settings
} from 'lucide-react';

interface CategoryHomeProps {
  morningProgress: number;
  morningNewProgress: number;
  schoolSettings: SchoolSettings;
  quizUrl?: string;
  onSelectCategory: (cat: 'meal-safety' | 'morning' | 'morning-new') => void;
  onOpenSettings: () => void;
}

export const CategoryHome: React.FC<CategoryHomeProps> = ({
  morningProgress,
  morningNewProgress,
  schoolSettings,
  onSelectCategory,
  onOpenSettings
}) => {
  const totalDays = 190;

  const morningPercent = Math.min(100, Math.round((morningProgress / totalDays) * 100));
  const morningNewPercent = Math.min(100, Math.round((morningNewProgress / totalDays) * 100));

  const hasSchoolSettings =
    Boolean(schoolSettings.schoolName) && schoolSettings.participants.length > 0;

  return (
    <div className="space-y-8">
      {/* Hero Welcome Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full mb-3 border border-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          학교급식 조리종사자 위생·HACCP 교육 플랫폼
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
          학교급식종사자 위생교육
        </h1>

        <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
          위생은 꼼꼼하게, 급식은 당당하게!
        </p>

        {/* School settings info banner */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            기기별 로컬 저장 · 무과금 완전 무료 정적 웹앱
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 transition-colors py-1 px-2 rounded-lg hover:bg-emerald-50 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>
              {hasSchoolSettings
                ? `${schoolSettings.schoolName} (${schoolSettings.participants.length}명 설정됨)`
                : '학교 및 조리종사자 설정'}
            </span>
          </button>
        </div>
      </section>

      {/* Exactly 3 Categories as Large Card Menus */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            교육 카테고리 선택
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            학습하고자 하는 교육과정을 선택하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: 급식안심(월) */}
          <div
            onClick={() => onSelectCategory('meal-safety')}
            className="group relative bg-white rounded-3xl p-6 border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-100 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  월별 정기교육
                </span>
                <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                  01
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                급식안심(월)
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                3월부터 2월까지 월 1회 정기 위생·HACCP 교육 및 교육실시일지 관리 (총 10개 월 및 부록 포함)
              </p>

              <div className="space-y-1.5 mb-6 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>10개 교육월 (1월·8월 미실시)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>부록: 계절별 식중독 · CCP 기록요령</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>교육실시기록 작성 & PDF 출력</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 px-4 bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-2xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>급식안심 교육 시작</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Card 2: 모닝위생(일) */}
          <div
            onClick={() => onSelectCategory('morning')}
            className="group relative bg-white rounded-3xl p-6 border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-100 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  조리 전 3분
                </span>
                <span className="text-xs font-bold text-slate-400 group-hover:text-amber-600 transition-colors">
                  02
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                모닝위생(일)
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Day001부터 Day190까지 학교 급식일 순서대로 이어가는 일일 핵심 위생수칙
              </p>

              {/* Progress status for Morning */}
              <div className="mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">현재 진행</span>
                  <span className="text-amber-700">Day {morningProgress} / {totalDays}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${morningPercent}%` }}
                  />
                </div>
                {morningProgress >= totalDays ? (
                  <p className="text-[11px] font-bold text-amber-700">
                    🎉 모닝위생 전체 교육을 완료했습니다.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    {morningProgress === 0
                      ? '아직 시작하지 않았습니다.'
                      : `Day ${morningProgress + 1}부터 이어보기 가능`}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 px-4 bg-amber-600 group-hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-2xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>모닝위생 교육 시작</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Card 3: 모닝위생_신규(일) */}
          <div
            onClick={() => onSelectCategory('morning-new')}
            className="group relative bg-white rounded-3xl p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-full border border-blue-100 flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-600" />
                  신규 맞춤과정
                </span>
                <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                  03
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-blue-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                모닝위생_신규(일)
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                신규 조리종사자를 위한 190일 독립 집중 위생 적응과정 (기존 과정과 독립 관리)
              </p>

              {/* Progress status for Morning New */}
              <div className="mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">현재 진행</span>
                  <span className="text-blue-700">Day {morningNewProgress} / {totalDays}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${morningNewPercent}%` }}
                  />
                </div>
                {morningNewProgress >= totalDays ? (
                  <p className="text-[11px] font-bold text-blue-700">
                    🎉 모닝위생(신규) 전체 교육을 완료했습니다.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    {morningNewProgress === 0
                      ? '아직 시작하지 않았습니다.'
                      : `Day ${morningNewProgress + 1}부터 이어보기 가능`}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 px-4 bg-blue-600 group-hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-2xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>
                {morningNewProgress === 0
                  ? 'Day 1부터 시작하기'
                  : morningNewProgress >= totalDays
                  ? 'Day 1부터 다시보기'
                  : `Day ${morningNewProgress + 1}부터 이어보기`}
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

