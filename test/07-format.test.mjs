const OUT = process.env.OUT || ".";
import puppeteer from "puppeteer-core";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const errs = [];
const ctx = await b.createBrowserContext();
const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message));
await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
await p.goto(process.env.MAP_URL); await sleep(1200);
check(await p.evaluate(() => !document.getElementById("empty").classList.contains("hidden") && window.__map.state().nodes.length === 0), "fresh browser: empty map, example offered, nothing loaded");
check(await p.evaluate(() => localStorage.getItem("outheis-map") === null), "nothing written on open");
await p.click("#emptyDemo"); await sleep(1500);
const t1 = await p.evaluate(() => window.__map.toText());
console.log(t1.split("\n").slice(0, 7).join("\n"));
// round trip
const rt = await p.evaluate(() => { const a = window.__map.snapshot(); const n = window.__map.fromText(window.__map.toText(), a); const key = s => JSON.stringify([s.nodes.map(n => [n.id, n.title, n.color, Math.round(n.x), Math.round(n.y), !!n.pinned, n.note || ""]).sort(), s.edges.map(e => [e.from, e.to, e.directed].sort().join()).sort(), s.legend]); return key(a) === key(n); });
check(rt, "text round trip keeps nodes, groups, links, positions");
// text view: edit
await p.click("#tabText"); await sleep(200);
await p.screenshot({ path: OUT + "/map-text.png" });
const ids = await p.evaluate(() => Object.fromEntries(window.__map.state().nodes.map(n => [n.title, Number(n.id.slice(1))])));
await p.evaluate(ids => {
  const ta = document.getElementById("mapText"); let lines = ta.value.split("\n");
  // rename, add a link only on one side, delete a line, add a new line without id, a directed link
  lines = lines.map(l => l.startsWith("Old town ") ? l.replace("Old town ", "Old town centre ") : l);
  lines = lines.map(l => l.startsWith("Lake shore ") ? l.replace(" #at-", " #id-" + ids["Pack the tent"] + " #link-to #at-") : l);
  lines = lines.filter(l => !l.startsWith("How many nights?"));
  lines = lines.map(l => l.startsWith("Mountain hut ") ? l.replace(/ #id-(\d+) #link-plain/, "") : l); // drops its link to Places
  lines.push("Swim at dawn {{bring towels}} #group-places #id-" + ids["Lake shore"] + " #link-plain");
  ta.value = lines.join("\n");
}, ids);
await p.click("#textApply"); await sleep(300); console.log("apply msg:", await p.evaluate(() => document.getElementById("textMsg").className + " " + document.getElementById("textMsg").textContent));
const st = await p.evaluate(() => window.__map.snapshot());
const byT = Object.fromEntries(st.nodes.map(n => [n.title, n]));
check(!!byT["Old town centre"] && byT["Old town centre"].id === "n" + ids["Old town"], "rename keeps the id");
check(st.edges.some(e => e.directed && e.from === "n" + ids["Lake shore"] && e.to === "n" + ids["Pack the tent"]), "link named on one side only is made, with direction");
check(!byT["How many nights?"] && !st.edges.some(e => e.to === "n" + ids["How many nights?"] || e.from === "n" + ids["How many nights?"]), "deleted line removes node and links");
check(!st.edges.some(e => [e.from, e.to].sort().join() === ["n" + ids["Mountain hut"], "n" + ids["Places"]].sort().join()), "link dropped on one side is removed");
check(byT["Swim at dawn"] && byT["Swim at dawn"].note === "bring towels" && st.edges.some(e => e.from === byT["Swim at dawn"].id || e.to === byT["Swim at dawn"].id), "new line becomes a node with note and link");
check(await p.evaluate(() => document.getElementById("mapText").value.includes("#link-from")), "the other side gets #link-from written back");
// faulty text
await p.evaluate(() => { const ta = document.getElementById("mapText"); ta.value = ta.value + "\nBroken #id-999 #id-1"; });
await p.click("#textApply"); await sleep(200);
const msg = await p.evaluate(() => document.getElementById("textMsg").textContent);
console.log("msg:", msg);
check(/no #link-plain/.test(msg), "faulty line reported, nothing applied");
await p.click("#tabMap"); await sleep(200);
check(await p.evaluate(() => document.getElementById("tabText").getAttribute("aria-pressed") === "true"), "stays in Text while faulty");
await p.evaluate(() => { const ta = document.getElementById("mapText"); ta.value = ta.value.replace("\nBroken #id-999 #id-1", ""); });
await p.click("#tabMap"); await sleep(400);
await p.screenshot({ path: OUT + "/map-after-text.png" });
// unreadable data kept aside
const p2 = await ctx.newPage(); p2.on("pageerror", e => errs.push(e.message));
await p2.evaluate(() => 0);
await p.evaluate(() => localStorage.setItem("outheis-map", "{broken"));
await p2.goto(process.env.MAP_URL); await sleep(800);
check(await p2.evaluate(() => localStorage.getItem("outheis-map") === "{broken" && Object.keys(localStorage).some(k => k.startsWith("outheis-map.unreadable-"))), "unreadable data is kept, not overwritten");
console.log(errs.length ? errs : "no errors"); await b.close();
