const OUT = process.env.OUT || ".";
import puppeteer, { KnownDevices } from "puppeteer-core";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const errs = [];
const p = await b.newPage(); p.on("pageerror", e => errs.push(e.message));
await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
await p.goto(process.env.MAP_URL); await sleep(1800); if (await p.evaluate(() => !document.getElementById("empty").classList.contains("hidden"))) { await p.evaluate(() => document.getElementById("emptyDemo").click()); await sleep(1500); }
const nid = await p.evaluate(() => window.__map.state().nodes.find(n => n.title === "Mountain hut").id);
const dot = await p.$(`[data-nid="${nid}"] .nd`); const bb = await dot.boundingBox();
await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(300);
check(await p.evaluate(() => document.getElementById("dlgNote").open), "dot opens the note dialog");
await p.type("#noteText", "Hut opens in June.\nPhone the warden first."); await sleep(100);
await p.screenshot({ path: OUT + "/map-note.png" });
await p.keyboard.press("Escape"); await sleep(300);
check(await p.evaluate(id => window.__map.state().nodes.find(n => n.id === id).note === "Hut opens in June.\nPhone the warden first.", nid), "closing keeps the note");
check(await p.evaluate(id => document.querySelector(`[data-nid="${id}"] .nd`).classList.contains("has"), nid), "dot filled");
check(await p.evaluate(() => window.__map.exportText().includes("Phone the warden")), "note in Markdown export");
await p.evaluate(() => { const n = window.__map.state().nodes.find(n => n.title === "Places"); document.querySelector(`[data-nid="${n.id}"]`).classList.add("sel"); });
await p.screenshot({ path: OUT + "/map-frame.png" });
// drag from node body still moves, and a tap on dot does not open popover
const m = await b.newPage(); m.on("pageerror", e => errs.push(e.message)); await m.emulate(KnownDevices["iPhone 13"]);
await m.goto(process.env.MAP_URL); await sleep(1500); if (await m.evaluate(() => !document.getElementById("empty").classList.contains("hidden"))) { await m.evaluate(() => document.getElementById("emptyDemo").click()); await sleep(1500); }
const d2 = await m.$(`[data-nid="${nid}"] .nd`); const b2 = await d2.boundingBox();
await m.touchscreen.tap(b2.x + b2.width / 2, b2.y + b2.height / 2); await sleep(400);
check(await m.evaluate(() => document.getElementById("dlgNote").open && document.getElementById("pop").classList.contains("hidden")), "phone: tap near the dot opens the note, not the menu");
console.log(errs.length ? errs : "no errors"); await b.close();
