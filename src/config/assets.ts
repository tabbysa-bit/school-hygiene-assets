/**
 * External public static file server configuration for school meal hygiene education materials.
 * Centralized in this single file as required.
 */

// Production Base URL on Cloudflare Worker Static Assets
export const ASSET_BASE_URL = 'https://school-hygiene-assets.tabbysa.workers.dev';

// Cache busting version managed in this single location
export const ASSET_VERSION = '20260926';

/**
 * Returns the Cloudflare image URL for Morning Hygiene (신규) by Day number.
 * Example:
 * dayNumber = 1   -> https://school-hygiene-assets.tabbysa.workers.dev/assets/morning-new/day001.webp?v=20260926
 * dayNumber = 38  -> https://school-hygiene-assets.tabbysa.workers.dev/assets/morning-new/day038.webp?v=20260926
 * dayNumber = 190 -> https://school-hygiene-assets.tabbysa.workers.dev/assets/morning-new/day190.webp?v=20260926
 */
export function getMorningNewImageUrl(dayOrImage: number | string): string {
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
  return `${ASSET_BASE_URL}/assets/morning-new/${fileName}${versionQuery}`;
}

// Default Quiz URL (Netlify site)
export const DEFAULT_QUIZ_URL = 'https://foodhygiene.netlify.app/';

/**
 * Returns the monthly quiz URL with the month query parameter,
 * e.g. https://foodhygiene.netlify.app/?month=3
 */
export function getMonthlyQuizUrl(baseUrl: string = DEFAULT_QUIZ_URL, month: number | string = 3): string {
  const effectiveBase = (baseUrl || DEFAULT_QUIZ_URL).trim();
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
 * Returns the full URL for a relative asset path.
 * If the path is already an absolute URL (http/https) or an inline data URI (data:/blob:),
 * it returns the string unchanged.
 * Otherwise it joins ASSET_BASE_URL with the relative path.
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
  const versionQuery = ASSET_VERSION ? `?v=${ASSET_VERSION}` : '';
  return `${ASSET_BASE_URL}${cleanPath}${versionQuery}`;
}
