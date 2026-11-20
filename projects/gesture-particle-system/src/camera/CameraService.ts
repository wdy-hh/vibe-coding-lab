import { CAMERA_CONFIG } from './CameraConfig.ts';

export interface CameraEnvironment {
  secure: boolean;
  getUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
}

export function cameraErrorMessage(error: unknown): string {
  const name = error instanceof Error ? error.name : '';
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return '摄像头权限被拒绝。请在地址栏的网站权限中允许摄像头，然后重试。';
    case 'NotFoundError': return '没有找到摄像头。请检查普通 RGB 摄像头的连接。';
    case 'NotReadableError':
    case 'TrackStartError': return '无法读取摄像头。请关闭占用摄像头的程序，并检查 Windows 摄像头隐私设置。';
    case 'OverconstrainedError': return '摄像头不支持请求的参数。请检查设备设置后重试。';
    case 'AbortError': return '摄像头启动已取消。';
    default: return error instanceof Error ? error.message : '摄像头启动失败，请检查设备后重试。';
  }
}

/** Owns only this application's stream; late permission results are stopped too. */
export class CameraService {
  private video: HTMLVideoElement;
  private environment?: CameraEnvironment;
  private stream: MediaStream | null = null;
  private generation = 0;
  private cancelPlayback: (() => void) | null = null;
  private endedListeners: Array<() => void> = [];
  onEnded: (() => void) | null = null;

  constructor(video: HTMLVideoElement, environment?: CameraEnvironment) {
    this.video = video;
    this.environment = environment;
  }

  async start(): Promise<MediaTrackSettings> {
    this.stop();
    const generation = this.generation;
    const environment = this.environment ?? {
      secure: globalThis.isSecureContext,
      getUserMedia: navigator.mediaDevices?.getUserMedia.bind(navigator.mediaDevices),
    };
    if (!environment.secure) throw new Error('摄像头需要安全环境。请通过 localhost 或 HTTPS 打开。');
    if (!environment.getUserMedia) throw new Error('当前浏览器不支持摄像头接口，请使用新版 Chrome 或 Edge。');

    const stream = await environment.getUserMedia(CAMERA_CONFIG);
    if (generation !== this.generation) {
      stream.getTracks().forEach((track) => track.stop());
      throw new DOMException('Camera start cancelled', 'AbortError');
    }
    this.stream = stream;
    this.video.srcObject = stream;
    this.video.muted = true;
    this.video.playsInline = true;
    for (const track of stream.getTracks()) {
      const ended = () => { this.onEnded?.(); };
      track.addEventListener('ended', ended, { once: true });
      this.endedListeners.push(() => track.removeEventListener('ended', ended));
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        this.video.play(),
        new Promise<never>((_, reject) => {
          this.cancelPlayback = () => reject(new DOMException('Camera start cancelled', 'AbortError'));
          timer = setTimeout(() => reject(new Error('摄像头未能输出视频，请检查设备占用后重试。')), 12_000);
        }),
      ]);
      if (generation !== this.generation) throw new DOMException('Camera start cancelled', 'AbortError');
      return stream.getVideoTracks()[0]?.getSettings() ?? {};
    } catch (error) {
      if (generation === this.generation) this.stop();
      throw error;
    } finally {
      clearTimeout(timer);
      if (generation === this.generation) this.cancelPlayback = null;
    }
  }

  stop(): void {
    this.generation++;
    this.cancelPlayback?.();
    this.cancelPlayback = null;
    this.endedListeners.forEach((remove) => remove());
    this.endedListeners = [];
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.video.pause();
    this.video.srcObject = null;
  }
}
