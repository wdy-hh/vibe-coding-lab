import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { HandIdentityManager } from '../../src/vision/HandIdentityManager.ts';
import { LandmarkSmoother } from '../../src/vision/LandmarkSmoother.ts';
import { adaptHandResult } from '../../src/vision/adaptHandResult.ts';
import { createWithDelegateFallback } from '../../src/vision/DelegateFactory.ts';
import { palmCenter } from '../../src/vision/types.ts';
import type { HandFrame, HandObservation, Handedness } from '../../src/vision/types.ts';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';

function observation(x: number, side: Handedness = 'Left', timestamp = 0): HandObservation {
  const landmarks = Array.from({ length: 21 }, (_, i) => ({ x: x + (i % 4) * 0.01, y: 0.5 - Math.floor(i / 4) * 0.02, z: -i * 0.001 }));
  return { landmarks, worldLandmarks: landmarks.map((p) => ({ ...p })), handedness: side, confidence: 0.99, palmCenter: palmCenter(landmarks), timestamp };
}
function frame(x: number, timestamp: number, id = 'hand-1'): HandFrame {
  return { ...observation(x, 'Left', timestamp), id, observedHandedness: 'Left' };
}
function result(): HandLandmarkerResult {
  return {
    landmarks: [observation(0.2).landmarks], worldLandmarks: [observation(0.2).landmarks],
    handedness: [[{ categoryName: 'Left', displayName: '', index: 0, score: 0.93 }]], handednesses: [],
  };
}

test('adapter preserves unmirrored coordinates, all 21 world points and category score', () => {
  const raw = result(); const [hand] = adaptHandResult(raw, 123);
  assert.equal(hand.landmarks.length, 21); assert.equal(hand.worldLandmarks?.length, 21);
  assert.equal(hand.landmarks[0].x, 0.2); assert.equal(hand.handedness, 'Left');
  assert.equal(hand.confidence, 0.93); assert.equal(hand.timestamp, 123);
  hand.landmarks[0].x = 0.9; assert.equal(raw.landmarks[0][0].x, 0.2);
});
test('adapter tolerates empty category arrays and unavailable world points', () => {
  const raw = result(); raw.handedness = [[]]; raw.worldLandmarks = [];
  const [hand] = adaptHandResult(raw, 0);
  assert.equal(hand.handedness, 'Unknown'); assert.equal(hand.confidence, 0); assert.equal(hand.worldLandmarks, undefined);
});
test('adapter filters malformed points and does not fabricate detection confidence', () => {
  const raw = result(); raw.landmarks[0][4].z = NaN;
  assert.deepEqual(adaptHandResult(raw, 0), []);
  const low = result(); low.handedness[0][0].score = 0.52;
  assert.equal(adaptHandResult(low, 0)[0].handedness, 'Unknown');
  assert.deepEqual(adaptHandResult({ ...result(), landmarks: [] }, 0), []);
});
test('two identities persist when SDK result order reverses', () => {
  const manager = new HandIdentityManager();
  const initial = manager.update([observation(0.2), observation(0.7, 'Right')], 0);
  const next = manager.update([observation(0.69, 'Right', 33), observation(0.21, 'Left', 33)], 33);
  assert.equal(next[0].id, initial[1].id); assert.equal(next[1].id, initial[0].id);
});
test('global assignment preserves identities through a crossing trajectory', () => {
  const manager = new HandIdentityManager();
  const initial = manager.update([observation(0.25), observation(0.65, 'Right')], 0);
  for (let step = 1; step <= 8; step++) {
    const now = step * 40;
    const left = observation(0.25 + step * 0.05, 'Left', now);
    const right = observation(0.65 - step * 0.05, 'Right', now);
    const next = manager.update(step % 2 ? [right, left] : [left, right], now);
    assert.equal(next.find((hand) => hand.observedHandedness === 'Left')?.id, initial[0].id);
    assert.equal(next.find((hand) => hand.observedHandedness === 'Right')?.id, initial[1].id);
  }
});
test('short absence retains identity without rendering a ghost, long absence expires it', () => {
  const manager = new HandIdentityManager(); const [initial] = manager.update([observation(0.3)], 0);
  assert.deepEqual(manager.update([], 100), []);
  assert.equal(manager.update([observation(0.31, 'Left', 500)], 500)[0].id, initial.id);
  manager.update([], 1600);
  assert.notEqual(manager.update([observation(0.31, 'Left', 1700)], 1700)[0].id, initial.id);
});
test('one-frame classification noise does not relabel a spatially continuous hand', () => {
  const manager = new HandIdentityManager(); const [initial] = manager.update([observation(0.3)], 0);
  const [next] = manager.update([observation(0.31, 'Right', 33)], 33);
  assert.equal(next.id, initial.id); assert.equal(next.handedness, 'Left'); assert.equal(next.observedHandedness, 'Right');
});
test('unknown handedness still matches by position with a one-to-one assignment', () => {
  const manager = new HandIdentityManager();
  const initial = manager.update([observation(0.2, 'Unknown'), observation(0.7, 'Unknown')], 0);
  const next = manager.update([observation(0.69, 'Unknown', 33), observation(0.21, 'Unknown', 33)], 33);
  assert.deepEqual(next.map((hand) => hand.id), [initial[1].id, initial[0].id]);
});
test('smoothing reduces small jitter without mixing hands or mutating input', () => {
  const smoother = new LandmarkSmoother(); smoother.update(frame(0.2, 0));
  const raw = frame(0.202, 33); const smoothed = smoother.update(raw);
  assert.ok(smoothed.landmarks[0].x > 0.2 && smoothed.landmarks[0].x < 0.202);
  assert.equal(raw.landmarks[0].x, 0.202);
  assert.equal(smoother.update(frame(0.7, 33, 'hand-2')).landmarks[0].x, 0.7);
});
test('smoothing responds to fast articulation and resets after occlusion', () => {
  const smoother = new LandmarkSmoother(); smoother.update(frame(0.2, 0));
  const raw = frame(0.2, 33); raw.landmarks[8].x += 0.25;
  const output = smoother.update(raw);
  assert.ok(Math.abs(output.landmarks[8].x - raw.landmarks[8].x) < 0.01);
  const returned = frame(0.6, 400); assert.deepEqual(smoother.update(returned), returned);
});
test('GPU initialization failure falls back to CPU exactly once', async () => {
  const warning = mock.method(console, 'warn', () => {}); const calls: string[] = []; let notified = false;
  try {
    const value = await createWithDelegateFallback(async (delegate) => {
      calls.push(delegate); if (delegate === 'GPU') throw new Error('no WebGL'); return 'cpu-resource';
    }, () => { notified = true; });
    assert.deepEqual(calls, ['GPU', 'CPU']); assert.equal(value.delegate, 'CPU'); assert.equal(notified, true);
  } finally { warning.mock.restore(); }
});
test('GPU success does not construct CPU; cancellation does not start a fallback', async () => {
  const calls: string[] = [];
  const value = await createWithDelegateFallback(async (delegate) => { calls.push(delegate); return 'gpu-resource'; }, () => assert.fail());
  assert.equal(value.delegate, 'GPU'); assert.deepEqual(calls, ['GPU']);
  await assert.rejects(createWithDelegateFallback(async () => { throw new Error('cancelled'); }, () => assert.fail(), () => true), { name: 'AbortError' });
});
test('failure of both delegates reports a local-resource recovery message', async () => {
  const warning = mock.method(console, 'warn', () => {});
  try { await assert.rejects(createWithDelegateFallback(async () => { throw new Error('unavailable'); }, () => {}), /GPU 与 CPU/); }
  finally { warning.mock.restore(); }
});
