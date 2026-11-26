import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rec = (ledger, args, input) =>
  spawnSync(process.execPath, ["scripts/provenance/record.mjs", ...args], {
    env: { ...process.env, PROVENANCE_LEDGER: ledger },
    encoding: "utf8",
    input,
  });
const tmp = () => join(mkdtempSync(join(tmpdir(), "prov-")), "ledger.jsonl");

describe("record.mjs", () => {
  it("appends exactly one valid JSON line", () => {
    const l = tmp();
    const r = rec(l, ["--event", "file-save", "--path", "src/a.ts", "--note", "hi"]);
    expect(r.status).toBe(0);
    const lines = readFileSync(l, "utf8").split("\n").filter(Boolean);
    expect(lines).toHaveLength(1);
    const o = JSON.parse(lines[0]);
    expect(o).toMatchObject({ event: "file-save", path: "src/a.ts", tool: "kiro", note: "hi" });
    expect(new Date(o.ts).toISOString()).toBe(o.ts);
  });

  it("refuses empty input and unknown events, writing nothing", () => {
    const l = tmp();
    expect(rec(l, []).status).not.toBe(0);
    expect(rec(l, ["--event", "  "]).status).not.toBe(0);
    expect(rec(l, ["--event", "bogus"]).status).not.toBe(0);
    expect(existsSync(l)).toBe(false);
  });

  it("never rewrites earlier lines", () => {
    const l = tmp();
    writeFileSync(l, '{"old":1}\n{"old":2}\n');
    rec(l, ["--event", "agent-stop"]);
    rec(l, ["--event", "agent-stop"]);
    const lines = readFileSync(l, "utf8").split("\n").filter(Boolean);
    expect(lines.slice(0, 2)).toEqual(['{"old":1}', '{"old":2}']);
    expect(lines).toHaveLength(4);
  });

  it("refuses paths inside docs/provenance (loop guard)", () => {
    const l = tmp();
    expect(rec(l, ["--event", "file-save", "--path", "docs/provenance/ledger.jsonl"]).status).not.toBe(0);
    expect(rec(l, ["--event", "file-save", "--path", "C:\\x\\docs\\provenance\\ledger.jsonl"]).status).not.toBe(0);
    expect(existsSync(l)).toBe(false);
  });

  it("reads the path from stdin JSON with --stdin", () => {
    const l = tmp();
    rec(l, ["--event", "file-save", "--stdin"], JSON.stringify({ file_path: "src/b.ts" }));
    expect(JSON.parse(readFileSync(l, "utf8")).path).toBe("src/b.ts");
  });
});

describe("provenance:check", () => {
  const chk = (l) =>
    spawnSync(process.execPath, ["scripts/provenance/check.mjs"], { env: { ...process.env, PROVENANCE_LEDGER: l }, encoding: "utf8" });
  it("passes on valid lines and fails on a bad line", () => {
    const l = tmp();
    writeFileSync(l, '{"a":1}\n');
    expect(chk(l).status).toBe(0);
    writeFileSync(l, '{"a":1}\nnot json\n');
    expect(chk(l).status).toBe(1);
  });
});
