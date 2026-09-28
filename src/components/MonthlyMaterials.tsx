import React, { useState } from 'react';
import { EducationMonth, MaterialItem } from '../types';
import {
  CheckCircle2,
  ClipboardList,
  FileDown,
  ZoomIn,
  Loader2,
  ImageOff,
  Video,
  HelpCircle,
  ExternalLink,
  Film,
  RotateCcw
} from 'lucide-react';
import { Modal } from './modals/Modal';
import { EducationCardImage } from './EducationCardImage';
import { getMonthlyQuizUrl } from '../config/assets';
import { getMealSafetyVideo } from '../data/mealSafetyVideos';

interface MonthlyMaterialsProps {
  month: EducationMonth;
  materials: MaterialItem[];
  isLoading: boolean;
  isBasicCompleted: boolean;
  onCompleteBasicEducation: () => void;
  recordsCount: number;
  isRecordsOpen: boolean;
  onToggleRecords: () => void;
  onOpenReportPrint: () => void;
  onResetMonthRecords?: () => void;
  recordsNode?: React.ReactNode;
  videoUrl?: string;
  videoTitle?: string;
  videoQrUrl?: string;
  quizUrl?: string;
  quizQrUrl?: string;
  onRetry?: () => void;
  loadError?: boolean;
}

export const MonthlyMaterials: React.FC<MonthlyMaterialsProps> = ({
  month,
  materials,
  isLoading,
  isBasicCompleted,
  onCompleteBasicEducation,
  recordsCount,
  isRecordsOpen,
  onToggleRecords,
  onOpenReportPrint,
  onResetMonthRecords,
  recordsNode,
  videoUrl,
  videoTitle,
  videoQrUrl,
  quizUrl = 'https://thtkssla.github.io/foodhygiene/',
  quizQrUrl,
  onRetry,
  loadError
}) => {
  const [zoomItem, setZoomItem] = useState<MaterialItem | null>(null);
  
  // Resolve monthly motivation video from static mealSafetyVideos dataset or passed props
  const videoData = getMealSafetyVideo(month);
  const effectiveVideoTitle = videoTitle || videoData.title;
  const rawVideoUrl = (videoUrl !== undefined && videoUrl !== '' ? videoUrl : videoData.youtubeUrl) || '';
  const effectiveVideoUrl = rawVideoUrl.trim();
  const hasVideoUrl = Boolean(effectiveVideoUrl);

  // Dynamic monthly quiz URL (e.g. https://thtkssla.github.io/foodhygiene/?month=3)
  const monthlyQuizUrl = getMonthlyQuizUrl(quizUrl, month);

  // Generate dynamic QR code URLs
  const effectiveQuizQr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(monthlyQuizUrl)}`;
  const effectiveVideoQr = hasVideoUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(effectiveVideoUrl)}`
    : undefined;

  return (
    <section className="mb-7">
      {/* Top Section: Month Title and 3 Action Buttons in a single row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 pb-3 border-b border-[#E5EDE9]">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            {month}월 위생교육
          </h2>
          <span className="text-xs text-[#64748B] font-medium hidden sm:inline">
            (기본자료 2종)
          </span>
        </div>

        {/* 3 Action Buttons in one compact horizontal row with unified styling */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Button 1: 기본교육 완료 버튼 (Primary Action) */}
          <button
            type="button"
            disabled={isBasicCompleted}
            onClick={onCompleteBasicEducation}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 min-h-[42px] ${
              isBasicCompleted
                ? 'bg-[#E6F4EA] text-[#0F766E] border border-[#A7F3D0] cursor-default'
                : 'bg-[#0F766E] hover:bg-[#115E59] text-white shadow-xs cursor-pointer active:scale-95'
            }`}
            title={
              isBasicCompleted
                ? `${month}월 기본교육이 등록되었습니다`
                : `${month}월 기본교육 완료 기록`
            }
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {isBasicCompleted
                ? `✓ ${month}월 기본교육 완료됨`
                : `✓ ${month}월 기본교육 완료`}
            </span>
          </button>

          {/* Button 2: 교육실시기록 토글 버튼 (Secondary Action) */}
          <button
            type="button"
            onClick={onToggleRecords}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 min-h-[42px] cursor-pointer ${
              isRecordsOpen
                ? 'bg-[#0F766E] text-white border border-[#0F766E] shadow-xs'
                : 'bg-white hover:bg-[#F0FDF4] text-[#0F766E] border border-[#D1FAE5] hover:border-[#A7F3D0] shadow-2xs'
            }`}
            title={`${month}월 교육실시기록 목록`}
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span>
              📋 {month}월 교육실시기록 · {recordsCount}건
            </span>
          </button>

          {/* Button 3: 교육일지 PDF / 출력 버튼 (Secondary Action) */}
          <button
            type="button"
            onClick={onOpenReportPrint}
            className="px-3.5 py-2.5 bg-white hover:bg-[#F0FDF4] text-[#0F766E] border border-[#D1FAE5] hover:border-[#A7F3D0] rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 min-h-[42px] shadow-2xs cursor-pointer active:scale-95"
            title={`${month}월 교육일지 PDF 생성 및 출력`}
          >
            <FileDown className="w-4 h-4 shrink-0" />
            <span>📄 {month}월 교육일지 PDF</span>
          </button>
        </div>
      </div>

      {/* Expanded records panel directly below the action bar */}
      {recordsNode}

      {/* Motivation Video & Hygiene Quiz Banner Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
        {/* 1. Monthly Motivation Video Card with QR Slot */}
        {hasVideoUrl ? (
          <a
            href={effectiveVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-br from-[#0c4a45] via-[#115E59] to-[#1e293b] hover:from-[#0f514b] hover:via-[#134e4a] hover:to-[#1e293b] text-white rounded-2xl p-4 sm:p-4.5 shadow-[0_2px_12px_rgba(15,118,110,0.08)] border border-[#0F766E]/40 flex items-center justify-between gap-3.5 transition-all duration-200 active:scale-[0.99] cursor-pointer hover:shadow-[0_4px_16px_rgba(15,118,110,0.14)]"
            title={`${effectiveVideoTitle} (새 창에서 YouTube 동영상 시청)`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-emerald-300 group-hover:scale-105 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                  <Film className="w-3 h-3" />
                  <span>동기유발 영상</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white truncate">
                  {effectiveVideoTitle}
                </h4>
                <p className="text-[11px] text-slate-300 truncate">
                  스마트폰 카메라로 QR 스캔 또는 클릭하여 시청
                </p>
              </div>
            </div>

            {/* Right side: Video QR Code */}
            <div className="shrink-0 bg-white p-1.5 rounded-xl shadow-xs border border-white/20 group-hover:scale-105 transition-transform flex flex-col items-center">
              <img
                src={effectiveVideoQr}
                alt="동영상 QR코드"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg"
              />
              <span className="text-[9px] font-bold text-[#172033] tracking-tighter mt-0.5">
                영상 QR
              </span>
            </div>
          </a>
        ) : (
          <div
            className="bg-gradient-to-br from-[#133e3b] to-[#1e293b] text-white rounded-2xl p-4 sm:p-4.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#0F766E]/30 flex items-center justify-between gap-3.5 select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-emerald-400/60">
                <Video className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400/70 uppercase tracking-wider">
                  <Film className="w-3 h-3" />
                  <span>동기유발 영상</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-200 truncate">
                  {effectiveVideoTitle}
                </h4>
                <p className="text-[11px] text-emerald-400/90 font-medium truncate">
                  동영상 준비 중
                </p>
              </div>
            </div>

            {/* Right side: 준비 중 slot matching exact QR dimensions */}
            <div className="shrink-0 bg-slate-800/80 border border-slate-700/60 rounded-xl shadow-xs flex flex-col items-center justify-center w-16 h-16 sm:w-[72px] sm:h-[72px] text-center px-1">
              <span className="text-[11px] font-bold text-slate-300">
                준비 중
              </span>
              <span className="text-[9px] font-medium text-slate-500 tracking-tighter mt-0.5">
                영상 QR
              </span>
            </div>
          </div>
        )}

        {/* 2. Hygiene Quiz Link Banner with QR Code */}
        <a
          href={monthlyQuizUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-gradient-to-br from-[#0F766E] via-[#0D9488] to-[#047857] hover:from-[#115E59] hover:via-[#0F766E] hover:to-[#065F46] text-white rounded-2xl p-4 sm:p-4.5 shadow-[0_2px_12px_rgba(15,118,110,0.1)] border border-teal-400/30 flex items-center justify-between gap-3.5 transition-all duration-200 active:scale-[0.99] hover:shadow-[0_4px_16px_rgba(15,118,110,0.14)]"
          title="이달의 위생교육 퀴즈 풀기 (스마트폰 카메라로 QR을 스캔하거나 클릭하세요)"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 text-white group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-100 uppercase tracking-wider">
                <span>학습 평가</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white truncate">
                {month}월 위생교육 퀴즈 풀기
              </h4>
              <p className="text-[11px] text-teal-100/90 truncate">
                스마트폰 카메라로 QR 스캔 또는 클릭
              </p>
            </div>
          </div>

          {/* Right side: QR Code */}
          <div className="shrink-0 bg-white p-1.5 rounded-xl shadow-xs border border-white/20 group-hover:scale-105 transition-transform flex flex-col items-center">
            <img
              src={effectiveQuizQr}
              alt="퀴즈 사이트 QR코드"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg"
            />
            <span className="text-[9px] font-bold text-[#0F766E] tracking-tighter mt-0.5">
              퀴즈 QR
            </span>
          </div>
        </a>
      </div>

      {loadError ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-rose-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <ImageOff className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-[#172033] text-base">교육자료를 불러오지 못했습니다.</h4>
            <p className="text-xs text-[#64748B] mt-1">네트워크 상태를 확인하신 후 다시 시도해 주세요.</p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              다시 시도
            </button>
          )}
        </div>
      ) : isLoading ? (
        <div className="space-y-6 animate-pulse">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-[#E5EDE9] shadow-2xs space-y-3"
            >
              <div className="w-full aspect-[4/3] max-h-[480px] bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                <Loader2 className="w-8 h-8 animate-spin text-[#0F766E]" />
              </div>
              <div className="h-6 bg-slate-100 rounded-lg w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E5EDE9] shadow-2xs">
          <ImageOff className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-500 font-semibold text-sm">
            등록된 교육자료가 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {materials.map((item, index) => (
            <article
              key={item.id || index}
              className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#E5EDE9] hover:border-slate-300 transition-all duration-200 group hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]"
            >
              {/* Image with zoom affordance */}
              <div
                className="relative bg-slate-50/50 cursor-pointer overflow-hidden"
                onClick={() => setZoomItem(item)}
                title="클릭하여 원본 크기로 보기"
              >
                <EducationCardImage
                  src={item.imageUrl}
                  title={item.title}
                  subtitle={item.subtitle}
                  category={`${month}월 위생교육`}
                  points={item.summaryPoints}
                  themeColor="#0F766E"
                  alt={item.title}
                  fitWidth
                />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/70 text-white px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-1.5 text-xs font-semibold shadow-xs">
                  <ZoomIn className="w-4 h-4" />
                  크게보기
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Full-view Zoom Modal for Cards */}
      {zoomItem && (
        <Modal
          isOpen={Boolean(zoomItem)}
          onClose={() => setZoomItem(null)}
          title={zoomItem.title}
          maxWidth="max-w-5xl"
        >
          <div className="p-1 flex flex-col items-center">
            <EducationCardImage
              src={zoomItem.imageUrl}
              title={zoomItem.title}
              subtitle={zoomItem.subtitle}
              category={`${month}월 위생교육`}
              points={zoomItem.summaryPoints}
              themeColor="#0F766E"
              alt={zoomItem.title}
              fitWidth
            />
          </div>
        </Modal>
      )}

    </section>
  );
};
