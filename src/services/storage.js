/**
 * LocalStorage wrapper service.
 * All functions are async so this can be seamlessly transitioned to
 * a backend database (Firestore / Cloud SQL / Supabase) in the future.
 */

export const EDUCATION_RECORDS_KEY = 'monthlyHygieneRecords_v1';
export const SCHOOL_SETTINGS_KEY = 'monthlyHygieneSchoolSettings_v1';
export const APP_SETTINGS_KEY = 'monthlyHygieneAppSettings_v1';
export const DEFAULT_QUIZ_URL = 'https://foodhygiene.netlify.app/';

/**
 * Helper to simulate brief async tick for database consistency
 */
const delay = (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// 1. Education Records Service (async)
// ==========================================

/**
 * Fetches education records from storage.
 * If month is provided, filters records for that month and sorts by date.
 * @param {number|string} [month]
 * @returns {Promise<Array<any>>}
 */
export async function getRecords(month) {
  await delay();
  try {
    const raw = localStorage.getItem(EDUCATION_RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    if (month !== undefined && month !== null) {
      return parsed
        .filter((r) => Number(r.month) === Number(month))
        .sort((a, b) => {
          const dateCmp = String(a.date).localeCompare(String(b.date));
          if (dateCmp !== 0) return dateCmp;
          return Number(a.id) - Number(b.id);
        });
    }

    return parsed;
  } catch (error) {
    console.error('[storage] Failed to get education records:', error);
    throw new Error('교육 기록을 불러오는 데 실패했습니다.');
  }
}

/**
 * Saves a single education record (creates new or updates existing).
 * @param {Object} record
 * @returns {Promise<Object>}
 */
export async function saveRecord(record) {
  await delay();
  try {
    if (!record || !record.id) {
      throw new Error('유효하지 않은 교육 기록 데이터입니다.');
    }
    const allRecords = await getRecords();
    const existingIndex = allRecords.findIndex((r) => r.id === record.id);
    if (existingIndex >= 0) {
      allRecords[existingIndex] = record;
    } else {
      allRecords.push(record);
    }
    localStorage.setItem(EDUCATION_RECORDS_KEY, JSON.stringify(allRecords));
    return record;
  } catch (error) {
    console.error('[storage] Failed to save education record:', error);
    throw new Error('교육 기록을 저장하는 데 실패했습니다.');
  }
}

/**
 * Saves the entire list of education records.
 * @param {Array<any>} records
 * @returns {Promise<Array<any>>}
 */
export async function saveRecords(records) {
  await delay();
  try {
    const list = Array.isArray(records) ? records : [];
    localStorage.setItem(EDUCATION_RECORDS_KEY, JSON.stringify(list));
    return list;
  } catch (error) {
    console.error('[storage] Failed to save education records list:', error);
    throw new Error('교육 기록 목록을 저장하는 데 실패했습니다.');
  }
}

/**
 * Deletes a single education record by ID.
 * @param {number|string} recordId
 * @returns {Promise<number|string>}
 */
export async function deleteRecord(recordId) {
  await delay();
  try {
    const allRecords = await getRecords();
    const filtered = allRecords.filter((r) => r.id !== recordId);
    localStorage.setItem(EDUCATION_RECORDS_KEY, JSON.stringify(filtered));
    return recordId;
  } catch (error) {
    console.error('[storage] Failed to delete education record:', error);
    throw new Error('교육 기록을 삭제하는 데 실패했습니다.');
  }
}

/**
 * Clears all records for a given month.
 * @param {number|string} month
 * @returns {Promise<number>}
 */
export async function clearMonthRecords(month) {
  await delay();
  try {
    const allRecords = await getRecords();
    const filtered = allRecords.filter((r) => Number(r.month) !== Number(month));
    localStorage.setItem(EDUCATION_RECORDS_KEY, JSON.stringify(filtered));
    return Number(month);
  } catch (error) {
    console.error('[storage] Failed to clear month records:', error);
    throw new Error(`${month}월 교육 기록을 초기화하는 데 실패했습니다.`);
  }
}

/**
 * Checks if basic education has been completed for a given month.
 * @param {number|string} month
 * @returns {Promise<boolean>}
 */
export async function hasBasicEducationRecord(month) {
  const monthRecords = await getRecords(month);
  return monthRecords.some((r) => r.type === 'basic');
}

// Compatibility aliases
export const getEducationRecords = getRecords;
export const saveEducationRecords = saveRecords;

// ==========================================
// 2. School Settings Service (async)
// ==========================================

/**
 * Fetches school settings (school name, participants list).
 * @returns {Promise<{ schoolName: string, participants: string[] }>}
 */
export async function getSettings() {
  await delay();
  try {
    const raw = localStorage.getItem(SCHOOL_SETTINGS_KEY);
    if (!raw) {
      return {
        schoolName: '',
        participants: []
      };
    }
    const data = JSON.parse(raw);
    return {
      schoolName: typeof data.schoolName === 'string' ? data.schoolName : '',
      participants: Array.isArray(data.participants) ? data.participants : []
    };
  } catch (error) {
    console.error('[storage] Failed to get school settings:', error);
    throw new Error('학교 설정을 불러오는 데 실패했습니다.');
  }
}

/**
 * Saves school settings.
 * @param {{ schoolName: string, participants: string[] }} settings
 * @returns {Promise<{ schoolName: string, participants: string[] }>}
 */
export async function saveSettings(settings) {
  await delay();
  try {
    const payload = {
      schoolName: (settings?.schoolName || '').trim(),
      participants: Array.isArray(settings?.participants) ? settings.participants : []
    };
    localStorage.setItem(SCHOOL_SETTINGS_KEY, JSON.stringify(payload));
    return payload;
  } catch (error) {
    console.error('[storage] Failed to save school settings:', error);
    throw new Error('학교 설정을 저장하는 데 실패했습니다.');
  }
}

// Compatibility aliases
export const getSchoolSettings = getSettings;
export const saveSchoolSettings = saveSettings;

// ==========================================
// 3. App / Quiz Settings Service (async)
// ==========================================

/**
 * Gets global Quiz URL.
 * @returns {Promise<string>}
 */
export async function getQuizUrl() {
  await delay();
  try {
    const raw = localStorage.getItem(APP_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.quizUrl && typeof parsed.quizUrl === 'string' && parsed.quizUrl.trim()) {
        return parsed.quizUrl.trim();
      }
    }
  } catch (error) {
    console.error('[storage] Failed to get quiz URL:', error);
  }
  return DEFAULT_QUIZ_URL;
}

/**
 * Saves global Quiz URL.
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function saveQuizUrl(url) {
  await delay();
  try {
    const raw = localStorage.getItem(APP_SETTINGS_KEY);
    const settings = raw ? JSON.parse(raw) : {};
    const effectiveUrl = (url || DEFAULT_QUIZ_URL).trim();
    settings.quizUrl = effectiveUrl;
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
    return effectiveUrl;
  } catch (error) {
    console.error('[storage] Failed to save quiz URL:', error);
    throw new Error('퀴즈 URL 저장 중 오류가 발생했습니다.');
  }
}

/**
 * Gets custom Quiz QR image URL.
 * @returns {Promise<string|undefined>}
 */
export async function getQuizQrUrl() {
  await delay();
  try {
    const raw = localStorage.getItem(APP_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.quizQrUrl && typeof parsed.quizQrUrl === 'string') {
        return parsed.quizQrUrl;
      }
    }
  } catch (error) {
    console.error('[storage] Failed to get quiz QR:', error);
  }
  return undefined;
}

/**
 * Saves custom Quiz QR image URL.
 * @param {string} [qrUrl]
 * @returns {Promise<void>}
 */
export async function saveQuizQrUrl(qrUrl) {
  await delay();
  try {
    const raw = localStorage.getItem(APP_SETTINGS_KEY);
    const settings = raw ? JSON.parse(raw) : {};
    settings.quizQrUrl = qrUrl;
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('[storage] Failed to save quiz QR:', error);
    throw new Error('퀴즈 QR 저장 중 오류가 발생했습니다.');
  }
}

/**
 * Gets full quiz configuration.
 * @returns {Promise<{ quizUrl: string, quizQrUrl?: string }>}
 */
export async function getQuizSettings() {
  const [quizUrl, quizQrUrl] = await Promise.all([getQuizUrl(), getQuizQrUrl()]);
  return { quizUrl, quizQrUrl };
}

// ==========================================
// 4. Backup & Restore Service (async)
// ==========================================

export const BACKUP_FORMAT_VERSION = 1;

/**
 * Exports all local data (education records, school settings, quiz settings) as a structured backup object.
 * @returns {Promise<{
 *   version: number,
 *   exportedAt: string,
 *   records: Array<any>,
 *   schoolSettings: { schoolName: string, participants: string[] },
 *   quizSettings: { quizUrl: string, quizQrUrl?: string }
 * }>}
 */
export async function exportBackupData() {
  const [records, schoolSettings, quizSettings] = await Promise.all([
    getRecords(),
    getSettings(),
    getQuizSettings()
  ]);

  return {
    version: BACKUP_FORMAT_VERSION,
    appName: 'monthly-hygiene-education',
    exportedAt: new Date().toISOString(),
    records,
    schoolSettings,
    quizSettings
  };
}

/**
 * Validates a parsed JSON backup object.
 * Throws a descriptive Error if validation fails.
 * @param {any} data
 * @returns {{ valid: boolean, error?: string, summary?: { recordsCount: number, schoolName: string, participantsCount: number } }}
 */
export function validateBackupData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('올바른 JSON 객체 형식이 아닙니다.');
  }

  // records must be an array
  if (!Array.isArray(data.records)) {
    throw new Error("백업 데이터에 'records' (교육 기록 목록) 배열이 누락되었거나 유효하지 않습니다.");
  }

  // Validate record items if present
  for (let i = 0; i < data.records.length; i++) {
    const item = data.records[i];
    if (!item || typeof item !== 'object' || !item.id || !item.date || typeof item.title !== 'string') {
      throw new Error(`교육 기록 #${i + 1}의 형식(id, date, title)이 올바르지 않습니다.`);
    }
  }

  // schoolSettings must be an object
  if (!data.schoolSettings || typeof data.schoolSettings !== 'object') {
    throw new Error("백업 데이터에 'schoolSettings' (학교 설정) 항목이 누락되었습니다.");
  }

  if (typeof data.schoolSettings.schoolName !== 'string') {
    throw new Error("학교 설정의 'schoolName' 항목이 올바르지 않습니다.");
  }

  if (!Array.isArray(data.schoolSettings.participants)) {
    throw new Error("학교 설정의 'participants' (조리종사자 명단) 배열이 누락되었습니다.");
  }

  return {
    valid: true,
    summary: {
      recordsCount: data.records.length,
      schoolName: data.schoolSettings.schoolName || '(미지정)',
      participantsCount: data.schoolSettings.participants.length
    }
  };
}

/**
 * Restores all data from a validated backup object.
 * @param {any} backupData
 * @returns {Promise<{ recordsCount: number, schoolName: string }>}
 */
export async function restoreBackupData(backupData) {
  validateBackupData(backupData);

  // 1. Save records
  await saveRecords(backupData.records);

  // 2. Save school settings
  await saveSettings(backupData.schoolSettings);

  // 3. Save quiz settings (if present)
  if (backupData.quizSettings && typeof backupData.quizSettings === 'object') {
    if (typeof backupData.quizSettings.quizUrl === 'string') {
      await saveQuizUrl(backupData.quizSettings.quizUrl);
    }
    await saveQuizQrUrl(backupData.quizSettings.quizQrUrl || undefined);
  }

  return {
    recordsCount: backupData.records.length,
    schoolName: backupData.schoolSettings.schoolName || ''
  };
}
