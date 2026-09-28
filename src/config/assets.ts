/**
 * External public static file server configuration for school meal hygiene education materials.
 * Centralized in this single file as required.
 */

// Production Base URL on Cloudflare Worker Static Assets
export const ASSET_BASE_URL = 'https://school-hygiene-assets.tabbysa.workers.dev';

// Cache busting version managed in this single location
export const ASSET_VERSION = '20260926';

/**
 * Returns the Cloudflare image URL for any Morning Hygiene curriculum by assetPrefix ('morning' | 'morning-new').
 * Example:
 * getMorningImageUrl('morning', 1) -> https://school-hygiene-assets.tabbysa.workers.dev/assets/morning/day001.webp?v=20260926
 * getMorningImageUrl('morning-new', 1) -> https://school-hygiene-assets.tabbysa.workers.dev/assets/morning-new/day001.webp?v=20260926
 */
export function getMorningImageUrl(courseOrPrefix: string, dayOrImage: number | string): string {
  const prefix = courseOrPrefix === 'morning' || courseOrPrefix === 'assets/morning' ? 'morning' : 'morning-new';
  let fileName = '';
  if (typeof dayOrImage === 'number') {
    const safeDay = Math.max(1, Math.min(190, Math.floor(dayOrImage) || 1));
    const dayStr = String(safeDay).padStart(3, '0');
    fileName = `day${dayStr}.webp`;
  } else {
    fileName = (dayOrImage || '').trim();
    if (!fileName.endsWith('.webp')) {
      fileName = `${fileName}.webp`;
    }
    if (fileName.startsWith('/')) {
      fileName = fileName.replace(/^\/+/, '');
    }
  }
  const versionQuery = ASSET_VERSION ? `?v=${ASSET_VERSION}` : '';
  return `${ASSET_BASE_URL}/assets/${prefix}/${fileName}${versionQuery}`;
}

/**
 * Returns the Cloudflare image URL for Morning Hygiene (신규) by Day number.
 */
export function getMorningNewImageUrl(dayOrImage: number | string): string {
  return getMorningImageUrl('morning-new', dayOrImage);
}

// Default Quiz URL (GitHub Pages site)
export const DEFAULT_QUIZ_URL = 'https://thtkssla.github.io/foodhygiene/';

/**
 * Returns the monthly quiz URL with the month query parameter,
 * e.g. https://thtkssla.github.io/foodhygiene/?month=3
 */
export function getMonthlyQuizUrl(baseUrl: string = DEFAULT_QUIZ_URL, month: number | string = 3): string {
  const rawBase = (baseUrl || DEFAULT_QUIZ_URL).trim();
  const effectiveBase = rawBase.includes('netlify.app') ? DEFAULT_QUIZ_URL : rawBase;
  try {
    const urlObj = new URL(effectiveBase.startsWith('http') ? effectiveBase : `https://${effectiveBase}`);
    urlObj.searchParams.set('month', String(month));
    return urlObj.toString();
  } catch {
    const clean = effectiveBase.replace(/\/+$/, '');
    const separator = clean.includes('?') ? '&' : '?';
    return `${clean}${separator}month=${month}`;
  }
}

/**
 * Generates relative image path for meal-safety monthly materials.
 * Rules:
 * month 3, page 1 -> /assets/meal-safety/m03_p1.webp
 * month 3, page 2 -> /assets/meal-safety/m03_p2.webp
 * month 10, page 1 -> /assets/meal-safety/m10_p1.webp
 * Month is always 2 digits (02, 03, ..., 12).
 */
export function getMealSafetyImagePath(month: number | string, page: number | string = 1): string {
  const m = String(month).padStart(2, '0');
  const p = String(page);
  return `/assets/meal-safety/m${m}_p${p}.webp`;
}

/**
 * Returns the full Cloudflare image URL for meal-safety monthly materials.
 * Forms: ASSET_BASE_URL + imagePath
 */
export function getMealSafetyImageUrl(month: number | string, page: number | string = 1): string {
  return `${ASSET_BASE_URL}${getMealSafetyImagePath(month, page)}`;
}

/**
 * Returns the full URL for a relative asset path.
 * If the path is already an absolute URL (http/https) or an inline data URI (data:/blob:),
 * it returns the string unchanged.
 * Otherwise it joins ASSET_BASE_URL with the relative path.
 * Format: ASSET_BASE_URL + imagePath
 */
export function getAssetUrl(relativePath?: string | null): string {
  if (!relativePath) return '';
  if (
    relativePath.startsWith('http://') ||
    relativePath.startsWith('https://') ||
    relativePath.startsWith('data:') ||
    relativePath.startsWith('blob:')
  ) {
    return relativePath;
  }
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${ASSET_BASE_URL}${cleanPath}`;
}

