import { describe, expect, it } from "vitest";
import {
  autoSpin, BUILTIN_SCENES, describeScene, drawEdges, FRONT, prefersReducedMotion, project, renderFlat, rotateByDrag, rotateByKey, TOP,
} from "../../packages/kit";
import { recorder } from "./helpers";

const key = (p: { x: number; y: number }[]) => new Set(p.map((q) => `${q.x.toFixed(3)},${q.y.toFixed(3)}`));

describe("project", () => {
  it("keeps every point inside the unit disc in a flat view", () => {
    for (const s of BUILTIN_SCENES)
      for (const yaw of [0, 0.7, 2, 4])
        for (const pitch of [0, 0.5, Math.PI / 2])
          for (const q of project(s, { yaw, pitch }).points) expect(Math.hypot(q.x, q.y)).toBeLessThanOrEqual(1 + 1e-9);
  });
  it("is pure: same input, same output", () => {
    const s = BUILTIN_SCENES[1];
    expect(project(s, { yaw: 1, pitch: 0.3 })).toEqual(project(s, { yaw: 1, pitch: 0.3 }));
  });
  it("gives a different front and top view for every built-in shape", () => {
    for (const s of BUILTIN_SCENES) {
      const f = key(project(s, FRONT).points), t = key(project(s, TOP).points);
      const same = f.size === t.size && [...f].every((k) => t.has(k));
      expect(same, `${s.id} front equals top`).toBe(false);
    }
  });
});

describe("flat output", () => {
  it("draws one segment per edge, centred", () => {
    const { ctx, calls } = recorder();
    const s = BUILTIN_SCENES[1];
    renderFlat(project(s, FRONT), ctx, 400, 300);
    expect(calls.filter((c) => c.startsWith("lineTo")).length).toBe(s.edges.length);
    expect(calls).toContain("translate(200.0,150.0)");
  });
  it("drawEdges scales to the given size", () => {
    const { ctx, calls } = recorder();
    drawEdges({ points: [{ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }], edges: [[0, 1]] }, ctx, 100, "#fff", 2);
    expect(calls).toEqual(["beginPath()", "moveTo(50.0,0.0)", "lineTo(0.0,-50.0)", "stroke()"]);
  });
  it("arrow keys and drag rotate; other keys do nothing", () => {
    expect(rotateByKey(FRONT, "ArrowRight")!.yaw).toBeGreaterThan(0);
    expect(rotateByKey(FRONT, "ArrowLeft")!.yaw).toBeLessThan(0);
    expect(rotateByKey({ yaw: 0, pitch: Math.PI / 2 }, "ArrowDown")!.pitch).toBe(Math.PI / 2);
    expect(rotateByKey(FRONT, "a")).toBeNull();
    expect(rotateByDrag(FRONT, 100, 0).yaw).toBeCloseTo(1);
    expect(rotateByDrag(FRONT, 0, 1e6).pitch).toBe(Math.PI / 2);
  });
});

describe("access", () => {
  it("stops auto rotation under reduced motion", () => {
    expect(autoSpin(true)).toBe(0);
    expect(autoSpin(false)).toBeGreaterThan(0);
    expect(prefersReducedMotion({ matchMedia: () => ({ matches: true }) })).toBe(true);
    expect(prefersReducedMotion({})).toBe(false);
  });
  it("describes the shape for a screen reader", () => {
    for (const s of BUILTIN_SCENES) expect(describeScene(s, "flat")).toContain(s.description);
  });
});
