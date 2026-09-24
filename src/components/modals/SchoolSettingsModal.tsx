import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { SchoolSettings } from '../../types';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SchoolSettings;
  onSave: (settings: SchoolSettings) => void | Promise<void>;
  isSaving?: boolean;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  isSaving = false
}) => {
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [participantsText, setParticipantsText] = useState(
    settings.participants.join('\n')
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSchoolName(settings.schoolName);
      setParticipantsText(settings.participants.join('\n'));
      setError(null);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    const trimmedSchool = schoolName.trim();
    if (!trimmedSchool) {
      setError('학교명을 입력해 주세요.');
      return;
    }

    const participants = participantsText
      .split(/\r?\n|,/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (participants.length === 0) {
      setError('교육이수대상자(조리종사자) 성명을 한 명 이상 입력해 주세요.');
      return;
    }

    onSave({
      schoolName: trimmedSchool,
      participants
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="학교 / 교육이수대상자 설정">
      <div className="space-y-4 py-1">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="schoolNameInput"
            className="block text-sm font-bold text-slate-700 mb-1.5"
          >
            학교명 <span className="text-rose-500">*</span>
          </label>
          <input
            id="schoolNameInput"
            type="text"
            value={schoolName}
            onChange={(e) => {
              setSchoolName(e.target.value);
              if (error) setError(null);
            }}
            placeholder=""
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#527765] focus:border-transparent text-sm transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="participantsInput"
              className="block text-sm font-bold text-slate-700"
            >
              교육이수대상자 명단 <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-400">
              {
                participantsText
                  .split(/\r?\n/)
                  .map((s) => s.trim())
                  .filter(Boolean).length
              }
              명 입력됨
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            성명을 한 줄에 한 명씩 입력하세요. (PDF 일지 서명부에 출력됩니다.)
          </p>
          <textarea
            id="participantsInput"
            rows={6}
            value={participantsText}
            onChange={(e) => {
              setParticipantsText(e.target.value);
              if (error) setError(null);
            }}
            placeholder={""}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#527765] focus:border-transparent text-sm leading-relaxed transition-all resize-y font-mono"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#527765] hover:bg-[#436353] text-white font-bold rounded-xl text-sm transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
