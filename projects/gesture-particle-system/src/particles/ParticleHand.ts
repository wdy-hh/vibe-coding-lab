import { AdditiveBlending, BufferAttribute, BufferGeometry, DynamicDrawUsage, Group, Points, ShaderMaterial, Vector3 } from 'three';
import type { Vector4 } from 'three';
import { HandGeometryBuilder } from '../hand/HandGeometryBuilder.ts';
import { HandSurfaceSampler } from '../hand/HandSurfaceSampler.ts';
import type { HandFrame } from '../vision/types.ts';
import { PARTICLE_CONFIG } from './ParticleConfig.ts';
import vertexShader from './shaders/particle.vert?raw';
import fragmentShader from './shaders/particle.frag?raw';

export interface ParticleUniforms {
  uRect: { value: Vector4 };
  uAspect: { value: number };
  uMirror: { value: number };
  uPixelRatio: { value: number };
  uPointSize: { value: number };
  uSpread: { value: number };
  uTime: { value: number };
}

export class ParticleHand {
  readonly group = new Group();
  readonly count: number;
  handId: string | null = null;
  lastSeen = -Infinity;
  private builder = new HandGeometryBuilder();
  private sampler: HandSurfaceSampler;
  private surfaceGeometry = new BufferGeometry();
  private jointGeometry = new BufferGeometry();
  private surfaceMaterial: ShaderMaterial;
  private jointMaterial: ShaderMaterial;
  private positions: Float32Array;
  private target: Float32Array;
  private normals: Float32Array;
  private joints = new Float32Array(63);
  private jointTarget = new Float32Array(63);
  private lastFrame: HandFrame | null = null;
  private aspect = 0;
  private settling = false;
  private center = new Vector3();
  private targetCenter = new Vector3();
  private palmWidth = { value: 0 };
  private targetWidth = 0;

  constructor(shared: ParticleUniforms, seed: number, count = PARTICLE_CONFIG.particlesPerHand) {
    this.count = count;
    this.sampler = new HandSurfaceSampler(count, seed);
    this.positions = new Float32Array(count * 3); this.target = new Float32Array(count * 3); this.normals = new Float32Array(count * 3);
    this.surfaceGeometry.setAttribute('position', new BufferAttribute(this.positions, 3).setUsage(DynamicDrawUsage));
    this.surfaceGeometry.setAttribute('aNormal', new BufferAttribute(this.normals, 3).setUsage(DynamicDrawUsage));
    this.surfaceGeometry.setAttribute('aTone', new BufferAttribute(this.sampler.tone, 1));
    this.surfaceGeometry.setAttribute('aSize', new BufferAttribute(this.sampler.size, 1));
    this.jointGeometry.setAttribute('position', new BufferAttribute(this.joints, 3).setUsage(DynamicDrawUsage));
    const jointNormals = new Float32Array(63), jointSizes = new Float32Array(21);
    for (let i = 0; i < 21; i++) { jointNormals[i * 3 + 2] = 1; jointSizes[i] = i === 0 || i % 4 === 0 ? 2.6 : 1.6; }
    this.jointGeometry.setAttribute('aNormal', new BufferAttribute(jointNormals, 3));
    this.jointGeometry.setAttribute('aTone', new BufferAttribute(new Float32Array(21), 1));
    this.jointGeometry.setAttribute('aSize', new BufferAttribute(jointSizes, 1));
    const createMaterial = (highlight: number) => new ShaderMaterial({
      vertexShader, fragmentShader,
      uniforms: { ...shared, uHandTint: { value: 0 }, uHighlight: { value: highlight }, uPalmCenter: { value: this.center }, uPalmWidth: this.palmWidth },
      transparent: true, depthTest: false, depthWrite: false, blending: AdditiveBlending, toneMapped: false,
    });
    this.surfaceMaterial = createMaterial(0); this.jointMaterial = createMaterial(.88);
    const surface = new Points(this.surfaceGeometry, this.surfaceMaterial), joints = new Points(this.jointGeometry, this.jointMaterial);
    surface.frustumCulled = false; joints.frustumCulled = false;
    this.group.add(surface, joints); this.group.visible = false;
  }

  setFrame(frame: HandFrame, aspect: number): void {
    const reset = !this.group.visible || this.handId !== frame.id || frame.timestamp - this.lastSeen > 180;
    if (reset) this.builder = new HandGeometryBuilder();
    this.handId = frame.id; this.lastSeen = frame.timestamp;
    if (this.lastFrame !== frame || this.aspect !== aspect || reset) {
      this.builder.update(frame.landmarks, aspect);
      this.sampler.write(this.builder, this.target, this.normals);
      this.jointTarget.set(this.builder.joints);
      this.targetCenter.fromArray(this.builder.palm);
      this.targetWidth = this.builder.palmWidth;
      this.surfaceGeometry.getAttribute('aNormal').needsUpdate = true;
      this.lastFrame = frame; this.aspect = aspect; this.settling = true;
      if (reset) {
        this.positions.set(this.target); this.joints.set(this.jointTarget);
        this.center.copy(this.targetCenter); this.palmWidth.value = this.targetWidth;
      }
    }
    const tint = [...frame.id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 2;
    this.surfaceMaterial.uniforms.uHandTint.value = tint;
    this.jointMaterial.uniforms.uHandTint.value = tint;
    this.group.visible = true;
  }

  step(deltaMs: number): void {
    if (!this.group.visible || !this.settling) return;
    const alpha = 1 - Math.exp(-Math.max(deltaMs, 1) / PARTICLE_CONFIG.positionResponseMs);
    this.center.lerp(this.targetCenter, alpha);
    this.palmWidth.value += (this.targetWidth - this.palmWidth.value) * alpha;
    let maximumDelta = 0;
    for (let i = 0; i < this.positions.length; i++) {
      const delta = this.target[i] - this.positions[i];
      this.positions[i] += delta * alpha; maximumDelta = Math.max(maximumDelta, Math.abs(delta));
    }
    for (let i = 0; i < 63; i++) this.joints[i] += (this.jointTarget[i] - this.joints[i]) * alpha;
    this.surfaceGeometry.getAttribute('position').needsUpdate = true;
    this.jointGeometry.getAttribute('position').needsUpdate = true;
    if (maximumDelta < 1e-6) this.settling = false;
  }

  dispose(): void {
    this.surfaceGeometry.dispose(); this.jointGeometry.dispose(); this.surfaceMaterial.dispose(); this.jointMaterial.dispose();
    this.group.clear(); this.group.visible = false;
  }
}
