const OUT = process.env.OUT || ".";
import puppeteer from "puppeteer-core";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
await p.goto(process.env.MAP_URL); await sleep(1500); if (await p.evaluate(() => !document.getElementById("empty").classList.contains("hidden"))) { await p.evaluate(() => document.getElementById("emptyDemo").click()); await sleep(1500); }
const r = await p.evaluate(() => {
  const s0 = window.__map.snapshot(); const n0 = s0.nodes.find(n => n.title === "Places"); n0.note = "x";
  window.__map.state().nodes.find(n => n.title === "Places").note = "Three places, one week.";
  const md = window.__map.exportText();
  const a = window.__map.importText(md); const s1 = window.__map.snapshot();
  const foreign = window.__map.importText("# Project\n## Plan\n- Step one\n- Step two\n## Risks\n- Weather\n");
  return { md: md.slice(0, 200), own: a, same: s1.nodes.length === s0.nodes.length && s1.edges.length === s0.edges.length, note: s1.nodes.find(n => n.title === "Places")?.note, foreign };
});
console.log(JSON.stringify(r, null, 1));
check(r.same && r.note === "Three places, one week.", "own export imports back with positions, colours and notes");
check(r.foreign.nodes === 6 && r.foreign.foreign, "foreign Markmap file imports as a tree");
await p.click("#btnSettings"); await sleep(300);
await (await p.$("#dlgSettings")).screenshot({ path: OUT + "/map-settings.png" });
await b.close();
