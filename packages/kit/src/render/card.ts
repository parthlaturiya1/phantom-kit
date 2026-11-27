import type { Scene } from "../scene";
import { project } from "./project";

export type Paper = "A4" | "Letter";
export const PAPER_MM: Record<Paper, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  Letter: { w: 215.9, h: 279.4 },
};
/** Fixed yaw angles in degrees, one picture each. */
export const CARD_ANGLES = [0, 60, 120, 180, 240, 300];
const PITCH = (20 * Math.PI) / 180;
const MARGIN = 12;
const HEADER = 22;
const LABEL = 8;
const COLS = 2;

const n = (v: number) => v.toFixed(2);
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Black lines on white, in millimetres, as SVG text. Same scene and angles always give the same text. */
export function renderCard(s: Scene, angles: number[] = CARD_ANGLES, paper: Paper = "A4"): string {
  const { w, h } = PAPER_MM[paper];
  const rows = Math.ceil(angles.length / COLS);
  const cellW = (w - 2 * MARGIN) / COLS;
  const cellH = (h - 2 * MARGIN - HEADER) / rows;
  const size = Math.min(cellW, cellH - LABEL) * 0.9; // every point lies in the unit disc, so the shape cannot be cut
  const out: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(`Card for ${s.title}. ${s.description}`)}">`,
    `<rect width="${w}" height="${h}" fill="#fff"/>`,
    `<text x="${MARGIN}" y="${MARGIN + 8}" font-family="sans-serif" font-size="8" font-weight="700">${esc(s.title)}</text>`,
    `<text x="${w - MARGIN}" y="${MARGIN + 8}" font-family="monospace" font-size="8" text-anchor="end">Item ${esc(s.id)}</text>`,
  ];
  angles.forEach((deg, i) => {
    const cx = MARGIN + (i % COLS) * cellW + cellW / 2;
    const cy = MARGIN + HEADER + Math.floor(i / COLS) * cellH + (cellH - LABEL) / 2;
    const p = project(s, { yaw: (deg * Math.PI) / 180, pitch: PITCH });
    const X = (i2: number) => n(cx + (p.points[i2].x * size) / 2);
    const Y = (i2: number) => n(cy - (p.points[i2].y * size) / 2);
    const d = p.edges.map(([a, b]) => `M${X(a)} ${Y(a)}L${X(b)} ${Y(b)}`).join("");
    out.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="0.7" stroke-linecap="round"/>`);
    out.push(`<text x="${n(cx)}" y="${n(cy + size / 2 + LABEL - 1)}" font-family="sans-serif" font-size="4" text-anchor="middle">${deg} degrees</text>`);
  });
  out.push("</svg>");
  return out.join("\n");
}
