export interface Vec3 { x: number; y: number; z: number }
export type Handedness = 'Left' | 'Right' | 'Unknown';

/** Original, unmirrored image coordinates. z is relative depth, not a scan. */
export interface HandObservation {
  handedness: Handedness;
  /** SDK handedness category score, NOT a hand-detection/presence score. */
  confidence: number;
  landmarks: Vec3[];
  /** Estimated coordinates in metres, relative to each hand's centre. */
  worldLandmarks?: Vec3[];
  palmCenter: Vec3;
  timestamp: number;
}

export interface HandFrame extends HandObservation {
  id: string;
  /** Raw per-frame category, before identity label stabilisation. */
  observedHandedness: Handedness;
}

export function palmCenter(landmarks: readonly Vec3[]): Vec3 {
  const center = { x: 0, y: 0, z: 0 };
  for (const index of [0, 5, 9, 13, 17]) {
    const point = landmarks[index];
    center.x += point.x / 5;
    center.y += point.y / 5;
    center.z += point.z / 5;
  }
  return center;
}
