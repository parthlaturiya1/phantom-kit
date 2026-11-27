import { parseScene, type Scene, type Vec3 } from "./index";

/** Prism from a 2D outline (a, b) and a half-depth c. `map` places (a, b, c) in 3D. */
function prism(
  id: string,
  title: string,
  outline: [number, number][],
  half: number,
  map: (a: number, b: number, c: number) => Vec3,
  description: string,
): Scene {
  const n = outline.length;
  const vertices: Vec3[] = [
    ...outline.map(([a, b]) => map(a, b, -half)),
    ...outline.map(([a, b]) => map(a, b, half)),
  ];
  const edges: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    edges.push([i, j], [n + i, n + j], [i, n + i]);
  }
  return { version: 1, id, title, vertices, edges, description, baseDifficulty: 1000 };
}

const octagon: [number, number][] = Array.from({ length: 8 }, (_, i) => {
  const t = (i / 8) * 2 * Math.PI + Math.PI / 8;
  return [+(0.8 * Math.cos(t)).toFixed(4), +(0.8 * Math.sin(t)).toFixed(4)];
});

const raw: Scene[] = [
  prism(
    "l-block",
    "L block",
    [[-0.8, -0.8], [0.8, -0.8], [0.8, -0.2], [-0.2, -0.2], [-0.2, 0.8], [-0.8, 0.8]],
    0.4,
    (a, b, c) => [a, b, c],
    "An L-shaped block. From the front it looks like the letter L. From the top it looks like a long rectangle.",
  ),
  {
    version: 1,
    id: "pyramid",
    title: "Square pyramid",
    vertices: [[-0.8, -0.6, -0.8], [0.8, -0.6, -0.8], [0.8, -0.6, 0.8], [-0.8, -0.6, 0.8], [0, 0.8, 0]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4]],
    description: "A square pyramid. From the front it looks like a triangle. From the top it looks like a square with an X inside.",
    baseDifficulty: 1000,
  },
  prism(
    "tri-prism",
    "Standing triangle prism",
    [[-0.8, -0.7], [0.8, -0.7], [0, 0.7]],
    0.7,
    (a, b, c) => [a, c, b],
    "A triangle prism standing upright. From the front it looks like a tall rectangle. From the top it looks like a triangle.",
  ),
  prism(
    "log",
    "Eight-sided log",
    octagon,
    0.8,
    (a, b, c) => [a, b, c],
    "A short eight-sided log pointing at you. From the front it looks like an eight-sided shape. From the top it looks like a rectangle.",
  ),
];

/** Built-in shapes. Each one passes through parseScene, so a bad edit fails loudly. */
export const BUILTIN_SCENES: Scene[] = raw.map((s) => {
  const r = parseScene(JSON.stringify(s));
  if (!r.ok) throw new Error(`built-in scene ${s.id}: ${r.error.map((e) => `${e.field} ${e.message}`).join("; ")}`);
  return r.value;
});
