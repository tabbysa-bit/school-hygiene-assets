/**
 * 월별 급식안심 동기유발 동영상 데이터 (YouTube 일부공개 URL 관리)
 * 
 * 1월과 8월은 방학으로 급식이 없어 제외됩니다.
 * 사용자가 제공하지 않은 URL은 빈 문자열("")로 유지되며,
 * URL이 입력되면 자동으로 영상 링크 및 영상 QR 코드가 활성화됩니다.
 */

export interface MealSafetyVideo {
  title: string;
  youtubeUrl: string;
}

export const MEAL_SAFETY_VIDEOS: Record<number, MealSafetyVideo> = {
  3: {
    title: '3월 신학기 개인위생 및 올바른 손씻기',
    youtubeUrl: 'https://youtu.be/H1xnT94bCB4'
  },
  4: {
    title: '4월 학교급식 HACCP 시스템',
    youtubeUrl: 'https://youtu.be/TjoPXEtqeKc'
  },
  5: {
    title: '5월 식재료 검수 및 보관 준수사항',
    youtubeUrl: 'https://youtu.be/6mV9-6Z5vyg'
  },
  6: {
    title: '6월 교차오염 예방 및 구분 사용',
    youtubeUrl: 'https://youtu.be/FjP99yKCT5I'
  },
  7: {
    title: '7월 급식기구 위생 관리',
    youtubeUrl: 'https://youtu.be/HD3f890I0q8'
  },
  9: {
    title: '9월 이물질 관리 및 신고절차',
    youtubeUrl: 'https://youtu.be/kjlDDQKIB08'
  },
  10: {
    title: '10월 안전한 행동 및 전처리 준수사항',
    youtubeUrl: 'https://youtu.be/CaLhzn6cjUw'
  },
  11: {
    title: '11월 소독과 가열',
    youtubeUrl: 'https://youtu.be/m7pOms7ZmAg'
  },
  12: {
    title: '12월 급식 및 보존식, 배식 관리',
    youtubeUrl: 'https://youtu.be/h3ddJCvTGM0'
  },
  2: {
    title: '2월 환경 위생 관리',
    youtubeUrl: 'https://youtu.be/kVpRd8KSkNc'
  }
};

export function getMealSafetyVideo(month: number): MealSafetyVideo {
  return (
    MEAL_SAFETY_VIDEOS[month] || {
      title: `${month}월 식중독 예방 동기유발 영상`,
      youtubeUrl: ''
    }
  );
}
