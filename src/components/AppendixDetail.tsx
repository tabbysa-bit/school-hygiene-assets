import React, { useState } from 'react';
import { AppendixGroup, EducationMonth, MaterialItem } from '../types';
import { ArrowLeft, Plus, Loader2, ZoomIn } from 'lucide-react';
import { Modal } from './modals/Modal';

interface AppendixDetailProps {
  group: AppendixGroup | null;
  isLoading: boolean;
  currentMonth: EducationMonth;
  onBack: () => void;
  onAddRecord: (item: MaterialItem) => void;
}

export const AppendixDetail: React.FC<AppendixDetailProps> = ({
  group,
  isLoading,
  currentMonth,
  onBack,
  onAddRecord
}) => {
  const [zoomItem, setZoomItem] = useState<MaterialItem | null>(null);

  if (isLoading || !group) {
    return (
      <div className="py-12 bg-white rounded-2xl text-center border border-slate-200">
        <Loader2 className="w-8 h-8 text-[#527765] animate-spin mx-auto mb-3" />
        <p className="text-slate-500 font-semibold text-sm">
          부록 자료를 불러오는 중입니다...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#607d8b] hover:text-[#37474f] px-2.5 py-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          부록 목록으로 돌아가기
        </button>
      </div>

      {/* Group Title and Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
          {group.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {group.description}
        </p>
      </div>

      {/* 4 Items (1 item per educational record) */}
      <div className="space-y-6">
        {group.materials.map((item, idx) => (
          <article
            key={item.id || idx}
            className="bg-white rounded-2xl overflow-hidden shadow-[0_3px_14px_rgba(0,0,0,0.07)] border border-slate-100/80 group"
          >
            {/* Image */}
            <div
              className="relative bg-slate-50 cursor-pointer overflow-hidden"
              onClick={() => setZoomItem(item)}
              title="클릭하여 원본 크기로 보기"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-contain max-h-[700px] transition-transform duration-300 group-hover:scale-[1.008]"
              />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-2 rounded-xl backdrop-blur-xs flex items-center gap-1 text-xs font-semibold">
                <ZoomIn className="w-4 h-4" />
                크게보기
              </div>
            </div>

            {/* Title */}
            <div className="py-3 px-4 text-center border-t border-slate-100 bg-white">
              <h4 className="text-base sm:text-lg font-bold text-slate-800">
                {item.title}
              </h4>
              {item.subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
              )}
            </div>

            {/* Individual Record Button */}
            <div className="p-4 pt-1 border-t border-slate-50 bg-slate-50/50">
              <button
                type="button"
                onClick={() => onAddRecord(item)}
                className="w-full py-3.5 px-4 bg-[#e8f3ed] hover:bg-[#dcece3] text-[#355c49] font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99] shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ {currentMonth}월 교육기록에 추가</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Full-view Zoom Modal */}
      {zoomItem && (
        <Modal
          isOpen={Boolean(zoomItem)}
          onClose={() => setZoomItem(null)}
          title={zoomItem.title}
          maxWidth="max-w-4xl"
        >
          <div className="p-2 flex flex-col items-center">
            <img
              src={zoomItem.imageUrl}
              alt={zoomItem.title}
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-xs"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
