import { test } from 'node:test';
import assert from 'node:assert/strict';
import { containRect, displayPoint } from '../../src/utils/CoordinateUtils.ts';

test('contain uses the same centred letterboxing as the video', () => {
  assert.deepEqual(containRect(640, 480, 800, 600), { x: 0, y: 0, width: 800, height: 600 });
  const rect = containRect(640, 480, 1000, 500);
  assert.ok(Math.abs(rect.x - 166.6666667) < 0.001);
  assert.ok(Math.abs(rect.y) < 1e-9); assert.ok(Math.abs(rect.height - 500) < 1e-9);
});
test('mirror only flips displayed x, preserving y and centre alignment', () => {
  const rect = containRect(640, 480, 800, 600);
  assert.deepEqual(displayPoint(0.2, 0.3, rect, false), { x: 160, y: 180 });
  assert.deepEqual(displayPoint(0.2, 0.3, rect, true), { x: 640, y: 180 });
  assert.deepEqual(displayPoint(0.5, 0.5, rect, true), displayPoint(0.5, 0.5, rect, false));
});
test('invalid dimensions produce an empty rect rather than NaN coordinates', () => {
  assert.deepEqual(containRect(0, 0, 800, 600), { x: 0, y: 0, width: 0, height: 0 });
});
