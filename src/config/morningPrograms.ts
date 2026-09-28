/**
 * Centralized Configuration for Morning Hygiene Programs
 * Defines the parameters for both 'morning' and 'morning-new'.
 */

export type MorningCourseId = 'morning' | 'morning-new';

export interface MorningProgramConfig {
  id: MorningCourseId;
  name: string; // Course short name (e.g. '모닝위생', '모닝위생_신규(일)')
  displayName: string; // Menu display label (e.g. '2. 모닝위생(일)', '3. 모닝위생_신규(일)')
  badge: string; // Subtitle / badge label
  assetPrefix: string; // Asset directory under /assets/ ('morning' | 'morning-new')
  dataSource: string; // Path to JSON data ('/data/morning.json' | '/data/morning-new.json')
  progressStorageKey: string; // Storage key for progress ('morningProgress' | 'morningNewProgress')
  recordsStorageKey: string; // Storage key for records ('morningRecords' | 'morningNewRecords')
  enabled: boolean; // Whether content and images are ready for active learning
}

export const MORNING_PROGRAMS: Record<MorningCourseId, MorningProgramConfig> = {
  morning: {
    id: 'morning',
    name: '모닝위생',
    displayName: '2. 모닝위생(일)',
    badge: '조리 전 3분 일일 교육',
    assetPrefix: 'morning',
    dataSource: '/data/morning.json',
    progressStorageKey: 'morningProgress',
    recordsStorageKey: 'morningRecords',
    enabled: true
  },
  'morning-new': {
    id: 'morning-new',
    name: '모닝위생_신규(일)',
    displayName: '3. 모닝위생_신규(일)',
    badge: '신규 맞춤 집중과정',
    assetPrefix: 'morning-new',
    dataSource: '/data/morning-new.json',
    progressStorageKey: 'morningNewProgress',
    recordsStorageKey: 'morningNewRecords',
    enabled: true
  }
};
