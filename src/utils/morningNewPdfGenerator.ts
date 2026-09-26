import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { getMorningNewImageUrl } from '../config/assets';

export interface MorningNewPdfRecord {
  day: number;
  date: string;
  title: string;
  image?: string;
  formattedDate?: string;
}

export interface MorningNewPdfOptions {
  year: number;
  month: number;
  records: MorningNewPdfRecord[];
  schoolSettings: {
    schoolName: string;
    participants: string[];
  };
  includeMaterials?: boolean;
}

export interface PdfGenerationResult {
  success: boolean;
  fileName: string;
  failedImages: string[];
}

function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Safely fetches a Cloudflare asset and converts it to a Base64 data URL.
 * Falls back gracefully if fetch fails without crashing the whole PDF process.
 */
async function fetchImageDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) {
      console.warn(`Failed to fetch image: ${url} (status: ${res.status})`);
      return null;
    }
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn(`Error loading image for PDF: ${url}`, err);
    return null;
  }
}

/**
 * Creates the Page 1 Education Log DOM element (A4 size: 794px x 1123px).
 */
function createLogPageElement(options: MorningNewPdfOptions): HTMLElement {
  const { year, month, records, schoolSettings } = options;

  const sorted = [...records].sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.day - b.day);
  const firstDate = sorted[0]?.date ? sorted[0].date.replace(/-/g, '.') : '';
  const lastDate = sorted[sorted.length - 1]?.date ? sorted[sorted.length - 1].date.replace(/-/g, '.') : '';
  const periodText = firstDate && lastDate ? `${firstDate} ~ ${lastDate}` : '-';

  // Build education rows: 2 pairs per row (교육일 | 교육내용 | 교육일 | 교육내용)
  // CRITICAL: Day numbers (Day001, etc.) are strictly NOT displayed in the PDF
  const rowsCount = Math.ceil(sorted.length / 2);
  let eduTableRows = '';

  for (let i = 0; i < rowsCount; i++) {
    const left = sorted[i * 2];
    const right = sorted[i * 2 + 1];

    const leftDateParts = (left?.date || '').split('-');
    const leftDateStr = leftDateParts.length === 3 ? `${leftDateParts[1]}.${leftDateParts[2]}` : left?.date || '';
    const leftTitle = left?.title || '';

    const rightDateParts = (right?.date || '').split('-');
    const rightDateStr = rightDateParts.length === 3 ? `${rightDateParts[1]}.${rightDateParts[2]}` : right?.date || '';
    const rightTitle = right?.title || '';

    eduTableRows += `
      <tr style="height: 29px;">
        <td style="border: 1px solid #334155; text-align: center; font-size: 11.5px; font-weight: 700; color: #1e293b; background: #fafafa; width: 14%;">
          ${escapeHtml(leftDateStr)}
        </td>
        <td style="border: 1px solid #334155; text-align: center; font-size: 12px; font-weight: 500; color: #0f172a; padding: 3px 6px; width: 36%; word-break: keep-all;">
          ${escapeHtml(leftTitle)}
        </td>
        <td style="border: 1px solid #334155; text-align: center; font-size: 11.5px; font-weight: 700; color: #1e293b; background: #fafafa; width: 14%;">
          ${escapeHtml(rightDateStr)}
        </td>
        <td style="border: 1px solid #334155; text-align: center; font-size: 12px; font-weight: 500; color: #0f172a; padding: 3px 6px; width: 36%; word-break: keep-all;">
          ${escapeHtml(rightTitle)}
        </td>
      </tr>
    `;
  }

  // Trainees 3-column layout (성명 | 서명 | 성명 | 서명 | 성명 | 서명)
  // Ample height for manual signature
  const participants = schoolSettings.participants || [];
  const participantRowCount = Math.max(1, Math.ceil(participants.length / 3));
  let participantRows = '';

  for (let r = 0; r < participantRowCount; r++) {
    const p1 = participants[r * 3] || '';
    const p2 = participants[r * 3 + 1] || '';
    const p3 = participants[r * 3 + 2] || '';

    participantRows += `
      <tr style="height: 38px;">
        <td style="border: 1px solid #334155; text-align: center; font-size: 12px; font-weight: 600; color: #1e293b; width: 15%; background: #ffffff;">
          ${escapeHtml(p1)}
        </td>
        <td style="border: 1px solid #334155; width: 18%; background: #ffffff;"></td>
        <td style="border: 1px solid #334155; text-align: center; font-size: 12px; font-weight: 600; color: #1e293b; width: 15%; background: #ffffff;">
          ${escapeHtml(p2)}
        </td>
        <td style="border: 1px solid #334155; width: 18%; background: #ffffff;"></td>
        <td style="border: 1px solid #334155; text-align: center; font-size: 12px; font-weight: 600; color: #1e293b; width: 15%; background: #ffffff;">
          ${escapeHtml(p3)}
        </td>
        <td style="border: 1px solid #334155; width: 19%; background: #ffffff;"></td>
      </tr>
    `;
  }

  const container = document.createElement('div');
  container.style.width = '794px';
  container.style.height = '1123px';
  container.style.padding = '76px 57px 57px 57px'; // Top 20mm, Left/Right 15mm, Bottom 15mm
  container.style.boxSizing = 'border-box';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = `'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif`;
  container.style.position = 'relative';

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 22px;">
      <h1 style="font-size: 25px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 4px 0; color: #0f172a;">
        ${year}년 ${month}월 위생교육 실시기록
      </h1>
      <div style="font-size: 12px; color: #475569; font-weight: 500;">
        ( 모닝위생 신규과정 )
      </div>
    </div>

    <!-- Metadata Section -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; font-size: 13px; font-weight: 600; color: #1e293b; border-bottom: 2px solid #0f172a; padding-bottom: 6px;">
      <div>
        <span style="color: #64748b; font-weight: 500;">학교명 : </span>
        <span style="font-weight: 700; color: #0f172a;">${escapeHtml(schoolSettings.schoolName || '○○초등학교')}</span>
      </div>
      <div>
        <span style="color: #64748b; font-weight: 500;">교육기간 : </span>
        <span style="font-weight: 700; color: #0f172a;">${escapeHtml(periodText)}</span>
      </div>
    </div>

    <!-- Education Contents Table (4 columns) -->
    <div style="margin-bottom: 20px;">
      <div style="font-size: 12.5px; font-weight: 700; color: #0f172a; margin-bottom: 5px;">
        1. 위생교육 실시내용
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #0f172a;">
        <thead>
          <tr style="height: 30px; background-color: #f1f5f9; border-bottom: 1.5px solid #0f172a;">
            <th style="border: 1px solid #334155; font-size: 12px; font-weight: 700; color: #1e293b; width: 14%;">교육일</th>
            <th style="border: 1px solid #334155; font-size: 12px; font-weight: 700; color: #1e293b; width: 36%;">교육내용</th>
            <th style="border: 1px solid #334155; font-size: 12px; font-weight: 700; color: #1e293b; width: 14%;">교육일</th>
            <th style="border: 1px solid #334155; font-size: 12px; font-weight: 700; color: #1e293b; width: 36%;">교육내용</th>
          </tr>
        </thead>
        <tbody>
          ${eduTableRows}
        </tbody>
      </table>
    </div>

    <!-- Trainees / Signatures Table (6 columns) -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 12.5px; font-weight: 700; color: #0f172a; margin-bottom: 5px;">
        2. 교육이수대상자 확인 및 서명
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #0f172a;">
        <thead>
          <tr style="height: 28px; background-color: #f1f5f9; border-bottom: 1.5px solid #0f172a;">
            <th style="border: 1px solid #334155; font-size: 12px; font-weight: 700; color: #1e293b; width: 15%;">성명</th>
            <th style="border: 1px solid #334155; font-size: 12px; font-weight: 700; color: #1e293b; width: 18%;">서명</th>
            <th style="border: 1px solid #334155; font-size: 12px; font-weight: 700; color: #1e293b; width: 15%;">성명</th>
            <th style="border: 1px solid #334155; font-size: 12px; font-weight: 700; color: #1e293b; width: 18%;">서명</th>
            <th style="border: 1px solid #334155; font-size: 12px; font-weight: 700; color: #1e293b; width: 15%;">성명</th>
            <th style="border: 1px solid #334155; font-size: 12px; font-weight: 700; color: #1e293b; width: 19%;">서명</th>
          </tr>
        </thead>
        <tbody>
          ${participantRows}
        </tbody>
      </table>
    </div>

    <div style="font-size: 11px; color: #64748b; text-align: right; padding-top: 4px;">
      ※ 위 교육내용을 확인하고 이해하였음을 서명합니다.
    </div>
  `;

  return container;
}

/**
 * Creates an Evidence Cards Page DOM element (A4 size: 794px x 1123px)
 * displaying up to 9 cards in a 3x3 grid.
 */
function createEvidencePageElement(
  year: number,
  month: number,
  cards: Array<{
    day: number;
    date: string;
    title: string;
    dataUrl: string | null;
  }>,
  pageIndex: number,
  totalPages: number
): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '794px';
  container.style.height = '1123px';
  container.style.padding = '55px 57px 45px 57px';
  container.style.boxSizing = 'border-box';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = `'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif`;
  container.style.position = 'relative';

  // Header for evidence page
  let headerHtml = `
    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 18px;">
      <div>
        <h2 style="font-size: 18px; font-weight: 800; margin: 0; color: #0f172a;">
          ${year}년 ${month}월 위생교육 자료
        </h2>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          실제 교육을 실시한 일자별 위생교육 카드입니다.
        </div>
      </div>
      <div style="font-size: 11.5px; font-weight: 600; color: #475569;">
        교육자료 ${pageIndex + 1} / ${totalPages}
      </div>
    </div>
  `;

  // 3x3 Grid
  let gridHtml = `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px 14px;">`;

  for (const card of cards) {
    const parts = (card.date || '').split('-');
    const dateFormatted = parts.length === 3 ? `${parts[0]}.${parts[1]}.${parts[2]}` : card.date;

    const imgTag = card.dataUrl
      ? `<img src="${card.dataUrl}" style="width: 100%; height: 100%; object-fit: contain;" alt="${escapeHtml(card.title)}" />`
      : `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #94a3b8; font-size: 11px;">이미지 로드 불가</div>`;

    // CRITICAL: Day number is strictly OMITTED from caption
    gridHtml += `
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; background: #ffffff;">
        <div style="width: 100%; aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 5px; overflow: hidden; margin-bottom: 6px;">
          ${imgTag}
        </div>
        <div style="width: 100%; overflow: hidden;">
          <div style="font-size: 10.5px; color: #64748b; font-weight: 600; margin-bottom: 1px;">
            ${escapeHtml(dateFormatted)}
          </div>
          <div style="font-size: 11.5px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(card.title)}
          </div>
        </div>
      </div>
    `;
  }

  // Fill in empty slots if fewer than 9 cards on this page so the grid maintains its structure
  const emptySlots = 9 - cards.length;
  for (let e = 0; e < emptySlots; e++) {
    gridHtml += `<div style="visibility: hidden;"></div>`;
  }

  gridHtml += `</div>`;
  container.innerHTML = headerHtml + gridHtml;

  return container;
}

/**
 * Generates and downloads the Morning Hygiene (신규) Monthly Education Log as a direct PDF file.
 */
export async function generateMorningNewMonthlyPdf(
  options: MorningNewPdfOptions
): Promise<PdfGenerationResult> {
  const { year, month, records, includeMaterials } = options;

  if (!records || records.length === 0) {
    throw new Error(`${year}년 ${month}월에 기록된 교육이 없습니다.`);
  }

  const monthStr = String(month).padStart(2, '0');
  const baseName = includeMaterials
    ? `${year}년${monthStr}월_모닝위생신규_교육자료포함`
    : `${year}년${monthStr}월_모닝위생신규_교육일지`;
  const sanitizedFileName = `${baseName.replace(/[/\\?%*:|"<>]/g, '')}.pdf`;

  // Hidden off-screen staging container
  const stagingContainer = document.createElement('div');
  stagingContainer.style.position = 'fixed';
  stagingContainer.style.left = '-9999px';
  stagingContainer.style.top = '0';
  stagingContainer.style.zIndex = '-1000';
  document.body.appendChild(stagingContainer);

  const failedImages: string[] = [];

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 1. Render Page 1 (Education Log)
    const logPage = createLogPageElement(options);
    stagingContainer.appendChild(logPage);

    const logCanvas = await html2canvas(logPage, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    const logImgData = logCanvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(logImgData, 'JPEG', 0, 0, 210, 297);
    stagingContainer.removeChild(logPage);

    // 2. Render Evidence Pages if requested
    if (includeMaterials) {
      // Deduplicate cards by Day number so same day image is displayed once
      const sortedRecords = [...records].sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.day - b.day);
      const uniqueCards: Array<{
        day: number;
        date: string;
        title: string;
        image: string;
      }> = [];
      const seenDays = new Set<number>();

      for (const r of sortedRecords) {
        if (!seenDays.has(r.day)) {
          seenDays.add(r.day);
          const pad = String(r.day).padStart(3, '0');
          uniqueCards.push({
            day: r.day,
            date: r.date,
            title: r.title,
            image: r.image || `day${pad}.webp`
          });
        }
      }

      // Pre-fetch all images as data URLs safely
      const cardsWithDataUrls: Array<{
        day: number;
        date: string;
        title: string;
        dataUrl: string | null;
      }> = [];

      for (const card of uniqueCards) {
        const imageUrl = getMorningNewImageUrl(card.image || card.day);
        const dataUrl = await fetchImageDataUrl(imageUrl);
        if (!dataUrl) {
          failedImages.push(`Day ${card.day} (${card.title})`);
        }
        cardsWithDataUrls.push({
          day: card.day,
          date: card.date,
          title: card.title,
          dataUrl
        });
      }

      // Chunk cards into 9 per page (3x3 grid)
      const pageSize = 9;
      const totalEvidencePages = Math.ceil(cardsWithDataUrls.length / pageSize);

      for (let p = 0; p < totalEvidencePages; p++) {
        const pageCards = cardsWithDataUrls.slice(p * pageSize, (p + 1) * pageSize);
        const evidencePageElement = createEvidencePageElement(
          year,
          month,
          pageCards,
          p,
          totalEvidencePages
        );
        stagingContainer.appendChild(evidencePageElement);

        const pageCanvas = await html2canvas(evidencePageElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);

        pdf.addPage();
        pdf.addImage(pageImgData, 'JPEG', 0, 0, 210, 297);
        stagingContainer.removeChild(evidencePageElement);
      }
    }

    // Direct download as PDF
    pdf.save(sanitizedFileName);

    return {
      success: true,
      fileName: sanitizedFileName,
      failedImages
    };
  } finally {
    if (document.body.contains(stagingContainer)) {
      document.body.removeChild(stagingContainer);
    }
  }
}
