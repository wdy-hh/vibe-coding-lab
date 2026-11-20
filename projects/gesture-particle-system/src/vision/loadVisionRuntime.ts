import type { HandLandmarker } from '@mediapipe/tasks-vision';
import assets from '../../vision-assets.lock.json' with { type: 'json' };
import type { VisionDelegate } from './DelegateFactory.ts';
import { VISION_CONFIG } from './VisionConfig.ts';

export type LandmarkerHandle = Pick<HandLandmarker, 'close' | 'detectForVideo'>;
export type VisionRuntimeFactory = (delegate: VisionDelegate) => Promise<LandmarkerHandle>;
export type VisionRuntimeLoader = (signal: AbortSignal, onStatus: (status: string) => void) => Promise<VisionRuntimeFactory>;

export const loadVisionRuntime: VisionRuntimeLoader = async (signal, onStatus) => {
  onStatus('正在校验本地手部模型…');
  const response = await fetch(`${import.meta.env.BASE_URL}${assets.model.path}`, { signal });
  if (!response.ok) throw new Error(`本地模型加载失败（HTTP ${response.status}），请运行 npm run assets:prepare。`);
  const buffer = await response.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  if (buffer.byteLength !== assets.model.bytes || hash !== assets.model.sha256) {
    throw new Error('本地模型不完整或校验失败，请运行 npm run assets:download。');
  }
  signal.throwIfAborted();
  onStatus('正在初始化本地 WASM 与推理后端…');
  const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
  const fileset = await FilesetResolver.forVisionTasks(`${import.meta.env.BASE_URL}${assets.wasmDirectory}`);
  signal.throwIfAborted();
  return (delegate) => HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetBuffer: new Uint8Array(buffer), delegate },
    runningMode: 'VIDEO', numHands: VISION_CONFIG.numHands,
    minHandDetectionConfidence: VISION_CONFIG.detectionConfidence,
    minHandPresenceConfidence: VISION_CONFIG.presenceConfidence,
    minTrackingConfidence: VISION_CONFIG.trackingConfidence,
  });
};
