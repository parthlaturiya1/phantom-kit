import type { Scene } from "../scene";
import { drawEdges, type Ctx } from "./flat";
import { project } from "./project";

export const GHOST_HONEST_LINE = "Pepper's ghost illusion, best for 2 to 4 learners in a dim room. Not a true hologram.";
export const GHOST_MIN_SIDE = 320; // CSS pixels; below this the four views are too small to read

/** Setup guide. Sizes are relative to the dashed square on screen, so they fit any screen. */
export const GHOST_GUIDE = {
  warning: "Warning: clear sheets have sharp edges. An adult cuts and folds the sheet. Learners do not.",
  steps: [
    "Dim the room and turn the screen brightness to the maximum. Lay the phone flat on the desk.",
    "Measure one side of the dashed square on the screen. Call it B.",
    "Cut 4 trapezoids from a clear sheet (a thin plastic folder cover works). Bottom edge B. Top edge B divided by 6. Height B times 0.6.",
    "Tape the 4 trapezoids edge to edge into a small pyramid with no top. Keep the sheets clean.",
    "Stand the pyramid with its wide end on the dashed square, narrow end up.",
    "Sit about 1 metre away, at eye height with the pyramid. Look through one side.",
  ],
} as const;

export function ghostDeskFits(width: number, height: number): boolean {
  return Math.min(width, height) >= GHOST_MIN_SIDE;
}

export const GHOST_SMALL_SCREEN_LINE = "This screen is too small for Ghost Desk. Use a larger phone or the flat view.";

export type GhostView = { yaw: number; rotation: number };

/** Four views of one shape. View k looks from the side k * 90 degrees round, and sits on side k of the screen. */
export function ghostLayout(angle: number): GhostView[] {
  return [0, 1, 2, 3].map((k) => ({ yaw: angle + (k * Math.PI) / 2, rotation: (k * Math.PI) / 2 }));
}

/** Size of each view and of the dashed pyramid square, as fractions of the shorter screen side. */
export const GHOST_VIEW_FRACTION = 0.25;
export const GHOST_BASE_FRACTION = 1 - 2 * GHOST_VIEW_FRACTION;

export function renderGhostDesk(s: Scene, angle: number, ctx: Ctx, width: number, height: number): void {
  const side = Math.min(width, height);
  const size = side * GHOST_VIEW_FRACTION;
  const dist = side / 2 - size / 2;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  for (const v of ghostLayout(angle)) {
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(v.rotation);
    ctx.translate(0, dist);
    ctx.scale(1, -1); // mirror, so the image reads upright in the sheet; the shape's top points away from the centre
    drawEdges(project(s, { yaw: v.yaw, pitch: 0.35 }), ctx, size * 0.9, "#ffffff", Math.max(2, size / 40));
    ctx.restore();
  }
  // dashed corners: where the pyramid stands
  const base = side * GHOST_BASE_FRACTION;
  const h = base / 2;
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const [x, y] of [[-h, -h], [h, -h], [h, h], [-h, h]] as const) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + (x < 0 ? 1 : -1) * base * 0.12, y);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + (y < 0 ? 1 : -1) * base * 0.12);
  }
  ctx.stroke();
  ctx.restore();
}
