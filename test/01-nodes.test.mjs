const OUT = process.env.OUT || ".";
import puppeteer, { KnownDevices } from "puppeteer-core";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const errs = [];
const p = await b.newPage(); p.on("pageerror", e => errs.push(e.message));
await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
await p.goto(process.env.MAP_URL); await sleep(1800); if (await p.evaluate(() => !document.getElementById("empty").classList.contains("hidden"))) { await p.evaluate(() => document.getElementById("emptyDemo").click()); await sleep(1500); }
const id = t => p.evaluate(t => window.__map.state().nodes.find(n => n.title === t).id, t);
const box = async t => (await p.$(`[data-nid="${await id(t)}"]`)).boundingBox();
// select "Lake shore" then drag its handle onto "Book the train"
let a = await box("Lake shore"); await p.mouse.click(a.x + a.width / 2, a.y + a.height / 2); await sleep(200);
await p.keyboard.press("Escape"); await sleep(100);
const lh = await (await p.$(`[data-nid="${await id("Lake shore")}"] .lh`)).boundingBox();
const t = await box("Book the train");
await p.screenshot({ path: OUT + "/map2-handle.png" });
await p.mouse.move(lh.x + lh.width / 2, lh.y + lh.height / 2); await p.mouse.down();
await p.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 10 }); await p.mouse.up(); await sleep(200);
check(await p.evaluate(async (a, b) => window.__map.state().edges.some(e => (e.from === a && e.to === b) || (e.from === b && e.to === a)), await id("Lake shore"), await id("Book the train")), "handle drag links two nodes");
// drag a node -> pinned
a = await box("Old town");
await p.mouse.move(a.x + 10, a.y + a.height / 2); await p.mouse.down(); await p.mouse.move(a.x - 60, a.y + 40, { steps: 5 }); await p.mouse.up(); await sleep(200);
check(await p.evaluate(async i => !window.__map.state().nodes.find(n => n.id === i).pinned, await id("Old town")), "moving a node does not pin it");
const before = await p.evaluate(async i => { const n = window.__map.state().nodes.find(n => n.id === i); return [n.x, n.y]; }, await id("Old town"));
await p.click('#side [data-ar="untangle"]'); await sleep(4000);
const after = await p.evaluate(async i => { const n = window.__map.state().nodes.find(n => n.id === i); return [n.x, n.y]; }, await id("Old town"));

// compact
const span = () => p.evaluate(() => { const ns = window.__map.state().nodes; const xs = ns.map(n => n.x); return Math.max(...xs) - Math.min(...xs); });
const s0 = await span();
await p.click('#side [data-ar="compact"]'); await sleep(1200);
const s1 = await span(); console.log("span", s0, s1);
check(s1 < s0, "compact reduces the spread");
// inline rename in the group bar

await p.click('#side [data-gname="#2B8A3E"]'); await sleep(150);
check(await p.evaluate(() => document.activeElement.dataset.gname === "#2B8A3E"), "a tap on the name edits it in place");
await p.keyboard.down("Control"); await p.keyboard.press("a"); await p.keyboard.up("Control");
await p.keyboard.type("Orte"); await p.keyboard.press("Enter"); await sleep(150);
check(await p.evaluate(() => window.__map.state().legend["#2B8A3E"] === "Orte"), "Enter renames the group");

await p.screenshot({ path: OUT + "/map2-rename.png" });
await p.keyboard.press("Escape"); await sleep(100);
a = await box("Places"); await p.mouse.click(a.x + a.width / 2, a.y + a.height / 2); await sleep(100); await p.keyboard.press("Escape"); await sleep(150);
await p.screenshot({ path: OUT + "/map2-main.png" });
// phone: handle drag with touch
const m = await b.newPage(); m.on("pageerror", e => errs.push(e.message)); await m.emulate(KnownDevices["iPhone 13"]);
await m.goto(process.env.MAP_URL); await sleep(1500); if (await m.evaluate(() => !document.getElementById("empty").classList.contains("hidden"))) { await m.evaluate(() => document.getElementById("emptyDemo").click()); await sleep(1500); }
console.log(errs.length ? errs : "no errors"); await b.close();
