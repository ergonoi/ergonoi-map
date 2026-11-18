// Renders the app icons from icons/src/icon.html into icons/<theme>-<size>.png and the link
// preview from icons/src/og.html into icons/<theme>-og.png, for both
// themes in brand.json. Needs Chrome and puppeteer-core (from test/: npm install there).
// Usage: node icons/render.mjs
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "..", "test", "package.json"));
const puppeteer = require("puppeteer-core");
const themes = Object.keys(JSON.parse(readFileSync(join(here, "..", "brand.json"), "utf8")).themes);
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox", "--allow-file-access-from-files"] });
const p = await b.newPage();
for (const t of themes) for (const s of [32, 180, 192, 512]) {
  await p.setViewport({ width: s, height: s });
  await p.goto(`file://${join(here, "src", "icon.html")}?t=${t}&s=${s}`);
  await p.evaluate(() => document.fonts.ready);
  await (await p.$("#icon")).screenshot({ path: join(here, `${t}-${s}.png`) });
  console.log(`icons/${t}-${s}.png`);
}
// the link preview, 1200 x 630
for (const t of themes) {
  await p.setViewport({ width: 1200, height: 630 });
  await p.goto(`file://${join(here, "src", "og.html")}?t=${t}`);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: join(here, `${t}-og.png`) });
  console.log(`icons/${t}-og.png`);
}
await b.close();
