// The site build as an installable app: manifest and icons, the service worker, a start
// without a network; and the default theme from brand.json.
const OUT = process.env.OUT || ".";
import puppeteer from "puppeteer-core";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const site = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".png": "image/png", ".webmanifest": "application/manifest+json" };
const srv = createServer((q, r) => {
  let f = decodeURIComponent(new URL(q.url, "http://x").pathname.replace(/^\/outheis-map\//, "/"));
  if (f.endsWith("/")) f += "index.html";
  const path = join(site, f);
  if (!path.startsWith(site) || !existsSync(path)) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { "content-type": types[extname(path)] || "application/octet-stream" }); r.end(readFileSync(path));
}).listen(0);
const url = `http://localhost:${srv.address().port}/outheis-map/`;
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("dialog", d => d.accept());
await p.goto(url); await sleep(800);
const m = await p.evaluate(async () => { const l = document.querySelector('link[rel="manifest"]'); return l && (await fetch(l.href)).json(); });
check(m && m.name === "οὐθείς Map" && m.start_url === "./" && m.display === "standalone" && m.icons.length === 2, "manifest: " + (m && m.name));
check(await p.evaluate(async () => (await Promise.all(["icon-192.png", "icon-512.png", "icon-180.png", "icon-32.png"].map(f => fetch(f)))).every(r => r.ok)), "icons served");
const reg = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; return r.active && r.active.state; });
check(reg === "activated", "service worker active");
await p.reload(); await sleep(800);
await p.evaluate(() => document.getElementById("setDemo").click()); await sleep(500);
const n0 = await p.evaluate(() => window.__map.state().nodes.length);
// no network: the server is gone, as on a plane
srv.closeAllConnections(); srv.close();
await p.reload({ waitUntil: "domcontentloaded", timeout: 8000 }); await sleep(1000);
check(await p.evaluate(() => document.title === "οὐθείς Map" && !!document.querySelector(".node")), "starts without a network");
check(await p.evaluate(() => window.__map.state().nodes.length) === n0, "the map is still there (" + n0 + " nodes)");
await p.screenshot({ path: OUT + "/app-offline.png" });
check(await p.evaluate(() => !document.documentElement.classList.contains("ergonoi")), "default theme outheis");
check(!errs.length, "no errors " + errs.join("|"));
// the single file registers no service worker
const q = await b.newPage(); await q.goto(process.env.MAP_URL); await sleep(600);
check(await q.evaluate(() => !document.querySelector('link[rel="manifest"]')), "the single file has no manifest");
await b.close();
