// The note field of the detail keeps the height it was drawn to, from node to node and after
// reloading; a map is saved as ergonoi-map.txt under the ergonoi look.
import puppeteer from "puppeteer-core";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const errs = [];
const p = await b.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("dialog", d => d.accept());
await p.setViewport({ width: 1500, height: 900 });
await p.goto(process.env.MAP_URL); await sleep(1800);
if (await p.evaluate(() => !document.getElementById("empty").classList.contains("hidden"))) { await p.evaluate(() => document.getElementById("emptyDemo").click()); await sleep(1500); }
const select = async t => { const id = await p.evaluate(t => window.__map.state().nodes.find(n => n.title === t).id, t); const el = await p.$(`[data-nid="${id}"]`); const bb = await el.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(400); };
await select("Mountain hut");
check(await p.evaluate(() => !!document.getElementById("detNote")), "the detail shows the note field");
await p.evaluate(() => { document.getElementById("detNote").style.height = "260px"; }); await sleep(300);
await select("Places");
check(await p.evaluate(() => document.getElementById("detNote").offsetHeight === 260), "another node: the same height " + await p.evaluate(() => document.getElementById("detNote").offsetHeight));
await p.goto(process.env.MAP_URL, { waitUntil: "domcontentloaded" }); await sleep(1800); await select("Mountain hut");
check(await p.evaluate(() => document.getElementById("detNote").offsetHeight === 260), "after reloading: the same height");
const name = await p.evaluate(() => new Promise(res => { const o = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { HTMLAnchorElement.prototype.click = o; res(this.download); }; document.documentElement.classList.contains("ergonoi") ? document.getElementById("fileDownload").click() : res("not ergonoi"); }));
check(name === "ergonoi-map.txt", "saved as ergonoi-map.txt: " + name);
console.log(errs.length ? errs : "no errors"); await b.close();
