import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const win = process.platform === "win32";
const run = (cmd, args) => spawnSync(win ? `${cmd}.cmd` : cmd, args, { stdio: "inherit", shell: win });

function secretScan() {
  const files = spawnSync("git", ["ls-files", "-co", "--exclude-standard"], { encoding: "utf8" })
    .stdout.split("\n").filter(Boolean);
  const bad = /(AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{36}|sk-[A-Za-z0-9]{32,}|xox[baprs]-[A-Za-z0-9-]{10,})/;
  const hits = [];
  for (const f of files) {
    if (f === "package-lock.json" || f === "scripts/verify.mjs") continue;
    let text;
    try { text = readFileSync(f, "utf8"); } catch { continue; }
    if (bad.test(text)) hits.push(f);
  }
  if (hits.length) console.error(`Secret-like text in: ${hits.join(", ")}`);
  return hits.length ? 1 : 0;
}

function gitignoreCheck() {
  const lines = readFileSync(".gitignore", "utf8").split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#"));
  const hit = lines.filter((l) => l.includes(".kiro"));
  if (hit.length) console.error(`.gitignore names .kiro: ${hit.join(", ")}`);
  return hit.length ? 1 : 0;
}

const steps = [
  ["typecheck", () => run("npm", ["run", "typecheck"]).status],
  ["lint", () => run("npm", ["run", "lint"]).status],
  ["unit", () => run("npm", ["run", "test:unit"]).status],
  ["property", () => run("npm", ["run", "test:property"]).status],
  ["build", () => run("npm", ["run", "build"]).status],
  ["e2e smoke", () => run("npm", ["run", "test:e2e"]).status],
  ["secret scan", secretScan],
  ["gitignore check", gitignoreCheck],
];

let n = 0;
for (const [name, fn] of steps) {
  n++;
  console.log(`\n=== verify ${n}/${steps.length}: ${name} ===`);
  if (fn() !== 0) {
    console.log(`::error title=verify failed::step ${n} (${name}) failed`);
    process.exit(1);
  }
  console.log(`PASS ${name}`);
}
console.log(`\nverify: all ${steps.length} steps passed`);
