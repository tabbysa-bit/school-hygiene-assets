import React, { useState, useEffect, useMemo } from 'react';
import { MorningMaterialItem, MorningNewRecord } from '../types';
import { EducationCardImage } from './EducationCardImage';
import { MessageModal, ConfirmModal } from './modals/MessageModal';
import { Modal } from './modals/Modal';
import { getMorningNewImageUrl } from '../config/assets';
import {
  completeMorningNewDay,
  getTodayDateString,
  getMorningNewData,
  updateMorningNewRecordDate,
  deleteMorningNewRecord,
  getSchoolSettings
} from '../services/storage';
import { generateMorningNewMonthlyPdf } from '../utils/morningNewPdfGenerator';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  List,
  Sparkles,
  BookOpen,
  Calendar,
  X,
  Award,
  Edit3,
  CalendarDays,
  Trash2,
  Clock,
  FileText,
  FileCheck
} from 'lucide-react';

interface MorningEducationProps {
  type: 'regular' | 'new';
  title: string;
  badge: string;
  materials: MorningMaterialItem[];
  isLoading: boolean;
  currentProgress: number; // 0 ~ 190 (e.g. 4 means finished Day 4)
  onSaveProgress: (day: number) => Promise<void>;
  onBackToCategories: () => void;
}

export const MorningEducation: React.FC<MorningEducationProps> = ({
  type,
  title,
  badge,
  materials,
  isLoading,
  currentProgress,
  onSaveProgress,
  onBackToCategories
}) => {
  // Mode: 'overview' | 'detail' | 'records'
  const [viewMode, setViewMode] = useState<'overview' | 'detail' | 'records'>('overview');

  // Currently displayed Day number (1 ~ 190)
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    if (type === 'new') {
      if (currentProgress >= 190) return 190;
      return Math.max(1, currentProgress + 1);
    }
    return 1;
  });

  // Modal to show all 190 days
  const [showAllModal, setShowAllModal] = useState<boolean>(false);

  // Education Records state (for 'new' type)
  const [recordsList, setRecordsList] = useState<MorningNewRecord[]>([]);

  // Selected Year & Month for records filtering
  const [recordYear, setRecordYear] = useState<number>(() => new Date().getFullYear());
  const [recordMonth, setRecordMonth] = useState<number>(() => new Date().getMonth() + 1);

  // Editing date modal state
  const [editingRecord, setEditingRecord] = useState<MorningNewRecord | null>(null);
  const [editDateInput, setEditDateInput] = useState<string>('');

  // Deleting record modal state
  const [deletingRecord, setDeletingRecord] = useState<MorningNewRecord | null>(null);

  // Completion modal states
  const [newlyCompletedInfo, setNewlyCompletedInfo] = useState<{
    isOpen: boolean;
    day: number;
    title: string;
    date: string;
  } | null>(null);

  const [alreadyCompletedInfo, setAlreadyCompletedInfo] = useState<{
    isOpen: boolean;
    day: number;
    title: string;
    date?: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Progress Modification state (Requirement 3 & 4)
  const [isEditProgressModalOpen, setIsEditProgressModalOpen] = useState(false);
  const [targetDayInput, setTargetDayInput] = useState<number>(currentProgress);
  const [editWarningMessage, setEditWarningMessage] = useState<string | null>(null);
  const [confirmDowngradeData, setConfirmDowngradeData] = useState<{
    targetDay: number;
    message: string;
  } | null>(null);

  const totalDays = materials.length || 190;
  const progressPercent = Math.min(100, Math.round((currentProgress / totalDays) * 100));
  const nextTargetDay = currentProgress >= totalDays ? totalDays : currentProgress + 1;

  // Load records from storage on mount
  const refreshRecords = async () => {
    if (type !== 'new') return;
    try {
      const data = await getMorningNewData();
      const recs = data.records || [];
      setRecordsList(recs);

      // Prioritize the month where records exist if any
      if (recs.length > 0) {
        const sortedDesc = [...recs].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        const latest = sortedDesc[0];
        if (latest && latest.date) {
          const parts = latest.date.split('-');
          if (parts.length >= 2) {
            const yr = parseInt(parts[0], 10);
            const mo = parseInt(parts[1], 10);
            if (!isNaN(yr) && !isNaN(mo)) {
              setRecordYear(yr);
              setRecordMonth(mo);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to load morning new records:', e);
    }
  };

  useEffect(() => {
    if (type === 'new') {
      refreshRecords();
    }
  }, [type]);

  // Sync selectedDay when currentProgress changes if in overview
  useEffect(() => {
    if (viewMode === 'overview') {
      const nextDay = currentProgress >= totalDays ? totalDays : Math.max(1, currentProgress + 1);
      setSelectedDay(nextDay);
    }
  }, [currentProgress, viewMode, totalDays]);

  // Preload next Day (+1) image in Card Detail mode
  useEffect(() => {
    if (type === 'new' && viewMode === 'detail' && selectedDay < totalDays) {
      const nextUrl = getMorningNewImageUrl(selectedDay + 1);
      const preloader = new Image();
      preloader.src = nextUrl;
    }
  }, [type, viewMode, selectedDay, totalDays]);

  // Current material item (matches by day number)
  const currentItem = materials.find((m) => m.day === selectedDay) || materials[0];

  // Pure title from morning-new.json without fake generated content
  const displayTitle = currentItem?.title?.trim() || `Day ${selectedDay}`;

  // Requirement 4: "다음 교육자료" (Up to 3 items after current completed day)
  const nextThreeDays = useMemo(() => {
    if (currentProgress >= totalDays) return [];
    const startDay = currentProgress + 1;
    const items: MorningMaterialItem[] = [];
    for (let d = startDay; d < startDay + 3 && d <= totalDays; d++) {
      const item = materials.find((m) => m.day === d);
      if (item) items.push(item);
    }
    return items;
  }, [currentProgress, materials, totalDays]);

  // Calculate distinct available years from records (plus current year)
  const availableYears = useMemo(() => {
    const currentYr = new Date().getFullYear();
    const yearSet = new Set<number>([currentYr, currentYr - 1, currentYr + 1]);
    recordsList.forEach((r) => {
      if (r.date) {
        const yr = parseInt(r.date.split('-')[0], 10);
        if (!isNaN(yr)) yearSet.add(yr);
      }
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [recordsList]);

  // Count records for each month in the selected year
  const monthCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) counts[m] = 0;
    recordsList.forEach((r) => {
      if (r.date) {
        const [y, m] = r.date.split('-');
        if (parseInt(y, 10) === recordYear) {
          const mo = parseInt(m, 10);
          if (counts[mo] !== undefined) counts[mo]++;
        }
      }
    });
    return counts;
  }, [recordsList, recordYear]);

  // Monthly records filtered by recordYear and recordMonth, sorted by date ascending
  const monthlyRecords = useMemo(() => {
    const prefix = `${recordYear}-${String(recordMonth).padStart(2, '0')}`;
    return recordsList
      .filter((r) => r.date && r.date.startsWith(prefix))
      .sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.day - b.day)
      .map((r) => {
        const parts = (r.date || '').split('-');
        const formattedDate = parts.length === 3 ? `${parts[1]}.${parts[2]}` : r.date;
        return {
          ...r,
          formattedDate
        };
      });
  }, [recordsList, recordYear, recordMonth]);

  // Summary dates
  const firstDateFormatted =
    monthlyRecords.length > 0 && monthlyRecords[0].date
      ? monthlyRecords[0].date.replace(/-/g, '.')
      : '';
  const lastDateFormatted =
    monthlyRecords.length > 0 && monthlyRecords[monthlyRecords.length - 1].date
      ? monthlyRecords[monthlyRecords.length - 1].date.replace(/-/g, '.')
      : '';

  // Open detail mode with specific day
  const handleOpenDay = (day: number) => {
    setSelectedDay(day);
    setViewMode('detail');
    setShowAllModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Previous Day
  const handlePrevDay = () => {
    if (selectedDay > 1) {
      setSelectedDay((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Next Day
  const handleNextDay = () => {
    if (selectedDay < totalDays) {
      setSelectedDay((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Requirement 6 & 7: Save progress & date ONLY when clicking [교육 완료], prevent duplicate records
  const handleCompleteEducation = async () => {
    setIsSaving(true);
    try {
      if (type === 'new') {
        const result = await completeMorningNewDay(selectedDay, displayTitle);
        setRecordsList(result.data.records);

        if (result.isAlreadyCompleted) {
          // Already completed on a previous date
          setAlreadyCompletedInfo({
            isOpen: true,
            day: selectedDay,
            title: displayTitle,
            date: result.existingRecord?.date || ''
          });
        } else {
          // Newly completed
          await onSaveProgress(result.data.progress);
          setNewlyCompletedInfo({
            isOpen: true,
            day: selectedDay,
            title: displayTitle,
            date: getTodayDateString()
          });
        }
      } else {
        const newProgressValue = Math.max(currentProgress, selectedDay);
        await onSaveProgress(newProgressValue);
        setNewlyCompletedInfo({
          isOpen: true,
          day: selectedDay,
          title: displayTitle,
          date: getTodayDateString()
        });
      }
    } catch (err) {
      console.error('Failed to save progress', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Open Progress Edit Modal
  const handleOpenEditProgress = () => {
    setTargetDayInput(currentProgress);
    setEditWarningMessage(null);
    setIsEditProgressModalOpen(true);
  };

  // Submit Progress Edit
  const handleSubmitEditProgress = async () => {
    const safeTarget = Math.max(0, Math.min(190, Number(targetDayInput) || 0));

    if (safeTarget === currentProgress) {
      setIsEditProgressModalOpen(false);
      return;
    }

    // Requirement 8: Disallow advancing progress without education records
    if (type === 'new' && safeTarget > currentProgress) {
      setEditWarningMessage(
        `진행기록 수정은 완료된 기록을 하향 정정하는 용도로만 사용할 수 있습니다. (현재 최대 Day ${currentProgress})\n새로운 Day의 완료는 교육 화면의 [교육 완료] 버튼을 이용해 주세요.`
      );
      return;
    }

    // If downgrading to a lower Day, show confirmation modal (Requirement 4 & 8)
    if (safeTarget < currentProgress) {
      setIsEditProgressModalOpen(false);
      if (safeTarget === 0) {
        setConfirmDowngradeData({
          targetDay: 0,
          message: `${title} 진행기록을 초기화하고\nDay 1부터 다시 시작하시겠습니까?`
        });
      } else {
        setConfirmDowngradeData({
          targetDay: safeTarget,
          message: `Day ${safeTarget + 1}~${currentProgress}의 완료 기록이 해제됩니다.`
        });
      }
      return;
    }

    // Advancing progress for regular morning (if allowed)
    setIsSaving(true);
    try {
      await onSaveProgress(safeTarget);
      setIsEditProgressModalOpen(false);
    } catch (err) {
      console.error('Failed to update progress', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm Downgrade Execution
  const handleConfirmDowngrade = async () => {
    if (!confirmDowngradeData) return;
    const target = confirmDowngradeData.targetDay;
    setIsSaving(true);
    try {
      await onSaveProgress(target);
      const data = await getMorningNewData();
      setRecordsList(data.records || []);
      setConfirmDowngradeData(null);
    } catch (err) {
      console.error('Failed to downgrade progress', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Open Edit Date Modal
  const handleOpenEditDate = (record: MorningNewRecord) => {
    setEditingRecord(record);
    setEditDateInput(record.date || getTodayDateString());
  };

  // Save Edit Date
  const handleSaveEditDate = async () => {
    if (!editingRecord || !editDateInput) return;
    setIsSaving(true);
    try {
      const updated = await updateMorningNewRecordDate(editingRecord.day, editDateInput);
      setRecordsList(updated.records);
      setEditingRecord(null);
    } catch (err) {
      console.error('Failed to update record date', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm Delete Record Execution
  const handleConfirmDeleteRecord = async () => {
    if (!deletingRecord) return;
    setIsSaving(true);
    try {
      const updated = await deleteMorningNewRecord(deletingRecord.day);
      setRecordsList(updated.records);
      setDeletingRecord(null);
    } catch (err) {
      console.error('Failed to delete record', err);
    } finally {
      setIsSaving(false);
    }
  };

  // PDF Generation states (Requirement 1, 2, 11, 13)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string | null>(null);
  const [pdfNoticeModal, setPdfNoticeModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'info' | 'error' | 'success';
  } | null>(null);

  const handleGeneratePdf = async (includeMaterials: boolean) => {
    // Requirement 13: If 0 records in selected month, do NOT generate PDF. Show in-app modal.
    if (monthlyRecords.length === 0) {
      setPdfNoticeModal({
        isOpen: true,
        title: 'PDF 생성 불가',
        message: `${recordYear}년 ${recordMonth}월에 기록된 교육이 없습니다.`,
        variant: 'info'
      });
      return;
    }

    setIsGeneratingPdf(true);
    setPdfStatusMessage(
      includeMaterials
        ? `${recordYear}년 ${recordMonth}월 교육자료 포함 PDF를 생성 중입니다...\n(Cloudflare 이미지 로딩 및 A4 카드 배치 중)`
        : `${recordYear}년 ${recordMonth}월 교육일지 PDF를 생성 중입니다...`
    );

    try {
      const schoolSettings = await getSchoolSettings();
      const result = await generateMorningNewMonthlyPdf({
        year: recordYear,
        month: recordMonth,
        records: monthlyRecords,
        schoolSettings,
        includeMaterials
      });

      if (result.failedImages && result.failedImages.length > 0) {
        setPdfNoticeModal({
          isOpen: true,
          title: 'PDF 생성 완료 (일부 이미지 제외)',
          message: `PDF 파일(${result.fileName})이 성공적으로 다운로드되었습니다.\n\n단, 다음 카드의 이미지를 불러오지 못해 자료에서 제외되었습니다:\n${result.failedImages.map((img) => `• ${img}`).join('\n')}`,
          variant: 'info'
        });
      }
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      setPdfNoticeModal({
        isOpen: true,
        title: 'PDF 생성 오류',
        message: err?.message || 'PDF 생성 중 오류가 발생했습니다.',
        variant: 'error'
      });
    } finally {
      setIsGeneratingPdf(false);
      setPdfStatusMessage(null);
    }
  };

  const themePrimary = type === 'new' ? '#2563EB' : '#10B981';
  const themeBgLight = type === 'new' ? 'bg-blue-50' : 'bg-emerald-50';
  const themeText = type === 'new' ? 'text-blue-800' : 'text-emerald-800';

  if (isLoading) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">{title} 교육자료를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Top Breadcrumb & Actions (Requirement 4: Only navigation and badge, no in-page action duplicates) */}
      <div className="flex items-center justify-between">
        {viewMode === 'records' ? (
          <button
            type="button"
            onClick={() => setViewMode('overview')}
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>모닝위생(신규) 메인으로</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onBackToCategories}
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>전체 카테고리로</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className={`text-xs sm:text-sm px-3 py-1 rounded-full font-bold ${themeBgLight} ${themeText}`}>
            {badge}
          </span>
        </div>
      </div>

      {/* 1. OVERVIEW VIEW */}
      {viewMode === 'overview' && (
        <div className="space-y-6 sm:space-y-7">
          {/* Main Hero Status Card */}
          <section className="bg-white rounded-[22px] p-6 sm:p-9 border border-slate-200/80 shadow-xs text-center">
            <div className={`inline-flex p-3.5 rounded-2xl ${themeBgLight} ${themeText} mb-4`}>
              <Sparkles className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-[30px] font-black text-slate-900 tracking-tight leading-snug mb-3">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto mb-7 leading-relaxed">
              조리 전 3분! 실제 학교 급식일 순서(Day001 ~ Day190)에 맞춰 매일 핵심 위생수칙을 확인하고 실천합니다.
            </p>

            {/* Progress Status for Morning New (Requirement 1 & 2: Cleaned up, no duplicate buttons inside) */}
            {type === 'new' && (
              <div className="max-w-md mx-auto bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 mb-7">
                <div className="flex items-center justify-between mb-2.5 font-bold">
                  <span className="text-sm sm:text-base text-slate-700">현재 진행</span>
                  <span className="text-base sm:text-lg font-black text-blue-700">
                    Day {currentProgress} / {totalDays}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden mb-2.5">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {currentProgress >= totalDays ? (
                  <div className="text-center py-1">
                    <span className="text-sm font-bold text-blue-700">
                      🎉 모닝위생(신규) 전체 교육을 완료했습니다.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 font-medium">
                    <span>{progressPercent}% 완료</span>
                    <span>다음 차례: Day {nextTargetDay}</span>
                  </div>
                )}

                {/* Requirement 1 & 2: Single "진행기록 수정" administrative button with lower emphasis */}
                <div className="mt-3.5 pt-3 border-t border-slate-200/70 flex justify-center">
                  <button
                    type="button"
                    onClick={handleOpenEditProgress}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                    title="진행기록 수정"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>진행기록 수정</span>
                  </button>
                </div>
              </div>
            )}

            {/* Requirement 2 & 8: Three Main Action Buttons with clear visual hierarchy & min-h-[50px] */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 max-w-xl mx-auto mb-2">
              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => handleOpenDay(type === 'new' ? nextTargetDay : 1)}
                className={`w-full sm:w-auto flex-1 min-h-[50px] py-3.5 px-6 sm:px-8 text-base font-bold text-white rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                  type === 'new' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                <BookOpen className="w-5 h-5 shrink-0" />
                <span>
                  {type === 'new'
                    ? currentProgress === 0
                      ? 'Day 1부터 시작하기'
                      : currentProgress >= totalDays
                      ? 'Day 1부터 다시보기'
                      : `Day ${nextTargetDay}부터 이어보기`
                    : '교육 시작하기'}
                </span>
              </button>

              {/* Secondary Action 1: 전체 교육자료 보기 */}
              <button
                type="button"
                onClick={() => setShowAllModal(true)}
                className="w-full sm:w-auto min-h-[50px] py-3.5 px-5 sm:px-6 bg-white hover:bg-slate-50 text-slate-700 font-bold text-base rounded-2xl border border-slate-300 transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <List className="w-5 h-5 text-slate-500 shrink-0" />
                <span>전체 교육자료 보기</span>
              </button>

              {/* Secondary Action 2: 교육실시기록 */}
              {type === 'new' && (
                <button
                  type="button"
                  onClick={() => setViewMode('records')}
                  className="w-full sm:w-auto min-h-[50px] py-3.5 px-5 sm:px-6 bg-white hover:bg-slate-50 text-slate-700 font-bold text-base rounded-2xl border border-slate-300 transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CalendarDays className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>교육실시기록</span>
                </button>
              )}
            </div>
          </section>

          {/* Requirement 3: "다음 교육자료" Area (No extra duplicate links, 3 cards only) */}
          <section className="bg-white rounded-[22px] p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-slate-500" />
                <span>다음 교육자료</span>
              </h2>
            </div>

            {nextThreeDays.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                {nextThreeDays.map((item) => {
                  const isTarget = item.day === nextTargetDay;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenDay(item.day)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                        isTarget
                          ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-400/20'
                          : 'border-slate-200/90 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-800">{item.dayCode}</span>
                        <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold">
                          Day {item.day}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1 mt-1">
                        {item.title}
                      </h3>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
                🎉 모든 190일 교육과정을 완료하셨습니다.
              </div>
            )}
          </section>
        </div>
      )}

      {/* 2. DETAIL VIEW (Strictly matching Card Detail specifications) */}
      {viewMode === 'detail' && currentItem && (
        <div className="space-y-4">
          {/* Card Top Action Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setViewMode('overview')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              메인으로
            </button>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-black ${themeBgLight} ${themeText}`}>
                {currentItem.dayCode} / Day 190
              </span>
              <button
                type="button"
                onClick={() => setShowAllModal(true)}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <List className="w-3 h-3" />
                목록
              </button>
            </div>
          </div>

          {/* Education Card Detail Main Body */}
          <div className="bg-white rounded-[22px] p-6 sm:p-9 border border-slate-200/80 shadow-xs space-y-6">
            {/* Header info */}
            <div className="text-center sm:text-left">
              <span className={`inline-block text-xs sm:text-sm font-black px-3 py-1 rounded-full mb-2 ${themeBgLight} ${themeText}`}>
                Day {selectedDay}
              </span>
              <h2 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
                {displayTitle}
              </h2>
            </div>

            {/* [교육카드 이미지] - 1254x1254 WebP Square Aspect Ratio, object-contain, in-app error UI */}
            <div className="w-full max-w-[620px] mx-auto">
              <EducationCardImage
                src={currentItem.imageUrl}
                title={displayTitle}
                alt={`Day ${selectedDay} ${displayTitle}`}
              />
            </div>

            {/* Bottom Controls: [이전]   [교육 완료]   [다음] with minimum 48px height on mobile */}
            <div className="max-w-[620px] mx-auto pt-5 border-t border-slate-200/80 flex items-center justify-between gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handlePrevDay}
                disabled={selectedDay <= 1}
                className="min-h-[48px] py-3 px-5 sm:px-6 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 font-bold text-sm sm:text-base rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>이전</span>
              </button>

              {/* Requirement 5 & 6: [교육 완료] button */}
              <button
                type="button"
                onClick={handleCompleteEducation}
                disabled={isSaving}
                className={`min-h-[48px] py-3.5 px-6 sm:px-8 text-white font-black text-base sm:text-lg rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                  type === 'new'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>교육 완료</span>
              </button>

              <button
                type="button"
                onClick={handleNextDay}
                disabled={selectedDay >= totalDays}
                className="min-h-[48px] py-3 px-5 sm:px-6 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 font-bold text-sm sm:text-base rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>다음</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. RECORDS VIEW (교육실시기록 화면) */}
      {viewMode === 'records' && (
        <div className="space-y-6 sm:space-y-7">
          {/* Header Panel */}
          <div className="bg-white rounded-[22px] p-6 sm:p-9 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs sm:text-sm px-3 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold">
                    교육실시기록
                  </span>
                  <span className="text-xs sm:text-sm text-slate-500 font-medium">실제 완료일자 기준</span>
                </div>
                <h2 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
                  모닝위생(신규) 교육실시기록
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mt-1.5 leading-relaxed">
                  학교 급식일에 맞추어 실제로 교육을 완료한 날짜(record.date)를 기준으로 월별로 조회하고 관리합니다.
                </p>
              </div>

              {/* Year Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-sm font-bold text-slate-600">연도 선택:</label>
                <select
                  value={recordYear}
                  onChange={(e) => setRecordYear(Number(e.target.value))}
                  className="px-3.5 py-2 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 min-h-[42px]"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}년
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Month Tabs (1월 ~ 12월) with counts */}
            <div className="border-t border-slate-100 pt-5">
              <div className="text-xs sm:text-sm font-bold text-slate-500 mb-2.5">월 선택</div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                  const isSelected = m === recordMonth;
                  const count = monthCounts[m] || 0;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setRecordMonth(m)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : count > 0
                          ? 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                          : 'bg-slate-50 text-slate-400 border border-transparent hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      <span>{m}월</span>
                      {count > 0 && (
                        <span
                          className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Current Month Summary & PDF Buttons (Requirement 1 & 10) */}
          <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 text-sm sm:text-base">
                <CalendarDays className="w-4.5 h-4.5 text-blue-600" />
                <span>{recordYear}년 {recordMonth}월 교육실시기록</span>
              </div>
              <span className="text-xs sm:text-sm font-black px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                {monthlyRecords.length}건
              </span>
              {monthlyRecords.length > 0 && (
                <div className="flex items-center gap-3 text-slate-600 ml-1 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-400 mr-1 font-medium">첫 교육일:</span>
                    <span className="font-bold text-slate-800">{firstDateFormatted}</span>
                  </div>
                  <div className="hidden sm:block text-slate-300">|</div>
                  <div>
                    <span className="text-slate-400 mr-1 font-medium">마지막 교육일:</span>
                    <span className="font-bold text-slate-800">{lastDateFormatted}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Requirement 1 & 8: PDF Generation Buttons (min-h-[48px] for easy tapping) */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleGeneratePdf(false)}
                disabled={isGeneratingPdf}
                className="min-h-[48px] px-4 py-2.5 text-sm sm:text-base font-bold text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 rounded-2xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                title={`${recordYear}년 ${recordMonth}월 교육일지 PDF 다운로드`}
              >
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span>월 교육일지 PDF</span>
              </button>
              <button
                type="button"
                onClick={() => handleGeneratePdf(true)}
                disabled={isGeneratingPdf}
                className="min-h-[48px] px-4 py-2.5 text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                title={`${recordYear}년 ${recordMonth}월 교육일지 + 카드 이미지 PDF 다운로드`}
              >
                <FileCheck className="w-4 h-4 shrink-0" />
                <span>교육자료 포함 PDF</span>
              </button>
            </div>
          </div>

          {/* Monthly Records List */}
          {monthlyRecords.length > 0 ? (
            <div className="space-y-3.5">
              {monthlyRecords.map((r) => {
                const pad = String(r.day).padStart(3, '0');
                return (
                  <div
                    key={`${r.day}-${r.date}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-200 shadow-2xs gap-3.5 transition-all"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4">
                      {/* Date badge */}
                      <div className="w-16 sm:w-18 py-2 bg-blue-50 text-blue-700 rounded-xl text-center border border-blue-100/80 shrink-0">
                        <div className="text-xs text-blue-500 font-semibold leading-none mb-1">
                          {recordYear}
                        </div>
                        <div className="text-base sm:text-lg font-black tracking-tight leading-none">
                          {r.formattedDate}
                        </div>
                      </div>

                      {/* Thumbnail preview - clicking opens that card */}
                      <div
                        onClick={() => handleOpenDay(r.day)}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                        title="교육 카드 보기"
                      >
                        <img
                          src={getMorningNewImageUrl(r.day)}
                          alt={`Day ${r.day}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Day & Title */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                            Day {pad}
                          </span>
                        </div>
                        <h4
                          onClick={() => handleOpenDay(r.day)}
                          className="text-base sm:text-lg font-bold text-slate-900 cursor-pointer hover:text-blue-700 transition-colors line-clamp-1"
                        >
                          {r.title}
                        </h4>
                      </div>
                    </div>

                    {/* Actions: [카드보기], [교육일 수정], [기록 삭제] */}
                    <div className="flex items-center justify-end gap-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenDay(r.day)}
                        className="min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        카드보기
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditDate(r)}
                        className="min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-800 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>교육일 수정</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingRecord(r)}
                        className="min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-100/70 border border-rose-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>기록 삭제</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Requirement 9: Empty Month Notice */
            <div className="bg-white rounded-[22px] p-12 border border-slate-200/80 text-center">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-slate-700 mb-1">
                이 달에 기록된 교육이 없습니다.
              </p>
              <p className="text-sm text-slate-500">
                {recordYear}년 {recordMonth}월에는 아직 완료된 모닝위생(신규) 교육 기록이 없습니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ALL 190 DAYS MODAL / DRAWER */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {title} 전체 교육자료 (Day 1 ~ Day 190)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  원하는 일차를 선택하면 해당 카드로 바로 이동합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 190 Items Grid (Requirement 3: Only DayCode and Title) */}
            <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {materials.map((m) => {
                const isSelected = m.day === selectedDay;
                const isCompleted = type === 'new' && m.day <= currentProgress;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleOpenDay(m.day)}
                    className={`p-3 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400/30'
                        : isCompleted
                        ? 'border-blue-200 bg-blue-50/40 hover:bg-blue-100/60'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800">{m.dayCode}</span>
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </div>
                    <div className="text-xs text-slate-700 font-semibold truncate">
                      {m.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Newly Completed Modal (Requirement 6) */}
      {newlyCompletedInfo && (
        <MessageModal
          isOpen={true}
          title={
            newlyCompletedInfo.day >= totalDays
              ? '🎉 모닝위생(신규) 전체 교육을 완료했습니다.'
              : `Day ${newlyCompletedInfo.day} 교육 완료`
          }
          message={
            <div className="space-y-3 text-center">
              {newlyCompletedInfo.day >= totalDays ? (
                <>
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-100">
                    <Award className="w-8 h-8" />
                  </div>
                  <p className="text-slate-900 font-bold text-base">
                    모닝위생(신규) 전체 교육을 완료했습니다.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Day 1부터 Day 190까지 모든 신규 위생교육 과정을 성공적으로 모두 이수하셨습니다!<br />
                    앞으로도 학생들의 안전하고 건강한 학교급식을 위해 힘써주세요.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-800 font-bold text-sm">
                    Day {newlyCompletedInfo.day} [{newlyCompletedInfo.title}] 교육을 완료하셨습니다!
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    교육일: <span className="font-semibold text-blue-700">{newlyCompletedInfo.date}</span><br />
                    진행상황이 안전하게 저장되었습니다.<br />
                    다음 접속 시 <strong>Day {newlyCompletedInfo.day + 1}</strong>부터 바로 이어보실 수 있습니다.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewlyCompletedInfo(null);
                        handleNextDay();
                      }}
                      className="w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-xs bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                      다음 Day {newlyCompletedInfo.day + 1} 이동하기 →
                    </button>
                  </div>
                </>
              )}
            </div>
          }
          variant="success"
          onClose={() => setNewlyCompletedInfo(null)}
        />
      )}

      {/* Already Completed Modal (Requirement 7) */}
      {alreadyCompletedInfo && (
        <MessageModal
          isOpen={true}
          title="이미 완료된 교육입니다."
          message={
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-1 border border-blue-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-slate-800 font-bold text-sm">
                Day {alreadyCompletedInfo.day} [{alreadyCompletedInfo.title}]
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {alreadyCompletedInfo.date
                  ? `해당 교육은 ${alreadyCompletedInfo.date}에 이미 완료되었습니다.`
                  : '해당 교육은 이미 완료된 기록이 있습니다.'}
                <br />
                기존 교육일 기록이 유지되며 중복 생성되지 않습니다.
              </p>
              {alreadyCompletedInfo.day < totalDays && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAlreadyCompletedInfo(null);
                      handleNextDay();
                    }}
                    className="w-full py-2 text-white font-bold text-xs rounded-xl shadow-xs bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    다음 Day {alreadyCompletedInfo.day + 1} 보기 →
                  </button>
                </div>
              )}
            </div>
          }
          variant="info"
          onClose={() => setAlreadyCompletedInfo(null)}
        />
      )}

      {/* Requirement 5: Education Date Modification Modal */}
      {editingRecord && (
        <Modal
          isOpen={true}
          onClose={() => setEditingRecord(null)}
          title="교육일 수정"
          maxWidth="max-w-sm"
        >
          <div className="p-4 sm:p-5 space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <span className="inline-block text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md mb-1">
                Day {String(editingRecord.day).padStart(3, '0')}
              </span>
              <h4 className="text-sm font-bold text-slate-900">{editingRecord.title}</h4>
              <p className="text-xs text-slate-500 mt-1">
                현재 교육일: <span className="font-semibold text-slate-700">{editingRecord.date}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                변경할 교육일:
              </label>
              <input
                type="date"
                value={editDateInput}
                onChange={(e) => setEditDateInput(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                교육일만 변경되며, 전체 진행상황(Day progress)은 변경되지 않습니다.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveEditDate}
                disabled={!editDateInput || isSaving}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                저장
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Requirement 6: Individual Record Deletion Confirm Modal */}
      {deletingRecord && (
        <ConfirmModal
          isOpen={true}
          title="교육기록 삭제"
          message={
            <div className="text-center py-2 space-y-2">
              <p className="font-bold text-slate-800 text-sm">
                Day {String(deletingRecord.day).padStart(3, '0')} {deletingRecord.title}
              </p>
              <p className="text-xs text-blue-700 font-semibold">
                교육일: {deletingRecord.date}
              </p>
              <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                이 교육완료 기록을 삭제하시겠습니까?<br />
                (기록만 삭제되며, 전체 진행 일차는 임의로 낮아지지 않습니다.)
              </p>
            </div>
          }
          confirmText="기록 삭제"
          cancelText="취소"
          danger={true}
          onConfirm={handleConfirmDeleteRecord}
          onClose={() => setDeletingRecord(null)}
        />
      )}

      {/* Requirement 3 & 8: "진행기록 수정" Modal */}
      {isEditProgressModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditProgressModalOpen(false)}
          title={`${title} 진행기록 수정`}
          maxWidth="max-w-md"
        >
          <div className="p-4 sm:p-6 space-y-5">
            <p className="text-xs text-slate-500 leading-relaxed">
              이미 완료된 일차를 <strong>하향 정정</strong>하거나 <strong>0으로 설정하여 초기화</strong>할 수 있습니다.
            </p>

            {editWarningMessage && (
              <div className="bg-amber-50 text-amber-900 border border-amber-200 p-3 rounded-xl text-xs whitespace-pre-line leading-relaxed">
                {editWarningMessage}
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="text-xs text-slate-600 font-medium">현재 저장된 완료 일차</div>
              <div className="text-xl font-black text-blue-700">
                {currentProgress === 0 ? 'Day 0 (미시작)' : `Day ${currentProgress} / 190`}
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  완료 Day 변경 (0 ~ {currentProgress}):
                </label>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-bold text-slate-600">Day</span>
                  <input
                    type="number"
                    min={0}
                    max={currentProgress}
                    value={targetDayInput}
                    onChange={(e) => {
                      setEditWarningMessage(null);
                      const val = parseInt(e.target.value, 10);
                      setTargetDayInput(isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    className="w-24 px-3 py-2 text-center text-lg font-black bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                  <span className="text-xs text-slate-400">/ {currentProgress}</span>
                </div>
              </div>

              {/* Quick Preset Buttons (filtered to <= currentProgress) */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                {[0, 1, 30, 50, 100, 150, 190]
                  .filter((p) => p === 0 || p <= currentProgress)
                  .map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setEditWarningMessage(null);
                        setTargetDayInput(preset);
                      }}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                        targetDayInput === preset
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset === 0 ? '0 (초기화)' : `Day ${preset}`}
                    </button>
                  ))}
              </div>
            </div>

            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-[11px] text-blue-900 space-y-1">
              <div>• <strong>0:</strong> 모닝위생(신규) 진행기록 및 완료일자 전체 초기화</div>
              <div>• <strong>1 ~ {currentProgress}:</strong> 해당 Day까지 완료 유지, 이후 일차의 기록은 삭제</div>
              <div>• <strong>주의:</strong> 진행기록 수정은 하향 정정 용도로 사용되며, 새 교육 완료는 카드의 [교육 완료] 버튼을 눌러주세요.</div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditProgressModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmitEditProgress}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                변경
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Requirement 4 & 8: Confirmation Modal when downgrading progress */}
      {confirmDowngradeData && (
        <ConfirmModal
          isOpen={true}
          title={confirmDowngradeData.targetDay === 0 ? '진행기록 초기화 확인' : '진행기록 변경 확인'}
          message={
            <div className="text-center py-2 space-y-3">
              <p className="text-slate-800 font-bold text-sm whitespace-pre-line leading-relaxed">
                {confirmDowngradeData.message}
              </p>
              <p className="text-xs text-slate-500">
                {confirmDowngradeData.targetDay === 0
                  ? '이후 Day 1부터 새로 시작하실 수 있습니다.'
                  : `변경 후 완료 일차가 Day ${confirmDowngradeData.targetDay}로 조정됩니다.`}
              </p>
            </div>
          }
          confirmText={
            confirmDowngradeData.targetDay === 0
              ? 'Day 0으로 초기화'
              : `Day ${confirmDowngradeData.targetDay}으로 변경`
          }
          cancelText="취소"
          danger={confirmDowngradeData.targetDay === 0}
          onConfirm={handleConfirmDowngrade}
          onClose={() => setConfirmDowngradeData(null)}
        />
      )}

      {/* Requirement 13 & 11: PDF Notice / Error Modal */}
      {pdfNoticeModal && (
        <MessageModal
          isOpen={true}
          title={pdfNoticeModal.title}
          message={
            <div className="whitespace-pre-line text-xs sm:text-sm text-slate-700 leading-relaxed text-center py-1">
              {pdfNoticeModal.message}
            </div>
          }
          variant={pdfNoticeModal.variant || 'info'}
          onClose={() => setPdfNoticeModal(null)}
        />
      )}

      {/* PDF Generating Loading Overlay */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">PDF 파일 생성 중</h3>
              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                {pdfStatusMessage}
              </p>
            </div>
            <p className="text-[11px] text-blue-600 font-medium">
              완료되면 자동으로 다운로드됩니다. 잠시만 기다려 주세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
