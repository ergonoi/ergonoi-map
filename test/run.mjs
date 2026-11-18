// Runs the browser tests (*.test.mjs), each in its own Node process, against a fresh build
// of dist/outheis-map.html. Usage: node run.mjs [part of a file name …]
// Needs Python 3 (build) and Chrome or Chromium (CHROME=/path/to/chrome).
import { readdirSync, mkdtempSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url)), root = join(here, "..");
const only = process.argv.slice(2);
const files = readdirSync(here).filter(f => f.endsWith(".test.mjs")).sort()
  .filter(f => !only.length || only.some(o => f.includes(o)));
execFileSync("python3", [join(root, "build.py")], { stdio: "ignore" });
const env = { ...process.env, MAP_URL: "file://" + join(root, "dist/outheis-map.html"), OUT: mkdtempSync(join(tmpdir(), "map-test-")) };
let bad = 0;
for (const f of files) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [join(here, f)], { env, encoding: "utf8", timeout: 300000 });
  const out = (r.stdout + r.stderr).trim().split("\n").filter(l => l.trim());
  const failed = r.status !== 0;
  if (failed) bad++;
  console.log(`${failed ? "FAIL" : "ok  "} ${f} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  for (const l of out) if (failed || /^FAIL/.test(l)) console.log("     " + l);
}
console.log(bad ? `${bad} of ${files.length} files failed` : `all ${files.length} passed (screenshots in ${env.OUT})`);
process.exit(bad ? 1 : 0);
