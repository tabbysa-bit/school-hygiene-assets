import { AppendixGroup, EducationMonth, MonthMaterialData } from '../types';
import { generateHygienePosterSvg } from './posterGenerator';

export const DEFAULT_MONTHLY_MATERIALS: Record<EducationMonth, MonthMaterialData> = {
  3: {
    month: 3,
    title: '3월 신학기 개인위생 및 올바른 손씻기',
    materials: [
      {
        id: 'm03_01',
        page: 1,
        title: '개인위생관리 및 올바른 손씻기 6단계',
        subtitle: '조리 전·후, 화장실 이용 후 흐르는 물에 30초 이상',
        fileName: 'Page01_개인위생관리.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '3월 위생교육 ①',
          themeColor: '#2E7D32',
          subColor: '#4CAF50',
          title: '개인위생관리 및 올바른 손씻기',
          subtitle: '신학기 식중독 예방의 첫걸음, 철저한 손위생 실천',
          points: [
            { step: '1', desc: '손바닥과 손바닥을 마주 대고 문지르기' },
            { step: '2', desc: '손등과 손바닥을 대고 깍지 끼고 문지르기' },
            { step: '3', desc: '손가락 사이를 깍지 끼고 꼼꼼히 씻기' },
            { step: '4', desc: '두 손을 모아 엄지손가락을 돌려주며 씻기' }
          ],
          haccpNotice: '위생모(머리카락 노출 금지), 위생복, 전용 위생화, 마스크 착용 필수!'
        })
      },
      {
        id: 'm03_02',
        page: 2,
        title: '건강진단 및 일일 건강상태 확인',
        subtitle: '조리종사자 발열, 설사, 화농성 질환 즉시 보고 및 작업 배제',
        fileName: 'Page02_건강진단.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '3월 위생교육 ②',
          themeColor: '#2E7D32',
          subColor: '#388E3C',
          title: '건강진단 및 일일 건강상태 확인',
          subtitle: '매일 조리 전 건강상태 체크리스트 작성 철저',
          points: [
            { step: '1', desc: '건강진단결과서(보건증) 연 1회(학교급식 연 2회) 주기적 갱신' },
            { step: '2', desc: '설사, 발열, 구토 등 소화기계 감염 증상 즉시 보고' },
            { step: '3', desc: '손이나 팔에 곪은 상처(화농성 질환) 발생 시 조리 작업 금지' },
            { step: '4', desc: '출근 직후 체온 측정 및 위생점검 기록부 서명' }
          ],
          haccpNotice: '감염병 환자 및 보균자는 완치될 때까지 급식 업무에 종사할 수 없습니다.'
        })
      }
    ]
  },
  4: {
    month: 4,
    title: '4월 식재료 검수 및 CCP 1 관리',
    materials: [
      {
        id: 'm04_01',
        page: 1,
        title: '식재료 검수 및 입고 관리 (CCP 1)',
        subtitle: '냉장식품 5℃ 이하, 냉동식품 -18℃ 이하, 신선도 확인',
        fileName: 'Page01_식재료검수.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '4월 위생교육 ①',
          themeColor: '#1565C0',
          subColor: '#42A5F5',
          title: '식재료 검수 및 입고관리 (CCP 1)',
          subtitle: '신선하고 안전한 식재료 선별과 한계기준 준수',
          points: [
            { step: '1', desc: '냉장 5℃ 이하(신선육 10℃ 이하), 냉동 -18℃ 이하 온도 측정' },
            { step: '2', desc: '배송차량 온도기록지 및 청결상태 확인' },
            { step: '3', desc: '포장 파손, 유통기한·소비기한, 이물 혼입 여부 육안 검사' },
            { step: '4', desc: '검수 즉시 전용 보관고로 신속 입고 (상온 방치 금지)' }
          ],
          haccpNotice: 'CCP 1 한계기준 이탈 시 즉시 반품 처리하고 검수기록지에 사유 기록!'
        })
      },
      {
        id: 'm04_02',
        page: 2,
        title: '원산지 표시 및 식재료 라벨링 관리',
        subtitle: '선입선출 원칙 준수 및 개봉일자·소비기한 명기',
        fileName: 'Page02_식재료라벨링.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '4월 위생교육 ②',
          themeColor: '#1565C0',
          subColor: '#1976D2',
          title: '원산지 및 식재료 표시 라벨링',
          subtitle: '선입선출 실천과 교차오염 방지 전용용기 관리',
          points: [
            { step: '1', desc: '개봉한 양념류·식재료는 밀폐용기에 담아 개봉일 라벨 부착' },
            { step: '2', desc: '먼저 입고된 식재료 우선 사용 (선입선출: First-In, First-Out)' },
            { step: '3', desc: '바닥에서 15cm 이상 띄워 랙(선반)에 위생적 보관' },
            { step: '4', desc: '육류·어류·채소류 전용 보관구역 분리 철저' }
          ],
          haccpNotice: '유통기한 또는 소비기한이 경과한 원료는 즉시 폐기 처리합니다.'
        })
      }
    ]
  },
  5: {
    month: 5,
    title: '5월 교차오염 방지 및 기구 세척·소독',
    materials: [
      {
        id: 'm05_01',
        page: 1,
        title: '교차오염 방지 및 도마·칼 4색 구분 사용',
        subtitle: '육류(적), 어류(청), 채소(녹), 완제품·조리(황) 구분',
        fileName: 'Page01_교차오염방지.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '5월 위생교육 ①',
          themeColor: '#C2410C',
          subColor: '#FB923C',
          title: '교차오염 방지 칼·도마 구분 사용',
          subtitle: '전처리 및 조리구역 분리와 식재료별 전용 조리기구',
          points: [
            { step: '1', desc: '도마·칼 색상별 구분: 육류(적), 어패류(청), 채소(녹), 조리완료(황)' },
            { step: '2', desc: '전처리 구역과 조리 구역 간 이동 시 앞치마·위생화 교체' },
            { step: '3', desc: '생식품 취급 후 반드시 손 세척 및 소독 후 가열식품 취급' },
            { step: '4', desc: '조리기구 사용 후 즉시 온수 세척 및 열탕/화학 소독' }
          ],
          haccpNotice: '칼·도마의 혼용 사용은 식중독 균을 전파하는 가장 위험한 경로입니다.'
        })
      },
      {
        id: 'm05_02',
        page: 2,
        title: '조리기구 화학소독 및 유효염소농도 관리',
        subtitle: '유효염소농도 100~200ppm 유지 및 시험지 확인',
        fileName: 'Page02_소독관리.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '5월 위생교육 ②',
          themeColor: '#C2410C',
          subColor: '#EA580C',
          title: '기구 세척·소독 및 잔류염소 관리',
          subtitle: '올바른 희석농도 측정과 충분한 헹굼 작업',
          points: [
            { step: '1', desc: '염소소독액 100~200ppm 조제 시 농도측정 페이퍼로 검증' },
            { step: '2', desc: '세척제 세정 → 음용수 헹굼 → 소독액 5분 침지 → 깨끗한 물 헹굼' },
            { step: '3', desc: '자외선 살균소독고 내 겹치지 않게 건조·보관' },
            { step: '4', desc: '행주·고무장갑은 끓는 물에 삶거나 매일 살균 소독' }
          ],
          haccpNotice: '소독액 제조 후 반드시 유효염소 시험지로 농도를 측정하고 기록합니다.'
        })
      }
    ]
  },
  6: {
    month: 6,
    title: '6월 가열조리공정 (CCP 2) 및 중심온도 관리',
    materials: [
      {
        id: 'm06_01',
        page: 1,
        title: '가열조리공정 및 중심온도 관리 (CCP 2)',
        subtitle: '일반식품 75℃ 이상, 어패류 85℃ 이상 1분간 가열',
        fileName: 'Page01_가열조리공정.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '6월 위생교육 ①',
          themeColor: '#B91C1C',
          subColor: '#EF4444',
          title: '가열조리공정 및 중심온도 (CCP 2)',
          subtitle: '병원성 미생물 사멸을 위한 철저한 온도 측정',
          points: [
            { step: '1', desc: '가열식품 중심온도 75℃ 이상(패류 및 어류는 85℃ 이상) 1분 유지' },
            { step: '2', desc: '탐침온도계는 알코올 소독 후 가장 두꺼운 중심부에 꽂아 측정' },
            { step: '3', desc: '국·찌개류, 볶음류, 튀김류 등 3군데 이상 고르게 측정' },
            { step: '4', desc: '한계기준 미달 시 즉시 추가 가열 후 재측정 기록' }
          ],
          haccpNotice: '조리 완료 즉시 CCP 2 기록지에 품명, 조리시간, 중심온도를 기록합니다.'
        })
      },
      {
        id: 'm06_02',
        page: 2,
        title: '비가열 조리 채소·과일 소독 관리 (CCP 3)',
        subtitle: '유효염소농도 100ppm 5분 침지 후 먹는물 3회 헹굼',
        fileName: 'Page02_채소과일소독.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '6월 위생교육 ②',
          themeColor: '#B91C1C',
          subColor: '#DC2626',
          title: '생채소·과일 소독 및 헹굼 (CCP 3)',
          subtitle: '여름철 비가열 식단에 대한 철저한 살균 세척',
          points: [
            { step: '1', desc: '전처리 세척 후 차아염소산나트륨 100ppm 소독수에 5분 침지' },
            { step: '2', desc: '소독 후 잔류염소 냄새가 남지 않도록 먹는물로 3회 이상 헹굼' },
            { step: '3', desc: '소독 완료된 식재료는 전용 청결 용기에 담아 냉장 보관' },
            { step: '4', desc: '조리 후 2시간 이내에 배식 완료' }
          ],
          haccpNotice: '소독 전 농도 검사 및 헹굼 후 잔류염소 잔존 여부를 철저히 확인합니다.'
        })
      }
    ]
  },
  7: {
    month: 7,
    title: '7월 혹서기 식중독 예방 및 보존식 관리',
    materials: [
      {
        id: 'm07_01',
        page: 1,
        title: '여름철 병원성 대장균 및 살모넬라 예방',
        subtitle: '고온다습기 세균 증식 억제와 조리장 온도 관리',
        fileName: 'Page01_혹서기식중독.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '7월 위생교육 ①',
          themeColor: '#D97706',
          subColor: '#F59E0B',
          title: '혹서기 세균성 식중독 예방 수칙',
          subtitle: '조리 후 지체 없는 배식과 보관온도 한계기준 엄수',
          points: [
            { step: '1', desc: '식재료 상온 방치 절대 금지 (냉장고 적정용량 70% 유지)' },
            { step: '2', desc: '조리 완료 후 2시간 이내 배식 완료 원칙' },
            { step: '3', desc: '조리장 내부 환기 가동 및 온도 25℃ 이하, 습도 관리' },
            { step: '4', desc: '계란 취급 시 파손란 배제 및 만진 후 즉시 손 씻기' }
          ],
          haccpNotice: '살모넬라는 계란 껍질과 가금류에서 쉽게 번식하므로 특별 주의를 요합니다.'
        })
      },
      {
        id: 'm07_02',
        page: 2,
        title: '배식 위생 및 보존식 채취 관리',
        subtitle: '온식 57℃ 이상, 냉식 5℃ 이하, 보존식 -18℃ 이하 144시간',
        fileName: 'Page02_보존식관리.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '7월 위생교육 ②',
          themeColor: '#D97706',
          subColor: '#B45309',
          title: '배식관리 및 보존식 채취·보관',
          subtitle: '사고 발생 시 원인 규명을 위한 법적 의무 사항',
          points: [
            { step: '1', desc: '배식 시 위생모, 마스크, 배식용 위생장갑 착용' },
            { step: '2', desc: '배식온도 유지: 온식 57℃ 이상, 냉식 5℃ 이하' },
            { step: '3', desc: '보존식은 매 식단 완제품 100g 이상씩 멸균용기에 채취' },
            { step: '4', desc: '전용 냉동고(-18℃ 이하)에 144시간(공휴일 제외 6일간) 보관' }
          ],
          haccpNotice: '보존식 채취용기는 멸균 소독된 상태여야 하며 담당자 서명 필수입니다.'
        })
      }
    ]
  },
  9: {
    month: 9,
    title: '9월 2학기 개학 대비 대청소 및 세척기 관리',
    materials: [
      {
        id: 'm09_01',
        page: 1,
        title: '2학기 급식실 일제 대청소 및 시설 소독',
        subtitle: '방학 중 휴지기 설비 점검 및 조리장 환경 소독',
        fileName: 'Page01_대청소소독.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '9월 위생교육 ①',
          themeColor: '#047857',
          subColor: '#10B981',
          title: '2학기 개학 대비 시설 대청소',
          subtitle: '쾌적하고 안전한 조리 환경 조성을 위한 총괄 정비',
          points: [
            { step: '1', desc: '후드, 배기덕트, 트렌치(배수로) 찌든 때 및 기름때 완전 제거' },
            { step: '2', desc: '조리대, 냉장고 내부 선반 알코올 분무 살균 소독' },
            { step: '3', desc: '방충망, 방서망 손상 여부 확인 및 해충 서식지 차단' },
            { step: '4', desc: '식기류, 수저류 열탕 소독 및 건조 점검' }
          ],
          haccpNotice: '배수로와 그리스트랩은 매일 청소하고 주 1회 이상 살균 소독합니다.'
        })
      },
      {
        id: 'm09_02',
        page: 2,
        title: '식기세척기 위생관리 및 최종 헹굼온도',
        subtitle: '세척수 60℃ 이상, 최종 헹굼수 82℃ 이상 유지 확인',
        fileName: 'Page02_식기세척기.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '9월 위생교육 ②',
          themeColor: '#047857',
          subColor: '#059669',
          title: '식기세척기 헹굼온도 및 세제 관리',
          subtitle: '열탕 소독 효과 확보와 잔류 세제 방지',
          points: [
            { step: '1', desc: '세척탱크 온도(60℃ 이상) 및 헹굼탱크 온도(82℃ 이상) 매회 확인' },
            { step: '2', desc: '노즐 막힘 여부 수시 점검 및 내부 스케일 제거' },
            { step: '3', desc: '식판 세척 후 잔류세제 검사(페놀프탈레인 용액 시험) 실시' },
            { step: '4', desc: '세척 후 전용 소독보관고에 완전 건조 보관' }
          ],
          haccpNotice: '헹굼온도가 82℃ 미만일 경우 즉시 세척기 수리 점검을 요청해야 합니다.'
        })
      }
    ]
  },
  10: {
    month: 10,
    title: '10월 식품 알레르기 관리 및 특별식 조리',
    materials: [
      {
        id: 'm10_01',
        page: 1,
        title: '식품 알레르기 유발물질 19종 관리',
        subtitle: '식단표 알레르기 번호 공지 및 대체식 조리 시 교차혼입 방지',
        fileName: 'Page01_알레르기관리.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '10월 위생교육 ①',
          themeColor: '#7C3AED',
          subColor: '#A78BFA',
          title: '식품 알레르기 안전관리 수칙',
          subtitle: '학생들의 생명을 지키는 철저한 식재료 표시 및 조리 분리',
          points: [
            { step: '1', desc: '법정 알레르기 유발물질 19종 확인 (난류, 우유, 땅콩, 새우 등)' },
            { step: '2', desc: '가공식품 원재료명 라벨의 알레르기 유발 표시 사전 검토' },
            { step: '3', desc: '알레르기 대체식은 별도 전용 조리기구 및 도마 분리 조리' },
            { step: '4', desc: '배식 시 알레르기 환아 확인 및 전용 식판 제공' }
          ],
          haccpNotice: '미량의 알레르겐 혼입으로도 아나필락시스 쇼크가 발생할 수 있습니다.'
        })
      },
      {
        id: 'm10_02',
        page: 2,
        title: '환절기 조리실 온습도 및 작업 안전',
        subtitle: '미끄럼 방지 전용화 착용, 근골격계 질환 예방 스트레칭',
        fileName: 'Page02_작업안전.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '10월 위생교육 ②',
          themeColor: '#7C3AED',
          subColor: '#8B5CF6',
          title: '조리실 산업안전 및 위생 환경',
          subtitle: '안전한 급식실 조성을 위한 작업장 안전수칙',
          points: [
            { step: '1', desc: '바닥 물기 즉시 제거 및 미끄럼 방지 장화 필착' },
            { step: '2', desc: '중량물 운반 시 무릎을 굽히고 2인 1조 운반 원칙' },
            { step: '3', desc: '튀김·가열 조리 시 화상 방지 내열 장갑 및 보안경 착용' },
            { step: '4', desc: '작업 시작 전·후 조리원 5분 스트레칭 생활화' }
          ],
          haccpNotice: '위생과 안전은 하나입니다. 작업 전 안전점검을 생활화합시다.'
        })
      }
    ]
  },
  11: {
    month: 11,
    title: '11월 전처리 위생관리 및 폐기물 분리배출',
    materials: [
      {
        id: 'm11_01',
        page: 1,
        title: '김장철 농산물 전처리 및 이물 제거',
        subtitle: '흙·벌레·이물질 다단계 세척 및 3단계 침지 세척',
        fileName: 'Page01_전처리위생.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '11월 위생교육 ①',
          themeColor: '#0D9488',
          subColor: '#14B8A6',
          title: '식재료 전처리 및 이물 제거',
          subtitle: '다량의 채소·양념류 취급 시 위생적인 세척 수칙',
          points: [
            { step: '1', desc: '뿌리채소의 흙과 외피는 전처리실에서 완벽히 1차 제거' },
            { step: '2', desc: '흐르는 물에서 3회 이상 침지 및 세척하여 미세 이물 제거' },
            { step: '3', desc: '마늘·생강·고춧가루 등 부원료의 금속·곰팡이 검사' },
            { step: '4', desc: '전처리 완료된 식재료는 조리실로 구역 분리 이동' }
          ],
          haccpNotice: '전처리 구역의 오염물질이 조리 구역으로 유입되지 않도록 동선을 통제합니다.'
        })
      },
      {
        id: 'm11_02',
        page: 2,
        title: '조리장 폐기물 처리 및 잔반 분리배출',
        subtitle: '폐기물 용기 뚜껑 관리 및 작업 후 즉시 반출 세척',
        fileName: 'Page02_폐기물처리.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '11월 위생교육 ②',
          themeColor: '#0D9488',
          subColor: '#0F766E',
          title: '조리장 폐기물 및 잔반 관리',
          subtitle: '해충 및 악취 발생 억제와 청결한 급식 환경 유지',
          points: [
            { step: '1', desc: '음식물 쓰레기통은 페달식 뚜껑 용기 사용 및 2/3 이하 수거' },
            { step: '2', desc: '작업 종료 즉시 외부 잔반 수거장으로 반출' },
            { step: '3', desc: '쓰레기통 사용 후 매일 세척 및 락스 소독 건조' },
            { step: '4', desc: '일반 쓰레기, 재활용품, 폐식용유 전용 보관함 분리 배출' }
          ],
          haccpNotice: '조리실 내 잔반 방치는 쥐·바퀴벌레 등 유해 해충 번식의 주원인입니다.'
        })
      }
    ]
  },
  12: {
    month: 12,
    title: '12월 겨울철 노로바이러스 식중독 집중 예방',
    materials: [
      {
        id: 'm12_01',
        page: 1,
        title: '겨울철 노로바이러스 식중독 집중 예방',
        subtitle: '저온에서도 생존하는 바이러스 차단, 패류 85℃ 1분 가열',
        fileName: 'Page01_노로바이러스.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '12월 위생교육 ①',
          themeColor: '#0284C7',
          subColor: '#38BDF8',
          title: '겨울철 노로바이러스 집중 예방',
          subtitle: '전염성이 매우 강한 겨울철 불청객 완전 차단',
          points: [
            { step: '1', desc: '굴, 조개 등 패류는 중심부 85℃ 이상에서 1분 이상 완전히 익히기' },
            { step: '2', desc: '구토·설사 증상자 발견 시 즉시 업무 배제 및 최소 3일간 격리' },
            { step: '3', desc: '환자 구토물 소독 시 1,000~5,000ppm 고농도 염소소독액 사용' },
            { step: '4', desc: '조리종사자 외 급식실 출입 엄격 통제' }
          ],
          haccpNotice: '노로바이러스는 알코올 소독제에 강하므로 비누 손씻기와 염소소독이 필수입니다.'
        })
      },
      {
        id: 'm12_02',
        page: 2,
        title: '동절기 급수시설 동파 방지 및 음용수 관리',
        subtitle: '저수조 청소 및 정수기 필터 교체, 먹는물 수질 기준 확인',
        fileName: 'Page02_음용수관리.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '12월 위생교육 ②',
          themeColor: '#0284C7',
          subColor: '#0369A1',
          title: '동절기 급수시설 및 음용수 위생',
          subtitle: '안전한 조리용수 및 학생 음용수 수질 관리',
          points: [
            { step: '1', desc: '지하수 사용 학교의 경우 염소자동투입기 잔류염소 수시 점검' },
            { step: '2', desc: '정수기 코크 및 물받이 매일 세척·소독, 주기적 필터 교체' },
            { step: '3', desc: '한파 대비 조리실 수도 배관 보온재 점검 및 퇴수 조치' },
            { step: '4', desc: '끓인 보리차 제공 시 당일 조리, 당일 소비 원칙' }
          ],
          haccpNotice: '먹는물 수질기준 검사 성적서를 게시하고 수질 이상 시 즉시 가열 급수합니다.'
        })
      }
    ]
  },
  2: {
    month: 2,
    title: '2월 학년도 말 급식시설 총괄 정비 및 신학기 준비',
    materials: [
      {
        id: 'm02_01',
        page: 1,
        title: '급식기구 총괄 점검 및 정기 보수',
        subtitle: '오븐, 식기세척기, 냉장냉동고 성능 점검 및 노후 부품 교체',
        fileName: 'Page01_기구총괄정비.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '2월 위생교육 ①',
          themeColor: '#475569',
          subColor: '#64748B',
          title: '급식시설·기구 총괄 정비 및 보수',
          subtitle: '새 학년도를 맞이하기 위한 기계설비 총체적 점검',
          points: [
            { step: '1', desc: '대형 오븐기 및 가스레인지 버너 청소 및 가스 누출 점검' },
            { step: '2', desc: '냉장·냉동고 콤프레셔 먼지 청소 및 적정온도 유지 성능 검증' },
            { step: '3', desc: '칼, 가위, 조리용 주걱 등 손상된 기구 전면 폐기 및 교체' },
            { step: '4', desc: '급식실 바닥 타일 및 배수로 파손 부위 보수 공사' }
          ],
          haccpNotice: '정기 점검을 통해 안전사고를 예방하고 위생 설비의 신뢰성을 확보합니다.'
        })
      },
      {
        id: 'm02_02',
        page: 2,
        title: '신학기 대비 HACCP 관리기준 재점검',
        subtitle: '위생수칙 전면 복습 및 조리원 안전보건교육 이수',
        fileName: 'Page02_HACCP재점검.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '2월 위생교육 ②',
          themeColor: '#475569',
          subColor: '#334155',
          title: '신학기 대비 HACCP 위생수칙 복습',
          subtitle: '완벽한 급식 위생을 향한 조리종사자 마인드 제고',
          points: [
            { step: '1', desc: '학교급식 위생·안전관리 지침서 개정사항 숙지' },
            { step: '2', desc: 'CCP 1~CCP 3 기록지 및 점검표 서식 정비' },
            { step: '3', desc: '조리종사자 정기 안전보건교육 및 위생교육 이수' },
            { step: '4', desc: '신학기 급식 개시 전 모의 점검(시운전) 실시' }
          ],
          haccpNotice: '위생은 꼼꼼하게, 급식은 당당하게! 신학기에도 안전한 급식을 만듭니다.'
        })
      }
    ]
  }
};

export const APPENDIX_DATA: Record<string, AppendixGroup> = {
  foodborne: {
    key: 'foodborne',
    title: '계절별 주요 식중독',
    description: '계절별로 호발하는 식중독 균의 특징과 예방 관리 요령',
    materials: [
      {
        id: 'app_fb_01',
        page: 1,
        title: '봄철 주요 식중독 (클로스트리디움 퍼프린젠스)',
        subtitle: '대량 조리 후 실온 방치 시 증식, 재가열 시 75℃ 이상 가열 필수',
        fileName: 'Page01_봄철_주요_식중독.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '부록 1-1',
          themeColor: '#059669',
          subColor: '#34D399',
          title: '봄철 주요 식중독: 퍼프린젠스',
          subtitle: '대량 가열 조리 음식의 급속 냉각 및 재가열 수칙',
          points: [
            { step: '원인', desc: '국, 불고기, 카레 등 대량 조리 식품을 상온 방치할 때 아포 증식' },
            { step: '증상', desc: '섭취 후 8~12시간 내 심한 복통 및 수양성 설사' },
            { step: '예방', desc: '조리 후 2시간 이내 섭취, 남은 음식은 얕은 용기에 나누어 급속 냉각' },
            { step: '수칙', desc: '보관된 음식 재섭취 시 중심부 75℃ 이상 끓여서 제공' }
          ],
          haccpNotice: '퍼프린젠스 포자는 열에 매우 강하므로 조리 후 서냉(천천히 식힘)을 방지해야 합니다.'
        })
      },
      {
        id: 'app_fb_02',
        page: 2,
        title: '여름철 주요 식중독 (병원성대장균·살모넬라)',
        subtitle: '오염된 채소류 및 육류·가금류·계란 취급 시 철저한 세척·소독',
        fileName: 'Page02_여름철_주요_식중독.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '부록 1-2',
          themeColor: '#E11D48',
          subColor: '#FB7185',
          title: '여름철 식중독: 병원성대장균·살모넬라',
          subtitle: '고온다습기 식중독 발생률 1위 세균 집중 차단',
          points: [
            { step: '원인', desc: '살모넬라(계란·닭고기), 병원성 대장균(오염된 생채소·지하수)' },
            { step: '증상', desc: '고열, 심한 복통, 구토, 혈변성 설사 (잠복기 6~72시간)' },
            { step: '예방', desc: '계란 취급 후 즉시 손 씻기, 가금류 중심온도 75℃ 1분 가열' },
            { step: '수칙', desc: '생채소 소독(유효염소 100ppm 5분) 및 3회 헹굼 철저' }
          ],
          haccpNotice: '살모넬라는 교차오염이 주원인이므로 칼·도마 분리와 손씻기를 철저히 지킵니다.'
        })
      },
      {
        id: 'app_fb_03',
        page: 3,
        title: '가을철 주요 식중독 (살모넬라 및 장염비브리오)',
        subtitle: '야외활동 증가 및 해수온도 상승에 따른 어패류 85℃ 이상 가열',
        fileName: 'Page03_가을철_주요_식중독.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '부록 1-3',
          themeColor: '#D97706',
          subColor: '#FBBF24',
          title: '가을철 식중독: 장염비브리오·세레우스',
          subtitle: '해산물 취급 주의 및 밥·면류 곡류 보관 관리',
          points: [
            { step: '원인', desc: '장염비브리오(오염된 어패류, 횟감), 바실러스 세레우스(김밥, 볶음밥)' },
            { step: '증상', desc: '복통, 설사, 발열, 구토 등 급성 위장염 증상' },
            { step: '예방', desc: '어패류는 수돗물(음용수)로 깨끗이 세척 후 85℃ 1분 이상 가열' },
            { step: '수칙', desc: '밥과 면류는 상온에 오래 방치하지 말고 조리 즉시 배식' }
          ],
          haccpNotice: '비브리오균은 염분을 좋아하므로 민물(수돗물) 세척만으로도 균수가 급감합니다.'
        })
      },
      {
        id: 'app_fb_04',
        page: 4,
        title: '겨울철 주요 식중독 (노로바이러스)',
        subtitle: '영하 20도에서도 생존, 굴 등 패류 익혀먹기 및 85℃ 1분 가열',
        fileName: 'Page04_겨울철_주요_식중독.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '부록 1-4',
          themeColor: '#0284C7',
          subColor: '#38BDF8',
          title: '겨울철 식중독: 노로바이러스',
          subtitle: '감염력 최상! 집단 발병 예방을 위한 특별 수칙',
          points: [
            { step: '원인', desc: '오염된 지하수, 익히지 않은 패류(굴·조개), 감염자의 비말/접촉' },
            { step: '증상', desc: '메스꺼움, 구토, 설사, 오한 (소량의 바이러스로도 집단 감염)' },
            { step: '예방', desc: '흐르는 물에 비누로 30초 이상 손 씻기, 굴 등 패류 85℃ 1분 가열' },
            { step: '수칙', desc: '유증상 조리원은 증상 소실 후 최소 48~72시간 조리 배제' }
          ],
          haccpNotice: '노로바이러스 환자 구토물 소독 시 반드시 보건용 마스크와 장갑을 착용하세요.'
        })
      }
    ]
  },
  ccpcp: {
    key: 'ccpcp',
    title: 'CCP 및 CP 기록지 작성요령',
    description: 'HACCP 중요관리점(CCP) 및 일반위생관리(CP) 서식 기록 지침',
    materials: [
      {
        id: 'app_ccp_01',
        page: 1,
        title: 'CCP 1 검수 기록지 작성요령 및 한계기준',
        subtitle: '냉장 5℃ 이하(신선육 10℃), 냉동 -18℃ 이하 온도 측정 및 서명',
        fileName: 'Page01_CCP1_검수기록지.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '부록 2-1',
          themeColor: '#1E40AF',
          subColor: '#3B82F6',
          title: 'CCP 1 검수 기록지 작성요령',
          subtitle: '신선하고 안전한 식재료 검수와 기록의 정확성',
          points: [
            { step: '온도', desc: '식재료 품온을 탐침온도계로 정확히 측정하여 소수점/정수 기록' },
            { step: '판정', desc: '한계기준 충족 여부 확인 후 적합(O) / 부적합(X) 표시' },
            { step: '조치', desc: '한계기준 이탈 시 반품/교환 사유 및 개선조치 내용 상세 기록' },
            { step: '서명', desc: '검수자(영양사/조리사) 및 납품기사 검수 즉시 확인 서명' }
          ],
          haccpNotice: '기록지는 검수 당일 실시간 작성이 원칙이며 소급 작성은 엄격히 금지됩니다.'
        })
      },
      {
        id: 'app_ccp_02',
        page: 2,
        title: 'CCP 2 가열조리공정 기록지 작성요령',
        subtitle: '조리 시작 및 완료시간, 3개소 중심온도 측정(75℃/85℃ 이상)',
        fileName: 'Page02_CCP2_가열조리기록지.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '부록 2-2',
          themeColor: '#B91C1C',
          subColor: '#F87171',
          title: 'CCP 2 가열조리 기록지 작성요령',
          subtitle: '가열 조리 시 중심온도 측정 지점 및 한계기준',
          points: [
            { step: '대상', desc: '국, 찌개, 볶음, 전, 튀김, 조림 등 모든 가열 조리 메뉴' },
            { step: '측정', desc: '솥/팬의 가장자리와 중심부 등 최소 3개 지점의 중심온도 측정' },
            { step: '기준', desc: '일반 75℃ 이상 1분, 어패류 85℃ 이상 1분 가열 유지' },
            { step: '미달', desc: '온도 미달 시 추가 가열 시간과 재측정 온도를 비고란에 기록' }
          ],
          haccpNotice: '탐침온도계는 매 측정 전 알코올 솜으로 철저히 소독하여 사용합니다.'
        })
      },
      {
        id: 'app_ccp_03',
        page: 3,
        title: 'CCP 3 생채소·과일 소독 기록지 작성요령',
        subtitle: '소독액 제조 농도(100ppm), 침지시간(5분), 헹굼 회수 기록',
        fileName: 'Page03_CCP3_채소소독기록지.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '부록 2-3',
          themeColor: '#15803D',
          subColor: '#4ADE80',
          title: 'CCP 3 생채소 소독 기록지 작성요령',
          subtitle: '비가열 섭취 채소·과일의 미생물 사멸과 안전 확보',
          points: [
            { step: '품명', desc: '당일 식단에 제공되는 생채소 및 과일 품목명 기재' },
            { step: '농도', desc: '염소소독액 희석 후 유효염소 시험지로 100ppm 적합 여부 판정' },
            { step: '시간', desc: '소독액 침지 시작 시간 및 완료 시간(최소 5분 침지) 기록' },
            { step: '헹굼', desc: '먹는물로 3회 이상 헹군 사실 확인 및 잔류염소 유무 체크' }
          ],
          haccpNotice: '수온이 25℃ 이상일 경우 소독 효율이 떨어지므로 냉수를 사용합니다.'
        })
      },
      {
        id: 'app_ccp_04',
        page: 4,
        title: 'CP 기록지 작성요령 (온도 및 위생관리)',
        subtitle: '냉장고(0~5℃), 냉동고(-18℃ 이하) 오전·오후 2회 측정 및 위생점검',
        fileName: 'Page04_CP기록지.png',
        visible: true,
        imageUrl: generateHygienePosterSvg({
          tag: '부록 2-4',
          themeColor: '#4B5563',
          subColor: '#9CA3AF',
          title: 'CP 관리 기록지 작성요령',
          subtitle: '냉장·냉동고 온도관리(CP 1) 및 교차오염 관리(CP 2)',
          points: [
            { step: 'CP 1', desc: '냉장고(5℃ 이하), 냉동고(-18℃ 이하) 오전 09시, 오후 14시 기록' },
            { step: 'CP 2', desc: '도마·칼 구분 사용, 조리원 위생복 교체 및 손소독 여부 점검' },
            { step: '보관', desc: '보존식 채취 시간, 일자, 채취자 서명 및 보존식 냉동고 온도 점검' },
            { step: '이상', desc: '온도 이상 발생 시 A/S 요청 및 식재료 긴급 이동 조치 명기' }
          ],
          haccpNotice: '일반위생관리기준(CP)의 철저한 준수가 HACCP의 견고한 밑바탕이 됩니다.'
        })
      }
    ]
  }
};
