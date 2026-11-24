import type { ProductItem, VisualStyleId } from '../types';
import { splitHighlights } from './mockGenerator';
import { downloadFile } from './csvHelper';

export const POSTER_SIZE = 800;
const FONT = '"Microsoft YaHei", "PingFang SC", sans-serif';

/** Character-width wrapping works for Chinese, Latin text and Unicode code points. */
export function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 2): number {
  if (maxLines <= 0 || maxWidth <= 0) return 0;
  const characters = Array.from(text);
  const lines: string[] = [];
  let current = '';
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    if (character === '\r') continue;
    const overflow = character !== '\n' && ctx.measureText(current + character).width > maxWidth;
    if (character === '\n' || (overflow && current)) {
      lines.push(current);
      current = character === '\n' ? '' : character;
      if (lines.length === maxLines) {
        let last = lines[maxLines - 1];
        while (last && ctx.measureText(last + '…').width > maxWidth) last = Array.from(last).slice(0, -1).join('');
        lines[maxLines - 1] = last + '…';
        current = '';
        break;
      }
    } else current += character;
  }
  if (current && lines.length < maxLines) lines.push(current);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight, maxWidth));
  return lines.length;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fill: string): void {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => { if (!image.naturalWidth || !image.naturalHeight) reject(new Error('图片尺寸无效，请重新上传。')); else resolve(image); };
    image.onerror = () => reject(new Error('无法读取商品图片，请重新上传 JPG、PNG 或 WebP。'));
    image.src = url;
  });
}

function pill(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, bg: string, fg: string, maxWidth: number): number {
  ctx.font = `500 21px ${FONT}`;
  let text = value;
  while (text && ctx.measureText(text).width > maxWidth - 36) text = Array.from(text).slice(0, -1).join('');
  const width = ctx.measureText(text).width + 36;
  roundedRect(ctx, x, y, width, 44, 22, bg);
  ctx.fillStyle = fg;
  ctx.fillText(text, x + 18, y + 29);
  return width;
}

export async function renderProductPoster(target: HTMLCanvasElement, product: ProductItem, style: VisualStyleId): Promise<void> {
  const image = product.imageUrl ? await loadImage(product.imageUrl) : null;
  // Compose offscreen so asynchronous image loads never leave half-drawn previews.
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = POSTER_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('此浏览器无法使用 Canvas，请尝试更新浏览器。');
  const isRed = style === 'promo-red', isDark = style === 'luxury-black', isGreen = style === 'fresh-green';
  const ink = isDark ? '#e6cf9c' : isRed ? '#fff8ea' : isGreen ? '#29483d' : '#242b2b';
  if (isRed) {
    const gradient = ctx.createLinearGradient(0, 0, 800, 800);
    gradient.addColorStop(0, '#e64232'); gradient.addColorStop(1, '#ff793d');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 800, 800);
    roundedRect(ctx, 18, 18, 764, 764, 4, '#fff8ee');
    ctx.fillStyle = '#ea4734'; ctx.fillRect(18, 18, 764, 201);
    ctx.fillRect(18, 684, 764, 98);
  } else if (isDark) {
    const gradient = ctx.createRadialGradient(410, 390, 20, 400, 400, 600);
    gradient.addColorStop(0, '#3c3b35'); gradient.addColorStop(1, '#151b1b');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 800, 800);
    ctx.strokeStyle = '#b6a17b'; ctx.lineWidth = 1.5; ctx.strokeRect(23, 23, 754, 754);
    ctx.strokeStyle = '#74664d'; ctx.strokeRect(31, 31, 738, 738);
  } else if (isGreen) {
    ctx.fillStyle = '#e3eddb'; ctx.fillRect(0, 0, 800, 800);
    roundedRect(ctx, 27, 27, 746, 746, 30, '#f2f6eb');
    ctx.fillStyle = '#d3e2c9'; ctx.beginPath(); ctx.arc(748, 45, 135, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#dce8d2'; ctx.beginPath(); ctx.arc(70, 720, 200, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#adc59a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(660, 120); ctx.quadraticCurveTo(699, 82, 704, 49); ctx.stroke();
  } else {
    ctx.fillStyle = '#f1f1ed'; ctx.fillRect(0, 0, 800, 800);
    const gradient = ctx.createLinearGradient(0, 250, 800, 600);
    gradient.addColorStop(0, '#f1f1ed'); gradient.addColorStop(.5, '#fafaf6'); gradient.addColorStop(1, '#e9e9e2');
    ctx.fillStyle = gradient; ctx.fillRect(0, 210, 800, 590);
    ctx.fillStyle = '#e4e4dd'; ctx.beginPath(); ctx.ellipse(414, 623, 261, 49, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#deded5'; ctx.fillRect(154, 620, 520, 25);
    ctx.fillStyle = '#e9e9e2'; ctx.beginPath(); ctx.ellipse(414, 620, 260, 39, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = isRed ? '#ffddae' : isDark ? '#a99b7e' : isGreen ? '#698763' : '#898d84';
  ctx.font = `500 15px ${FONT}`;
  ctx.letterSpacing = '4px';
  ctx.fillText(isRed ? 'NEW SEASON · LIMITED OFFER' : isDark ? 'THE ART OF EVERYDAY' : isGreen ? 'A LITTLE JOY IN EVERYDAY' : 'URBAN ESSENTIALS', 52, 63);
  ctx.letterSpacing = '0px';

  const title = product.generated?.posterTitle || product.name || '让好商品，自带好内容';
  ctx.fillStyle = ink;
  ctx.font = `bold 52px ${FONT}`;
  drawWrappedText(ctx, title, 50, 128, 700, 66, 2);

  if (image) {
    const maxWidth = 604, maxHeight = 468;
    const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
    const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
    ctx.save();
    if (isDark) { ctx.shadowColor = '#00000080'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 20; }
    ctx.drawImage(image, (800 - width) / 2, 220 + (maxHeight - height) / 2, width, height);
    ctx.restore();
  } else {
    ctx.strokeStyle = isDark ? '#8c8069' : '#b8c0b3'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
    ctx.strokeRect(220, 280, 360, 300); ctx.setLineDash([]);
    ctx.fillStyle = isDark ? '#bcb09a' : '#7b8575'; ctx.font = `24px ${FONT}`;
    ctx.textAlign = 'center'; ctx.fillText('上传商品图，完成你的主图', 400, 440); ctx.textAlign = 'left';
  }

  const tags = splitHighlights(product.highlights).slice(0, 3);
  if (!tags.length) tags.push('细节用心', '日常实用', '质感之选');
  const tagBg = isDark ? '#34352e' : isRed ? '#fff4dc' : isGreen ? '#dce8d0' : '#ffffffd9';
  const tagInk = isDark ? '#e0cdab' : isRed ? '#be3b24' : isGreen ? '#496743' : '#595f56';
  const widths = tags.map(tag => { ctx.font = `500 21px ${FONT}`; return Math.min(ctx.measureText(tag).width + 36, 220); });
  let x = (800 - widths.reduce((sum, width) => sum + width, 0) - (tags.length - 1) * 12) / 2;
  tags.forEach(tag => { x += pill(ctx, tag, x, isRed ? 715 : 707, tagBg, tagInk, 220) + 12; });

  if (product.badgeText) {
    const badge = Array.from(product.badgeText).slice(0, 12).join('');
    ctx.font = `bold 22px ${FONT}`;
    const width = Math.min(292, ctx.measureText(badge).width + 36);
    const badgeX = 748 - width;
    roundedRect(ctx, badgeX, 226, width, 51, isGreen ? 14 : 4, isRed ? '#ffe18a' : isDark ? '#d6bd88' : isGreen ? '#50774b' : '#262d2a');
    ctx.fillStyle = isRed ? '#b8301e' : isDark ? '#26251e' : '#ffffff';
    drawWrappedText(ctx, badge, badgeX + 18, 260, width - 36, 28, 1);
  }
  target.width = target.height = POSTER_SIZE;
  const targetContext = target.getContext('2d');
  if (!targetContext) throw new Error('无法绘制主图。');
  targetContext.drawImage(canvas, 0, 0);
}

export async function exportPoster(product: ProductItem): Promise<void> {
  const canvas = document.createElement('canvas');
  await renderProductPoster(canvas, product, product.generated?.visualStyle ?? 'minimal-white');
  // toDataURL is deliberately used here: all images are local Data URLs, so it stays origin-clean.
  const dataUrl = canvas.toDataURL('image/png');
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const safeName = (product.name || '商品').replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-');
  downloadFile(blob, `${safeName}-主图.png`);
}
