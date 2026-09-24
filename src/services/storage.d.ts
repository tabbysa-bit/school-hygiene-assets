import { EducationMonth, EducationRecord, SchoolSettings } from '../types';

export const EDUCATION_RECORDS_KEY: string;
export const SCHOOL_SETTINGS_KEY: string;
export const APP_SETTINGS_KEY: string;
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
}

export function exportBackupData(): Promise<BackupData>;
export function validateBackupData(data: any): {
  valid: boolean;
  error?: string;
  summary?: {
    recordsCount: number;
    schoolName: string;
    participantsCount: number;
  };
};
export function restoreBackupData(backupData: any): Promise<{ recordsCount: number; schoolName: string }>;
