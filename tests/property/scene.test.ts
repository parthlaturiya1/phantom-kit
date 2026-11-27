import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { parseScene, serializeScene, type Scene } from "../../packages/kit";

const coord = fc.double({ min: -1, max: 1, noNaN: true }).map((n) => n + 0);
const sceneArb: fc.Arbitrary<Scene> = fc
  .record({
    id: fc.stringMatching(/^[a-z0-9-]{3,12}$/),
    title: fc.string({ minLength: 1, maxLength: 60 }),
    description: fc.string({ minLength: 1, maxLength: 100 }),
    baseDifficulty: fc.double({ min: 0, max: 3000, noNaN: true }).map((n) => n + 0),
    vertices: fc.array(fc.tuple(coord, coord, coord), { minLength: 3, maxLength: 20 }),
    withFaces: fc.boolean(),
  })
  .chain((b) => {
    const idx = fc.integer({ min: 0, max: b.vertices.length - 1 });
    return fc.record({ edges: fc.array(fc.tuple(idx, idx), { maxLength: 20 }), tri: fc.tuple(idx, idx, idx) }).map(({ edges, tri }) => {
      const s: Scene = { version: 1, id: b.id, title: b.title, vertices: b.vertices, edges, description: b.description, baseDifficulty: b.baseDifficulty };
      if (b.withFaces) s.faces = [tri];
      return s;
    });
  });

describe("scene properties", () => {
  it("parse(serialize(s)) equals s", () => {
    fc.assert(
      fc.property(sceneArb, (s) => {
        const r = parseScene(serializeScene(s));
        expect(r).toEqual({ ok: true, value: s });
      }),
      { seed: 20261127, numRuns: 300 },
    );
  });
});
