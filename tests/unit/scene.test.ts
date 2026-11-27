import { describe, expect, it } from "vitest";
import { BUILTIN_SCENES, MAX_BYTES, parseScene, serializeScene } from "../../packages/kit";

const good = serializeScene(BUILTIN_SCENES[0]);
const mutate = (f: (o: Record<string, unknown>) => void) => {
  const o = JSON.parse(good);
  f(o);
  return JSON.stringify(o);
};
const fields = (text: string) => {
  const r = parseScene(text);
  return r.ok ? [] : r.error.map((e) => e.field);
};

describe("parseScene", () => {
  it("accepts every built-in scene", () => {
    expect(BUILTIN_SCENES).toHaveLength(4);
    for (const s of BUILTIN_SCENES) expect(parseScene(serializeScene(s))).toEqual({ ok: true, value: s });
  });
  it("names each bad field", () => {
    expect(fields(mutate((o) => (o.id = "BAD ID")))).toEqual(["id"]);
    expect(fields(mutate((o) => (o.title = "")))).toEqual(["title"]);
    expect(fields(mutate((o) => (o.description = 5)))).toEqual(["description"]);
    expect(fields(mutate((o) => (o.baseDifficulty = "x")))).toEqual(["baseDifficulty"]);
    expect(fields(mutate((o) => ((o.vertices as number[][])[2] = [0, 0, 2])))).toEqual(["vertices[2]"]);
    expect(fields(mutate((o) => ((o.edges as number[][])[1] = [0, 99])))).toEqual(["edges[1]"]);
    expect(fields(mutate((o) => (o.faces = [[0, 1]])))).toEqual(["faces[0]"]);
    expect(fields(mutate((o) => (o.extra = 1)))).toEqual(["extra"]);
  });
  it("rejects an unknown version and names the supported one", () => {
    const r = parseScene(mutate((o) => (o.version = 2)));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error[0].message).toContain("supports version 1");
  });
  it("rejects bad JSON and non-objects", () => {
    expect(fields("{")).toEqual(["file"]);
    expect(fields("[]")).toEqual(["file"]);
  });
  it("states the limit for a big file", () => {
    const r = parseScene(" ".repeat(MAX_BYTES + 1));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error[0].message).toContain("256 KB");
  });
  it("states the limit for too many vertices", () => {
    const r = parseScene(mutate((o) => (o.vertices = Array.from({ length: 2001 }, () => [0, 0, 0]))));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error[0].message).toContain("2000");
  });
});
