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
  Play,
  HelpCircle,
  ExternalLink,
  Film,
  RotateCcw
} from 'lucide-react';
import { Modal } from './modals/Modal';
import { EducationCardImage } from './EducationCardImage';
import { getMonthlyQuizUrl } from '../config/assets';

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
  quizUrl = 'https://foodhygiene.netlify.app/',
  quizQrUrl,
  onRetry,
  loadError
}) => {
  const [zoomItem, setZoomItem] = useState<MaterialItem | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Dynamic monthly quiz URL (e.g. https://foodhygiene.netlify.app/?month=3)
  const monthlyQuizUrl = getMonthlyQuizUrl(quizUrl, month);

  // Generate dynamic QR code URL if custom image is not provided
  const effectiveQuizQr = quizQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(monthlyQuizUrl)}`;
  const effectiveVideoQr = videoQrUrl || (videoUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(videoUrl)}` : undefined);

  return (
    <section className="mb-7">
      {/* Top Section: Month Title and 3 Action Buttons in a single row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 pb-1 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {month}월 위생교육
          </h2>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
            (기본자료 2종)
          </span>
        </div>

        {/* 3 Action Buttons in one compact horizontal row with unified Vivid Emerald Green */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Button 1: 기본교육 완료 버튼 (Vivid Emerald Green) */}
          <button
            type="button"
            disabled={isBasicCompleted}
            onClick={onCompleteBasicEducation}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center gap-1.5 shadow-2xs ${
              isBasicCompleted
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95 hover:shadow-xs'
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

          {/* Button 2: 교육실시기록 토글 버튼 (Vivid Emerald Green) */}
          <button
            type="button"
            onClick={onToggleRecords}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center gap-1.5 shadow-2xs ${
              isRecordsOpen
                ? 'bg-emerald-800 text-white ring-2 ring-emerald-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 hover:shadow-xs'
            }`}
            title={`${month}월 교육실시기록 목록`}
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span>
              📋 {month}월 교육실시기록 · {recordsCount}건
            </span>
          </button>

          {/* Button 3: 교육일지 PDF / 출력 버튼 (Vivid Emerald Green) */}
          <button
            type="button"
            onClick={onOpenReportPrint}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center gap-1.5 shadow-2xs active:scale-95 hover:shadow-xs"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
        {/* 1. Monthly Motivation Video Card with QR Slot */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-2xl p-3.5 sm:p-4 text-white shadow-xs border border-emerald-800/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-300">
              <Video className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                <Film className="w-3 h-3" />
                <span>동기유발 영상</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white truncate">
                {videoTitle || `${month}월 식중독 예방 동기유발 영상`}
              </h4>
              <p className="text-[11px] text-slate-300 truncate">
                {videoUrl ? 'QR 스캔 또는 클릭하여 영상 시청' : '동영상 파일 연결 대기 중 (관리자 설정 가능)'}
              </p>
            </div>
          </div>

          {/* Right side: Video QR or Play Button Slot */}
          <div className="shrink-0 flex items-center gap-1.5">
            {effectiveVideoQr ? (
              <div
                onClick={() => setIsVideoModalOpen(true)}
                className="bg-white p-1 rounded-xl shadow-xs cursor-pointer hover:scale-105 transition-transform flex flex-col items-center group"
                title="모바일 스캔 또는 클릭하여 동영상 재생"
              >
                <img
                  src={effectiveVideoQr}
                  alt="동영상 QR코드"
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg"
                />
                <span className="text-[9px] font-black text-slate-800 tracking-tighter mt-0.5">
                  영상 QR
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs rounded-xl shadow-xs transition-all active:scale-95"
                title="동영상 재생"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>영상보기</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Hygiene Quiz Link Banner with QR Code (Small Button Removed) */}
        <a
          href={monthlyQuizUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-gradient-to-r from-emerald-600 to-[#355c49] hover:from-emerald-500 hover:to-emerald-700 text-white rounded-2xl p-3.5 sm:p-4 shadow-xs border border-emerald-400/30 flex items-center justify-between gap-3 transition-all duration-200 active:scale-[0.99]"
          title="이달의 위생교육 퀴즈 풀기 (스마트폰 카메라로 QR을 스캔하거나 클릭하세요)"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 text-white group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                <span>학습 평가</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white truncate">
                {month}월 위생교육 퀴즈 풀기
              </h4>
              <p className="text-[11px] text-emerald-100 truncate">
                스마트폰 카메라로 QR 스캔 또는 클릭
              </p>
            </div>
          </div>

          {/* Right side: Replaced button with QR Code */}
          <div className="shrink-0 bg-white p-1 rounded-xl shadow-xs group-hover:scale-105 transition-transform flex flex-col items-center">
            <img
              src={effectiveQuizQr}
              alt="퀴즈 사이트 QR코드"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg"
            />
            <span className="text-[9px] font-black text-emerald-900 tracking-tighter mt-0.5">
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
            <h4 className="font-bold text-slate-800 text-base">교육자료를 불러오지 못했습니다.</h4>
            <p className="text-xs text-slate-500 mt-1">네트워크 상태를 확인하신 후 다시 시도해 주세요.</p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 bg-[#527765] hover:bg-[#436353] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
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
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="w-full aspect-[4/3] max-h-[480px] bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                <Loader2 className="w-8 h-8 animate-spin text-[#527765]" />
              </div>
              <div className="h-6 bg-slate-100 rounded-lg w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs">
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
              className="bg-white rounded-2xl overflow-hidden shadow-[0_3px_14px_rgba(0,0,0,0.07)] border border-slate-100/80 transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] group"
            >
              {/* Image with zoom affordance */}
              <div
                className="relative bg-slate-50 cursor-pointer overflow-hidden"
                onClick={() => setZoomItem(item)}
                title="클릭하여 원본 크기로 보기"
              >
                <EducationCardImage
                  src={item.imageUrl}
                  title={item.title}
                  subtitle={item.subtitle}
                  category={`${month}월 위생교육`}
                  points={item.summaryPoints}
                  themeColor="#2E7D32"
                  alt={item.title}
                />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-2 rounded-xl backdrop-blur-xs flex items-center gap-1 text-xs font-semibold">
                  <ZoomIn className="w-4 h-4" />
                  크게보기
                </div>
              </div>

              {/* Title label */}
              <div className="py-3.5 px-4 text-center border-t border-slate-100 bg-white">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                )}
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
          maxWidth="max-w-4xl"
        >
          <div className="p-2 flex flex-col items-center">
            <EducationCardImage
              src={zoomItem.imageUrl}
              title={zoomItem.title}
              subtitle={zoomItem.subtitle}
              category={`${month}월 위생교육`}
              points={zoomItem.summaryPoints}
              themeColor="#2E7D32"
              alt={zoomItem.title}
            />
          </div>
        </Modal>
      )}

      {/* Motivation Video Modal */}
      {isVideoModalOpen && (
        <Modal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          title={`🎬 ${month}월 동기유발 위생 영상 : ${videoTitle || `${month}월 식중독 예방 수칙`}`}
          maxWidth="max-w-3xl"
        >
          <div className="p-4 bg-slate-950 rounded-b-2xl">
            {videoUrl ? (
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <video
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  src={videoUrl}
                >
                  브라우저가 동영상 재생을 지원하지 않습니다.
                </video>
              </div>
            ) : (
              <div className="aspect-video w-full rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center p-6 text-slate-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                  <Film className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  {month}월 동기유발 동영상 파일 등록 대기
                </h4>
                <p className="text-sm text-slate-400 max-w-md mb-4 leading-relaxed">
                  Firebase Storage 또는 클라우드에 업로드된 동영상 파일 URL을 관리자 설정에서 입력하시면 즉시 재생됩니다.
                </p>
                <div className="px-3.5 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg font-mono">
                  우측 상단 🛡️ 관리자 메뉴 → {month}월 영상 URL 설정
                </div>
              </div>
            )}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
              <span>동기유발 영상 시청 후 아래의 위생교육 카드와 퀴즈를 진행해 주세요.</span>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};
