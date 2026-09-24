import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from './firebase';
import {
  AppendixGroup,
  EducationMonth,
  FirestoreMaterialDoc,
  MaterialItem,
  MonthMaterialData
} from '../types';
import { APPENDIX_DATA, DEFAULT_MONTHLY_MATERIALS } from './defaultMaterials';
import { optimizeImageForWeb, fileToDataUrl } from '../utils/imageOptimizer';
import {
  getQuizUrl as storageGetQuizUrl,
  saveQuizUrl as storageSaveQuizUrl,
  getQuizQrUrl as storageGetQuizQrUrl,
  saveQuizQrUrl as storageSaveQuizQrUrl,
  DEFAULT_QUIZ_URL
} from './storage';

const MATERIALS_COLLECTION = 'materials';
export { DEFAULT_QUIZ_URL };

// In-memory cache for lazy-loaded appendices during the active session
const appendixSessionCache: Record<string, AppendixGroup> = {};

export const contentService = {
  /**
   * Gets the global quiz URL (defaults to https://foodhygiene.netlify.app/)
   */
  async getQuizUrl(): Promise<string> {
    return storageGetQuizUrl();
  },

  /**
   * Saves the global quiz URL
   */
  async saveQuizUrl(url: string): Promise<string> {
    return storageSaveQuizUrl(url);
  },

  /**
   * Gets custom Quiz QR image URL (if uploaded by admin)
   */
  async getQuizQrUrl(): Promise<string | undefined> {
    return storageGetQuizQrUrl();
  },

  /**
   * Saves custom Quiz QR image URL
   */
  async saveQuizQrUrl(qrUrl?: string): Promise<void> {
    return storageSaveQuizQrUrl(qrUrl);
  },

  /**
   * Fetches educational materials for a specific month.
   * Priority:
   * 1. Cloud Firestore materials collection (type == 'monthly', month == m, isPublished == true)
   * 2. Fallback to bundled DEFAULT_MONTHLY_MATERIALS if Firestore is empty or offline
   */
  async getMonthMaterials(month: EducationMonth): Promise<MonthMaterialData> {
    const defaultData = DEFAULT_MONTHLY_MATERIALS[month] || {
      month,
      title: `${month}월 위생교육`,
      materials: []
    };

    try {
      // Query Firestore for this month only
      const q = query(
        collection(db, MATERIALS_COLLECTION),
        where('type', '==', 'monthly'),
        where('month', '==', Number(month)),
        where('isPublished', '==', true),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const firestoreMaterials: MaterialItem[] = snapshot.docs.map((docSnap, index) => {
          const d = docSnap.data() as FirestoreMaterialDoc;
          return {
            id: docSnap.id,
            page: d.page || index + 1,
            title: d.title,
            subtitle: d.subtitle,
            imageUrl: d.imageUrl,
            imagePath: d.imagePath,
            originalImagePath: d.originalImagePath,
            originalImageUrl: d.originalImageUrl,
            visible: d.isPublished,
            order: d.order ?? index + 1
          };
        });

        return {
          month,
          title: defaultData.title || `${month}월 위생교육`,
          videoUrl: defaultData.videoUrl,
          videoTitle: defaultData.videoTitle,
          videoQrUrl: defaultData.videoQrUrl,
          materials: firestoreMaterials
        };
      }
    } catch (error) {
      console.warn(`Firestore getMonthMaterials(${month}) failed or empty, falling back to bundled default:`, error);
    }

    // Default fallback
    return {
      month,
      title: defaultData.title,
      videoUrl: defaultData.videoUrl,
      videoTitle: defaultData.videoTitle,
      videoQrUrl: defaultData.videoQrUrl,
      materials: defaultData.materials ? [...defaultData.materials] : []
    };
  },

  /**
   * Admin: Fetches ALL materials for a month (including unpublished)
   */
  async getAdminMonthMaterials(month: EducationMonth): Promise<MaterialItem[]> {
    try {
      const q = query(
        collection(db, MATERIALS_COLLECTION),
        where('type', '==', 'monthly'),
        where('month', '==', Number(month)),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap, idx) => {
          const d = docSnap.data() as FirestoreMaterialDoc;
          return {
            id: docSnap.id,
            page: d.page || idx + 1,
            title: d.title,
            subtitle: d.subtitle,
            imageUrl: d.imageUrl,
            imagePath: d.imagePath,
            originalImagePath: d.originalImagePath,
            originalImageUrl: d.originalImageUrl,
            visible: d.isPublished,
            order: d.order ?? idx + 1
          };
        });
      }
    } catch (e) {
      console.warn('Admin fetch from firestore failed, returning defaults:', e);
    }

    const defaultData = DEFAULT_MONTHLY_MATERIALS[month];
    return defaultData?.materials ? JSON.parse(JSON.stringify(defaultData.materials)) : [];
  },

  /**
   * Fetches appendix category on demand (Lazy Loading + In-memory session cache).
   */
  async getAppendixGroup(groupKey: 'foodborne' | 'ccpcp'): Promise<AppendixGroup> {
    // 1. Session cache check
    if (appendixSessionCache[groupKey]) {
      return appendixSessionCache[groupKey];
    }

    const defaultGroup = APPENDIX_DATA[groupKey];

    try {
      const q = query(
        collection(db, MATERIALS_COLLECTION),
        where('type', '==', 'appendix'),
        where('category', '==', groupKey),
        where('isPublished', '==', true),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const firestoreMaterials: MaterialItem[] = snapshot.docs.map((docSnap, idx) => {
          const d = docSnap.data() as FirestoreMaterialDoc;
          return {
            id: docSnap.id,
            page: d.page || idx + 1,
            title: d.title,
            subtitle: d.subtitle,
            imageUrl: d.imageUrl,
            imagePath: d.imagePath,
            originalImagePath: d.originalImagePath,
            originalImageUrl: d.originalImageUrl,
            category: groupKey,
            visible: d.isPublished,
            order: d.order ?? idx + 1
          };
        });

        const loadedGroup: AppendixGroup = {
          key: groupKey,
          title: defaultGroup?.title || (groupKey === 'foodborne' ? '계절별 주요 식중독' : 'CCP 및 CP 기록지 작성요령'),
          description: defaultGroup?.description || '',
          materials: firestoreMaterials
        };

        appendixSessionCache[groupKey] = loadedGroup;
        return loadedGroup;
      }
    } catch (e) {
      console.warn(`Firestore getAppendixGroup(${groupKey}) fallback:`, e);
    }

    if (!defaultGroup) {
      throw new Error(`존재하지 않는 부록 항목입니다: ${groupKey}`);
    }

    appendixSessionCache[groupKey] = defaultGroup;
    return defaultGroup;
  },

  /**
   * Admin: Fetches ALL appendix items for a category
   */
  async getAdminAppendixGroup(groupKey: 'foodborne' | 'ccpcp'): Promise<MaterialItem[]> {
    try {
      const q = query(
        collection(db, MATERIALS_COLLECTION),
        where('type', '==', 'appendix'),
        where('category', '==', groupKey),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap, idx) => {
          const d = docSnap.data() as FirestoreMaterialDoc;
          return {
            id: docSnap.id,
            page: d.page || idx + 1,
            title: d.title,
            subtitle: d.subtitle,
            imageUrl: d.imageUrl,
            imagePath: d.imagePath,
            originalImagePath: d.originalImagePath,
            originalImageUrl: d.originalImageUrl,
            category: groupKey,
            visible: d.isPublished,
            order: d.order ?? idx + 1
          };
        });
      }
    } catch (e) {
      console.warn('Admin fetch appendix failed, returning defaults:', e);
    }

    const defaultGroup = APPENDIX_DATA[groupKey];
    return defaultGroup?.materials ? JSON.parse(JSON.stringify(defaultGroup.materials)) : [];
  },

  /**
   * Admin: Uploads an image file to Firebase Storage (both original and optimized webp)
   * and saves or updates metadata in Cloud Firestore.
   */
  async uploadMaterialImage({
    file,
    type,
    month,
    category,
    page,
    title,
    order,
    existingDocId,
    isPublished = true
  }: {
    file: File;
    type: 'monthly' | 'appendix';
    month?: number;
    category?: 'foodborne' | 'ccpcp' | string;
    page: number;
    title: string;
    order: number;
    existingDocId?: string;
    isPublished?: boolean;
  }): Promise<FirestoreMaterialDoc> {
    const timestamp = Date.now();
    const pad2 = (n: number) => String(n).padStart(2, '0');

    // Storage path structure
    let folderPath = '';
    let fileBase = `page${pad2(page)}`;

    if (type === 'monthly') {
      const monthStr = pad2(month || 3);
      folderPath = `monthly/${monthStr}`;
    } else {
      folderPath = `appendix/${category || 'misc'}`;
    }

    const originalPath = `${folderPath}/original/${fileBase}_${timestamp}_${file.name}`;
    const webpPath = `${folderPath}/${fileBase}_${timestamp}.webp`;

    let originalUrl = '';
    let displayUrl = '';
    let displayPath = '';

    // 1. Try Firebase Storage upload
    try {
      const originalRef = ref(storage, originalPath);
      await uploadBytes(originalRef, file, { contentType: file.type || 'image/png' });
      originalUrl = await getDownloadURL(originalRef);
      displayUrl = originalUrl;
      displayPath = originalPath;

      // Try webp optimization upload
      try {
        const { blob: optimizedBlob } = await optimizeImageForWeb(file, 1200, 1200, 0.9);
        const webpRef = ref(storage, webpPath);
        await uploadBytes(webpRef, optimizedBlob, { contentType: 'image/webp' });
        displayUrl = await getDownloadURL(webpRef);
        displayPath = webpPath;
      } catch (optErr) {
        console.warn('WebP optimization skipped, using original storage URL:', optErr);
      }
    } catch (storageErr) {
      console.warn('Storage upload encountered error, falling back to data URL preview:', storageErr);
      // Fallback: Read file to data URL so the image is NEVER blank and can always be displayed
      const fallbackDataUrl = await fileToDataUrl(file);
      originalUrl = fallbackDataUrl;
      displayUrl = fallbackDataUrl;
      displayPath = `inline/${fileBase}_${timestamp}`;
    }

    // 2. Save or update metadata in Firestore
    const docId = existingDocId || (type === 'monthly'
      ? `monthly_${pad2(month || 3)}_page_${pad2(page)}_${timestamp}`
      : `appendix_${category}_page_${pad2(page)}_${timestamp}`);

    const nowISO = new Date().toISOString();
    const docData: FirestoreMaterialDoc = {
      id: docId,
      type,
      month: type === 'monthly' ? Number(month) : undefined,
      category: type === 'appendix' ? category : undefined,
      page,
      title: title.trim(),
      imageUrl: displayUrl,
      imagePath: displayPath,
      originalImagePath: originalPath,
      originalImageUrl: originalUrl,
      order,
      isPublished,
      createdAt: nowISO,
      updatedAt: nowISO
    };

    const docRef = doc(db, MATERIALS_COLLECTION, docId);
    await setDoc(docRef, docData, { merge: true });

    // Invalidate session cache if appendix
    if (type === 'appendix' && category) {
      delete appendixSessionCache[category];
    }

    return docData;
  },

  /**
   * Admin: Updates metadata (title, order, publish status) in Firestore
   */
  async updateMaterialMetadata(docId: string, updates: Partial<FirestoreMaterialDoc>): Promise<void> {
    const docRef = doc(db, MATERIALS_COLLECTION, docId);
    const nowISO = new Date().toISOString();
    await setDoc(docRef, { ...updates, updatedAt: nowISO }, { merge: true });

    // Invalidate cache
    if (updates.category) {
      delete appendixSessionCache[updates.category];
    }
  },

  /**
   * Admin: Deletes a material from Firestore and Storage
   */
  async deleteMaterial(material: MaterialItem): Promise<void> {
    if (material.id) {
      try {
        await deleteDoc(doc(db, MATERIALS_COLLECTION, material.id));
      } catch (e) {
        console.warn('Failed to delete firestore doc:', e);
      }
    }

    // Attempt to delete storage files if paths are available
    if (material.imagePath) {
      try {
        await deleteObject(ref(storage, material.imagePath));
      } catch (e) {
        console.warn('Storage imagePath deletion skipped/failed:', e);
      }
    }
    if (material.originalImagePath) {
      try {
        await deleteObject(ref(storage, material.originalImagePath));
      } catch (e) {
        console.warn('Storage originalImagePath deletion skipped/failed:', e);
      }
    }

    if (material.category) {
      delete appendixSessionCache[material.category];
    }
  },

  /**
   * Seeds initial sample default materials into Firestore if empty
   */
  async seedMonthDefaultsToFirestore(month: EducationMonth): Promise<void> {
    const defaultData = DEFAULT_MONTHLY_MATERIALS[month];
    if (!defaultData?.materials) return;

    for (let idx = 0; idx < defaultData.materials.length; idx++) {
      const item = defaultData.materials[idx];
      const pad2 = (n: number) => String(n).padStart(2, '0');
      const docId = `monthly_${pad2(month)}_page_${pad2(idx + 1)}`;
      const nowISO = new Date().toISOString();

      const docData: FirestoreMaterialDoc = {
        id: docId,
        type: 'monthly',
        month: Number(month),
        page: idx + 1,
        title: item.title,
        subtitle: item.subtitle,
        imageUrl: item.imageUrl,
        order: idx + 1,
        isPublished: true,
        createdAt: nowISO,
        updatedAt: nowISO
      };

      await setDoc(doc(db, MATERIALS_COLLECTION, docId), docData, { merge: true });
    }
  }
};
