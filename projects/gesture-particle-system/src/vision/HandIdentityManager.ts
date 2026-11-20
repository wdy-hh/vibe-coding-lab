import { VISION_CONFIG } from './VisionConfig.ts';
import type { HandFrame, HandObservation, Handedness, Vec3 } from './types.ts';

interface Track {
  id: string;
  side: Handedness;
  center: Vec3;
  velocity: Vec3;
  timestamp: number;
  candidate: Handedness;
  confirmations: number;
}

/** Global minimum-cost assignment (at most 2 detections), independent of SDK order. */
export class HandIdentityManager {
  private tracks = new Map<string, Track>();
  private sequence = 0;

  update(observations: readonly HandObservation[], now: number): HandFrame[] {
    for (const [id, track] of this.tracks) {
      if (now - track.timestamp > VISION_CONFIG.identityRetentionMs) this.tracks.delete(id);
    }
    const inputs = observations.slice(0, VISION_CONFIG.numHands);
    const candidates = [...this.tracks.values()];
    let bestCost = Infinity;
    let best: Array<Track | null> = [];
    const search = (index: number, assigned: Array<Track | null>, cost: number): void => {
      if (cost >= bestCost) return;
      if (index === inputs.length) { bestCost = cost; best = [...assigned]; return; }
      for (const candidate of candidates) {
        if (assigned.includes(candidate)) continue;
        const pairCost = this.cost(inputs[index], candidate, now);
        if (Number.isFinite(pairCost)) search(index + 1, [...assigned, candidate], cost + pairCost);
      }
      search(index + 1, [...assigned, null], cost + 0.7);
    };
    search(0, [], 0);

    const frames = inputs.map((observation, index): HandFrame => {
      let track = best[index];
      if (!track) {
        track = {
          id: `hand-${++this.sequence}`, side: observation.handedness,
          center: observation.palmCenter, velocity: { x: 0, y: 0, z: 0 },
          timestamp: now, candidate: 'Unknown', confirmations: 0,
        };
      } else {
        const dt = (now - track.timestamp) / 1000;
        for (const axis of ['x', 'y', 'z'] as const) {
          const velocity = dt > 0 && dt < 0.18 ? (observation.palmCenter[axis] - track.center[axis]) / dt : 0;
          track.velocity[axis] = dt < 0.18 ? track.velocity[axis] * 0.5 + Math.max(-3, Math.min(3, velocity)) * 0.5 : 0;
        }
        if (observation.handedness !== 'Unknown' && observation.confidence >= 0.8) {
          track.confirmations = track.candidate === observation.handedness ? track.confirmations + 1 : 1;
          track.candidate = observation.handedness;
          if (track.side === 'Unknown' || track.confirmations >= VISION_CONFIG.handednessConfirmFrames) {
            track.side = observation.handedness;
          }
        } else {
          track.confirmations = 0;
        }
      }
      track.center = observation.palmCenter;
      track.timestamp = now;
      this.tracks.set(track.id, track);
      return { ...observation, id: track.id, observedHandedness: observation.handedness, handedness: track.side };
    });
    // Keep a small, bounded pool for short occlusions, never stale visible hands.
    if (this.tracks.size > 4) {
      const active = new Set(frames.map((frame) => frame.id));
      for (const track of [...this.tracks.values()].sort((a, b) => a.timestamp - b.timestamp)) {
        if (this.tracks.size <= 4) break;
        if (!active.has(track.id)) this.tracks.delete(track.id);
      }
    }
    return frames;
  }

  private cost(observation: HandObservation, track: Track, now: number): number {
    const gap = now - track.timestamp;
    const dt = gap < 180 ? Math.min(gap / 1000, 0.12) : 0;
    const center = observation.palmCenter;
    const distance = Math.hypot(
      center.x - track.center.x - track.velocity.x * dt,
      center.y - track.center.y - track.velocity.y * dt,
      (center.z - track.center.z - track.velocity.z * dt) * 0.25,
    );
    if (distance > VISION_CONFIG.identityDistanceGate) return Infinity;
    const mismatch = observation.handedness !== 'Unknown' && track.side !== 'Unknown' && observation.handedness !== track.side;
    return distance + (mismatch ? VISION_CONFIG.handednessPenalty * observation.confidence : 0) + gap * 0.00004;
  }

  reset(): void { this.tracks.clear(); this.sequence = 0; }
}
