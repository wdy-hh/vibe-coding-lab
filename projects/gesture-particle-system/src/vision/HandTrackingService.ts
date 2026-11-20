import { adaptHandResult } from './adaptHandResult.ts';
import { createWithDelegateFallback } from './DelegateFactory.ts';
import type { VisionDelegate } from './DelegateFactory.ts';
import { loadVisionRuntime } from './loadVisionRuntime.ts';
import type { LandmarkerHandle, VisionRuntimeLoader } from './loadVisionRuntime.ts';
import type { HandObservation } from './types.ts';

export class HandTrackingService {
  private landmarker: LandmarkerHandle | null = null;
  private initializing: Promise<VisionDelegate> | null = null;
  private abort: AbortController | null = null;
  private generation = 0;
  private lastTimestamp = -1;
  private preferred?: 'CPU';
  private loadRuntime: VisionRuntimeLoader;
  delegate: VisionDelegate | null = null;

  constructor(options: { preferredDelegate?: 'CPU'; loadRuntime?: VisionRuntimeLoader } = {}) {
    this.preferred = options.preferredDelegate;
    this.loadRuntime = options.loadRuntime ?? loadVisionRuntime;
  }

  initialize(onStatus: (status: string) => void = () => {}): Promise<VisionDelegate> {
    const generation = ++this.generation;
    this.abort?.abort();
    const previous = this.initializing;
    const run = async (): Promise<VisionDelegate> => {
      // Serialize construction, including a cancelled previous initialization.
      if (previous) await previous.catch(() => {});
      const ensureCurrent = () => {
        if (generation !== this.generation) throw new DOMException('Initialization cancelled', 'AbortError');
      };
      ensureCurrent();
      this.releaseLandmarker();
      const abort = new AbortController();
      this.abort = abort;
      const create = await this.loadRuntime(abort.signal, onStatus);
      ensureCurrent();
      const result = this.preferred === 'CPU'
        ? { resource: await create('CPU'), delegate: 'CPU' as const }
        : await createWithDelegateFallback(create, () => onStatus('GPU 初始化失败，正在尝试 CPU…'), () => generation !== this.generation);
      if (generation !== this.generation) {
        this.closeResource(result.resource);
        ensureCurrent();
      }
      this.landmarker = result.resource;
      this.delegate = result.delegate;
      this.lastTimestamp = -1;
      return result.delegate;
    };
    const promise = run();
    this.initializing = promise;
    void promise.finally(() => { if (this.initializing === promise) this.initializing = null; }).catch(() => {});
    return promise;
  }

  detect(video: HTMLVideoElement, timestamp: number): HandObservation[] {
    if (!this.landmarker) return [];
    this.lastTimestamp = Math.max(timestamp, this.lastTimestamp + 0.001);
    return adaptHandResult(this.landmarker.detectForVideo(video, this.lastTimestamp), this.lastTimestamp);
  }

  dispose(): void {
    this.generation++;
    this.abort?.abort();
    this.abort = null;
    this.releaseLandmarker();
    this.lastTimestamp = -1;
  }

  private releaseLandmarker(): void {
    const resource = this.landmarker;
    this.landmarker = null;
    this.delegate = null;
    if (resource) this.closeResource(resource);
  }

  private closeResource(resource: LandmarkerHandle): void {
    try { resource.close(); }
    catch (error) { console.warn('MediaPipe resource cleanup reported an error.', error); }
  }
}
