import React, { useState, useEffect, useCallback } from 'react';
import { Header, AppTab } from './components/Header';
import { MonthSelector } from './components/MonthSelector';
import { MonthlyMaterials } from './components/MonthlyMaterials';
import { EducationRecordList } from './components/EducationRecordList';
import { AppendixMenu } from './components/AppendixMenu';
import { AppendixDetail } from './components/AppendixDetail';
import { CategoryHome } from './components/CategoryHome';
import { MorningEducation } from './components/MorningEducation';
import { SchoolSettingsModal } from './components/modals/SchoolSettingsModal';
import { EducationDateModal } from './components/modals/EducationDateModal';
import { ConfirmModal, MessageModal } from './components/modals/MessageModal';
import { PdfPreviewModal } from './components/modals/PdfPreviewModal';
import { AdminPage } from './admin/AdminPage';

import {
  AppendixGroup,
  EducationMonth,
  EducationRecord,
  MaterialItem,
  MorningMaterialItem,
  SchoolSettings
} from './types';
import { contentService } from './services/contentService';
import {
  getRecords,
  saveRecord,
  deleteRecord,
  clearMonthRecords,
  hasBasicEducationRecord,
  getSettings,
  saveSettings,
  getQuizUrl,
  getQuizQrUrl,
  DEFAULT_QUIZ_URL,
  getMorningProgress,
  setMorningProgress,
  getMorningNewProgress,
  setMorningNewProgress
} from './services/storage';
import {
  getPrintCards,
  formatRecordDate
} from './utils/records';
import { GeneratePdfOptions } from './utils/pdfGenerator';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function App() {
  // Navigation tab state (supports /admin pathname or #hash)
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      return 'admin';
    }
    if (window.location.hash === '#meal-safety') return 'meal-safety';
    if (window.location.hash === '#morning') return 'morning';
    if (window.location.hash === '#morning-new') return 'morning-new';
    return 'home';
  });

  // Keep URL in sync with tabs
  const handleSelectTab = (tab: AppTab) => {
    setActiveTab(tab);
    if (tab === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else if (tab === 'home') {
      window.history.pushState(null, '', '/');
    } else {
      window.history.pushState(null, '', `#${tab}`);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setActiveTab('admin');
      } else if (window.location.hash === '#meal-safety') {
        setActiveTab('meal-safety');
      } else if (window.location.hash === '#morning') {
        setActiveTab('morning');
      } else if (window.location.hash === '#morning-new') {
        setActiveTab('morning-new');
      } else {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Morning hygiene progress states
  const [morningProgress, setMorningProgressState] = useState<number>(0);
  const [morningNewProgress, setMorningNewProgressState] = useState<number>(0);
  const [morningMaterials, setMorningMaterials] = useState<MorningMaterialItem[]>([]);
  const [morningNewMaterials, setMorningNewMaterials] = useState<MorningMaterialItem[]>([]);
  const [isLoadingMorning, setIsLoadingMorning] = useState<boolean>(false);
  const [isLoadingMorningNew, setIsLoadingMorningNew] = useState<boolean>(false);

  // Load morning progress on mount
  useEffect(() => {
    getMorningProgress().then(setMorningProgressState);
    getMorningNewProgress().then(setMorningNewProgressState);
  }, []);

  // Lazy-load morning materials when corresponding tab is selected
  useEffect(() => {
    if (activeTab === 'morning' && morningMaterials.length === 0) {
      setIsLoadingMorning(true);
      contentService.getMorningMaterials().then((data) => {
        setMorningMaterials(data);
        setIsLoadingMorning(false);
      });
    } else if (activeTab === 'morning-new' && morningNewMaterials.length === 0) {
      setIsLoadingMorningNew(true);
      contentService.getMorningNewMaterials().then((data) => {
        setMorningNewMaterials(data);
        setIsLoadingMorningNew(false);
      });
    }
  }, [activeTab, morningMaterials.length, morningNewMaterials.length]);

  const handleSaveMorningProgress = async (day: number) => {
    const saved = await setMorningProgress(day);
    setMorningProgressState(saved);
  };

  const handleSaveMorningNewProgress = async (day: number) => {
    const saved = await setMorningNewProgress(day);
    setMorningNewProgressState(saved);
  };

  // Active month (defaults to 3 as school year begins in March)
  const [currentMonth, setCurrentMonth] = useState<EducationMonth>(3);

  // School settings (managed via async storage service)
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({
    schoolName: '',
    participants: []
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  // Education records (managed via async storage service)
  const [records, setRecords] = useState<EducationRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState<boolean>(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [isSavingRecord, setIsSavingRecord] = useState<boolean>(false);
  const [isRecordsOpen, setIsRecordsOpen] = useState<boolean>(false);

  // Monthly materials state
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [videoTitle, setVideoTitle] = useState<string | undefined>(undefined);
  const [videoQrUrl, setVideoQrUrl] = useState<string | undefined>(undefined);
  const [quizUrl, setQuizUrl] = useState<string>(DEFAULT_QUIZ_URL);
  const [quizQrUrl, setQuizQrUrl] = useState<string | undefined>(undefined);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(true);
  const [loadMaterialsError, setLoadMaterialsError] = useState<boolean>(false);

  // Appendix state
  const [selectedAppendixKey, setSelectedAppendixKey] = useState<'foodborne' | 'ccpcp' | null>(
    null
  );
  const [appendixGroup, setAppendixGroup] = useState<AppendixGroup | null>(null);
  const [isLoadingAppendix, setIsLoadingAppendix] = useState<boolean>(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dateModalConfig, setDateModalConfig] = useState<{
    isOpen: boolean;
    type: 'basic' | 'appendix';
    title: string;
    itemTitle?: string;
    pendingItem?: MaterialItem;
  }>({
    isOpen: false,
    type: 'basic',
    title: ''
  });

  const [deleteConfirmConfig, setDeleteConfirmConfig] = useState<{
    isOpen: boolean;
    record: EducationRecord | null;
  }>({
    isOpen: false,
    record: null
  });

  const [resetMonthConfirmConfig, setResetMonthConfirmConfig] = useState<{
    isOpen: boolean;
    month: EducationMonth | null;
  }>({
    isOpen: false,
    month: null
  });

  const [messageConfig, setMessageConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string | React.ReactNode;
    variant: 'info' | 'success' | 'warning' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info'
  });

  const [pdfPreviewConfig, setPdfPreviewConfig] = useState<{
    isOpen: boolean;
    options: GeneratePdfOptions | null;
  }>({
    isOpen: false,
    options: null
  });

  // Basic education completion status for active month
  const isBasicCompleted = records.some((r) => r.type === 'basic');

  // Load school settings from storage
  const loadSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    setSettingsError(null);
    try {
      const data = await getSettings();
      setSchoolSettings(data);
    } catch (err: any) {
      console.error('Failed to load school settings', err);
      setSettingsError(err?.message || '학교 설정을 불러오지 못했습니다.');
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  // Load records for active month from storage
  const loadRecords = useCallback(async (month: EducationMonth) => {
    setIsLoadingRecords(true);
    setRecordsError(null);
    try {
      const data = await getRecords(month);
      setRecords(data);
    } catch (err: any) {
      console.error('Failed to load records', err);
      setRecordsError(err?.message || '교육 기록을 불러오지 못했습니다.');
    } finally {
      setIsLoadingRecords(false);
    }
  }, []);

  // Initial load of school settings
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Load materials and records when currentMonth changes
  const loadMonthMaterials = useCallback(async (month: EducationMonth) => {
    setIsLoadingMaterials(true);
    setLoadMaterialsError(false);
    try {
      const data = await contentService.getMonthMaterials(month);
      setMaterials(data.materials || []);
      setVideoUrl(data.videoUrl);
      setVideoTitle(data.videoTitle);
      setVideoQrUrl(data.videoQrUrl);
      const [qUrl, qQr] = await Promise.all([getQuizUrl(), getQuizQrUrl()]);
      setQuizUrl(qUrl);
      setQuizQrUrl(qQr);
    } catch (error) {
      console.error('Failed to load materials', error);
      setLoadMaterialsError(true);
    } finally {
      setIsLoadingMaterials(false);
    }
  }, []);

  useEffect(() => {
    loadMonthMaterials(currentMonth);
    loadRecords(currentMonth);
  }, [currentMonth, loadMonthMaterials, loadRecords]);

  // Handle Month change
  const handleSelectMonth = (month: EducationMonth) => {
    setCurrentMonth(month);
  };

  // Basic education title synthesis
  const getBasicEducationTitle = (): string => {
    if (!materials || materials.length === 0) {
      return `${currentMonth}월 위생교육`;
    }
    const titles = materials.map((m) => m.title).filter(Boolean);
    const unique = [...new Set(titles)];
    if (unique.length === 0) return `${currentMonth}월 위생교육`;
    if (unique.length === 1) return unique[0];
    return unique.join(' · ');
  };

  // Open basic education completion modal
  const handleOpenBasicRecordModal = () => {
    if (isBasicCompleted) {
      setMessageConfig({
        isOpen: true,
        title: '이미 기록된 교육입니다.',
        message: `${currentMonth}월 기본교육은 이미 교육실시기록에 등록되어 있습니다.`,
        variant: 'info'
      });
      return;
    }

    if (materials.length === 0) {
      setMessageConfig({
        isOpen: true,
        title: '교육자료 없음',
        message: '현재 월에 등록된 기본교육 자료가 없습니다.',
        variant: 'warning'
      });
      return;
    }

    setDateModalConfig({
      isOpen: true,
      type: 'basic',
      title: `${currentMonth}월 기본교육`,
      itemTitle: getBasicEducationTitle()
    });
  };

  // Open appendix item education record modal
  const handleOpenAppendixRecordModal = (item: MaterialItem) => {
    setDateModalConfig({
      isOpen: true,
      type: 'appendix',
      title: `${currentMonth}월 추가 위생교육`,
      itemTitle: item.title,
      pendingItem: item
    });
  };

  // Confirm date & save education record (either basic or appendix)
  const handleConfirmDate = async (dateText: string) => {
    setIsSavingRecord(true);
    try {
      if (dateModalConfig.type === 'basic') {
        // Duplicate protection
        const alreadyHasBasic = records.some((r) => r.type === 'basic');
        if (alreadyHasBasic) {
          setMessageConfig({
            isOpen: true,
            title: '이미 기록된 교육',
            message: `${currentMonth}월 기본교육이 이미 등록되어 있습니다.`,
            variant: 'info'
          });
          return;
        }

        const basicTitle = getBasicEducationTitle();
        const newRecord: EducationRecord = {
          id: Date.now(),
          date: dateText,
          month: Number(currentMonth),
          title: basicTitle,
          type: 'basic',
          imageUrls: materials.map((m) => m.imageUrl).filter(Boolean)
        };

        await saveRecord(newRecord);
        await loadRecords(currentMonth);

        setMessageConfig({
          isOpen: true,
          title: '기본교육 기록 완료',
          message: `교육일: ${dateText}\n\n${basicTitle}\n\n교육실시기록에 추가되었습니다.`,
          variant: 'success'
        });
      } else if (dateModalConfig.type === 'appendix' && dateModalConfig.pendingItem) {
        const item = dateModalConfig.pendingItem;
        const newRecord: EducationRecord = {
          id: Date.now(),
          date: dateText,
          month: Number(currentMonth),
          title: item.title,
          type: 'appendix',
          appendixKey: selectedAppendixKey || undefined,
          page: item.page,
          imageUrl: item.imageUrl
        };

        await saveRecord(newRecord);
        await loadRecords(currentMonth);

        setMessageConfig({
          isOpen: true,
          title: '추가교육 기록 완료',
          message: `교육일: ${dateText}\n\n${item.title}\n\n${currentMonth}월 교육실시기록에 추가되었습니다.`,
          variant: 'success'
        });
      }
    } catch (err: any) {
      console.error('Failed to save record', err);
      setMessageConfig({
        isOpen: true,
        title: '기록 저장 실패',
        message: err?.message || '교육 기록을 저장하는 중 오류가 발생했습니다.',
        variant: 'error'
      });
    } finally {
      setIsSavingRecord(false);
    }
  };

  // Request delete a record
  const handleRequestDeleteRecord = (record: EducationRecord) => {
    setDeleteConfirmConfig({
      isOpen: true,
      record
    });
  };

  // Confirm delete a record
  const handleConfirmDeleteRecord = async () => {
    if (!deleteConfirmConfig.record) return;
    const targetId = deleteConfirmConfig.record.id;
    setIsSavingRecord(true);
    try {
      await deleteRecord(targetId);
      await loadRecords(currentMonth);

      setMessageConfig({
        isOpen: true,
        title: '교육기록 삭제 완료',
        message: '선택한 교육기록을 삭제했습니다.',
        variant: 'info'
      });
    } catch (err: any) {
      console.error('Failed to delete record', err);
      setMessageConfig({
        isOpen: true,
        title: '삭제 실패',
        message: err?.message || '교육 기록 삭제 중 오류가 발생했습니다.',
        variant: 'error'
      });
    } finally {
      setIsSavingRecord(false);
    }
  };

  // Request reset all records for the current month
  const handleRequestResetMonth = () => {
    if (records.length === 0) {
      setMessageConfig({
        isOpen: true,
        title: '초기화할 기록 없음',
        message: `${currentMonth}월에 등록된 교육기록이 없습니다.`,
        variant: 'info'
      });
      return;
    }

    setResetMonthConfirmConfig({
      isOpen: true,
      month: currentMonth
    });
  };

  // Confirm reset all records for the current month
  const handleConfirmResetMonth = async () => {
    if (!resetMonthConfirmConfig.month) return;
    const targetMonth = resetMonthConfirmConfig.month;
    setIsSavingRecord(true);
    try {
      await clearMonthRecords(targetMonth);
      await loadRecords(targetMonth);
      setResetMonthConfirmConfig({ isOpen: false, month: null });

      setMessageConfig({
        isOpen: true,
        title: `${targetMonth}월 기록 초기화 완료`,
        message: `${targetMonth}월에 등록되었던 기본교육 및 부록 추가교육 기록이 모두 초기화되었습니다.\n새로운 날짜로 다시 등록하실 수 있습니다.`,
        variant: 'success'
      });
    } catch (err: any) {
      console.error('Failed to clear month records', err);
      setMessageConfig({
        isOpen: true,
        title: '초기화 실패',
        message: err?.message || '교육 기록 초기화 중 오류가 발생했습니다.',
        variant: 'error'
      });
    } finally {
      setIsSavingRecord(false);
    }
  };

  // Open appendix category (Lazy loading with in-session cache)
  const handleSelectAppendixGroup = async (groupKey: 'foodborne' | 'ccpcp') => {
    setSelectedAppendixKey(groupKey);
    setIsLoadingAppendix(true);
    try {
      const groupData = await contentService.getAppendixGroup(groupKey);
      setAppendixGroup(groupData);
    } catch (err: any) {
      console.error(err);
      setMessageConfig({
        isOpen: true,
        title: '부록 불러오기 실패',
        message: err.message || '부록 자료를 불러오지 못했습니다.',
        variant: 'error'
      });
      setSelectedAppendixKey(null);
    } finally {
      setIsLoadingAppendix(false);
    }
  };

  // Save school settings
  const handleSaveSchoolSettings = async (newSettings: SchoolSettings) => {
    setIsSavingSettings(true);
    try {
      const saved = await saveSettings(newSettings);
      setSchoolSettings(saved);
      setMessageConfig({
        isOpen: true,
        title: '학교 설정 저장 완료',
        message: `학교명: ${saved.schoolName}\n교육이수대상자 ${saved.participants.length}명이 정상 저장되었습니다.`,
        variant: 'success'
      });
    } catch (err: any) {
      console.error('Failed to save school settings', err);
      setMessageConfig({
        isOpen: true,
        title: '학교 설정 저장 실패',
        message: err?.message || '학교 설정을 저장하지 못했습니다.',
        variant: 'error'
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Open PDF / Print report preview
  const handleOpenReportPrint = () => {
    const currentMonthRecs = records;

    if (currentMonthRecs.length === 0) {
      setMessageConfig({
        isOpen: true,
        title: '교육기록 없음',
        message: `${currentMonth}월에 등록된 교육기록이 없습니다.\n기본교육 완료 또는 부록 추가교육을 먼저 기록해 주세요.`,
        variant: 'warning'
      });
      return;
    }

    if (!schoolSettings.schoolName) {
      setMessageConfig({
        isOpen: true,
        title: '학교정보 확인',
        message: '먼저 상단의 [⚙ 학교 / 교육이수대상자 설정]에서 학교명을 입력해 주세요.',
        variant: 'warning'
      });
      return;
    }

    if (!schoolSettings.participants || schoolSettings.participants.length === 0) {
      setMessageConfig({
        isOpen: true,
        title: '교육이수대상자 확인',
        message: '먼저 상단의 [⚙ 학교 / 교육이수대상자 설정]에서 교육이수대상자 명단을 입력해 주세요.',
        variant: 'warning'
      });
      return;
    }

    const fallbackMonthImages = materials.map((m) => ({
      url: m.imageUrl,
      title: m.title
    }));

    const printCards = getPrintCards(currentMonthRecs, fallbackMonthImages);

    setPdfPreviewConfig({
      isOpen: true,
      options: {
        schoolSettings,
        month: currentMonth,
        records: currentMonthRecs,
        printCards
      }
    });
  };

  return (
    <div className="min-h-screen text-[#263238] font-sans">
      <div className="max-w-[920px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <Header
          schoolSettings={schoolSettings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
        />

        {/* Tab 0: 3 Categories Menu Home (Default First Screen) */}
        {activeTab === 'home' && (
          <CategoryHome
            morningProgress={morningProgress}
            morningNewProgress={morningNewProgress}
            schoolSettings={schoolSettings}
            quizUrl={quizUrl}
            onSelectCategory={(cat) => handleSelectTab(cat)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* Tab 1: 급식안심(월) - Monthly Hygiene Education & Log */}
        {activeTab === 'meal-safety' && (
          <main>
            {/* Top Back to Home Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => handleSelectTab('home')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                전체 카테고리로
              </button>
            </div>

            {/* Month Selector */}
            <MonthSelector
              currentMonth={currentMonth}
              onSelectMonth={handleSelectMonth}
            />

            {/* Monthly Materials & Top Action Bar */}
            <MonthlyMaterials
              month={currentMonth}
              materials={materials}
              isLoading={isLoadingMaterials}
              loadError={loadMaterialsError}
              onRetry={() => loadMonthMaterials(currentMonth)}
              isBasicCompleted={isBasicCompleted}
              onCompleteBasicEducation={handleOpenBasicRecordModal}
              recordsCount={records.length}
              isRecordsOpen={isRecordsOpen}
              onToggleRecords={() => setIsRecordsOpen((prev) => !prev)}
              onOpenReportPrint={handleOpenReportPrint}
              onResetMonthRecords={handleRequestResetMonth}
              videoUrl={videoUrl}
              videoTitle={videoTitle}
              videoQrUrl={videoQrUrl}
              quizUrl={quizUrl}
              quizQrUrl={quizQrUrl}
              recordsNode={
                <EducationRecordList
                  month={currentMonth}
                  records={records}
                  isOpen={isRecordsOpen}
                  onClose={() => setIsRecordsOpen(false)}
                  onRequestDelete={handleRequestDeleteRecord}
                  onResetMonth={handleRequestResetMonth}
                  isLoading={isLoadingRecords}
                  errorMessage={recordsError}
                  isSaving={isSavingRecord}
                />
              }
            />

            {/* Appendix Section (Lazy loading) */}
            <section className="mt-12 pt-8 border-t-2 border-[#e3e9ec]">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                  부록 · 추가 위생교육
                </h2>
                <p className="text-xs sm:text-sm text-[#708087] mt-1 leading-relaxed">
                  필요한 경우 자료를 선택하여 추가 위생교육에 활용하세요. (각 낱장별로 {currentMonth}월 교육기록에 개별 추가됩니다.)
                </p>
              </div>

              {!selectedAppendixKey ? (
                <AppendixMenu onSelectGroup={handleSelectAppendixGroup} />
              ) : (
                <AppendixDetail
                  group={appendixGroup}
                  isLoading={isLoadingAppendix}
                  currentMonth={currentMonth}
                  onBack={() => {
                    setSelectedAppendixKey(null);
                    setAppendixGroup(null);
                  }}
                  onAddRecord={handleOpenAppendixRecordModal}
                />
              )}
            </section>
          </main>
        )}

        {/* Tab 2: 모닝위생(일) */}
        {activeTab === 'morning' && (
          <MorningEducation
            type="regular"
            title="모닝위생(일)"
            badge="조리 전 3분 일일 교육"
            materials={morningMaterials}
            isLoading={isLoadingMorning}
            currentProgress={morningProgress}
            onSaveProgress={handleSaveMorningProgress}
            onBackToCategories={() => handleSelectTab('home')}
          />
        )}

        {/* Tab 3: 모닝위생_신규(일) */}
        {activeTab === 'morning-new' && (
          <MorningEducation
            type="new"
            title="모닝위생_신규(일)"
            badge="신규 맞춤 집중과정"
            materials={morningNewMaterials}
            isLoading={isLoadingMorningNew}
            currentProgress={morningNewProgress}
            onSaveProgress={handleSaveMorningNewProgress}
            onBackToCategories={() => handleSelectTab('home')}
          />
        )}

        {/* Tab 4: Admin Page */}
        {activeTab === 'admin' && (
          <AdminPage
            onBackToApp={() => handleSelectTab('home')}
            onRefreshParent={() => {
              loadMonthMaterials(currentMonth);
              getMorningProgress().then(setMorningProgressState);
              getMorningNewProgress().then(setMorningNewProgressState);
            }}
          />
        )}
      </div>

      {/* School Settings Modal */}
      <SchoolSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={schoolSettings}
        onSave={handleSaveSchoolSettings}
        isSaving={isSavingSettings}
      />

      {/* Education Date Modal */}
      <EducationDateModal
        isOpen={dateModalConfig.isOpen}
        onClose={() =>
          setDateModalConfig((prev) => ({ ...prev, isOpen: false, pendingItem: undefined }))
        }
        targetMonth={currentMonth}
        title={dateModalConfig.title}
        itemTitle={dateModalConfig.itemTitle}
        type={dateModalConfig.type}
        onConfirm={handleConfirmDate}
      />

      {/* Delete Record Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmConfig.isOpen}
        onClose={() => setDeleteConfirmConfig({ isOpen: false, record: null })}
        onConfirm={handleConfirmDeleteRecord}
        title="교육기록 삭제"
        message={
          deleteConfirmConfig.record ? (
            <span>
              <strong>[{formatRecordDate(deleteConfirmConfig.record.date)}]</strong>{' '}
              {deleteConfirmConfig.record.title}
              <br />
              <br />
              해당 교육기록을 삭제하시겠습니까?
            </span>
          ) : (
            ''
          )
        }
        confirmText="삭제"
        danger
      />

      {/* Reset Current Month Records Confirmation Modal */}
      <ConfirmModal
        isOpen={resetMonthConfirmConfig.isOpen}
        onClose={() => setResetMonthConfirmConfig({ isOpen: false, month: null })}
        onConfirm={handleConfirmResetMonth}
        title={`${resetMonthConfirmConfig.month}월 교육기록 전체 초기화`}
        message={
          <span>
            <strong>{resetMonthConfirmConfig.month}월</strong>에 잘못 등록된{' '}
            <strong className="text-rose-600">모든 교육기록({records.length}건)</strong>을 초기화하시겠습니까?
            <br />
            <br />
            기본교육 및 부록 추가교육 기록이 삭제되며, 다른 월의 교육기록에는 영향을 주지 않습니다.
          </span>
        }
        confirmText="초기화 실행"
        cancelText="취소"
        danger
      />

      {/* General Guidance & Message Modal */}
      <MessageModal
        isOpen={messageConfig.isOpen}
        onClose={() => setMessageConfig((prev) => ({ ...prev, isOpen: false }))}
        title={messageConfig.title}
        message={messageConfig.message}
        variant={messageConfig.variant}
      />

      {/* PDF Report Preview Modal */}
      {pdfPreviewConfig.options && (
        <PdfPreviewModal
          isOpen={pdfPreviewConfig.isOpen}
          onClose={() => setPdfPreviewConfig({ isOpen: false, options: null })}
          options={pdfPreviewConfig.options}
        />
      )}
    </div>
  );
}
