import type { Scene } from "../scene";
import { drawEdges, type Ctx } from "./flat";
import { FRONT, project, type ViewParams } from "./project";

/** Device tilt in degrees, as in the browser's deviceorientation event. */
export type Tilt = { beta: number; gamma: number };

const DEG = Math.PI / 180;
const clamp = (n: number, lim: number) => Math.max(-lim, Math.min(lim, n));
export const WINDOW_DISTANCE = 3;

/** Camera for the window view: tilt if we have it, otherwise the drag view. */
export function windowView(tilt: Tilt | null, drag: ViewParams = FRONT): ViewParams {
  const base = tilt
    ? { yaw: clamp(tilt.gamma, 40) * DEG, pitch: clamp(tilt.beta - 60, 40) * DEG } // 60 degrees is a phone held up to read
    : drag;
  return { ...base, distance: WINDOW_DISTANCE };
}

/** The one line shown under the window view. */
export function windowNote(tilt: Tilt | null): string {
  return tilt ? "Tilt your phone to look around the shape." : "No tilt on this device, so drag the shape instead.";
}

export function renderWindow(s: Scene, tilt: Tilt | null, ctx: Ctx, width: number, height: number, drag: ViewParams = FRONT): void {
  const size = Math.min(width, height) * 0.6; // perspective can push points out of the unit disc; 0.6 keeps them in the frame
  ctx.save();
  ctx.fillStyle = "#101418";
  ctx.fillRect(0, 0, width, height);
  ctx.translate(width / 2, height / 2);
  drawEdges(project(s, windowView(tilt, drag)), ctx, size, "#f4f1e8", Math.max(2, size / 70));
  ctx.restore();
}
