import React, { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { isUserAdmin } from '../services/adminAuth';
import { AVAILABLE_MONTHS, EducationMonth, MaterialItem } from '../types';
import { contentService } from '../services/contentService';
import {
  getQuizUrl,
  saveQuizUrl,
  getQuizQrUrl,
  saveQuizQrUrl,
  DEFAULT_QUIZ_URL,
  exportBackupData,
  validateBackupData,
  restoreBackupData
} from '../services/storage';
import { ConfirmModal, MessageModal } from '../components/modals/MessageModal';
import {
  Upload,
  Save,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Cloud,
  ArrowLeft,
  Video,
  HelpCircle,
  ExternalLink,
  Plus,
  Trash2,
  FolderOpen,
  Calendar,
  Layers,
  Loader2,
  LogOut,
  AlertCircle,
  Download,
  FileUp,
  Database
} from 'lucide-react';

interface AdminPageProps {
  onBackToApp: () => void;
  onRefreshParent: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onBackToApp,
  onRefreshParent
}) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('tabbysa@penz.kr');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab: 'monthly' vs 'appendix'
  const [adminTab, setAdminTab] = useState<'monthly' | 'appendix'>('monthly');

  // Monthly tab state
  const [selectedMonth, setSelectedMonth] = useState<EducationMonth>(3);
  const [monthlyMaterials, setMonthlyMaterials] = useState<MaterialItem[]>([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoQrUrl, setVideoQrUrl] = useState('');
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);

  // Appendix tab state
  const [selectedCategory, setSelectedCategory] = useState<'foodborne' | 'ccpcp'>('foodborne');
  const [appendixMaterials, setAppendixMaterials] = useState<MaterialItem[]>([]);
  const [isLoadingAppendix, setIsLoadingAppendix] = useState(false);

  // Global Quiz URL & QR state
  const [quizUrlInput, setQuizUrlInput] = useState<string>(DEFAULT_QUIZ_URL);
  const [quizQrInput, setQuizQrInput] = useState<string>('');
  const [quizSaveSuccess, setQuizSaveSuccess] = useState(false);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);

  // Uploading and save states
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Backup & Restore states
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<{
    data: any;
    summary: {
      recordsCount: number;
      schoolName: string;
      participantsCount: number;
    };
    fileName: string;
  } | null>(null);
  const [restoreNoticeModal, setRestoreNoticeModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info'
  });

  // Custom Modal for delete confirmation
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<MaterialItem | null>(null);

  // Load quiz settings asynchronously
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [qUrl, qQr] = await Promise.all([getQuizUrl(), getQuizQrUrl()]);
        if (isMounted) {
          setQuizUrlInput(qUrl);
          setQuizQrInput(qQr || '');
        }
      } catch (err) {
        console.error('Failed to load quiz settings', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = isUserAdmin(currentUser);

  // Load Monthly Data
  const loadMonthData = async (m: EducationMonth) => {
    setIsLoadingMonth(true);
    try {
      const items = await contentService.getAdminMonthMaterials(m);
      setMonthlyMaterials(items);

      // Load video info from month data
      const monthMeta = await contentService.getMonthMaterials(m);
      setVideoTitle(monthMeta.videoTitle || '');
      setVideoUrl(monthMeta.videoUrl || '');
      setVideoQrUrl(monthMeta.videoQrUrl || '');
    } catch (e) {
      console.error('Failed to load month data', e);
    } finally {
      setIsLoadingMonth(false);
    }
  };

  // Load Appendix Data
  const loadAppendixData = async (cat: 'foodborne' | 'ccpcp') => {
    setIsLoadingAppendix(true);
    try {
      const items = await contentService.getAdminAppendixGroup(cat);
      setAppendixMaterials(items);
    } catch (e) {
      console.error('Failed to load appendix data', e);
    } finally {
      setIsLoadingAppendix(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      if (adminTab === 'monthly') {
        loadMonthData(selectedMonth);
      } else {
        loadAppendixData(selectedCategory);
      }
    }
  }, [isAdmin, adminTab, selectedMonth, selectedCategory]);

  // Google Login
  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setAuthError(err.message || 'Google 로그인에 실패했습니다.');
    }
  };

  // Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, emailInput, passwordInput);
    } catch (err: any) {
      setAuthError('로그인 실패: 이메일 또는 비밀번호를 확인해주세요.');
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await signOut(auth);
  };

  // Global Quiz URL & QR Save
  const handleSaveQuizUrl = async () => {
    setIsSavingQuiz(true);
    setErrorMessage(null);
    try {
      await saveQuizUrl(quizUrlInput);
      await saveQuizQrUrl(quizQrInput.trim() || undefined);
      setQuizSaveSuccess(true);
      onRefreshParent();
      setTimeout(() => setQuizSaveSuccess(false), 2500);
    } catch (err: any) {
      setErrorMessage(err?.message || '퀴즈 설정을 저장하지 못했습니다.');
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const handleQuizQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setQuizQrInput(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 1. Data Backup (JSON Download)
  const handleBackupExport = async () => {
    setIsExportingBackup(true);
    setErrorMessage(null);
    try {
      const backupData = await exportBackupData();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`;

      const todayStr = new Date().toISOString().slice(0, 10);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute(
        'download',
        `학교급식_위생교육_백업_${todayStr}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showSuccessNotice(
        `데이터 백업 파일이 다운로드되었습니다. (교육기록 ${backupData.records.length}건, 학교: ${backupData.schoolSettings.schoolName || '미지정'})`
      );
    } catch (err: any) {
      console.error('Backup export failed:', err);
      setErrorMessage(err?.message || '데이터 백업 중 오류가 발생했습니다.');
    } finally {
      setIsExportingBackup(false);
    }
  };

  // 2. Data Restore File Selection & Verification
  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset file input value so user can re-select the same file if needed
    e.target.value = '';

    if (!file) return;

    // Check extension or MIME type
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      setRestoreNoticeModal({
        isOpen: true,
        title: '지원하지 않는 파일 형식',
        message: '백업 복원은 JSON 형식(.json)의 파일만 지원됩니다.\n올바른 백업 파일을 선택해주세요.',
        variant: 'error'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawContent = event.target?.result as string;
        let parsed: any;
        try {
          parsed = JSON.parse(rawContent);
        } catch {
          throw new Error('파일 내용이 유효한 JSON 형식이 아닙니다. 파일이 손상되었는지 확인해주세요.');
        }

        // Validate structure
        const validated = validateBackupData(parsed);

        // Open confirm modal with summary
        setPendingRestoreData({
          data: parsed,
          summary: validated.summary || {
            recordsCount: parsed.records?.length || 0,
            schoolName: parsed.schoolSettings?.schoolName || '(미지정)',
            participantsCount: parsed.schoolSettings?.participants?.length || 0
          },
          fileName: file.name
        });
      } catch (validationErr: any) {
        setRestoreNoticeModal({
          isOpen: true,
          title: '백업 파일 검증 실패',
          message: `${validationErr?.message || '올바른 백업 데이터 형식이 아닙니다.'}\n\n시스템에서 정상 다운로드된 백업 파일인지 확인해주세요.`,
          variant: 'error'
        });
      }
    };

    reader.onerror = () => {
      setRestoreNoticeModal({
        isOpen: true,
        title: '파일 읽기 오류',
        message: '선택한 파일을 읽는 중 문제가 발생했습니다.',
        variant: 'error'
      });
    };

    reader.readAsText(file);
  };

  // 3. Confirm and Execute Restore
  const handleConfirmRestore = async () => {
    if (!pendingRestoreData) return;
    setIsRestoringBackup(true);
    try {
      const result = await restoreBackupData(pendingRestoreData.data);

      // Refresh quiz state inputs if restored
      const [qUrl, qQr] = await Promise.all([getQuizUrl(), getQuizQrUrl()]);
      setQuizUrlInput(qUrl);
      setQuizQrInput(qQr || '');

      // Refresh parent app state
      onRefreshParent();

      setPendingRestoreData(null);
      setRestoreNoticeModal({
        isOpen: true,
        title: '데이터 복원 완료',
        message: `데이터가 성공적으로 복원되었습니다.\n\n- 학교명: ${result.schoolName || '(미지정)'}\n- 복원된 교육기록: 총 ${result.recordsCount}건\n\n화면에 즉시 반영되었습니다.`,
        variant: 'success'
      });
    } catch (err: any) {
      console.error('Data restore failed:', err);
      setRestoreNoticeModal({
        isOpen: true,
        title: '복원 실패',
        message: err?.message || '데이터를 복원하는 중 오류가 발생했습니다.',
        variant: 'error'
      });
    } finally {
      setIsRestoringBackup(false);
    }
  };

  // Upload or replace image for Monthly Item
  const handleMonthlyImageUpload = async (idx: number, file: File) => {
    const item = monthlyMaterials[idx];
    setUploadingIndex(idx);
    setErrorMessage(null);
    try {
      const result = await contentService.uploadMaterialImage({
        file,
        type: 'monthly',
        month: selectedMonth,
        page: item.page || idx + 1,
        title: item.title,
        order: item.order ?? idx + 1,
        existingDocId: item.id?.startsWith('monthly_') ? item.id : undefined,
        isPublished: item.visible !== false
      });

      const updated = [...monthlyMaterials];
      updated[idx] = {
        ...item,
        id: result.id || item.id,
        imageUrl: result.imageUrl,
        imagePath: result.imagePath,
        originalImageUrl: result.originalImageUrl,
        originalImagePath: result.originalImagePath
      };
      setMonthlyMaterials(updated);
      onRefreshParent();
      showSuccessNotice('이미지가 등록되어 사용자 화면에 반영되었습니다.');
    } catch (error: any) {
      console.error('Image upload failed:', error);
      showErrorNotice(`이미지 업로드 중 오류가 발생했습니다: ${error?.message || '다시 시도해주세요.'}`);
    } finally {
      setUploadingIndex(null);
    }
  };

  // Upload or replace image for Appendix Item
  const handleAppendixImageUpload = async (idx: number, file: File) => {
    const item = appendixMaterials[idx];
    setUploadingIndex(idx);
    setErrorMessage(null);
    try {
      const result = await contentService.uploadMaterialImage({
        file,
        type: 'appendix',
        category: selectedCategory,
        page: item.page || idx + 1,
        title: item.title,
        order: item.order ?? idx + 1,
        existingDocId: item.id?.startsWith('appendix_') ? item.id : undefined,
        isPublished: item.visible !== false
      });

      const updated = [...appendixMaterials];
      updated[idx] = {
        ...item,
        id: result.id || item.id,
        imageUrl: result.imageUrl,
        imagePath: result.imagePath,
        originalImageUrl: result.originalImageUrl,
        originalImagePath: result.originalImagePath
      };
      setAppendixMaterials(updated);
      onRefreshParent();
      showSuccessNotice('부록 이미지가 등록되었습니다.');
    } catch (error: any) {
      console.error('Appendix upload failed:', error);
      showErrorNotice(`부록 이미지 업로드 실패: ${error?.message || '다시 시도해주세요.'}`);
    } finally {
      setUploadingIndex(null);
    }
  };

  // Add new material item (Monthly)
  const handleAddNewMonthly = () => {
    const nextOrder = monthlyMaterials.length + 1;
    const newItem: MaterialItem = {
      id: '',
      page: nextOrder,
      title: `${selectedMonth}월 신규 교육자료`,
      imageUrl: '',
      visible: true,
      order: nextOrder
    };
    setMonthlyMaterials([...monthlyMaterials, newItem]);
  };

  // Add new material item (Appendix)
  const handleAddNewAppendix = () => {
    const nextOrder = appendixMaterials.length + 1;
    const newItem: MaterialItem = {
      id: '',
      page: nextOrder,
      title: `${selectedCategory === 'foodborne' ? '식중독' : 'CCP'} 신규 추가자료`,
      imageUrl: '',
      category: selectedCategory,
      visible: true,
      order: nextOrder
    };
    setAppendixMaterials([...appendixMaterials, newItem]);
  };

  // Save/Update metadata (Title, Order, isPublished)
  const handleSaveMonthlyMetadata = async (idx: number) => {
    const item = monthlyMaterials[idx];
    if (!item.id) {
      alert('먼저 이미지를 업로드해 주세요.');
      return;
    }

    try {
      await contentService.updateMaterialMetadata(item.id, {
        title: item.title,
        order: item.order ?? idx + 1,
        isPublished: item.visible !== false
      });
      onRefreshParent();
      showSuccessNotice('자료 메타데이터가 저장되었습니다.');
    } catch (e) {
      console.error(e);
      alert('저장 실패');
    }
  };

  const handleSaveAppendixMetadata = async (idx: number) => {
    const item = appendixMaterials[idx];
    if (!item.id) {
      alert('먼저 이미지를 업로드해 주세요.');
      return;
    }

    try {
      await contentService.updateMaterialMetadata(item.id, {
        title: item.title,
        order: item.order ?? idx + 1,
        isPublished: item.visible !== false,
        category: selectedCategory
      });
      onRefreshParent();
      showSuccessNotice('부록 메타데이터가 저장되었습니다.');
    } catch (e) {
      console.error(e);
      alert('저장 실패');
    }
  };

  // Delete Material Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;

    try {
      await contentService.deleteMaterial(deleteConfirmTarget);
      if (adminTab === 'monthly') {
        setMonthlyMaterials((prev) => prev.filter((m) => m !== deleteConfirmTarget));
      } else {
        setAppendixMaterials((prev) => prev.filter((m) => m !== deleteConfirmTarget));
      }
      onRefreshParent();
      showSuccessNotice('교육자료가 안전하게 삭제되었습니다.');
    } catch (e) {
      console.error(e);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleteConfirmTarget(null);
    }
  };

  // Seed default materials to Firestore for initial testing
  const handleSeedDefaults = async () => {
    setIsSeeding(true);
    setErrorMessage(null);
    try {
      await contentService.seedMonthDefaultsToFirestore(selectedMonth);
      await loadMonthData(selectedMonth);
      onRefreshParent();
      showSuccessNotice(`${selectedMonth}월 기본 자료 2종이 Firestore에 즉시 등록되었습니다.`);
    } catch (e: any) {
      console.error('Seed defaults failed:', e);
      showErrorNotice(`샘플 자료 등록 실패: ${e?.message || '권한을 확인해주세요.'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const showSuccessNotice = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  const showErrorNotice = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // Authentication Required Screen
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#527765] mb-2" />
        <p className="text-sm font-semibold">관리자 인증 상태 확인 중...</p>
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl shadow-xl border border-slate-200">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-slate-100 text-slate-700 rounded-2xl mb-3">
            <Lock className="w-8 h-8 text-[#527765]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">관리자 인증 (Firebase Auth)</h2>
          <p className="text-xs text-slate-500 mt-1">
            교육 이미지 직접 업로드 및 Firestore 저장을 위한 관리자 전용 로그인입니다.
            <br />
            (일반 학교 사용자는 로그인 없이 바로 열람합니다.)
          </p>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
            {authError}
          </div>
        )}

        {currentUser && !isAdmin && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
            현재 계정({currentUser.email})은 관리자 권한이 등록되지 않았습니다.
            <br />
            관리자 승인 이메일(tabbysa@penz.kr)로 로그인해 주세요.
          </div>
        )}

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-2xs transition-colors mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google 계정으로 관리자 로그인</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">또는 이메일 로그인</span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              관리자 이메일
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#527765]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#527765]"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onBackToApp}
              className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm"
            >
              앱으로 돌아가기
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-[#527765] hover:bg-[#436353] text-white font-bold rounded-xl text-sm"
            >
              로그인
            </button>
          </div>
        </form>

        {currentUser && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs text-rose-600 hover:underline"
            >
              현재 계정 로그아웃
            </button>
          </div>
        )}
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToApp}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            사용자 화면으로
          </button>
          <div>
            <div className="font-bold text-slate-900 text-base">
              Firebase 교육콘텐츠 관리자 대시보드
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold">
              ● 관리자 인증됨: {currentUser.email}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            로그아웃
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMessage && (
        <div className="p-3 bg-emerald-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="p-3 bg-rose-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-white font-bold"
          >
            닫기
          </button>
        </div>
      )}

      {/* Global Setting: 퀴즈 사이트 링크 & QR 설정 */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                전 월 공통 위생교육 퀴즈 링크 및 QR 설정
              </h3>
              <p className="text-xs text-emerald-700">
                매월 상단 배너에 표시되는 퀴즈 사이트 URL과 스마트폰 스캔용 QR입니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveQuizUrl}
            disabled={isSavingQuiz}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            {isSavingQuiz ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>저장 중...</span>
              </>
            ) : quizSaveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                <span>저장됨</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>퀴즈설정 저장</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input
            type="url"
            value={quizUrlInput}
            onChange={(e) => setQuizUrlInput(e.target.value)}
            placeholder="https://foodhygiene.netlify.app/"
            className="flex-1 px-3.5 py-2 border border-emerald-300 rounded-xl text-xs sm:text-sm font-mono bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <a
            href={quizUrlInput}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl transition-colors shrink-0"
          >
            <span>확인</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="mt-3 pt-3 border-t border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900">
            <span className="font-bold">퀴즈 QR 코드:</span>
            <span>{quizQrInput ? '사용자 정의 QR 이미지 적용 중' : '퀴즈 링크 기반 자동 생성 QR 표시 중'}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-lg transition-colors flex items-center gap-1">
              <Upload className="w-3 h-3" />
              <span>QR 이미지 변경</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleQuizQrFileUpload}
                className="hidden"
              />
            </label>
            {quizQrInput && (
              <button
                type="button"
                onClick={() => setQuizQrInput('')}
                className="text-rose-600 hover:text-rose-700 font-bold"
              >
                기본 QR로 초기화
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Global Data Management: 데이터 백업 및 복원 */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#527765] text-white rounded-lg shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                기기 데이터 백업 및 복원 (JSON)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                현재 기기에 저장된 학교 정보, 조리종사자 명단, 교육실시기록을 파일로 내보내거나 다른 기기로 복원할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {/* 데이터 백업 (JSON 다운로드) */}
            <button
              type="button"
              onClick={handleBackupExport}
              disabled={isExportingBackup}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition-colors shadow-2xs disabled:opacity-50"
              title="현재 등록된 학교 설정 및 교육실시기록을 JSON 파일로 다운로드합니다."
            >
              {isExportingBackup ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#527765]" />
                  <span>백업 파일 생성 중...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#527765]" />
                  <span>데이터 백업 (JSON 다운로드)</span>
                </>
              )}
            </button>

            {/* 데이터 복원 (JSON 업로드) */}
            <label
              className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 bg-[#527765] hover:bg-[#436353] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
              title="이전에 다운로드한 JSON 백업 파일을 선택하여 데이터를 복원합니다."
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>데이터 복원 (JSON 업로드)</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleBackupFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Main Admin Tab Navigator */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setAdminTab('monthly')}
          className={`flex items-center gap-2 py-3 px-5 font-bold text-sm border-b-2 transition-all ${
            adminTab === 'monthly'
              ? 'border-[#527765] text-[#527765] bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>[월별 교육자료 관리]</span>
        </button>
        <button
          type="button"
          onClick={() => setAdminTab('appendix')}
          className={`flex items-center gap-2 py-3 px-5 font-bold text-sm border-b-2 transition-all ${
            adminTab === 'appendix'
              ? 'border-[#527765] text-[#527765] bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>[부록 관리]</span>
        </button>
      </div>

      {/* TAB 1: 월별 교육자료 관리 */}
      {adminTab === 'monthly' && (
        <div className="space-y-6">
          {/* Month Selector for Admin */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
              <span>편집할 교육 월 선택</span>
              <button
                type="button"
                onClick={handleSeedDefaults}
                disabled={isSeeding}
                className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 px-2.5 py-1 rounded-lg font-bold border border-emerald-200 transition-colors flex items-center gap-1.5"
                title="기본 샘플 2장을 Firestore에 초기 생성합니다"
              >
                {isSeeding && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>{isSeeding ? '등록 중...' : `+ ${selectedMonth}월 기본 샘플 Firestore 등록`}</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_MONTHS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMonth(m)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedMonth === m
                      ? 'bg-[#527765] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m}월 자료
                </button>
              ))}
            </div>
          </div>

          {/* Section: Monthly Motivation Video Setting */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-2 bg-slate-900 text-emerald-400 rounded-lg">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  🎬 {selectedMonth}월 동기유발 동영상 및 QR 설정
                </h4>
                <p className="text-xs text-slate-500">
                  Firebase Storage 영상 URL 또는 직접 제작하신 mp4/webm 링크를 입력하세요.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">영상 제목</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder={`${selectedMonth}월 식중독 예방 동기유발 영상`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">동영상 URL (mp4, webm)</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Monthly Materials List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{selectedMonth}월 교육 이미지 목록</span>
                <span className="text-xs font-normal text-slate-500">
                  (총 {monthlyMaterials.length}개)
                </span>
              </h3>
              <button
                type="button"
                onClick={handleAddNewMonthly}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#527765] hover:bg-[#436353] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>새 자료 추가</span>
              </button>
            </div>

            {isLoadingMonth ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>자료 불러오는 중...</span>
              </div>
            ) : monthlyMaterials.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                등록된 자료가 없습니다. 상단의 [+ 새 자료 추가] 또는 [+ 샘플 등록]을 눌러주세요.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {monthlyMaterials.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
                        자료 {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Publish Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...monthlyMaterials];
                            updated[idx].visible = updated[idx].visible !== false ? false : true;
                            setMonthlyMaterials(updated);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                            item.visible !== false
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {item.visible !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>공개 ON</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>비공개 OFF</span>
                            </>
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmTarget(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="자료 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Image Preview & Upload Button */}
                    <div className="relative aspect-square max-h-56 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-4 text-slate-400 text-xs">
                          이미지가 등록되지 않았습니다
                        </div>
                      )}

                      {/* Replace Image Button overlay */}
                      <label className="absolute bottom-2 right-2 cursor-pointer px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md transition-colors backdrop-blur-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingIndex === idx ? '업로드 중...' : '이미지 교체/업로드'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingIndex === idx}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleMonthlyImageUpload(idx, file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Title and Order Inputs */}
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          제목
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...monthlyMaterials];
                            updated[idx].title = e.target.value;
                            setMonthlyMaterials(updated);
                          }}
                          placeholder="교육자료 제목을 입력하세요"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            순서
                          </label>
                          <input
                            type="number"
                            value={item.order ?? idx + 1}
                            onChange={(e) => {
                              const updated = [...monthlyMaterials];
                              updated[idx].order = Number(e.target.value);
                              setMonthlyMaterials(updated);
                            }}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>

                        <div className="flex-1 flex justify-end pt-3">
                          <button
                            type="button"
                            onClick={() => handleSaveMonthlyMetadata(idx)}
                            className="px-3.5 py-1.5 bg-[#527765] hover:bg-[#436353] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>변경 저장</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: 부록 관리자 */}
      {adminTab === 'appendix' && (
        <div className="space-y-6">
          {/* Appendix Category Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-sm font-bold text-slate-700 mb-3">
              편집할 부록 카테고리 선택
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('foodborne')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedCategory === 'foodborne'
                    ? 'bg-[#527765] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                계절별 주요 식중독
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('ccpcp')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedCategory === 'ccpcp'
                    ? 'bg-[#527765] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                CCP 및 CP 기록지 작성요령
              </button>
            </div>
          </div>

          {/* Appendix Materials List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>
                  {selectedCategory === 'foodborne' ? '계절별 주요 식중독' : 'CCP 및 CP 기록지 작성요령'} 부록 낱장 목록
                </span>
                <span className="text-xs font-normal text-slate-500">
                  (총 {appendixMaterials.length}개)
                </span>
              </h3>
              <button
                type="button"
                onClick={handleAddNewAppendix}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#527765] hover:bg-[#436353] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>새 낱장 추가</span>
              </button>
            </div>

            {isLoadingAppendix ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>부록 불러오는 중...</span>
              </div>
            ) : appendixMaterials.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                등록된 부록 자료가 없습니다. [+ 새 낱장 추가]를 눌러 업로드해 주세요.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {appendixMaterials.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
                        낱장 {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...appendixMaterials];
                            updated[idx].visible = updated[idx].visible !== false ? false : true;
                            setAppendixMaterials(updated);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                            item.visible !== false
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {item.visible !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>공개 ON</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>비공개 OFF</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmTarget(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="자료 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="relative aspect-square max-h-56 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-4 text-slate-400 text-xs">
                          이미지 미등록
                        </div>
                      )}

                      <label className="absolute bottom-2 right-2 cursor-pointer px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md transition-colors backdrop-blur-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingIndex === idx ? '업로드 중...' : '이미지 교체/업로드'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingIndex === idx}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAppendixImageUpload(idx, file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          제목
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...appendixMaterials];
                            updated[idx].title = e.target.value;
                            setAppendixMaterials(updated);
                          }}
                          placeholder="부록 자료 제목"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            순서
                          </label>
                          <input
                            type="number"
                            value={item.order ?? idx + 1}
                            onChange={(e) => {
                              const updated = [...appendixMaterials];
                              updated[idx].order = Number(e.target.value);
                              setAppendixMaterials(updated);
                            }}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>

                        <div className="flex-1 flex justify-end pt-3">
                          <button
                            type="button"
                            onClick={() => handleSaveAppendixMetadata(idx)}
                            className="px-3.5 py-1.5 bg-[#527765] hover:bg-[#436353] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>변경 저장</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (App's own modal, never window.confirm) */}
      <ConfirmModal
        isOpen={!!deleteConfirmTarget}
        onClose={() => setDeleteConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        title="교육자료 삭제"
        message={
          deleteConfirmTarget ? (
            <span>
              <strong>{deleteConfirmTarget.title}</strong>
              <br />
              <br />
              해당 자료를 Firebase Storage 및 Firestore에서 삭제하시겠습니까?
              <br />
              삭제 후 사용자 화면에서도 즉시 사라집니다.
            </span>
          ) : (
            ''
          )
        }
        confirmText="삭제"
        danger
      />

      {/* Restore Confirmation Modal */}
      <ConfirmModal
        isOpen={!!pendingRestoreData}
        onClose={() => setPendingRestoreData(null)}
        onConfirm={handleConfirmRestore}
        title="데이터 복원 확인"
        message={
          pendingRestoreData ? (
            <div className="space-y-3 text-left">
              <p className="text-slate-700 font-medium">
                선택하신 백업 파일(<strong>{pendingRestoreData.fileName}</strong>)로 현재 데이터를 덮어쓰시겠습니까?
              </p>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 text-slate-600">
                <div className="font-bold text-slate-800 text-sm mb-1 pb-1 border-b border-slate-200">
                  복원 대상 요약
                </div>
                <div>• 학교명: <strong className="text-slate-800">{pendingRestoreData.summary.schoolName}</strong></div>
                <div>• 조리종사자 대상: <strong className="text-slate-800">{pendingRestoreData.summary.participantsCount}명</strong></div>
                <div>• 교육실시 기록: <strong className="text-emerald-700 font-bold">{pendingRestoreData.summary.recordsCount}건</strong></div>
              </div>
              <p className="text-rose-600 text-xs font-semibold">
                ⚠️ 복원 시 현재 기기에 저장된 기존 교육실시기록 및 학교 설정이 백업 파일의 내용으로 완전히 대체됩니다.
              </p>
            </div>
          ) : (
            ''
          )
        }
        confirmText={isRestoringBackup ? '복원 진행 중...' : '데이터 복원'}
        cancelText="취소"
        danger
      />

      {/* Restore Result Notification Modal */}
      <MessageModal
        isOpen={restoreNoticeModal.isOpen}
        onClose={() => setRestoreNoticeModal((prev) => ({ ...prev, isOpen: false }))}
        title={restoreNoticeModal.title}
        message={restoreNoticeModal.message}
        variant={restoreNoticeModal.variant}
      />
    </div>
  );
};
