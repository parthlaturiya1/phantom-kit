import type { Scene } from "../scene";

export type ViewParams = {
  yaw: number; // radians, turn about the up axis
  pitch: number; // radians, tilt towards the viewer
  distance?: number; // camera distance for a perspective view; leave out for a flat (orthographic) view
};

/** 2D points in the unit disc (y up), plus depth. Every output draws from this one result. */
export type Projected = {
  points: { x: number; y: number; z: number }[];
  edges: [number, number][];
};

export const FRONT: ViewParams = { yaw: 0, pitch: 0 };
export const TOP: ViewParams = { yaw: 0, pitch: Math.PI / 2 };

/** Pure. Rotate the scene by the view, then drop depth. The shape is scaled so its farthest vertex sits on the unit circle. */
export function project(s: Scene, view: ViewParams): Projected {
  const radius = Math.max(1e-9, ...s.vertices.map(([x, y, z]) => Math.hypot(x, y, z)));
  const cy = Math.cos(view.yaw), sy = Math.sin(view.yaw);
  const cp = Math.cos(view.pitch), sp = Math.sin(view.pitch);
  const points = s.vertices.map(([x0, y0, z0]) => {
    const x1 = (x0 * cy + z0 * sy) / radius;
    const z1 = (-x0 * sy + z0 * cy) / radius;
    const y1 = y0 / radius;
    const y = y1 * cp - z1 * sp;
    const z = y1 * sp + z1 * cp;
    const f = view.distance ? view.distance / Math.max(0.1, view.distance - z) : 1;
    return { x: x1 * f, y: y * f, z };
  });
  return { points, edges: s.edges };
}
