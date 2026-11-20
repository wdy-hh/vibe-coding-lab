import { VISION_CONFIG } from './VisionConfig.ts';
import { palmCenter } from './types.ts';
import type { HandFrame, Vec3 } from './types.ts';

interface SmoothState { frame: HandFrame }

/** Time-based adaptive EMA: steadier at rest, more responsive during motion. */
export class LandmarkSmoother {
  private states = new Map<string, SmoothState>();

  update(frame: HandFrame): HandFrame {
    const previous = this.states.get(frame.id);
    const dt = previous ? (frame.timestamp - previous.frame.timestamp) / 1000 : 0;
    if (!previous || dt <= 0 || dt * 1000 > VISION_CONFIG.smoothingResetMs) {
      this.states.set(frame.id, { frame });
      return frame;
    }
    // Per-landmark motion preserves finger articulation even with a stationary palm.
    const blend = (current: Vec3[], before: Vec3[], world = false): Vec3[] => current.map((point, i) => {
      const last = before[i];
      const speed = Math.hypot(point.x - last.x, point.y - last.y, point.z - last.z) / dt;
      const cutoff = VISION_CONFIG.smoothingCutoffHz + VISION_CONFIG.smoothingSpeedGain * speed * (world ? 5 : 1);
      const alpha = 1 - Math.exp(-2 * Math.PI * cutoff * dt);
      return { x: last.x + alpha * (point.x - last.x), y: last.y + alpha * (point.y - last.y), z: last.z + alpha * (point.z - last.z) };
    });
    const landmarks = blend(frame.landmarks, previous.frame.landmarks);
    const result: HandFrame = {
      ...frame, landmarks, palmCenter: palmCenter(landmarks),
      worldLandmarks: frame.worldLandmarks && previous.frame.worldLandmarks
        ? blend(frame.worldLandmarks, previous.frame.worldLandmarks, true) : frame.worldLandmarks,
    };
    this.states.set(frame.id, { frame: result });
    return result;
  }

  prune(now: number): void {
    for (const [id, state] of this.states) {
      if (now - state.frame.timestamp > VISION_CONFIG.identityRetentionMs) this.states.delete(id);
    }
  }

  reset(): void { this.states.clear(); }
}
