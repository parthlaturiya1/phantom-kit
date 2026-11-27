import { describe, expect, it } from "vitest";
import {
  BUILTIN_SCENES, CARD_ANGLES, FRONT, GHOST_GUIDE, GHOST_HONEST_LINE, ghostDeskFits, ghostLayout, PAPER_MM, renderCard, renderGhostDesk,
  renderWindow, windowNote, windowView, type Paper,
} from "../../packages/kit";
import { recorder } from "./helpers";

describe("window output", () => {
  it("falls back to the drag view when tilt is missing, and says so", () => {
    const drag = { yaw: 0.4, pitch: 0.2 };
    expect(windowView(null, drag)).toMatchObject(drag);
    expect(windowNote(null)).toContain("drag");
    expect(windowNote({ beta: 60, gamma: 0 })).toContain("Tilt");
  });
  it("moves the camera with tilt and clamps it", () => {
    expect(windowView({ beta: 60, gamma: 20 }).yaw).toBeGreaterThan(0);
    expect(windowView({ beta: 60, gamma: 500 }).yaw).toBeCloseTo((40 * Math.PI) / 180);
  });
  it("draws every edge and never touches the camera", () => {
    const { ctx, calls } = recorder();
    renderWindow(BUILTIN_SCENES[1], null, ctx, 400, 300, FRONT);
    expect(calls.filter((c) => c.startsWith("lineTo")).length).toBe(BUILTIN_SCENES[1].edges.length);
  });
});

describe("ghost desk output", () => {
  it("draws on black, four views, each edge once per view", () => {
    const { ctx, calls } = recorder();
    const s = BUILTIN_SCENES[0];
    renderGhostDesk(s, 0.3, ctx, 600, 600);
    expect(calls[0]).toBe("fillRect(0.0,0.0,600.0,600.0)");
    expect(calls.filter((c) => c.startsWith("rotate")).length).toBe(4);
    expect(calls.filter((c) => c.startsWith("scale(1.0,-1.0)")).length).toBe(4);
    expect(calls.filter((c) => c.startsWith("lineTo")).length).toBe(4 * s.edges.length + 8); // 8 = dashed corners
  });
  it("has the honest line and a guide with the sharp-edge warning", () => {
    expect(GHOST_HONEST_LINE).toBe("Pepper's ghost illusion, best for 2 to 4 learners in a dim room. Not a true hologram.");
    expect(GHOST_GUIDE.warning).toMatch(/sharp edges.*adult/i);
    expect(GHOST_GUIDE.steps).toHaveLength(6);
  });
  it("checks the screen size", () => {
    expect(ghostDeskFits(400, 700)).toBe(true);
    expect(ghostDeskFits(300, 700)).toBe(false);
    expect(ghostDeskFits(900, 200)).toBe(false);
  });
  it("lays the four views a quarter turn apart", () => {
    expect(ghostLayout(0).map((v) => v.rotation)).toEqual([0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]);
  });
});

describe("card output", () => {
  const papers: Paper[] = ["A4", "Letter"];
  it("is repeatable and carries the item code", () => {
    for (const s of BUILTIN_SCENES) {
      expect(renderCard(s)).toBe(renderCard(s));
      expect(renderCard(s)).toContain(`Item ${s.id}`);
    }
  });
  it("uses black on white only", () => {
    const svg = renderCard(BUILTIN_SCENES[0]);
    expect([...new Set(svg.match(/#[0-9a-f]{3,6}/gi))].sort()).toEqual(["#000", "#fff"]);
  });
  it("keeps every drawn point inside A4 and Letter", () => {
    for (const paper of papers)
      for (const s of BUILTIN_SCENES) {
        const { w, h } = PAPER_MM[paper];
        const svg = renderCard(s, CARD_ANGLES, paper);
        expect(svg).toContain(`width="${w}mm" height="${h}mm"`);
        const d = svg.match(/ d="([^"]+)"/g)!.join(" ");
        for (const m of d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)) {
          expect(+m[1]).toBeGreaterThan(12 - 1e-6);
          expect(+m[1]).toBeLessThan(w - 12 + 1e-6);
          expect(+m[2]).toBeGreaterThan(12 - 1e-6);
          expect(+m[2]).toBeLessThan(h - 12 + 1e-6);
        }
      }
  });
  it("escapes the title", () => {
    const s = { ...BUILTIN_SCENES[0], title: `A <b> & "c"` };
    const svg = renderCard(s);
    expect(svg).toContain("A &lt;b&gt; &amp; &quot;c&quot;");
    expect(svg).not.toContain("<b>");
  });
});
