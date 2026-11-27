import type { Result } from "../result";

export const SCENE_VERSION = 1;
export const MAX_BYTES = 256 * 1024;
export const MAX_VERTICES = 2000;

export type Vec3 = [number, number, number];

export type Scene = {
  version: 1;
  id: string; // item code, 3 to 12 chars, [a-z0-9-]
  title: string; // max 60 chars
  vertices: Vec3[]; // max 2000, each in [-1, 1]
  edges: [number, number][]; // indexes into vertices
  faces?: number[][];
  description: string; // text for screen readers
  baseDifficulty: number; // starting rating
};

export type SceneError = { field: string; message: string };

const KEYS = ["version", "id", "title", "vertices", "edges", "faces", "description", "baseDifficulty"];
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);

/** Parse and validate scene file text. Every invalid field is reported by name. */
export function parseScene(text: string): Result<Scene, SceneError[]> {
  if (new TextEncoder().encode(text).length > MAX_BYTES) {
    return { ok: false, error: [{ field: "file", message: `file is larger than the limit of ${MAX_BYTES / 1024} KB` }] };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: [{ field: "file", message: "not valid JSON" }] };
  }
  if (!isObj(raw)) return { ok: false, error: [{ field: "file", message: "must be a JSON object" }] };
  if (raw.version !== SCENE_VERSION) {
    return {
      ok: false,
      error: [{ field: "version", message: `unknown version ${JSON.stringify(raw.version)}; this kit supports version ${SCENE_VERSION}` }],
    };
  }
  const errs: SceneError[] = [];
  const bad = (field: string, message: string) => errs.push({ field, message });

  for (const k of Object.keys(raw)) if (!KEYS.includes(k)) bad(k, "unknown field");

  if (typeof raw.id !== "string" || !/^[a-z0-9-]{3,12}$/.test(raw.id)) bad("id", "must be 3 to 12 chars of a-z, 0-9 or -");
  if (typeof raw.title !== "string" || raw.title.length < 1 || raw.title.length > 60) bad("title", "must be 1 to 60 characters");
  if (typeof raw.description !== "string" || raw.description.length < 1) bad("description", "must be a non-empty string");
  if (typeof raw.baseDifficulty !== "number" || !Number.isFinite(raw.baseDifficulty)) bad("baseDifficulty", "must be a finite number");

  const verts = raw.vertices;
  let nv = 0;
  if (!Array.isArray(verts) || verts.length < 1) bad("vertices", "must be a non-empty list");
  else if (verts.length > MAX_VERTICES) bad("vertices", `has ${verts.length} vertices; the limit is ${MAX_VERTICES}`);
  else {
    nv = verts.length;
    verts.forEach((v, i) => {
      const ok = Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === "number" && Number.isFinite(n) && n >= -1 && n <= 1);
      if (!ok) bad(`vertices[${i}]`, "must be [x, y, z], each a number from -1 to 1");
    });
  }

  const inRange = (n: unknown) => isInt(n) && n >= 0 && n < nv;
  if (!Array.isArray(raw.edges)) bad("edges", "must be a list");
  else
    raw.edges.forEach((e, i) => {
      if (!(Array.isArray(e) && e.length === 2 && inRange(e[0]) && inRange(e[1]))) bad(`edges[${i}]`, "must be two vertex indexes");
    });
  if (raw.faces !== undefined) {
    if (!Array.isArray(raw.faces)) bad("faces", "must be a list");
    else
      raw.faces.forEach((f, i) => {
        if (!(Array.isArray(f) && f.length >= 3 && f.every(inRange))) bad(`faces[${i}]`, "must be 3 or more vertex indexes");
      });
  }

  if (errs.length) return { ok: false, error: errs };
  const s: Scene = {
    version: 1,
    id: raw.id as string,
    title: raw.title as string,
    vertices: (raw.vertices as Vec3[]).map((v) => [v[0] + 0, v[1] + 0, v[2] + 0]), // +0 turns -0 into 0
    edges: raw.edges as [number, number][],
    description: raw.description as string,
    baseDifficulty: raw.baseDifficulty as number,
  };
  if (raw.faces !== undefined) s.faces = raw.faces as number[][];
  return { ok: true, value: s };
}

/** Write a scene as JSON with a fixed key order. */
export function serializeScene(s: Scene): string {
  const o: Record<string, unknown> = {
    version: s.version,
    id: s.id,
    title: s.title,
    vertices: s.vertices,
    edges: s.edges,
  };
  if (s.faces !== undefined) o.faces = s.faces;
  o.description = s.description;
  o.baseDifficulty = s.baseDifficulty;
  return JSON.stringify(o);
}
