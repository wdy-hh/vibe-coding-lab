import type { Vec3 } from '../vision/types.ts';

export const FINGER_CHAINS = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]] as const;
export const SURFACE_TOPOLOGY = {
  palmEdges: 8,
  stepsPerBone: 12,
  capSteps: 8,
  fingerRadius: [0.115, 0.095, 0.10, 0.092, 0.077],
  fingerFlattening: 0.72,
  palmThickness: 0.075,
} as const;
export const TUBE_STEPS = SURFACE_TOPOLOGY.stepsPerBone * 3;
export const FINGER_RINGS = TUBE_STEPS + SURFACE_TOPOLOGY.capSteps + 1;

/** Authored reference pose for sampling density; never used as camera results. */
export const REFERENCE_HAND: readonly Vec3[] = [
  { x: .5, y: .83, z: 0 },
  { x: .39, y: .72, z: -.015 }, { x: .30, y: .61, z: -.025 }, { x: .24, y: .51, z: -.035 }, { x: .19, y: .43, z: -.04 },
  { x: .39, y: .54, z: -.015 }, { x: .36, y: .36, z: -.025 }, { x: .35, y: .24, z: -.03 }, { x: .34, y: .15, z: -.035 },
  { x: .50, y: .51, z: -.02 }, { x: .50, y: .30, z: -.03 }, { x: .50, y: .17, z: -.035 }, { x: .50, y: .07, z: -.04 },
  { x: .61, y: .54, z: -.015 }, { x: .63, y: .36, z: -.025 }, { x: .64, y: .24, z: -.03 }, { x: .65, y: .15, z: -.035 },
  { x: .70, y: .61, z: -.005 }, { x: .74, y: .46, z: -.015 }, { x: .77, y: .35, z: -.02 }, { x: .79, y: .27, z: -.025 },
];
