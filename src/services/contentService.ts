import {
  AppendixGroup,
  EducationMonth,
  MaterialItem,
  MonthMaterialData,
  MorningMaterialItem
} from '../types';
import { APPENDIX_DATA, DEFAULT_MONTHLY_MATERIALS } from './defaultMaterials';
import morningNewJson from '../data/morning-new.json';
import { getAssetUrl, getMorningNewImageUrl, DEFAULT_QUIZ_URL } from '../config/assets';
import {
  getQuizUrl as storageGetQuizUrl,
  saveQuizUrl as storageSaveQuizUrl,
  getQuizQrUrl as storageGetQuizQrUrl,
  saveQuizQrUrl as storageSaveQuizQrUrl
} from './storage';

export { DEFAULT_QUIZ_URL };

// In-memory cache for static JSON responses during the active session
let cachedMealSafety: any = null;
let cachedMorning: MorningMaterialItem[] | null = null;
let cachedMorningNew: MorningMaterialItem[] | null = null;
let cachedConfig: any = null;

const appendixSessionCache: Record<string, AppendixGroup> = {};

export const contentService = {
  /**
   * Loads global config.json
   */
  async getConfig(): Promise<any> {
    if (cachedConfig) return cachedConfig;
    try {
      const res = await fetch('/data/config.json');
      if (res.ok) {
        cachedConfig = await res.json();
        return cachedConfig;
      }
    } catch (e) {
      console.warn('Failed to fetch /data/config.json, using fallback', e);
    }
    return {
      serviceTitle: '학교급식종사자 위생교육',
      quizUrl: DEFAULT_QUIZ_URL,
      totalMorningDays: 190
    };
  },

  /**
   * Fetches /data/meal-safety.json (cached)
   */
  async getMealSafetyData(): Promise<any> {
    if (cachedMealSafety) return cachedMealSafety;
    try {
      const res = await fetch('/data/meal-safety.json');
      if (res.ok) {
        cachedMealSafety = await res.json();
        return cachedMealSafety;
      }
    } catch (e) {
      console.warn('Failed to fetch /data/meal-safety.json, using bundled defaults', e);
    }
    return null;
  },

  /**
   * Gets materials for a specific month (lazy loaded per month).
   * Note: Meal safety images are not yet deployed to Cloudflare, so imageUrl is set to empty
   * to avoid 404 network requests and cleanly show the preparation state.
   */
  async getMonthMaterials(month: EducationMonth): Promise<MonthMaterialData> {
    const defaultData = DEFAULT_MONTHLY_MATERIALS[month];
    const safetyData = await this.getMealSafetyData();

    if (safetyData?.monthlyMaterials?.[String(month)]) {
      const monthData = safetyData.monthlyMaterials[String(month)];
      const materials: MaterialItem[] = (monthData.materials || []).map(
        (item: any, idx: number) => {
          const fallbackItem = defaultData?.materials?.[idx];
          return {
            id: item.id || `m${month}_${idx + 1}`,
            page: item.page || idx + 1,
            title: item.title,
            subtitle: item.subtitle,
            imagePath: item.imagePath,
            imageUrl: '', // Preparation state (no 404s)
            summaryPoints: item.summaryPoints || fallbackItem?.summaryPoints || [],
            visible: true
          };
        }
      );

      return {
        month,
        title: monthData.title || defaultData.title,
        materials: materials.length > 0 ? materials : defaultData.materials.map(m => ({ ...m, imageUrl: '' })),
        videoUrl: monthData.videoUrl || defaultData.videoUrl,
        videoTitle: monthData.videoTitle || defaultData.videoTitle,
        videoQrUrl: monthData.videoQrUrl || defaultData.videoQrUrl
      };
    }

    return {
      ...defaultData,
      materials: (defaultData?.materials || []).map(m => ({ ...m, imageUrl: '' }))
    };
  },

  /**
   * Gets appendix category materials (lazy loaded on demand).
   * Note: Appendix images are not yet deployed to Cloudflare.
   */
  async getAppendixGroup(groupKey: 'foodborne' | 'ccpcp' | string): Promise<AppendixGroup> {
    if (appendixSessionCache[groupKey]) {
      return appendixSessionCache[groupKey];
    }

    const defaultGroup = APPENDIX_DATA[groupKey];
    const safetyData = await this.getMealSafetyData();

    if (safetyData?.appendices?.[groupKey]) {
      const appData = safetyData.appendices[groupKey];
      const materials: MaterialItem[] = (appData.materials || []).map(
        (item: any, idx: number) => {
          const fallbackItem = defaultGroup?.materials?.[idx];
          return {
            id: item.id || `${groupKey}_${idx + 1}`,
            page: item.page || idx + 1,
            title: item.title,
            subtitle: item.subtitle,
            imagePath: item.imagePath,
            imageUrl: '', // Preparation state (no 404s)
            summaryPoints: item.summaryPoints || fallbackItem?.summaryPoints || [],
            visible: true
          };
        }
      );

      const result: AppendixGroup = {
        key: groupKey,
        title: appData.title || defaultGroup?.title || '',
        description: appData.description || defaultGroup?.description || '',
        materials: materials.length > 0 ? materials : (defaultGroup?.materials || []).map(m => ({ ...m, imageUrl: '' }))
      };

      appendixSessionCache[groupKey] = result;
      return result;
    }

    if (defaultGroup) {
      const result = {
        ...defaultGroup,
        materials: defaultGroup.materials.map(m => ({ ...m, imageUrl: '' }))
      };
      appendixSessionCache[groupKey] = result;
      return result;
    }

    throw new Error(`부록 데이터를 찾을 수 없습니다: ${groupKey}`);
  },

  /**
   * Gets all 190 days materials for regular Morning Hygiene.
   * Note: Regular morning images are not yet deployed to Cloudflare.
   */
  async getMorningMaterials(): Promise<MorningMaterialItem[]> {
    if (cachedMorning) return cachedMorning;
    try {
      const res = await fetch('/data/morning.json');
      if (res.ok) {
        const json = await res.json();
        cachedMorning = (json.materials || []).map((m: any) => ({
          ...m,
          imageUrl: '' // Preparation state (no 404s)
        }));
        return cachedMorning!;
      }
    } catch (e) {
      console.warn('Failed to fetch /data/morning.json', e);
    }
    return [];
  },

  /**
   * Gets all 190 days materials for Morning Hygiene [New Recruits].
   * Deployed on Cloudflare Worker Static Assets:
   * https://school-hygiene-assets.tabbysa.workers.dev/assets/morning-new/day001.webp?v=20260926
   */
  async getMorningNewMaterials(): Promise<MorningMaterialItem[]> {
    if (cachedMorningNew) return cachedMorningNew;
    let list: any[] = [];
    try {
      const res = await fetch('/data/morning-new.json');
      if (res.ok) {
        const json = await res.json();
        list = Array.isArray(json) ? json : (json.materials || []);
      }
    } catch (e) {
      console.warn('Failed to fetch /data/morning-new.json, using bundled data', e);
    }
    if (!list || list.length === 0) {
      list = (morningNewJson as any).materials || [];
    }

    cachedMorningNew = list.map((m: any) => {
      const day = Number(m.day);
      const pad = String(day).padStart(3, '0');
      const imageFileName = m.image || `day${pad}.webp`;
      return {
        id: `mnew_day${pad}`,
        day: day,
        dayCode: `Day${pad}`,
        title: (m.title || '').trim(),
        image: imageFileName,
        imageUrl: getMorningNewImageUrl(imageFileName)
      };
    });
    return cachedMorningNew;
  },

  /**
   * Quiz URL methods backed by local storage
   */
  async getQuizUrl(): Promise<string> {
    return storageGetQuizUrl();
  },

  async saveQuizUrl(url: string): Promise<string> {
    return storageSaveQuizUrl(url);
  },

  async getQuizQrUrl(): Promise<string | undefined> {
    return storageGetQuizQrUrl();
  },

  async saveQuizQrUrl(qrUrl?: string): Promise<void> {
    return storageSaveQuizQrUrl(qrUrl);
  }
};
