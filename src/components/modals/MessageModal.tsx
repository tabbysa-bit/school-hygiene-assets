import React from 'react';
import { Modal } from './Modal';
import { CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'error';
}

export const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info'
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-rose-600 mb-2" />;
      case 'info':
      default:
        return <Info className="w-8 h-8 text-sky-600 mb-2" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center py-2">
        {getIcon()}
        <div className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-line w-full">
          {message}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-[#527765] hover:bg-[#436353] text-white font-bold rounded-xl shadow-xs transition-colors"
        >
          확인
        </button>
      </div>
    </Modal>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  danger = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="py-2">
        <div className="text-slate-700 text-sm leading-relaxed mb-6 whitespace-pre-line">
          {message}
        </div>
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 text-white font-bold rounded-xl text-sm transition-colors ${
              danger
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#527765] hover:bg-[#436353]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
