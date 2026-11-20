import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { VISION_CONFIG } from './VisionConfig.ts';
import { palmCenter } from './types.ts';
import type { HandObservation, Vec3 } from './types.ts';

const valid = (points: readonly Vec3[] | undefined): points is Vec3[] =>
  points?.length === 21 && points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z));
const copy = (points: readonly Vec3[]): Vec3[] => points.map(({ x, y, z }) => ({ x, y, z }));

/** The only boundary that consumes SDK results; downstream code uses our types. */
export function adaptHandResult(result: HandLandmarkerResult, timestamp: number): HandObservation[] {
  const hands: HandObservation[] = [];
  for (let i = 0; i < Math.min(result.landmarks.length, VISION_CONFIG.numHands); i++) {
    const raw = result.landmarks[i];
    if (!valid(raw)) continue;
    const category = result.handedness[i]?.slice().sort((a, b) => b.score - a.score)[0];
    const confidence = category && Number.isFinite(category.score) ? Math.max(0, Math.min(1, category.score)) : 0;
    const side = category?.categoryName;
    const landmarks = copy(raw);
    hands.push({
      handedness: confidence >= VISION_CONFIG.handednessThreshold && (side === 'Left' || side === 'Right') ? side : 'Unknown',
      confidence, landmarks, palmCenter: palmCenter(landmarks), timestamp,
      worldLandmarks: valid(result.worldLandmarks[i]) ? copy(result.worldLandmarks[i]) : undefined,
    });
  }
  return hands;
}
