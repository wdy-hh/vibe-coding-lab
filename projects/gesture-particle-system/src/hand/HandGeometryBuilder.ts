import type { Vec3 } from '../vision/types.ts';
import { FINGER_CHAINS, FINGER_RINGS, SURFACE_TOPOLOGY, TUBE_STEPS } from './HandTopology.ts';

function normalize(out: Float32Array, x: number, y: number, z: number, fallback: readonly number[] | Float32Array): void {
  const length = Math.hypot(x, y, z);
  if (length < 1e-8) { out[0] = fallback[0]; out[1] = fallback[1]; out[2] = fallback[2]; }
  else { out[0] = x / length; out[1] = y / length; out[2] = z / length; }
}

/** Landmark-driven palm slab and five capped curved tubes, in image-width units. */
export class HandGeometryBuilder {
  readonly joints = new Float32Array(21 * 3);
  // Vertex 0 is the centre; vertices 1..8 form the fixed palm boundary.
  readonly palm = new Float32Array(9 * 3);
  readonly palmNormal = new Float32Array([0, 0, 1]);
  readonly centers = new Float32Array(5 * FINGER_RINGS * 3);
  readonly across = new Float32Array(5 * FINGER_RINGS * 3);
  readonly normals = new Float32Array(5 * FINGER_RINGS * 3);
  readonly tangents = new Float32Array(5 * FINGER_RINGS * 3);
  readonly radii = new Float32Array(5 * FINGER_RINGS);
  readonly capAmount = new Float32Array(5 * FINGER_RINGS);
  palmWidth = 0;
  thickness = 0;
  private knots = new Float32Array(4 * 3);
  private tangent = new Float32Array(3);
  private normal = new Float32Array(3);
  private binormal = new Float32Array(3);
  private candidateNormal = new Float32Array(3);

  update(landmarks: readonly Vec3[], aspect: number): void {
    if (landmarks.length !== 21 || !Number.isFinite(aspect) || aspect <= 0 || landmarks.some((p) => !Number.isFinite(p.x + p.y + p.z))) {
      throw new Error('Hand surface requires 21 finite landmarks and a positive video aspect.');
    }
    const p = this.joints;
    for (let i = 0; i < 21; i++) { p[i * 3] = landmarks[i].x; p[i * 3 + 1] = landmarks[i].y * aspect; p[i * 3 + 2] = landmarks[i].z; }
    const ax = p[15] - p[0], ay = p[16] - p[1], az = p[17] - p[2];
    const bx = p[51] - p[0], by = p[52] - p[1], bz = p[53] - p[2];
    normalize(this.candidateNormal, ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx, this.palmNormal);
    const sign = this.candidateNormal[0] * this.palmNormal[0] + this.candidateNormal[1] * this.palmNormal[1] + this.candidateNormal[2] * this.palmNormal[2] < 0 ? -1 : 1;
    for (let axis = 0; axis < 3; axis++) this.palmNormal[axis] = this.candidateNormal[axis] * sign;
    this.palmWidth = Math.max(1e-5, Math.hypot(p[15] - p[51], p[16] - p[52], p[17] - p[53]));
    this.thickness = this.palmWidth * SURFACE_TOPOLOGY.palmThickness;
    normalize(this.binormal, p[15] - p[51], p[16] - p[52], p[17] - p[53], [1, 0, 0]);
    for (let axis = 0; axis < 3; axis++) {
      this.palm[axis] = (p[axis] + p[15 + axis] + p[27 + axis] + p[39 + axis] + p[51 + axis]) / 5;
      this.palm[3 + axis] = p[axis] + this.binormal[axis] * this.palmWidth * .25;
      this.palm[24 + axis] = p[axis] - this.binormal[axis] * this.palmWidth * .25;
    }
    [1, 2, 5, 9, 13, 17].forEach((joint, i) => {
      for (let axis = 0; axis < 3; axis++) this.palm[(i + 2) * 3 + axis] = p[joint * 3 + axis];
    });
    for (let finger = 0; finger < 5; finger++) this.updateFinger(finger);
  }

  private updateFinger(finger: number): void {
    const chain = FINGER_CHAINS[finger], p = this.joints, k = this.knots;
    for (let i = 0; i < 4; i++) for (let a = 0; a < 3; a++) k[i * 3 + a] = p[chain[i] * 3 + a];
    const lastLength = Math.hypot(k[9] - k[6], k[10] - k[7], k[11] - k[8]);
    normalize(this.tangent, k[9] - k[6], k[10] - k[7], k[11] - k[8], [0, -1, 0]);
    const baseRadius = this.palmWidth * SURFACE_TOPOLOGY.fingerRadius[finger];
    const tipRadius = Math.min(baseRadius * .62, lastLength * .35);
    for (let a = 0; a < 3; a++) k[9 + a] -= this.tangent[a] * tipRadius;
    for (let ring = 0; ring < FINGER_RINGS; ring++) {
      const index = finger * FINGER_RINGS + ring, offset = index * 3;
      const cap = ring > TUBE_STEPS ? (ring - TUBE_STEPS) / SURFACE_TOPOLOGY.capSteps : 0;
      if (ring <= TUBE_STEPS) {
        const t = ring / SURFACE_TOPOLOGY.stepsPerBone;
        const segment = Math.min(2, Math.floor(t)), u = t - segment;
        let dx = 0, dy = 0, dz = 0;
        for (let a = 0; a < 3; a++) {
          const p1 = k[segment * 3 + a], p2 = k[(segment + 1) * 3 + a];
          const p0 = segment === 0 ? 2 * p1 - p2 : k[(segment - 1) * 3 + a];
          const p3 = segment === 2 ? 2 * p2 - p1 : k[(segment + 2) * 3 + a];
          const c = .5 * (-p0 + p2), b = p0 - 2.5 * p1 + 2 * p2 - .5 * p3, d = .5 * (-p0 + 3 * p1 - 3 * p2 + p3);
          this.centers[offset + a] = p1 + c * u + b * u * u + d * u * u * u;
          const derivative = c + 2 * b * u + 3 * d * u * u;
          if (a === 0) dx = derivative; else if (a === 1) dy = derivative; else dz = derivative;
        }
        normalize(this.tangent, dx, dy, dz, [0, -1, 0]);
        this.radii[index] = baseRadius + (tipRadius - baseRadius) * ring / TUBE_STEPS;
      } else {
        normalize(this.tangent, p[chain[3] * 3] - k[9], p[chain[3] * 3 + 1] - k[10], p[chain[3] * 3 + 2] - k[11], [0, -1, 0]);
        for (let a = 0; a < 3; a++) this.centers[offset + a] = k[9 + a] + this.tangent[a] * tipRadius * cap;
        this.radii[index] = tipRadius * Math.sqrt(Math.max(0, 1 - cap * cap));
      }
      this.capAmount[index] = cap;
      const dot = this.palmNormal[0] * this.tangent[0] + this.palmNormal[1] * this.tangent[1] + this.palmNormal[2] * this.tangent[2];
      const nx = this.palmNormal[0] - dot * this.tangent[0], ny = this.palmNormal[1] - dot * this.tangent[1], nz = this.palmNormal[2] - dot * this.tangent[2];
      if (Math.hypot(nx, ny, nz) < 1e-6) {
        const reference = Math.abs(this.tangent[2]) < .8 ? [0, 0, 1] : [0, 1, 0];
        const projection = reference[0] * this.tangent[0] + reference[1] * this.tangent[1] + reference[2] * this.tangent[2];
        normalize(this.normal, reference[0] - projection * this.tangent[0], reference[1] - projection * this.tangent[1], reference[2] - projection * this.tangent[2], [0, 0, 1]);
      } else normalize(this.normal, nx, ny, nz, [0, 0, 1]);
      normalize(this.binormal,
        this.tangent[1] * this.normal[2] - this.tangent[2] * this.normal[1],
        this.tangent[2] * this.normal[0] - this.tangent[0] * this.normal[2],
        this.tangent[0] * this.normal[1] - this.tangent[1] * this.normal[0], [1, 0, 0]);
      this.normals.set(this.normal, offset); this.across.set(this.binormal, offset); this.tangents.set(this.tangent, offset);
    }
  }
}
