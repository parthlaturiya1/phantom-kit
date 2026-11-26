// Append exactly one JSON line to the provenance ledger. Append only.
// Usage: node scripts/provenance/record.mjs --event <name> [--path <file>] [--note <text>] [--stdin]
// --stdin reads a hook event JSON from STDIN to find the file path (key names UNKNOWN, see docs/verification/t02.md).
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export const EVENTS = ["file-save", "agent-stop", "manual"];
const LEDGER = process.env.PROVENANCE_LEDGER || "docs/provenance/ledger.jsonl";

export function buildLine(argv, stdinText = "") {
  const opt = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--stdin") opt.stdin = true;
    else if (argv[i].startsWith("--")) opt[argv[i].slice(2)] = argv[++i];
  }
  const event = (opt.event ?? "").trim();
  if (!event) throw new Error("empty input: --event is required");
  if (!EVENTS.includes(event)) throw new Error(`unknown event: ${event}`);
  let path = opt.path;
  if (opt.stdin && stdinText.trim()) {
    try {
      const j = JSON.parse(stdinText);
      path ??= j.file_path ?? j.filePath ?? j.path ?? j.tool_input?.path;
    } catch { /* shortcut: bad stdin JSON is ignored, the line is still written without a path */ }
  }
  if (path !== undefined && !String(path).trim()) path = undefined;
  if (path && /(^|[\\/])docs[\\/]provenance[\\/]/.test(path)) throw new Error("refusing: path is inside docs/provenance (loop guard)");
  const rec = { ts: new Date().toISOString(), event };
  if (path) rec.path = String(path);
  rec.tool = "kiro";
  rec.note = opt.note ?? "";
  return JSON.stringify(rec) + "\n";
}

async function readStdin() {
  if (process.stdin.isTTY) return "";
  let s = "";
  const timer = setTimeout(() => process.stdin.destroy(), 3000);
  for await (const c of process.stdin) s += c;
  clearTimeout(timer);
  return s;
}

if (import.meta.url === new URL(process.argv[1], "file:///").href || process.argv[1]?.endsWith("record.mjs")) {
  try {
    const argv = process.argv.slice(2);
    const line = buildLine(argv, argv.includes("--stdin") ? await readStdin() : "");
    mkdirSync(dirname(LEDGER), { recursive: true });
    appendFileSync(LEDGER, line);
  } catch (e) {
    console.error(`record.mjs: ${e.message}`);
    process.exit(1);
  }
}
