/**
 * Clean SVG Poster generator for school meal HACCP hygiene education cards.
 * Generates high quality, scalable vectors with authentic Korean hygiene guidelines.
 */

interface PosterConfig {
  tag: string;
  themeColor: string;
  subColor: string;
  title: string;
  subtitle: string;
  points: { step: string; desc: string }[];
  haccpNotice: string;
}

export function generateHygienePosterSvg(config: PosterConfig): string {
  const { tag, themeColor, subColor, title, subtitle, points, haccpNotice } = config;

  const pointsSvg = points
    .map((p, idx) => {
      const y = 290 + idx * 110;
      return `
      <g transform="translate(60, ${y})">
        <rect width="840" height="92" rx="16" fill="white" stroke="#E2E8F0" stroke-width="2"/>
        <circle cx="50" cy="46" r="28" fill="${themeColor}"/>
        <text x="50" y="54" font-family="'Noto Sans KR', 'Pretendard', sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">${p.step}</text>
        <text x="96" y="53" font-family="'Noto Sans KR', 'Pretendard', sans-serif" font-size="22" font-weight="600" fill="#1E293B">${p.desc}</text>
      </g>
      `;
    })
    .join('\n');

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 960" width="960" height="960">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F8FAFC"/>
        <stop offset="100%" stop-color="#EEF2F6"/>
      </linearGradient>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${themeColor}"/>
        <stop offset="100%" stop-color="${subColor}"/>
      </linearGradient>
      <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="6" stdDeviation="10" flood-opacity="0.08"/>
      </filter>
    </defs>

    <!-- Background Frame -->
    <rect width="960" height="960" rx="32" fill="url(#bgGrad)"/>
    <rect x="20" y="20" width="920" height="920" rx="26" fill="none" stroke="${themeColor}" stroke-width="3" stroke-dasharray="10 8" opacity="0.3"/>

    <!-- Header Section -->
    <g transform="translate(60, 50)">
      <!-- Badge -->
      <rect width="210" height="42" rx="21" fill="url(#headerGrad)"/>
      <text x="105" y="27" font-family="'Noto Sans KR', 'Pretendard', sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">${tag}</text>

      <!-- Main Title -->
      <text x="0" y="105" font-family="'Noto Sans KR', 'Pretendard', sans-serif" font-size="44" font-weight="800" fill="#0F172A">${title}</text>
      <text x="0" y="150" font-family="'Noto Sans KR', 'Pretendard', sans-serif" font-size="22" font-weight="500" fill="#475569">${subtitle}</text>
      <line x1="0" y1="180" x2="840" y2="180" stroke="${themeColor}" stroke-width="4" stroke-linecap="round"/>
    </g>

    <!-- Checklist / Guidelines -->
    ${pointsSvg}

    <!-- HACCP Notice Footer -->
    <g transform="translate(60, 770)">
      <rect width="840" height="130" rx="20" fill="#FFFFFF" stroke="${themeColor}" stroke-width="2" filter="url(#cardShadow)"/>
      <rect x="24" y="24" width="8" height="82" rx="4" fill="${themeColor}"/>
      <text x="46" y="52" font-family="'Noto Sans KR', 'Pretendard', sans-serif" font-size="20" font-weight="bold" fill="${themeColor}">★ 학교급식 HACCP 위생관리 핵심기준</text>
      <text x="46" y="88" font-family="'Noto Sans KR', 'Pretendard', sans-serif" font-size="18" font-weight="500" fill="#334155">${haccpNotice}</text>
    </g>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
