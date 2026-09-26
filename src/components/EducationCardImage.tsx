import React, { useState, useEffect } from 'react';
import { AlertCircle, RotateCw, Clock, Loader2 } from 'lucide-react';

interface EducationCardImageProps {
  src?: string;
  title: string;
  subtitle?: string;
  category?: string;
  points?: string[];
  themeColor?: string;
  alt?: string;
  className?: string;
}

export const EducationCardImage: React.FC<EducationCardImageProps> = ({
  src,
  title,
  subtitle,
  category = '위생교육',
  alt,
  className = ''
}) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Reset loading and error state whenever the image source changes
  useEffect(() => {
    setLoadFailed(false);
    if (src && !src.startsWith('data:')) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [src]);

  // Handle retry when image loading failed
  const handleRetry = () => {
    setLoadFailed(false);
    setIsLoading(true);
    setRetryKey((prev) => prev + 1);
  };

  // Case 1: No image provided yet (e.g. for '급식안심' and '기존 모닝위생' until ready)
  // Requirement 10: Display "교육자료를 준비 중입니다." without triggering 404 network requests
  if (!src) {
    return (
      <div
        className={`w-full aspect-square max-w-[620px] mx-auto bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center p-8 text-center shadow-xs ${className}`}
        style={{ aspectRatio: '1 / 1' }}
      >
        <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100">
          <Clock className="w-7 h-7" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
          교육자료를 준비 중입니다.
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed mb-3">
          {title ? `[${title}] ` : ''}자료가 준비되는 대로 자동 업데이트됩니다.
        </p>
        <span className="text-[11px] px-3 py-1 bg-slate-200/70 text-slate-600 rounded-full font-semibold">
          자료 준비 중
        </span>
      </div>
    );
  }

  // Case 2: Inline SVG data URI
  if (src.startsWith('data:image/svg+xml')) {
    return (
      <div
        className={`w-full aspect-square max-w-[620px] mx-auto overflow-hidden rounded-2xl bg-white shadow-xs ${className}`}
        style={{ aspectRatio: '1 / 1' }}
      >
        <img
          src={src}
          alt={alt || title}
          className="w-full h-full object-contain rounded-2xl"
          loading="lazy"
        />
      </div>
    );
  }

  // Case 3: Image loading failed
  // Requirement 8: Show in-app retry UI ("교육자료 이미지를 불러오지 못했습니다.", [다시 시도]), no alert()
  if (loadFailed) {
    return (
      <div
        className={`w-full aspect-square max-w-[620px] mx-auto bg-rose-50/60 rounded-2xl border border-rose-200 flex flex-col items-center justify-center p-8 text-center shadow-xs ${className}`}
        style={{ aspectRatio: '1 / 1' }}
      >
        <div className="w-14 h-14 bg-rose-100/80 text-rose-600 rounded-2xl flex items-center justify-center mb-4 border border-rose-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-slate-800 mb-1">
          교육자료 이미지를 불러오지 못했습니다.
        </h4>
        <p className="text-xs text-slate-500 mb-4 max-w-xs leading-relaxed">
          네트워크 연결 상태를 확인한 후 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>다시 시도</span>
        </button>
      </div>
    );
  }

  // Case 4: Actual WebP Image (e.g. 1254x1254 from Cloudflare Worker)
  // Requirement 6: Maintain square ratio, object-fit: contain, no clipping
  const imageSrcWithRetry = retryKey > 0 ? `${src}${src.includes('?') ? '&' : '?'}retry=${retryKey}` : src;

  return (
    <div
      className={`relative w-full aspect-square max-w-[620px] mx-auto overflow-hidden rounded-2xl bg-slate-50/50 border border-slate-200/80 shadow-xs flex items-center justify-center ${className}`}
      style={{ aspectRatio: '1 / 1' }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10 transition-opacity">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mb-2" />
          <span className="text-xs text-slate-500 font-medium">이미지 불러오는 중...</span>
        </div>
      )}
      <img
        key={`${src}_${retryKey}`}
        src={imageSrcWithRetry}
        alt={alt || title}
        loading="lazy"
        decoding="async"
        onLoad={() => {
          setIsLoading(false);
          setLoadFailed(false);
        }}
        onError={() => {
          setIsLoading(false);
          setLoadFailed(true);
        }}
        className={`w-full h-full object-contain rounded-2xl transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ aspectRatio: '1 / 1' }}
      />
    </div>
  );
};
