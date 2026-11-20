import { containRect, displayPoint } from '../utils/CoordinateUtils.ts';
import type { HandFrame } from '../vision/types.ts';

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
] as const;
const TIPS = new Set([4, 8, 12, 16, 20]);

export class SkeletonRenderer {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private observer: ResizeObserver;
  private width = 0;
  private height = 0;
  private dpr = 1;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('浏览器无法创建骨骼绘图画布，请使用新版 Chrome 或 Edge。');
    this.context = context;
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    this.resize();
  }
  private resize(): void {
    const { width, height } = this.canvas.getBoundingClientRect();
    this.width = width; this.height = height;
    this.dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(width * this.dpr); this.canvas.height = Math.round(height * this.dpr);
  }
  render(hands: readonly HandFrame[], videoWidth: number, videoHeight: number, mirrored: boolean, indices: boolean): void {
    const ctx = this.context;
    if (this.dpr !== Math.min(globalThis.devicePixelRatio || 1, 2)) this.resize();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    const rect = containRect(videoWidth, videoHeight, this.width, this.height);
    if (!rect.width) return;
    ctx.save(); ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.width, rect.height); ctx.clip();
    for (const hand of hands) {
      const color = Number(hand.id.split('-')[1]) % 2 ? '#67e8f9' : '#b49bff';
      const points = hand.landmarks.map((p) => displayPoint(p.x, p.y, rect, mirrored));
      ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.beginPath();
      for (const [a, b] of CONNECTIONS) { ctx.moveTo(points[a].x, points[a].y); ctx.lineTo(points[b].x, points[b].y); }
      ctx.stroke();
      points.forEach((point, index) => {
        ctx.beginPath(); ctx.arc(point.x, point.y, TIPS.has(index) || index === 0 ? 4.5 : 2.6, 0, Math.PI * 2);
        ctx.fillStyle = TIPS.has(index) || index === 0 ? '#f5fbff' : color; ctx.fill();
        if (indices) { ctx.font = '12px Consolas, monospace'; ctx.fillStyle = '#ffffff'; ctx.fillText(String(index), point.x + 6, point.y - 6); }
      });
      const center = displayPoint(hand.palmCenter.x, hand.palmCenter.y, rect, mirrored);
      ctx.beginPath(); ctx.arc(center.x, center.y, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = color; ctx.font = '14px Consolas, monospace';
      ctx.fillText(`${hand.handedness} / ${hand.id}`, points[0].x + 10, points[0].y + 22);
    }
    ctx.restore();
  }
  clear(): void { this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); }
  dispose(): void { this.observer.disconnect(); this.clear(); this.canvas.width = 0; this.canvas.height = 0; }
}
