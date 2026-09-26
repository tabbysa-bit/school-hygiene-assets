/**
 * LocalStorage wrapper service.
 * All functions are async so this can be seamlessly transitioned to
 * a backend database (Firestore / Cloud SQL / Supabase) in the future.
 */

export const EDUCATION_RECORDS_KEY = 'monthlyHygieneRecords_v1';
export const SCHOOL_SETTINGS_KEY = 'monthlyHygieneSchoolSettings_v1';
export const APP_SETTINGS_KEY = 'monthlyHygieneAppSettings_v1';
export const MORNING_PROGRESS_KEY = 'morningProgress_v1';
export const MORNING_NEW_PROGRESS_KEY = 'morningNewProgress';
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
// 4. Morning Hygiene Progress Service (async)
// ==========================================

/**
 * Gets the current progress Day for regular Morning Hygiene (1 ~ 190).
 * Defaults to 0 (meaning not yet started).
 * @returns {Promise<number>}
 */
export async function getMorningProgress() {
  await delay();
  try {
    const raw = localStorage.getItem(MORNING_PROGRESS_KEY);
    if (raw !== null && raw !== undefined) {
      const val = parseInt(raw, 10);
      if (!isNaN(val) && val >= 0) return val;
    }
  } catch (error) {
    console.error('[storage] Failed to get morning progress:', error);
  }
  return 0;
}

/**
 * Saves the progress Day for regular Morning Hygiene.
 * @param {number} day
 * @returns {Promise<number>}
 */
export async function setMorningProgress(day) {
  await delay();
  try {
    const safeDay = Math.max(0, Math.min(190, parseInt(day, 10) || 0));
    localStorage.setItem(MORNING_PROGRESS_KEY, String(safeDay));
    return safeDay;
  } catch (error) {
    console.error('[storage] Failed to save morning progress:', error);
    throw new Error('모닝위생 진행상황 저장에 실패했습니다.');
  }
}

/**
 * Helper to get current date formatted as YYYY-MM-DD
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets the full state for Morning Hygiene [New Recruits].
 * Returns { progress: number, records: Array<{ day: number, date: string, title: string }> }
 * Supports backward compatibility with primitive number strings.
 * @returns {Promise<{ progress: number, records: Array<{ day: number, date: string, title: string }> }>}
 */
export async function getMorningNewData() {
  await delay();
  try {
    const raw = localStorage.getItem(MORNING_NEW_PROGRESS_KEY) ?? localStorage.getItem('morningNewProgress_v1');
    if (!raw) {
      return { progress: 0, records: [] };
    }
    const trimmed = raw.trim();
    if (trimmed.startsWith('{')) {
      const parsed = JSON.parse(trimmed);
      return {
        progress: Math.max(0, Math.min(190, parseInt(parsed.progress, 10) || 0)),
        records: Array.isArray(parsed.records) ? parsed.records : []
      };
    }
    const val = parseInt(trimmed, 10);
    if (!isNaN(val) && val >= 0) {
      return { progress: Math.min(190, val), records: [] };
    }
  } catch (error) {
    console.error('[storage] Failed to get morning new data:', error);
  }
  return { progress: 0, records: [] };
}

/**
 * Gets the current progress Day for Morning Hygiene [New Recruits] (0 ~ 190).
 * Defaults to 0 (meaning not yet started).
 * Completely separate from regular morning progress.
 * @returns {Promise<number>}
 */
export async function getMorningNewProgress() {
  const data = await getMorningNewData();
  return data.progress;
}

/**
 * Gets completed education records for Morning Hygiene [New Recruits].
 * @returns {Promise<Array<{ day: number, date: string, title: string }>>}
 */
export async function getMorningNewRecords() {
  const data = await getMorningNewData();
  return data.records;
}

/**
 * Records completion of a specific Day in Morning Hygiene [New Recruits].
 * Saves { day, date, title } into records array without duplicate Day entries.
 * Updates progress to Math.max(progress, day).
 * @param {number} day
 * @param {string} title
 * @param {string} [date]
 * @returns {Promise<{ isAlreadyCompleted: boolean, data: { progress: number, records: Array<{ day: number, date: string, title: string }> }, existingRecord?: { day: number, date: string, title: string } }>}
 */
export async function completeMorningNewDay(day, title, date) {
  await delay();
  try {
    const current = await getMorningNewData();
    const safeDay = Math.max(1, Math.min(190, parseInt(day, 10) || 1));
    const recordDate = date || getTodayDateString();

    const existing = current.records.find((r) => r.day === safeDay);
    if (existing) {
      return {
        isAlreadyCompleted: true,
        existingRecord: existing,
        data: current
      };
    }

    const newRecords = [
      ...current.records,
      { day: safeDay, date: recordDate, title: (title || '').trim() || `Day ${safeDay}` }
    ].sort((a, b) => a.day - b.day);

    const newProgress = Math.max(current.progress, safeDay);
    const updatedData = {
      progress: newProgress,
      records: newRecords
    };

    const jsonStr = JSON.stringify(updatedData);
    localStorage.setItem(MORNING_NEW_PROGRESS_KEY, jsonStr);
    localStorage.setItem('morningNewProgress_v1', jsonStr);

    return {
      isAlreadyCompleted: false,
      data: updatedData
    };
  } catch (error) {
    console.error('[storage] Failed to complete morning new day:', error);
    throw new Error('모닝위생(신규) 교육완료 저장에 실패했습니다.');
  }
}

/**
 * Saves the progress Day for Morning Hygiene [New Recruits].
 * Synchronizes records by removing any records where day > safeDay.
 * Completely separate from regular morning progress.
 * @param {number} day
 * @returns {Promise<number>}
 */
export async function setMorningNewProgress(day) {
  await delay();
  try {
    const current = await getMorningNewData();
    const safeDay = Math.max(0, Math.min(190, parseInt(day, 10) || 0));

    // Remove any records beyond the new progress
    const updatedRecords = current.records.filter((r) => r.day <= safeDay);
    const updatedData = {
      progress: safeDay,
      records: updatedRecords
    };

    const jsonStr = JSON.stringify(updatedData);
    localStorage.setItem(MORNING_NEW_PROGRESS_KEY, jsonStr);
    localStorage.setItem('morningNewProgress_v1', jsonStr);
    return safeDay;
  } catch (error) {
    console.error('[storage] Failed to save morning new progress:', error);
    throw new Error('모닝위생(신규) 진행상황 저장에 실패했습니다.');
  }
}

/**
 * Updates the date of an existing Morning Hygiene [New Recruits] record.
 * Does NOT alter progress.
 * @param {number} day
 * @param {string} newDate - YYYY-MM-DD
 * @returns {Promise<{ progress: number, records: Array<{ day: number, date: string, title: string, image?: string }> }>}
 */
export async function updateMorningNewRecordDate(day, newDate) {
  await delay();
  try {
    const current = await getMorningNewData();
    const safeDay = parseInt(day, 10);
    const updatedRecords = current.records.map((r) => {
      if (r.day === safeDay) {
        return { ...r, date: newDate };
      }
      return r;
    });

    const updatedData = {
      progress: current.progress,
      records: updatedRecords
    };

    const jsonStr = JSON.stringify(updatedData);
    localStorage.setItem(MORNING_NEW_PROGRESS_KEY, jsonStr);
    localStorage.setItem('morningNewProgress_v1', jsonStr);
    return updatedData;
  } catch (error) {
    console.error('[storage] Failed to update morning new record date:', error);
    throw new Error('모닝위생(신규) 교육일 수정에 실패했습니다.');
  }
}

/**
 * Deletes an individual Morning Hygiene [New Recruits] record.
 * As per policy: Does NOT automatically rewind/alter progress.
 * @param {number} day
 * @returns {Promise<{ progress: number, records: Array<{ day: number, date: string, title: string, image?: string }> }>}
 */
export async function deleteMorningNewRecord(day) {
  await delay();
  try {
    const current = await getMorningNewData();
    const safeDay = parseInt(day, 10);
    const updatedRecords = current.records.filter((r) => r.day !== safeDay);

    const updatedData = {
      progress: current.progress,
      records: updatedRecords
    };

    const jsonStr = JSON.stringify(updatedData);
    localStorage.setItem(MORNING_NEW_PROGRESS_KEY, jsonStr);
    localStorage.setItem('morningNewProgress_v1', jsonStr);
    return updatedData;
  } catch (error) {
    console.error('[storage] Failed to delete morning new record:', error);
    throw new Error('모닝위생(신규) 교육기록 삭제에 실패했습니다.');
  }
}

/**
 * Extracts morning new records for a given year & month (e.g. 2026, 9 -> 2026-09)
 * for monthly education log generation and viewing.
 * @param {number | string} year
 * @param {number | string} month
 * @returns {Promise<Array<{ day: number, date: string, title: string, image: string, formattedDate: string }>>}
 */
export async function getMorningNewRecordsByMonth(year, month) {
  const data = await getMorningNewData();
  const yStr = String(year);
  const mStr = String(month).padStart(2, '0');
  const prefix = `${yStr}-${mStr}`;

  return data.records
    .filter((r) => r.date && r.date.startsWith(prefix))
    .sort((a, b) => a.date.localeCompare(b.date) || a.day - b.day)
    .map((r) => {
      const parts = r.date.split('-');
      const formattedDate = parts.length === 3 ? `${parts[1]}.${parts[2]}` : r.date;
      const pad = String(r.day).padStart(3, '0');
      return {
        day: r.day,
        date: r.date,
        title: r.title,
        image: r.image || `day${pad}.webp`,
        formattedDate
      };
    });
}

// ==========================================
// 5. Backup & Restore Service (async)
// ==========================================

export const BACKUP_FORMAT_VERSION = 1;

/**
 * Exports all local data (records, settings, quiz, morning progress) as a structured backup object.
 * @returns {Promise<{
 *   version: number,
 *   appName: string,
 *   exportedAt: string,
 *   records: Array<any>,
 *   schoolSettings: { schoolName: string, participants: string[] },
 *   quizSettings: { quizUrl: string, quizQrUrl?: string },
 *   morningProgress: number,
 *   morningNewProgress: number,
 *   morningNewData?: { progress: number, records: Array<{ day: number, date: string, title: string }> }
 * }>}
 */
export async function exportBackupData() {
  const [records, schoolSettings, quizSettings, morningProgress, morningNewData] = await Promise.all([
    getRecords(),
    getSettings(),
    getQuizSettings(),
    getMorningProgress(),
    getMorningNewData()
  ]);

  return {
    version: BACKUP_FORMAT_VERSION,
    appName: 'school-hygiene-education',
    exportedAt: new Date().toISOString(),
    records,
    schoolSettings,
    quizSettings,
    morningProgress,
    morningNewProgress: morningNewData.progress,
    morningNewData
  };
}

/**
 * Validates a parsed JSON backup object.
 * Throws a descriptive Error if validation fails.
 * @param {any} data
 * @returns {{ valid: boolean, error?: string, summary?: { recordsCount: number, schoolName: string, participantsCount: number, morningProgress: number, morningNewProgress: number, morningNewRecordsCount: number } }}
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

  const morningNewRecordsCount =
    data.morningNewData && Array.isArray(data.morningNewData.records)
      ? data.morningNewData.records.length
      : 0;

  return {
    valid: true,
    summary: {
      recordsCount: data.records.length,
      schoolName: data.schoolSettings.schoolName || '(미지정)',
      participantsCount: data.schoolSettings.participants.length,
      morningProgress: typeof data.morningProgress === 'number' ? data.morningProgress : 0,
      morningNewProgress: typeof data.morningNewProgress === 'number' ? data.morningNewProgress : (data.morningNewData?.progress || 0),
      morningNewRecordsCount
    }
  };
}

/**
 * Restores all data from a validated backup object.
 * @param {any} backupData
 * @returns {Promise<{ recordsCount: number, schoolName: string, morningProgress: number, morningNewProgress: number }>}
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

  // 4. Save morning progress (if present)
  let morningProg = 0;
  if (typeof backupData.morningProgress === 'number') {
    morningProg = await setMorningProgress(backupData.morningProgress);
  }

  // 5. Save morning new progress and records (if present)
  let morningNewProg = 0;
  if (backupData.morningNewData && typeof backupData.morningNewData === 'object') {
    const rawData = backupData.morningNewData;
    const safeData = {
      progress: Math.max(0, Math.min(190, parseInt(rawData.progress, 10) || 0)),
      records: Array.isArray(rawData.records) ? rawData.records : []
    };
    const jsonStr = JSON.stringify(safeData);
    localStorage.setItem(MORNING_NEW_PROGRESS_KEY, jsonStr);
    localStorage.setItem('morningNewProgress_v1', jsonStr);
    morningNewProg = safeData.progress;
  } else if (typeof backupData.morningNewProgress === 'number') {
    morningNewProg = await setMorningNewProgress(backupData.morningNewProgress);
  }

  return {
    recordsCount: backupData.records.length,
    schoolName: backupData.schoolSettings.schoolName || '',
    morningProgress: morningProg,
    morningNewProgress: morningNewProg
  };
}
