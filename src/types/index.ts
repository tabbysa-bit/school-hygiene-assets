export type EducationMonth = 3 | 4 | 5 | 6 | 7 | 9 | 10 | 11 | 12 | 2;

export const AVAILABLE_MONTHS: EducationMonth[] = [3, 4, 5, 6, 7, 9, 10, 11, 12, 2];

export type MainCategory = 'meal-safety' | 'morning' | 'morning-new';

export interface MaterialItem {
  id: string;
  page: number;
  title: string;
  subtitle?: string;
  fileName?: string;
  imageUrl: string;
  imagePath?: string;
  category?: string;
  summaryPoints?: string[];
  visible?: boolean;
  order?: number;
}

export interface MorningMaterialItem {
  id: string;
  day: number; // 1 ~ 190
  dayCode: string; // 'Day001' ~ 'Day190'
  title: string;
  subtitle?: string;
  category?: string;
  image?: string;
  imagePath?: string;
  imageUrl?: string;
  points?: string[];
  haccpNotice?: string;
  themeColor?: string;
}

export interface MonthMaterialData {
  month: EducationMonth;
  title: string;
  materials: MaterialItem[];
  videoUrl?: string;
  videoTitle?: string;
  videoQrUrl?: string;
}

export interface AppendixGroup {
  key: 'foodborne' | 'ccpcp' | string;
  title: string;
  description: string;
  materials: MaterialItem[];
}

export interface AppSettings {
  quizUrl: string;
  quizQrUrl?: string;
}

export interface EducationRecord {
  id: number;
  date: string; // YYYY-MM-DD
  month: number;
  title: string;
  type: 'basic' | 'appendix';
  appendixKey?: string;
  page?: number;
  imageUrl?: string;
  imageUrls?: string[];
}

export interface SchoolSettings {
  schoolName: string;
  participants: string[];
}

export interface PrintCard {
  url: string;
  title: string;
}

export interface BackupData {
  version: number;
  appName?: string;
  exportedAt: string;
  records: EducationRecord[];
  schoolSettings: SchoolSettings;
  quizSettings?: {
    quizUrl: string;
    quizQrUrl?: string;
  };
  morningProgress?: number;
  morningNewProgress?: number;
  morningNewData?: MorningNewProgressData;
}

export interface MorningNewRecord {
  day: number;
  date: string; // YYYY-MM-DD
  title: string;
  image?: string;
  formattedDate?: string;
}

export interface MorningNewProgressData {
  progress: number;
  records: MorningNewRecord[];
}
