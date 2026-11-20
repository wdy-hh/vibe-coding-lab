import type { AppView } from './AppView.ts';
import type { HandFrame, Handedness } from '../vision/types.ts';

const sideText = (side: Handedness): string => side === 'Left' ? '左手' : side === 'Right' ? '右手' : '未定';

export class HUDController {
  private view: AppView;
  private lastKey = '';
  private lastMetrics = 0;
  private samples: Array<{ timestamp: number; duration: number }> = [];
  constructor(view: AppView) { this.view = view; }

  reset(): void {
    this.samples = []; this.lastKey = ''; this.lastMetrics = 0;
    for (const id of ['resolution', 'delegate', 'inference-fps', 'inference-time']) this.view.get(`#${id}`).textContent = '—';
    this.particles(0, 0); this.particleBackend('未启动');
    this.hands([], false);
  }

  camera(width: number, height: number): void { this.view.get('#resolution').textContent = `${width} × ${height}`; }
  backend(delegate: string): void { this.view.get('#delegate').textContent = delegate; }

  particleBackend(backend: string): void { this.view.get('#particle-backend').textContent = backend; }
  particles(surface: number, joints: number): void {
    const surfaceText = surface.toLocaleString(), jointText = joints.toLocaleString();
    if (this.view.get('#surface-count').textContent !== surfaceText) this.view.get('#surface-count').textContent = surfaceText;
    if (this.view.get('#joint-count').textContent !== jointText) this.view.get('#joint-count').textContent = jointText;
  }

  sample(timestamp: number, duration: number): void {
    this.samples.push({ timestamp, duration });
    while (this.samples.length && timestamp - this.samples[0].timestamp > 1500) this.samples.shift();
    if (timestamp - this.lastMetrics < 400) return;
    this.lastMetrics = timestamp;
    const span = timestamp - this.samples[0].timestamp;
    this.view.get('#inference-fps').textContent = span > 0 ? `${((this.samples.length - 1) * 1000 / span).toFixed(1)} Hz` : '采样中';
    this.view.get('#inference-time').textContent = `${(this.samples.reduce((sum, item) => sum + item.duration, 0) / this.samples.length).toFixed(1)} ms`;
  }

  hands(hands: readonly HandFrame[], running: boolean): void {
    const key = `${running}:${hands.map((hand) => `${hand.id}/${hand.handedness}/${hand.observedHandedness}/${hand.confidence.toFixed(2)}/${!!hand.worldLandmarks}`).join(',')}`;
    if (key === this.lastKey) return;
    this.lastKey = key;
    this.view.get('#hand-count').textContent = String(hands.length);
    this.view.get('#hand-summary').textContent = hands.length ? `已追踪 ${hands.length * 21} 个关键点` : running ? '等待手部进入画面' : '等待摄像头启动';
    this.view.get('#left-state').textContent = hands.some((hand) => hand.handedness === 'Left') ? '已识别' : '—';
    this.view.get('#right-state').textContent = hands.some((hand) => hand.handedness === 'Right') ? '已识别' : '—';
    this.view.get('#world-state').textContent = hands.length ? (hands.every((hand) => hand.worldLandmarks?.length === 21) ? '已接收 · 估计值' : '本帧无数据') : '等待数据';
    this.view.get('#hand-details').replaceChildren(...hands.map((hand) => {
      const card = document.createElement('div'); card.className = 'hand-card';
      const title = document.createElement('strong'); title.textContent = `${sideText(hand.handedness)} · ${hand.id}`;
      const score = document.createElement('span'); score.textContent = `SDK 左右分类：${sideText(hand.observedHandedness)} ${(hand.confidence * 100).toFixed(0)}%`;
      card.append(title, score); return card;
    }));
  }
}
