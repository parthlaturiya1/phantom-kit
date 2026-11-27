import type { Projected, ViewParams } from "./project";

/** The part of a 2D canvas the renderers use. Lets tests pass a recorder. */
export type Ctx = Pick<
  CanvasRenderingContext2D,
  "save" | "restore" | "translate" | "rotate" | "scale" | "beginPath" | "moveTo" | "lineTo" | "stroke" | "fillRect" | "fillText"
> & { strokeStyle: unknown; fillStyle: unknown; lineWidth: number; lineCap: CanvasLineCap; font: string; textAlign: CanvasTextAlign };

/** Draw edges centred in a square of side `size` at (0,0). Y is flipped because canvas y points down. */
export function drawEdges(p: Projected, ctx: Ctx, size: number, color: string, lineWidth: number): void {
  const r = size / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (const [a, b] of p.edges) {
    ctx.moveTo(p.points[a].x * r, -p.points[a].y * r);
    ctx.lineTo(p.points[b].x * r, -p.points[b].y * r);
  }
  ctx.stroke();
}

export function renderFlat(p: Projected, ctx: Ctx, width: number, height: number): void {
  const size = Math.min(width, height) * 0.86;
  ctx.save();
  ctx.fillStyle = "#101418";
  ctx.fillRect(0, 0, width, height);
  ctx.translate(width / 2, height / 2);
  drawEdges(p, ctx, size, "#f4f1e8", Math.max(2, size / 90));
  ctx.restore();
}

const STEP = Math.PI / 12; // 15 degrees per key press
const DRAG_RAD_PER_PX = 0.01;
const LIMIT = Math.PI / 2;

/** Arrow keys turn the shape. Returns null for any other key. */
export function rotateByKey(v: ViewParams, key: string): ViewParams | null {
  switch (key) {
    case "ArrowLeft": return { ...v, yaw: v.yaw - STEP };
    case "ArrowRight": return { ...v, yaw: v.yaw + STEP };
    case "ArrowUp": return { ...v, pitch: Math.max(-LIMIT, v.pitch - STEP) };
    case "ArrowDown": return { ...v, pitch: Math.min(LIMIT, v.pitch + STEP) };
    default: return null;
  }
}

/** A drag of (dx, dy) pixels turns the shape. */
export function rotateByDrag(v: ViewParams, dx: number, dy: number): ViewParams {
  return {
    ...v,
    yaw: v.yaw + dx * DRAG_RAD_PER_PX,
    pitch: Math.max(-LIMIT, Math.min(LIMIT, v.pitch + dy * DRAG_RAD_PER_PX)),
  };
}
