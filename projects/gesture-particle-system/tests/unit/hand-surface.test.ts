import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HandGeometryBuilder } from '../../src/hand/HandGeometryBuilder.ts';
import { HandSurfaceSampler } from '../../src/hand/HandSurfaceSampler.ts';
import { FINGER_CHAINS, FINGER_RINGS, REFERENCE_HAND } from '../../src/hand/HandTopology.ts';
import type { Vec3 } from '../../src/vision/types.ts';

function surface(points: readonly Vec3[] = REFERENCE_HAND, count = 10_000) {
  const builder = new HandGeometryBuilder(), sampler = new HandSurfaceSampler(count);
  const positions = new Float32Array(count * 3), normals = new Float32Array(count * 3);
  builder.update(points, .75); sampler.write(builder, positions, normals);
  return { builder, sampler, positions, normals };
}

test('surface fills palm faces and edge walls, plus all five fingers', () => {
  const { positions, normals, sampler } = surface();
  assert.equal(positions.length, 30_000);
  assert.ok(positions.every(Number.isFinite)); assert.ok(normals.every(Number.isFinite));
  for (let region = 0; region <= 6; region++) assert.ok(sampler.region.filter((value) => value === region).length > 100);
  assert.equal(sampler.region.filter((region) => region === 0 || region === 6).length, 4700);
  let awayFromJoints = 0;
  for (let i = 0; i < sampler.count; i++) {
    let distance = Infinity;
    for (const point of REFERENCE_HAND) distance = Math.min(distance, Math.hypot(positions[i * 3] - point.x, positions[i * 3 + 1] - point.y * .75, positions[i * 3 + 2] - point.z));
    if (distance > .025) awayFromJoints++;
  }
  assert.ok(awayFromJoints > 4000, `${awayFromJoints} samples were away from keypoints`);
});
test('seeded local identity and repeated deformation produce identical buffers', () => {
  const first = surface(), second = surface();
  assert.deepEqual(first.sampler.local, second.sampler.local);
  assert.deepEqual(first.positions, second.positions);
  const saved = first.positions.slice(), parameters = first.sampler.local.slice();
  first.sampler.write(first.builder, first.positions, first.normals);
  assert.deepEqual(first.positions, saved); assert.deepEqual(first.sampler.local, parameters);
  assert.notDeepEqual(new HandSurfaceSampler(10_000, 7).local, parameters);
});
test('palm barycentric coordinates stay inside triangles and include both faces', () => {
  const { sampler } = surface(); let front = 0, back = 0, interior = 0;
  for (let i = 0; i < sampler.count; i++) if (sampler.region[i] === 0) {
    const o = i * 4;
    assert.ok(Math.abs(sampler.local[o] + sampler.local[o + 1] + sampler.local[o + 2] - 1) < 1e-6);
    assert.ok(sampler.local[o] >= 0 && sampler.local[o + 1] >= 0 && sampler.local[o + 2] >= 0);
    if (sampler.local[o + 3] > 0) front++; else back++;
    if (sampler.local[o] > .5) interior++;
  }
  assert.ok(front > 1000 && back > 1000 && interior > 500);
});
test('translating the real landmarks translates the entire surface consistently', () => {
  const { builder, sampler, positions, normals } = surface(); const original = positions.slice();
  builder.update(REFERENCE_HAND.map((p) => ({ x: p.x + .1, y: p.y - .08, z: p.z + .02 })), .75);
  sampler.write(builder, positions, normals);
  for (let i = 0; i < sampler.count; i++) {
    assert.ok(Math.abs(positions[i * 3] - original[i * 3] - .1) < 2e-6);
    assert.ok(Math.abs(positions[i * 3 + 1] - original[i * 3 + 1] + .06) < 2e-6);
    assert.ok(Math.abs(positions[i * 3 + 2] - original[i * 3 + 2] - .02) < 2e-6);
  }
});
test('bending one finger deforms its surface while the palm and other fingers stay stable', () => {
  const { builder, sampler, positions, normals } = surface(); const original = positions.slice();
  const bent = REFERENCE_HAND.map((p) => ({ ...p }));
  bent[6] = { x: .39, y: .42, z: -.07 }; bent[7] = { x: .4, y: .50, z: -.12 }; bent[8] = { x: .41, y: .60, z: -.1 };
  builder.update(bent, .75); sampler.write(builder, positions, normals);
  let changedIndexParticles = 0;
  for (let i = 0; i < sampler.count; i++) {
    const distance = Math.hypot(positions[i * 3] - original[i * 3], positions[i * 3 + 1] - original[i * 3 + 1], positions[i * 3 + 2] - original[i * 3 + 2]);
    if (sampler.region[i] === 2) { if (distance > .02) changedIndexParticles++; }
    else assert.ok(distance < 1e-7);
  }
  assert.ok(changedIndexParticles > 300);
});
test('closed finger caps terminate at the tracked fingertips with zero end radius', () => {
  const { builder } = surface();
  for (let finger = 0; finger < 5; finger++) {
    const ring = (finger + 1) * FINGER_RINGS - 1, tip = REFERENCE_HAND[FINGER_CHAINS[finger][3]];
    assert.equal(builder.radii[ring], 0);
    assert.ok(Math.abs(builder.centers[ring * 3] - tip.x) < 1e-6);
    assert.ok(Math.abs(builder.centers[ring * 3 + 1] - tip.y * .75) < 1e-6);
    assert.ok(Math.abs(builder.centers[ring * 3 + 2] - tip.z) < 1e-6);
  }
});
test('tube frames are orthogonal and palm thickness creates a nonzero depth extent', () => {
  const { builder, positions } = surface();
  assert.ok(builder.thickness > .01);
  for (let i = 0; i < 5 * FINGER_RINGS; i++) {
    const o = i * 3;
    const dot = builder.tangents[o] * builder.normals[o] + builder.tangents[o + 1] * builder.normals[o + 1] + builder.tangents[o + 2] * builder.normals[o + 2];
    assert.ok(Math.abs(dot) < 1e-5);
  }
  let min = Infinity, max = -Infinity;
  for (let i = 2; i < positions.length; i += 3) { min = Math.min(min, positions[i]); max = Math.max(max, positions[i]); }
  assert.ok(max - min > .04);
});
test('degenerate and camera-facing finger poses remain finite', () => {
  const { builder, sampler, positions, normals } = surface();
  const collapsed = REFERENCE_HAND.map(() => ({ x: .5, y: .5, z: 0 }));
  builder.update(collapsed, .75); sampler.write(builder, positions, normals);
  assert.ok(positions.every(Number.isFinite)); assert.ok(normals.every(Number.isFinite));
  const foreshortened = REFERENCE_HAND.map((p) => ({ x: .5 + (p.x - .5) * .01, y: p.y, z: (p.x - .5) * .8 }));
  builder.update(foreshortened, .75); sampler.write(builder, positions, normals);
  assert.ok(positions.every(Number.isFinite)); assert.ok(normals.every(Number.isFinite));
});
test('two surface instances do not share mutable pose buffers', () => {
  const left = surface(), right = surface(), saved = right.positions.slice();
  left.builder.update(REFERENCE_HAND.map((p) => ({ ...p, x: p.x + .2 })), .75);
  left.sampler.write(left.builder, left.positions, left.normals);
  assert.deepEqual(right.positions, saved); assert.notDeepEqual(left.positions, saved);
});
test('invalid inputs and output capacities fail before corrupting GPU buffers', () => {
  const { builder, sampler } = surface();
  assert.throws(() => builder.update([], .75), /21 finite/);
  assert.throws(() => builder.update(REFERENCE_HAND, 0), /positive/);
  assert.throws(() => new HandSurfaceSampler(4), /integer/);
  assert.throws(() => sampler.write(builder, new Float32Array(3), new Float32Array(3)), /capacity/);
});
