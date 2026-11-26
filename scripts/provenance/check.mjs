// Fail if any ledger line is not valid JSON.
import { existsSync, readFileSync } from "node:fs";

const file = process.env.PROVENANCE_LEDGER || "docs/provenance/ledger.jsonl";
if (!existsSync(file)) {
  console.log("provenance:check: no ledger yet, nothing to check");
  process.exit(0);
}
const lines = readFileSync(file, "utf8").split("\n").filter((l) => l.trim());
const bad = [];
lines.forEach((l, i) => {
  try {
    const o = JSON.parse(l);
    if (typeof o !== "object" || o === null || Array.isArray(o)) throw new Error("not an object");
  } catch { bad.push(i + 1); }
});
if (bad.length) {
  console.error(`provenance:check: invalid JSON on line(s) ${bad.join(", ")}`);
  process.exit(1);
}
console.log(`provenance:check: ${lines.length} line(s) valid`);
