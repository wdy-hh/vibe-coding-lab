import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { HandTrackingService } from '../../src/vision/HandTrackingService.ts';
import type { LandmarkerHandle, VisionRuntimeFactory } from '../../src/vision/loadVisionRuntime.ts';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
function resource() {
  let closes = 0;
  const timestamps: number[] = [];
  const handle: LandmarkerHandle = {
    close() { closes++; },
    detectForVideo(_video, timestamp) {
      timestamps.push(timestamp);
      return { landmarks: [], worldLandmarks: [], handedness: [], handednesses: [] };
    },
  };
  return { handle, timestamps, closes: () => closes };
}

test('stopping while local assets load aborts loading and prevents model construction', async () => {
  const load = deferred<VisionRuntimeFactory>(); let signal: AbortSignal | undefined; let creates = 0;
  const service = new HandTrackingService({ loadRuntime: (current) => { signal = current; return load.promise; } });
  const pending = service.initialize(); const rejected = assert.rejects(pending, { name: 'AbortError' });
  service.dispose(); assert.equal(signal?.aborted, true);
  load.resolve(async () => { creates++; return resource().handle; });
  await rejected; assert.equal(creates, 0); assert.equal(service.delegate, null);
});
test('a model that finishes constructing after Stop is immediately closed', async () => {
  const started = deferred<void>(); const created = deferred<LandmarkerHandle>(); const model = resource();
  const service = new HandTrackingService({ loadRuntime: async () => async () => { started.resolve(); return created.promise; } });
  const pending = service.initialize(); const rejected = assert.rejects(pending, { name: 'AbortError' });
  await started.promise; service.dispose(); created.resolve(model.handle); await rejected;
  assert.equal(model.closes(), 1); assert.equal(service.delegate, null);
});
test('restart waits for cancelled initialization and never overlaps model construction', async () => {
  const started = deferred<void>(); const firstModel = resource(); const secondModel = resource();
  const created = deferred<LandmarkerHandle>(); let loaders = 0;
  const service = new HandTrackingService({ loadRuntime: async () => {
    loaders++;
    return loaders === 1 ? async () => { started.resolve(); return created.promise; } : async () => secondModel.handle;
  } });
  const first = service.initialize(); const rejected = assert.rejects(first, { name: 'AbortError' });
  await started.promise; service.dispose(); const second = service.initialize();
  assert.equal(loaders, 1); created.resolve(firstModel.handle);
  await rejected; assert.equal(await second, 'GPU'); assert.equal(firstModel.closes(), 1);
  assert.equal(loaders, 2); service.dispose(); assert.equal(secondModel.closes(), 1);
});
test('monotonic video timestamps and idempotent disposal protect SDK state', async () => {
  const model = resource();
  const service = new HandTrackingService({ loadRuntime: async () => async () => model.handle });
  await service.initialize();
  const video = {} as HTMLVideoElement;
  service.detect(video, 100); service.detect(video, 100); service.detect(video, 99);
  assert.ok(model.timestamps[1] > model.timestamps[0]); assert.ok(model.timestamps[2] > model.timestamps[1]);
  service.dispose(); service.dispose(); assert.equal(model.closes(), 1);
  assert.deepEqual(service.detect(video, 200), []);
});
test('an SDK cleanup error still clears the session so a new Start can proceed', async () => {
  const warning = mock.method(console, 'warn', () => {});
  const model = resource(); model.handle.close = () => { throw new Error('context already lost'); };
  const service = new HandTrackingService({ loadRuntime: async () => async () => model.handle });
  try {
    await service.initialize(); assert.doesNotThrow(() => service.dispose()); assert.equal(service.delegate, null);
    assert.equal(await service.initialize(), 'GPU'); service.dispose();
  } finally { warning.mock.restore(); }
});
