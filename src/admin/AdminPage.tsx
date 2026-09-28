import React, { useState, useEffect } from 'react';
import {
  checkAdminPasscode,
  isAdminAuthenticated,
  setAdminAuthenticated
} from '../services/adminAuth';
import {
  getQuizUrl,
  saveQuizUrl,
  DEFAULT_QUIZ_URL,
  exportBackupData,
  validateBackupData,
  restoreBackupData,
  getMorningProgress,
  setMorningProgress,
  getMorningNewProgress,
  setMorningNewProgress
} from '../services/storage';
import { ASSET_BASE_URL } from '../config/assets';
import { ConfirmModal, MessageModal } from '../components/modals/MessageModal';
import { Modal } from '../components/modals/Modal';
import {
  ArrowLeft,
  Lock,
  LogOut,
  Download,
  FileUp,
  Database,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Server,
  Sparkles,
  RotateCcw,
  Edit3
} from 'lucide-react';

interface AdminPageProps {
  onBackToApp: () => void;
  onRefreshParent: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onBackToApp,
  onRefreshParent
}) => {
  // Passcode gate state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAdminAuthenticated());
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Quiz setting state
  const [quizUrlInput, setQuizUrlInput] = useState<string>(DEFAULT_QUIZ_URL);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [quizSaveSuccess, setQuizSaveSuccess] = useState(false);

  // Backup & Restore states
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<{
    data: any;
    summary: {
      recordsCount: number;
      schoolName: string;
      participantsCount: number;
      morningProgress?: number;
      morningNewProgress?: number;
    };
  } | null>(null);

  // Custom Modal states
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

  // Morning progress states
  const [morningProg, setMorningProg] = useState<number>(0);
  const [morningNewProg, setMorningNewProg] = useState<number>(0);

  // Admin Progress Edit states
  const [adminEditModal, setAdminEditModal] = useState<{
    type: 'regular' | 'new';
    current: number;
  } | null>(null);
  const [adminEditInput, setAdminEditInput] = useState<number>(0);
  const [adminConfirmDowngrade, setAdminConfirmDowngrade] = useState<{
    type: 'regular' | 'new';
    target: number;
    message: string;
  } | null>(null);

  // Load initial settings
  useEffect(() => {
    if (isAuthenticated) {
      getQuizUrl().then((url) => setQuizUrlInput(url || DEFAULT_QUIZ_URL));
      getMorningProgress().then(setMorningProg);
      getMorningNewProgress().then(setMorningNewProg);
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAdminPasscode(passcodeInput)) {
      setAdminAuthenticated(true);
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('관리자 비밀번호가 일치하지 않습니다. (기본: 1234)');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setAdminAuthenticated(false);
    setIsAuthenticated(false);
    setPasscodeInput('');
  };

  // Save Quiz URL
  const handleSaveQuizUrl = async () => {
    setIsSavingQuiz(true);
    try {
      await saveQuizUrl(quizUrlInput);
      setQuizSaveSuccess(true);
      setTimeout(() => setQuizSaveSuccess(false), 3000);
      onRefreshParent();
    } catch (err: any) {
      setMessageConfig({
        isOpen: true,
        title: '퀴즈 URL 저장 실패',
        message: err?.message || '퀴즈 URL 저장 중 오류가 발생했습니다.',
        variant: 'error'
      });
    } finally {
      setIsSavingQuiz(false);
    }
  };

  // Open Admin Edit Progress Modal
  const handleOpenAdminEditProgress = (type: 'regular' | 'new', current: number) => {
    setAdminEditModal({ type, current });
    setAdminEditInput(current);
  };

  // Submit Admin Edit Progress
  const handleSubmitAdminEditProgress = async () => {
    if (!adminEditModal) return;
    const { type, current } = adminEditModal;
    const target = Math.max(0, Math.min(190, Number(adminEditInput) || 0));

    if (target === current) {
      setAdminEditModal(null);
      return;
    }

    // For morning new, disallow advancing without records
    if (type === 'new' && target > current) {
      setMessageConfig({
        isOpen: true,
        title: '진행기록 수정 안내',
        message: `모닝위생(신규)은 교육일 기록이 필요하므로, 진행기록 수정은 이미 완료된 기록을 하향 정정하는 용도로만 사용할 수 있습니다. (현재 최대 Day ${current})\n새로운 Day의 완료는 각 카드의 [교육 완료] 버튼을 이용해 주세요.`,
        variant: 'info'
      });
      return;
    }

    // Downgrade check
    if (target < current) {
      setAdminEditModal(null);
      const titleName = type === 'new' ? '모닝위생(신규)' : '모닝위생';
      if (target === 0) {
        setAdminConfirmDowngrade({
          type,
          target: 0,
          message: `${titleName} 진행기록을 초기화하고\nDay 1부터 다시 시작하시겠습니까?`
        });
      } else {
        setAdminConfirmDowngrade({
          type,
          target,
          message: `Day ${target + 1}~${current}의 완료 기록이 해제됩니다.`
        });
      }
      return;
    }

    // Advance for regular morning
    const saved = await setMorningProgress(target);
    setMorningProg(saved);
    setAdminEditModal(null);
    onRefreshParent();
  };

  // Confirm Admin Downgrade
  const handleConfirmAdminDowngrade = async () => {
    if (!adminConfirmDowngrade) return;
    const { type, target } = adminConfirmDowngrade;
    if (type === 'new') {
      const saved = await setMorningNewProgress(target);
      setMorningNewProg(saved);
    } else {
      const saved = await setMorningProgress(target);
      setMorningProg(saved);
    }
    setAdminConfirmDowngrade(null);
    onRefreshParent();
    setMessageConfig({
      isOpen: true,
      title: '진행기록 변경 완료',
      message: `${type === 'new' ? '모닝위생(신규)' : '모닝위생'} 완료 일차가 Day ${target}로 변경되었습니다.`,
      variant: 'success'
    });
  };

  // Export Backup JSON
  const handleExportBackup = async () => {
    setIsExportingBackup(true);
    try {
      const backupData = await exportBackupData();
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        now.getDate()
      ).padStart(2, '0')}`;

      const link = document.createElement('a');
      link.href = url;
      link.download = `학교급식_위생교육_백업_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessageConfig({
        isOpen: true,
        title: '백업 완료',
        message: '현재 기기에 저장된 학교 정보, 교육 기록 및 진행상황이 안전하게 JSON 파일로 다운로드되었습니다.',
        variant: 'success'
      });
    } catch (err: any) {
      console.error('Backup export failed:', err);
      setMessageConfig({
        isOpen: true,
        title: '백업 실패',
        message: err?.message || '데이터 백업 중 오류가 발생했습니다.',
        variant: 'error'
      });
    } finally {
      setIsExportingBackup(false);
    }
  };

  // Select file for restore
  const handleSelectRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const validation = validateBackupData(parsed);

        setPendingRestoreData({
          data: parsed,
          summary: validation.summary!
        });
      } catch (err: any) {
        console.error('Invalid backup file:', err);
        setMessageConfig({
          isOpen: true,
          title: '백업 파일 오류',
          message: err?.message || '선택한 파일이 올바른 백업 형식이 아니거나 손상되었습니다.',
          variant: 'error'
        });
      } finally {
        e.target.value = '';
      }
    };

    reader.onerror = () => {
      setMessageConfig({
        isOpen: true,
        title: '파일 읽기 오류',
        message: '백업 파일을 읽는 중 오류가 발생했습니다.',
        variant: 'error'
      });
      e.target.value = '';
    };

    reader.readAsText(file);
  };

  // Confirm restore
  const handleConfirmRestore = async () => {
    if (!pendingRestoreData) return;
    setIsRestoringBackup(true);
    try {
      const res = await restoreBackupData(pendingRestoreData.data);
      setPendingRestoreData(null);

      // Refresh states
      const [newMorning, newMorningNew] = await Promise.all([
        getMorningProgress(),
        getMorningNewProgress(),
        getQuizUrl().then((u) => setQuizUrlInput(u || DEFAULT_QUIZ_URL))
      ]);
      setMorningProg(newMorning);
      setMorningNewProg(newMorningNew);
      onRefreshParent();

      setMessageConfig({
        isOpen: true,
        title: '데이터 복원 완료',
        message: `학교명: ${res.schoolName || '(미지정)'}\n교육실시기록: ${res.recordsCount}건\n모닝위생 진행: Day ${res.morningProgress}\n모닝위생(신규) 진행: Day ${res.morningNewProgress}\n\n데이터가 성공적으로 복원되었습니다.`,
        variant: 'success'
      });
    } catch (err: any) {
      console.error('Restore failed:', err);
      setMessageConfig({
        isOpen: true,
        title: '복원 실패',
        message: err?.message || '데이터 복원 중 오류가 발생했습니다.',
        variant: 'error'
      });
    } finally {
      setIsRestoringBackup(false);
    }
  };

  // If not authenticated, show passcode screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
        <button
          type="button"
          onClick={onBackToApp}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          교육 화면으로 돌아가기
        </button>

        <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-1">
          학교급식종사자 위생교육 관리
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          관리자 인증을 위해 비밀번호를 입력해 주세요. (기본: 1234)
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              placeholder="관리자 비밀번호"
              className="w-full px-4 py-2.5 text-center text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          {authError && (
            <p className="text-xs text-rose-600 font-medium">{authError}</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-[#527765] hover:bg-[#416252] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            관리자 확인
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            type="button"
            onClick={onBackToApp}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            교육 화면으로 돌아가기
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            학교급식종사자 위생교육 관리
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            완전 무료 정적 웹앱 모드로 운영되며, 데이터는 기기 로컬에 안전하게 보관됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          관리자 종료
        </button>
      </div>

      {/* 1. Data Backup & Restore */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            데이터 백업 및 복원 (JSON)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
          브라우저 캐시 삭제나 기기 교체에 대비하여 현재 기기에 저장된 학교 정보, 교육실시기록, 모닝위생 진행상황을 JSON 파일로 백업하거나 복원할 수 있습니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Backup Download */}
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={isExportingBackup}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-xl border border-indigo-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {isExportingBackup ? '백업 파일 생성 중...' : '데이터 백업 (JSON 다운로드)'}
          </button>

          {/* Restore Upload */}
          <label className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-bold rounded-xl border border-emerald-200 transition-colors cursor-pointer">
            <FileUp className="w-4 h-4" />
            <span>데이터 복원 (JSON 업로드)</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleSelectRestoreFile}
              className="hidden"
            />
          </label>
        </div>
      </section>

      {/* 2. Quiz URL Settings */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            위생교육 퀴즈 설정
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
          조리종사자 대상 온라인 위생퀴즈 사이트 URL을 확인하고 변경할 수 있습니다.
        </p>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={quizUrlInput}
              onChange={(e) => setQuizUrlInput(e.target.value)}
              placeholder="https://thtkssla.github.io/foodhygiene/"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs sm:text-sm"
            />
            <button
              type="button"
              onClick={handleSaveQuizUrl}
              disabled={isSavingQuiz}
              className="px-4 py-2 bg-[#527765] hover:bg-[#416252] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {isSavingQuiz ? '저장 중...' : '저장'}
            </button>
            <a
              href={quizUrlInput}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              테스트 열기
            </a>
          </div>

          {quizSaveSuccess && (
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              퀴즈 URL이 성공적으로 저장되었습니다.
            </p>
          )}
        </div>
      </section>

      {/* 3. Morning Hygiene Progress Control (Requirement 3, 4, 5) */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            모닝위생 진행기록 관리
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
          190일 연속 교육과정의 진행 일차를 안전하게 확인하고 수정할 수 있습니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 모닝위생(일) */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-800">모닝위생(일)</span>
                <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  Day {morningProg} / 190
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-3">
                {morningProg === 0 ? '아직 시작하지 않음' : `Day ${morningProg}까지 완료`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAdminEditProgress('regular', morningProg)}
              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>진행기록 수정</span>
            </button>
          </div>

          {/* 모닝위생_신규(일) */}
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-800">모닝위생_신규(일)</span>
                <span className="text-xs font-black text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                  Day {morningNewProg} / 190
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-3">
                {morningNewProg === 0 ? '아직 시작하지 않음' : `Day ${morningNewProg}까지 완료`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAdminEditProgress('new', morningNewProg)}
              className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>진행기록 수정</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Educational Materials Static Server Info */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Server className="w-5 h-5 text-slate-700" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            정적 교육자료 서버 (Cloudflare Pages)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-3 leading-relaxed">
          교육 이미지 및 정적 파일은 외부 공개 정적 파일 서버에서 제공됩니다.
        </p>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Base URL:</span>
            <code className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-800 font-mono text-[11px]">
              {ASSET_BASE_URL}
            </code>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">서버 운영 방식:</span>
            <span className="text-emerald-700 font-bold">Cloudflare Pages 완전 무료 정적 호스팅</span>
          </div>
        </div>
      </section>

      {/* Admin Edit Progress Modal */}
      {adminEditModal && (
        <Modal
          isOpen={true}
          onClose={() => setAdminEditModal(null)}
          title={`${adminEditModal.type === 'new' ? '모닝위생_신규(일)' : '모닝위생(일)'} 진행기록 수정`}
          maxWidth="max-w-md"
        >
          <div className="p-4 sm:p-6 space-y-5">
            <p className="text-xs text-slate-500 leading-relaxed">
              현재 완료 일차를 직접 변경하거나 <strong>0으로 설정하여 초기화</strong>할 수 있습니다.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="text-xs text-slate-600 font-medium">현재 저장된 완료 일차</div>
              <div className="text-xl font-black text-slate-800">
                {adminEditModal.current === 0 ? 'Day 0 (미시작)' : `Day ${adminEditModal.current} / 190`}
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  완료 Day 변경 (0 ~ {adminEditModal.type === 'new' ? adminEditModal.current : 190}):
                </label>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-bold text-slate-600">Day</span>
                  <input
                    type="number"
                    min={0}
                    max={adminEditModal.type === 'new' ? adminEditModal.current : 190}
                    value={adminEditInput}
                    onChange={(e) => {
                      const maxLimit = adminEditModal.type === 'new' ? adminEditModal.current : 190;
                      const val = parseInt(e.target.value, 10);
                      setAdminEditInput(isNaN(val) ? 0 : Math.max(0, Math.min(maxLimit, val)));
                    }}
                    className="w-24 px-3 py-2 text-center text-lg font-black bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                  <span className="text-xs text-slate-400">/ {adminEditModal.type === 'new' ? adminEditModal.current : 190}</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                {[0, 1, 30, 50, 100, 150, 190]
                  .filter((preset) => adminEditModal.type !== 'new' || preset === 0 || preset <= adminEditModal.current)
                  .map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAdminEditInput(preset)}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                        adminEditInput === preset
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset === 0 ? '0 (초기화)' : preset === 190 ? '190 (완료)' : `Day ${preset}`}
                    </button>
                  ))}
              </div>
            </div>

            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
              <div>• <strong>0:</strong> 아직 시작하지 않은 상태 (초기화)</div>
              <div>• <strong>1 ~ 189:</strong> 해당 Day까지 완료 처리</div>
              <div>• <strong>190:</strong> 전체 190일 완료 처리</div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setAdminEditModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmitAdminEditProgress}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                변경
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Downgrade Confirm Modal */}
      {adminConfirmDowngrade && (
        <ConfirmModal
          isOpen={true}
          title={adminConfirmDowngrade.target === 0 ? '진행기록 초기화 확인' : '진행기록 변경 확인'}
          message={
            <div className="text-center py-2 space-y-3">
              <p className="text-slate-800 font-bold text-sm whitespace-pre-line leading-relaxed">
                {adminConfirmDowngrade.message}
              </p>
              <p className="text-xs text-slate-500">
                {adminConfirmDowngrade.target === 0
                  ? '이후 Day 1부터 새로 시작할 수 있습니다.'
                  : `변경 후 완료 일차가 Day ${adminConfirmDowngrade.target}로 조정됩니다.`}
              </p>
            </div>
          }
          confirmText={
            adminConfirmDowngrade.target === 0
              ? 'Day 0으로 초기화'
              : `Day ${adminConfirmDowngrade.target}으로 변경`
          }
          cancelText="취소"
          danger={adminConfirmDowngrade.target === 0}
          onConfirm={handleConfirmAdminDowngrade}
          onClose={() => setAdminConfirmDowngrade(null)}
        />
      )}

      {/* Confirmation Modal for Restore */}
      {pendingRestoreData && (
        <ConfirmModal
          isOpen={true}
          title="데이터 복원 확인"
          message={
            <div>
              <p className="mb-3 text-slate-700">
                백업 파일로 복원하면 현재 기기에 저장된 데이터가 아래 내용으로 변경됩니다. 계속하시겠습니까?
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 text-left">
                <div>
                  <strong>학교명:</strong> {pendingRestoreData.summary.schoolName}
                </div>
                <div>
                  <strong>교육이수대상자:</strong> {pendingRestoreData.summary.participantsCount}명
                </div>
                <div>
                  <strong>교육실시기록:</strong> {pendingRestoreData.summary.recordsCount}건
                </div>
                <div>
                  <strong>모닝위생 진행:</strong> Day {pendingRestoreData.summary.morningProgress || 0}
                </div>
                <div>
                  <strong>모닝위생(신규) 진행:</strong> Day {pendingRestoreData.summary.morningNewProgress || 0}
                </div>
              </div>
            </div>
          }
          confirmText={isRestoringBackup ? '복원 중...' : '확인 (데이터 덮어쓰기)'}
          cancelText="취소"
          danger={false}
          onConfirm={handleConfirmRestore}
          onClose={() => setPendingRestoreData(null)}
        />
      )}

      {/* General Message Modal */}
      <MessageModal
        isOpen={messageConfig.isOpen}
        title={messageConfig.title}
        message={messageConfig.message}
        variant={messageConfig.variant}
        onClose={() => setMessageConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
