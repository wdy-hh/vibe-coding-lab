import { HandGeometryBuilder } from './HandGeometryBuilder.ts';
import { FINGER_RINGS, REFERENCE_HAND, SURFACE_TOPOLOGY } from './HandTopology.ts';

function randomGenerator(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
}
function cdf(weights: number[]): number[] {
  let sum = 0; const cumulative = weights.map((value) => sum += Math.max(value, 1e-10));
  return cumulative.map((value) => value / sum);
}
function pick(cumulative: number[], value: number): number {
  const index = cumulative.findIndex((limit) => value < limit);
  return index < 0 ? cumulative.length - 1 : index;
}

/** Stable local coordinates are generated ONCE; update only deforms them. */
export class HandSurfaceSampler {
  readonly count: number;
  /** 0: palm faces; 1..5: fingers; 6: palm edge wall. */
  readonly region: Uint8Array;
  readonly section: Uint8Array;
  readonly local: Float32Array;
  readonly tone: Float32Array;
  readonly size: Float32Array;

  constructor(count: number, seed = 0x4b19f3) {
    if (!Number.isInteger(count) || count < 100) throw new Error('Surface sample count must be an integer >= 100.');
    this.count = count; this.region = new Uint8Array(count); this.section = new Uint8Array(count);
    this.local = new Float32Array(count * 4); this.tone = new Float32Array(count); this.size = new Float32Array(count);
    const random = randomGenerator(seed), reference = new HandGeometryBuilder();
    reference.update(REFERENCE_HAND, .75);
    const palmAreas: number[] = [], edgeLengths: number[] = [], fingerAreas: number[][] = [];
    const p = reference.palm;
    for (let edge = 0; edge < 8; edge++) {
      const b = (edge + 1) * 3, c = (edge === 7 ? 1 : edge + 2) * 3;
      const ax = p[b] - p[0], ay = p[b + 1] - p[1], az = p[b + 2] - p[2];
      const bx = p[c] - p[0], by = p[c + 1] - p[1], bz = p[c + 2] - p[2];
      palmAreas.push(Math.hypot(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx) / 2);
      edgeLengths.push(Math.hypot(p[b] - p[c], p[b + 1] - p[c + 1], p[b + 2] - p[c + 2]));
    }
    for (let finger = 0; finger < 5; finger++) {
      const areas: number[] = [];
      for (let ring = 0; ring < FINGER_RINGS - 1; ring++) {
        const index = finger * FINGER_RINGS + ring, o = index * 3;
        const distance = Math.hypot(reference.centers[o] - reference.centers[o + 3], reference.centers[o + 1] - reference.centers[o + 4], reference.centers[o + 2] - reference.centers[o + 5]);
        const r0 = reference.radii[index], r1 = reference.radii[index + 1];
        areas.push((r0 + r1) * Math.hypot(distance, r0 - r1));
      }
      fingerAreas.push(areas);
    }
    const palmCdf = cdf(palmAreas), edgeCdf = cdf(edgeLengths);
    const fingerCdf = cdf(fingerAreas.map((areas) => areas.reduce((sum, area) => sum + area, 0)));
    const sectionCdf = fingerAreas.map(cdf);
    const palmCount = Math.round(count * .47), edgeCount = Math.round(palmCount * .055);
    for (let i = 0; i < count; i++) {
      const offset = i * 4;
      this.size[i] = .78 + random() * .4;
      if (i < edgeCount) {
        this.region[i] = 6; this.section[i] = pick(edgeCdf, random());
        this.local[offset] = random(); this.local[offset + 1] = random() * 2 - 1;
        this.tone[i] = .2 + random() * .15;
      } else if (i < palmCount) {
        this.region[i] = 0; this.section[i] = pick(palmCdf, random());
        const root = Math.sqrt(random()), v = random();
        this.local[offset] = 1 - root; this.local[offset + 1] = root * (1 - v); this.local[offset + 2] = root * v;
        this.local[offset + 3] = i % 2 ? 1 : -1;
        this.tone[i] = .1 + .4 * this.local[offset];
      } else {
        const finger = pick(fingerCdf, (i - palmCount + random()) / (count - palmCount));
        this.region[i] = finger + 1; this.section[i] = pick(sectionCdf[finger], random());
        const angle = random() * Math.PI * 2;
        this.local[offset] = random(); this.local[offset + 1] = Math.cos(angle); this.local[offset + 2] = Math.sin(angle);
        this.tone[i] = .2 + .75 * (this.section[i] + this.local[offset]) / (FINGER_RINGS - 1);
      }
    }
  }

  write(geometry: HandGeometryBuilder, positions: Float32Array, normals: Float32Array): void {
    if (positions.length !== this.count * 3 || normals.length !== this.count * 3) throw new Error('Surface output buffers have the wrong capacity.');
    const p = geometry.palm, n = geometry.palmNormal;
    for (let i = 0; i < this.count; i++) {
      const o = i * 3, l = i * 4, region = this.region[i], section = this.section[i];
      if (region === 0 || region === 6) {
        const b = (section + 1) * 3, c = (section === 7 ? 1 : section + 2) * 3;
        if (region === 0) {
          const aWeight = this.local[l], side = this.local[l + 3];
          const thickness = geometry.thickness * (.35 + .65 * Math.sqrt(aWeight)) * side;
          for (let axis = 0; axis < 3; axis++) {
            positions[o + axis] = p[axis] * aWeight + p[b + axis] * this.local[l + 1] + p[c + axis] * this.local[l + 2] + n[axis] * thickness;
            normals[o + axis] = n[axis] * side;
          }
        } else {
          const u = this.local[l], height = geometry.thickness * .35 * this.local[l + 1];
          const dx = p[c] - p[b], dy = p[c + 1] - p[b + 1], dz = p[c + 2] - p[b + 2];
          for (let axis = 0; axis < 3; axis++) positions[o + axis] = p[b + axis] * (1 - u) + p[c + axis] * u + n[axis] * height;
          normals[o] = dy * n[2] - dz * n[1]; normals[o + 1] = dz * n[0] - dx * n[2]; normals[o + 2] = dx * n[1] - dy * n[0];
        }
      } else {
        const ring = (region - 1) * FINGER_RINGS + section, b = ring * 3, c = b + 3;
        const u = this.local[l], cos = this.local[l + 1], sin = this.local[l + 2];
        const radius = geometry.radii[ring] * (1 - u) + geometry.radii[ring + 1] * u;
        const cap = geometry.capAmount[ring] * (1 - u) + geometry.capAmount[ring + 1] * u;
        for (let axis = 0; axis < 3; axis++) {
          const normal = geometry.normals[b + axis] * (1 - u) + geometry.normals[c + axis] * u;
          const across = geometry.across[b + axis] * (1 - u) + geometry.across[c + axis] * u;
          const tangent = geometry.tangents[b + axis] * (1 - u) + geometry.tangents[c + axis] * u;
          positions[o + axis] = geometry.centers[b + axis] * (1 - u) + geometry.centers[c + axis] * u + radius * (across * cos + normal * sin * SURFACE_TOPOLOGY.fingerFlattening);
          normals[o + axis] = (across * cos + normal * sin / SURFACE_TOPOLOGY.fingerFlattening) * Math.sqrt(1 - cap * cap) + tangent * cap;
        }
      }
    }
  }
}
