import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CameraService, cameraErrorMessage } from '../../src/camera/CameraService.ts';

class FakeTrack extends EventTarget {
  readyState = 'live';
  stops = 0;
  stop() { this.stops++; this.readyState = 'ended'; }
  getSettings() { return { width: 640, height: 480 }; }
}
function fixtures(play: () => Promise<void> = async () => {}) {
  const tracks = [new FakeTrack(), new FakeTrack()];
  const stream = { getTracks: () => tracks, getVideoTracks: () => [tracks[0]] } as unknown as MediaStream;
  const video = { srcObject: null, muted: false, playsInline: false, play, pause: () => {} } as unknown as HTMLVideoElement;
  return { tracks, stream, video };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

test('camera is lazy, requests RGB only, and stop releases every track and video', async () => {
  const { video, stream, tracks } = fixtures();
  let calls = 0;
  const service = new CameraService(video, { secure: true, getUserMedia: async (constraints) => {
    calls++; assert.equal(constraints.audio, false);
    assert.deepEqual((constraints.video as MediaTrackConstraints).width, { ideal: 640 });
    return stream;
  } });
  assert.equal(calls, 0);
  assert.deepEqual(await service.start(), { width: 640, height: 480 });
  assert.equal(video.srcObject, stream);
  assert.equal(video.muted, true);
  service.stop(); service.stop();
  assert.equal(video.srcObject, null);
  assert.deepEqual(tracks.map((track) => track.stops), [1, 1]);
});

test('late permission grant after Stop cannot revive or leak the stream', async () => {
  const { video, stream, tracks } = fixtures();
  const permission = deferred<MediaStream>();
  const service = new CameraService(video, { secure: true, getUserMedia: () => permission.promise });
  const pending = service.start();
  const rejected = assert.rejects(pending, { name: 'AbortError' });
  service.stop(); permission.resolve(stream);
  await rejected;
  assert.equal(video.srcObject, null);
  assert.ok(tracks.every((track) => track.readyState === 'ended'));
});

test('an old pending Start cannot overwrite a newer successful Start', async () => {
  const old = fixtures(); const fresh = fixtures();
  const permission = deferred<MediaStream>(); let calls = 0;
  const service = new CameraService(fresh.video, { secure: true, getUserMedia: () => ++calls === 1 ? permission.promise : Promise.resolve(fresh.stream) });
  const first = service.start(); const rejected = assert.rejects(first, { name: 'AbortError' });
  service.stop(); await service.start(); permission.resolve(old.stream); await rejected;
  assert.equal(fresh.video.srcObject, fresh.stream);
  assert.ok(old.tracks.every((track) => track.stops === 1));
  assert.ok(fresh.tracks.every((track) => track.stops === 0));
  service.stop();
});

test('stopping during video playback initialization cancels promptly', async () => {
  const playback = deferred<void>(); const { video, stream, tracks } = fixtures(() => playback.promise);
  const service = new CameraService(video, { secure: true, getUserMedia: async () => stream });
  const pending = service.start(); const rejected = assert.rejects(pending, { name: 'AbortError' });
  await Promise.resolve(); service.stop(); await rejected;
  assert.ok(tracks.every((track) => track.stops === 1));
  assert.equal(video.srcObject, null);
});

test('playback failure releases acquired tracks', async () => {
  const { video, stream, tracks } = fixtures(async () => { throw new Error('playback failed'); });
  const service = new CameraService(video, { secure: true, getUserMedia: async () => stream });
  await assert.rejects(service.start(), /playback failed/);
  assert.equal(video.srcObject, null);
  assert.ok(tracks.every((track) => track.stops === 1));
});

test('device interruption notifies once; stopped streams no longer notify', async () => {
  const { video, stream, tracks } = fixtures(); let ended = 0;
  const service = new CameraService(video, { secure: true, getUserMedia: async () => stream });
  service.onEnded = () => ended++;
  await service.start(); tracks[0].dispatchEvent(new Event('ended'));
  assert.equal(ended, 1);
  service.stop(); tracks[1].dispatchEvent(new Event('ended'));
  assert.equal(ended, 1);
});

test('denial, missing device, busy device and unsupported environments are actionable', async () => {
  assert.match(cameraErrorMessage(new DOMException('', 'NotAllowedError')), /权限被拒绝/);
  assert.match(cameraErrorMessage(new DOMException('', 'NotFoundError')), /没有找到/);
  assert.match(cameraErrorMessage(new DOMException('', 'NotReadableError')), /占用/);
  const { video } = fixtures();
  await assert.rejects(new CameraService(video, { secure: false }).start(), /localhost/);
  await assert.rejects(new CameraService(video, { secure: true }).start(), /不支持/);
  const denied = new CameraService(video, { secure: true, getUserMedia: async () => { throw new DOMException('', 'NotAllowedError'); } });
  await assert.rejects(denied.start(), { name: 'NotAllowedError' });
  assert.equal(video.srcObject, null);
});
