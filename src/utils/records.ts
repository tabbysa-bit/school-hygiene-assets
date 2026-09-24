import { EducationRecord, PrintCard } from '../types';

export {
  getRecords,
  saveRecord,
  saveRecords,
  deleteRecord,
  clearMonthRecords,
  hasBasicEducationRecord,
  getEducationRecords,
  saveEducationRecords,
  getSettings,
  saveSettings,
  getSchoolSettings,
  saveSchoolSettings,
  EDUCATION_RECORDS_KEY,
  SCHOOL_SETTINGS_KEY
} from '../services/storage';

export function formatRecordDate(dateText: string): string {
  if (!dateText) return '';
  const parts = dateText.split('-');
  if (parts.length !== 3) return dateText;
  return `${parts[1]}.${parts[2]}`;
}

export function formatFullRecordDate(dateText: string): string {
  if (!dateText) return '';
  return dateText.replace(/-/g, '.');
}

export function getTodayISO(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Collects distinct print cards from month records.
 * If the same appendix card was taught multiple times in the month,
 * the card image is only shown once on the print sheet as per specification.
 */
export function getPrintCards(
  records: EducationRecord[],
  fallbackMonthImages: { url: string; title: string }[] = []
): PrintCard[] {
  const cards: PrintCard[] = [];

  records.forEach((record) => {
    // Basic education
    if (record.type === 'basic') {
      let urls: string[] = [];
      if (Array.isArray(record.imageUrls) && record.imageUrls.length > 0) {
        urls = record.imageUrls;
      } else if (fallbackMonthImages.length > 0) {
        urls = fallbackMonthImages.map((img) => img.url).filter(Boolean);
      }

      urls.forEach((url, idx) => {
        cards.push({
          url,
          title: record.title + (urls.length > 1 ? ` ${idx + 1}` : '')
        });
      });
    }

    // Appendix education
    if (record.type === 'appendix' && record.imageUrl) {
      cards.push({
        url: record.imageUrl,
        title: record.title
      });
    }
  });

  // Deduplicate by URL
  const seen = new Set<string>();
  return cards.filter((card) => {
    if (!card.url) return false;
    if (seen.has(card.url)) return false;
    seen.add(card.url);
    return true;
  });
}
