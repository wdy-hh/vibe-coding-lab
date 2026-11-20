import { OrthographicCamera, Scene, Vector4, WebGLRenderer } from 'three';
import { containRect } from '../utils/CoordinateUtils.ts';
import type { HandFrame } from '../vision/types.ts';
import { PARTICLE_CONFIG } from './ParticleConfig.ts';
import { ParticleHand } from './ParticleHand.ts';
import type { ParticleUniforms } from './ParticleHand.ts';

export interface ParticleStats { surface: number; joints: number; drawCalls: number }

/** Two reusable hand buffers. Inference/camera ownership stays in AppController. */
export class ParticleEngine {
  private host: HTMLElement;
  private canvas = document.createElement('canvas');
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new OrthographicCamera(0, 1, 0, 1, .1, 10_000);
  private hands: ParticleHand[] = [];
  private resizeObserver: ResizeObserver;
  private uniforms: ParticleUniforms = {
    uRect: { value: new Vector4() }, uAspect: { value: .75 }, uMirror: { value: 1 },
    uPixelRatio: { value: 1 }, uPointSize: { value: PARTICLE_CONFIG.sizeCssPixels },
    uSpread: { value: PARTICLE_CONFIG.spread }, uTime: { value: 0 },
  };
  private width = 0;
  private height = 0;
  private previousTime = 0;
  private disposed = false;
  private lostHandler: (event: Event) => void;
  private stats: ParticleStats = { surface: 0, joints: 0, drawCalls: 0 };

  constructor(host: HTMLElement, onUnavailable: (message: string) => void = () => {}) {
    this.host = host;
    this.canvas.setAttribute('aria-label', '根据真实手部关键点生成的2.5D表面粒子');
    this.renderer = new WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.debug.onShaderError = (gl, program, vertex, fragment) => {
      console.error('Particle shader compilation failed:', gl.getProgramInfoLog(program), gl.getShaderInfoLog(vertex), gl.getShaderInfoLog(fragment));
      throw new Error('粒子 Shader 编译失败，已回退到骨骼调试。');
    };
    this.camera.position.z = 1000;
    try {
      for (let i = 0; i < PARTICLE_CONFIG.maxHands; i++) {
        const hand = new ParticleHand(this.uniforms, PARTICLE_CONFIG.seed + i * 97);
        this.hands.push(hand); this.scene.add(hand.group);
      }
      this.host.append(this.canvas);
    } catch (error) {
      this.hands.forEach((hand) => hand.dispose()); this.renderer.dispose(); this.renderer.forceContextLoss(); this.canvas.remove();
      throw error;
    }
    this.lostHandler = (event) => { event.preventDefault(); if (!this.disposed) onUnavailable('WebGL 上下文已丢失，已保留摄像头与骨骼调试。'); };
    this.canvas.addEventListener('webglcontextlost', this.lostHandler);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host); this.resize();
  }

  private resize(): void {
    if (this.disposed) return;
    const { width, height } = this.host.getBoundingClientRect();
    this.width = width; this.height = height;
    const pixelRatio = Math.min(globalThis.devicePixelRatio || 1, PARTICLE_CONFIG.maxPixelRatio);
    this.uniforms.uPixelRatio.value = pixelRatio;
    this.renderer.setPixelRatio(pixelRatio); this.renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
    this.camera.right = Math.max(width, 1); this.camera.bottom = Math.max(height, 1); this.camera.updateProjectionMatrix();
  }

  render(frames: readonly HandFrame[], videoWidth: number, videoHeight: number, mirrored: boolean, now: number, spread: number = PARTICLE_CONFIG.spread): ParticleStats {
    if (this.disposed) return this.stats;
    if (this.uniforms.uPixelRatio.value !== Math.min(globalThis.devicePixelRatio || 1, PARTICLE_CONFIG.maxPixelRatio)) this.resize();
    const rect = containRect(videoWidth, videoHeight, this.width, this.height), aspect = videoHeight / videoWidth;
    this.uniforms.uRect.value.set(rect.x, rect.y, rect.width, rect.height);
    this.uniforms.uMirror.value = mirrored ? 1 : 0; this.uniforms.uAspect.value = Number.isFinite(aspect) && aspect > 0 ? aspect : .75;
    this.uniforms.uSpread.value = Number.isFinite(spread) ? Math.max(0, Math.min(1, spread)) : PARTICLE_CONFIG.spread;
    this.uniforms.uTime.value = now / 1000;
    const active = frames.slice(0, 2), activeIds = new Set(active.map((frame) => frame.id));
    for (const hand of this.hands) if (!activeIds.has(hand.handId ?? '')) hand.group.visible = false;
    let count = 0;
    if (rect.width) for (const frame of active) {
      const hand = this.hands.find((candidate) => candidate.handId === frame.id)
        ?? this.hands.filter((candidate) => !activeIds.has(candidate.handId ?? '')).sort((a, b) => a.lastSeen - b.lastSeen)[0];
      if (!hand) continue;
      hand.setFrame(frame, aspect); count++;
    }
    const delta = this.previousTime ? Math.min(100, Math.max(0, now - this.previousTime)) : 16.67;
    this.previousTime = now;
    this.hands.forEach((hand) => hand.step(delta));
    // Clear the full canvas before clipping to the contain video rectangle.
    this.renderer.setScissorTest(false); this.renderer.clear();
    this.renderer.setScissor(rect.x, this.height - rect.y - rect.height, rect.width, rect.height);
    this.renderer.setScissorTest(true); this.renderer.autoClear = false;
    if (rect.width) this.renderer.render(this.scene, this.camera);
    this.stats = { surface: count * PARTICLE_CONFIG.particlesPerHand, joints: count * 21, drawCalls: count ? this.renderer.info.render.calls : 0 };
    return this.stats;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true; this.canvas.removeEventListener('webglcontextlost', this.lostHandler); this.resizeObserver.disconnect();
    this.hands.forEach((hand) => hand.dispose()); this.hands = []; this.scene.clear();
    this.renderer.dispose(); this.renderer.forceContextLoss(); this.canvas.remove();
    this.stats = { surface: 0, joints: 0, drawCalls: 0 };
  }
}
