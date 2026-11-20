import { CameraService, cameraErrorMessage } from '../camera/CameraService.ts';
import { HandTrackingService } from '../vision/HandTrackingService.ts';
import { HandIdentityManager } from '../vision/HandIdentityManager.ts';
import { LandmarkSmoother } from '../vision/LandmarkSmoother.ts';
import { VISION_CONFIG } from '../vision/VisionConfig.ts';
import type { HandFrame } from '../vision/types.ts';
import { SkeletonRenderer } from '../rendering/SkeletonRenderer.ts';
import { HUDController } from '../ui/HUDController.ts';
import type { AppView } from '../ui/AppView.ts';
import type { ParticleEngine } from '../particles/ParticleEngine.ts';

export class AppController {
  private view: AppView;
  private camera: CameraService;
  private tracking = new HandTrackingService();
  private identities = new HandIdentityManager();
  private smoother = new LandmarkSmoother();
  private renderer: SkeletonRenderer;
  private hud: HUDController;
  private events = new AbortController();
  private session = 0;
  private running = false;
  private starting = false;
  private renderCallback = 0;
  private visionCallback = 0;
  private videoCallback: number | null = null;
  private lastVideoTime = -1;
  private lastInference = -Infinity;
  private lastVideoFrame = 0;
  private hands: HandFrame[] = [];
  private particles: ParticleEngine | null = null;
  private particleRequest = 0;

  constructor(view: AppView) {
    this.view = view;
    this.camera = new CameraService(view.video);
    this.renderer = new SkeletonRenderer(view.canvas);
    this.hud = new HUDController(view);
    this.hud.reset();
    const { signal } = this.events;
    view.start.addEventListener('click', () => { void this.start(); }, { signal });
    view.stop.addEventListener('click', () => this.stop(), { signal });
    view.mirror.addEventListener('change', () => view.stage.classList.toggle('mirrored', view.mirror.checked), { signal });
    view.smoothing.addEventListener('change', () => this.smoother.reset(), { signal });
    view.particlesEnabled.addEventListener('change', () => {
      if (view.particlesEnabled.checked) void this.enableParticles(this.session);
      else this.disableParticles();
    }, { signal });
    view.videoReference.addEventListener('change', () => view.stage.classList.toggle('video-hidden', !view.videoReference.checked), { signal });
    view.indices.addEventListener('change', () => { if (view.indices.checked) view.skeletonEnabled.checked = true; }, { signal });
    view.spread.addEventListener('input', () => { view.spreadValue.value = `${view.spread.value}%`; }, { signal });
    this.camera.onEnded = () => this.fail('摄像头视频流已中断。请检查连接，然后重新启动。');
    window.addEventListener('pagehide', () => this.stop(), { signal });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.lastVideoFrame = performance.now(); }, { signal });
  }

  private async start(): Promise<void> {
    if (this.starting || this.running) return;
    const session = ++this.session;
    this.starting = true;
    this.view.start.disabled = true; this.view.stop.disabled = false;
    this.view.error.hidden = true;
    this.view.particleWarning.hidden = true;
    this.view.cameraState.textContent = '启动中';
    this.view.emptyTitle.textContent = '正在启动';
    this.view.emptyDescription.textContent = '请在浏览器中允许本地摄像头访问。';
    this.view.status.textContent = '等待摄像头权限与视频流…';
    try {
      const settings = await this.camera.start();
      if (session !== this.session) return;
      this.view.empty.hidden = true;
      this.hud.camera(settings.width ?? this.view.video.videoWidth, settings.height ?? this.view.video.videoHeight);
      const delegate = await this.tracking.initialize((status) => {
        if (session === this.session) this.view.status.textContent = status;
      });
      if (session !== this.session) return;
      this.hud.backend(delegate);
      this.starting = false; this.running = true;
      this.view.root.dataset.camera = 'running';
      this.view.cameraState.textContent = '运行中';
      this.view.status.textContent = `追踪已启动（${delegate}）。将一只或两只手放入画面，掌面与五指粒子会持续跟随。`;
      this.lastVideoFrame = performance.now();
      this.scheduleVision(session);
      this.draw(session);
      void this.enableParticles(session);
    } catch (error) {
      if (session !== this.session) return;
      console.error('Camera / tracking startup failed:', error);
      this.fail(cameraErrorMessage(error));
    }
  }

  private scheduleVision(session: number): void {
    if (!this.running || session !== this.session) return;
    if (typeof this.view.video.requestVideoFrameCallback === 'function') {
      this.videoCallback = this.view.video.requestVideoFrameCallback((now) => {
        this.videoCallback = null;
        this.infer(now, session);
        this.scheduleVision(session);
      });
    } else {
      this.visionCallback = requestAnimationFrame((now) => {
        if (this.view.video.currentTime !== this.lastVideoTime) this.infer(now, session);
        this.scheduleVision(session);
      });
    }
  }

  private infer(now: number, session: number): void {
    if (!this.running || session !== this.session || this.view.video.readyState < 2) return;
    this.lastVideoTime = this.view.video.currentTime;
    this.lastVideoFrame = now;
    if (now - this.lastInference < 1000 / VISION_CONFIG.inferenceFps - 1) return;
    try {
      const started = performance.now();
      const observations = this.tracking.detect(this.view.video, now);
      this.hud.sample(now, performance.now() - started);
      const matched = this.identities.update(observations, now);
      this.hands = this.view.smoothing.checked ? matched.map((frame) => this.smoother.update(frame)) : matched;
      this.smoother.prune(now);
      this.lastInference = now;
    } catch (error) {
      console.error('Hand inference failed:', error);
      this.fail('手部推理中断。请检查本地 WASM 与浏览器支持，然后重新启动摄像头。');
    }
  }

  private draw(session: number): void {
    if (!this.running || session !== this.session) return;
    const now = performance.now();
    if (!document.hidden && now - this.lastVideoFrame > VISION_CONFIG.stalledVideoMs) {
      this.fail('摄像头持续未输出新视频帧。请检查设备占用后重试。'); return;
    }
    const hands = now - this.lastInference > VISION_CONFIG.staleResultMs ? [] : this.hands;
    this.renderer.render(this.view.skeletonEnabled.checked ? hands : [], this.view.video.videoWidth, this.view.video.videoHeight, this.view.mirror.checked, this.view.indices.checked);
    if (this.particles) {
      try {
        const stats = this.particles.render(hands, this.view.video.videoWidth, this.view.video.videoHeight, this.view.mirror.checked, now, Number(this.view.spread.value) / 100);
        this.hud.particles(stats.surface, stats.joints);
      } catch (error) {
        console.warn('Particle rendering failed; hand tracking continues.', error);
        this.particleFallback(error instanceof Error ? error.message : '粒子渲染不可用，已保留骨骼调试。');
      }
    }
    this.hud.hands(hands, true);
    this.renderCallback = requestAnimationFrame(() => this.draw(session));
  }

  stop(): void {
    this.session++; this.starting = false; this.running = false;
    cancelAnimationFrame(this.renderCallback); cancelAnimationFrame(this.visionCallback);
    if (this.videoCallback !== null) this.view.video.cancelVideoFrameCallback(this.videoCallback);
    this.videoCallback = null;
    this.camera.stop(); this.tracking.dispose(); this.identities.reset(); this.smoother.reset();
    this.disableParticles();
    this.hands = []; this.lastInference = -Infinity; this.lastVideoTime = -1;
    this.renderer.clear(); this.hud.reset();
    this.view.root.dataset.camera = 'stopped';
    this.view.start.disabled = false; this.view.stop.disabled = true;
    this.view.cameraState.textContent = '已停止';
    this.view.empty.hidden = false; this.view.emptyTitle.textContent = '摄像头已停止';
    this.view.emptyDescription.textContent = '视频流已释放。点击 Start Camera 可重新启动。';
    this.view.status.textContent = '已停止识别并释放摄像头、模型和推理资源。';
    this.view.error.hidden = true;
    this.view.particleWarning.hidden = true;
  }

  private async enableParticles(session: number): Promise<void> {
    if (!this.running || !this.view.particlesEnabled.checked || this.particles) return;
    const request = ++this.particleRequest;
    this.hud.particleBackend('加载中');
    this.view.particleWarning.hidden = true;
    try {
      const { ParticleEngine } = await import('../particles/ParticleEngine.ts');
      if (session !== this.session || request !== this.particleRequest || !this.running || !this.view.particlesEnabled.checked) return;
      this.particles = new ParticleEngine(this.view.particleHost, (message) => this.particleFallback(message));
      this.view.stage.classList.add('has-particles');
      this.hud.particleBackend('WebGL2');
    } catch (error) {
      if (session !== this.session || request !== this.particleRequest) return;
      console.warn('Particle renderer unavailable; hand tracking continues.', error);
      this.particleFallback('WebGL2 粒子渲染初始化失败，已保留摄像头与骨骼调试。');
    }
  }

  private disableParticles(): void {
    this.particleRequest++;
    this.particles?.dispose(); this.particles = null;
    this.view.stage.classList.remove('has-particles');
    this.hud.particles(0, 0); this.hud.particleBackend(this.running ? '已关闭' : '未启动');
  }

  private particleFallback(message: string): void {
    this.disableParticles();
    this.view.particlesEnabled.checked = false; this.view.skeletonEnabled.checked = true; this.view.videoReference.checked = true;
    this.view.stage.classList.remove('video-hidden');
    this.hud.particleBackend('骨骼回退');
    this.view.particleWarning.textContent = message; this.view.particleWarning.hidden = false;
  }

  private fail(message: string): void {
    this.stop();
    this.view.cameraState.textContent = '出错'; this.view.emptyTitle.textContent = '无法继续追踪';
    this.view.emptyDescription.textContent = '查看下方错误提示，处理后可重新启动。';
    this.view.error.textContent = message; this.view.error.hidden = false;
    this.view.status.textContent = '启动或运行失败，已有视频流和推理资源已释放。';
  }

  dispose(): void { this.stop(); this.events.abort(); this.camera.onEnded = null; this.renderer.dispose(); }
}
