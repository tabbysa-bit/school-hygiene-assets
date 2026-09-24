export type EducationMonth = 3 | 4 | 5 | 6 | 7 | 9 | 10 | 11 | 12 | 2;

export const AVAILABLE_MONTHS: EducationMonth[] = [3, 4, 5, 6, 7, 9, 10, 11, 12, 2];

export interface MaterialItem {
  id: string;
  page: number;
  title: string;
  subtitle?: string;
  fileName?: string;
  imageUrl: string;
  imagePath?: string;
  originalImagePath?: string;
  originalImageUrl?: string;
  category?: string;
  summaryPoints?: string[];
  visible?: boolean;
  order?: number;
}

export interface FirestoreMaterialDoc {
  id?: string;
  type: 'monthly' | 'appendix';
  month?: number;
  category?: 'foodborne' | 'ccpcp' | string;
  page: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  imagePath?: string;
  originalImagePath?: string;
  originalImageUrl?: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MonthMaterialData {
  month: EducationMonth;
  title: string;
  materials: MaterialItem[];
  videoUrl?: string;
  videoTitle?: string;
  videoQrUrl?: string;
}

export interface AppSettings {
  quizUrl: string;
  quizQrUrl?: string;
}

export interface AppendixGroup {
  key: 'foodborne' | 'ccpcp' | string;
  title: string;
  description: string;
  materials: MaterialItem[];
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
