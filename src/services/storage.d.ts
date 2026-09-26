import { EducationMonth, EducationRecord, SchoolSettings, MorningNewProgressData, MorningNewRecord } from '../types';

export const EDUCATION_RECORDS_KEY: string;
export const SCHOOL_SETTINGS_KEY: string;
export const APP_SETTINGS_KEY: string;
export const MORNING_PROGRESS_KEY: string;
export const MORNING_NEW_PROGRESS_KEY: string;
export const DEFAULT_QUIZ_URL: string;

export function getRecords(month?: number | string): Promise<EducationRecord[]>;
export function saveRecord(record: EducationRecord): Promise<EducationRecord>;
export function saveRecords(records: EducationRecord[]): Promise<EducationRecord[]>;
export function deleteRecord(recordId: number | string): Promise<number | string>;
export function clearMonthRecords(month: number | string): Promise<number>;
export function hasBasicEducationRecord(month: number | string): Promise<boolean>;

export const getEducationRecords: typeof getRecords;
export const saveEducationRecords: typeof saveRecords;

export function getSettings(): Promise<SchoolSettings>;
export function saveSettings(settings: SchoolSettings): Promise<SchoolSettings>;

export const getSchoolSettings: typeof getSettings;
export const saveSchoolSettings: typeof saveSettings;

export function getQuizUrl(): Promise<string>;
export function saveQuizUrl(url: string): Promise<string>;
export function getQuizQrUrl(): Promise<string | undefined>;
export function saveQuizQrUrl(qrUrl?: string): Promise<void>;
export function getQuizSettings(): Promise<{ quizUrl: string; quizQrUrl?: string }>;

export function getMorningProgress(): Promise<number>;
export function setMorningProgress(day: number): Promise<number>;

export function getTodayDateString(): string;
export function getMorningNewData(): Promise<MorningNewProgressData>;
export function getMorningNewProgress(): Promise<number>;
export function getMorningNewRecords(): Promise<MorningNewRecord[]>;
export function completeMorningNewDay(
  day: number,
  title: string,
  date?: string
): Promise<{
  isAlreadyCompleted: boolean;
  data: MorningNewProgressData;
  existingRecord?: MorningNewRecord;
}>;
export function setMorningNewProgress(day: number): Promise<number>;
export function updateMorningNewRecordDate(
  day: number,
  newDate: string
): Promise<MorningNewProgressData>;
export function deleteMorningNewRecord(day: number): Promise<MorningNewProgressData>;
export function getMorningNewRecordsByMonth(
  year: number | string,
  month: number | string
): Promise<Array<MorningNewRecord & { image: string; formattedDate: string }>>;

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

export function exportBackupData(): Promise<BackupData>;
export function validateBackupData(data: any): {
  valid: boolean;
  error?: string;
  summary?: {
    recordsCount: number;
    schoolName: string;
    participantsCount: number;
    morningProgress?: number;
    morningNewProgress?: number;
    morningNewRecordsCount?: number;
  };
};
export function restoreBackupData(backupData: any): Promise<{
  recordsCount: number;
  schoolName: string;
  morningProgress?: number;
  morningNewProgress?: number;
}>;
