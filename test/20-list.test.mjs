// The List view: groups as columns, adding members row by row, linking by dragging the blue
// point, moving a row into another group, folding; phone: one column, the head lists groups.
const OUT = process.env.OUT || ".";
import puppeteer from "puppeteer-core";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const st = p => p.evaluate(() => window.__map.state());
const centre = (p, sel) => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
for (const ergo of [false, true]) {
  const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("dialog", d => d.accept());
  await p.setViewport({ width: 1400, height: 850 });
  await p.goto(process.env.MAP_URL); await sleep(700);
  await p.evaluate(e => { localStorage.clear(); if (e) localStorage.setItem("outheis-map.theme", "ergonoi"); }, ergo); await p.reload(); await sleep(700);
  await p.evaluate(() => document.getElementById("setDemo").click()); await sleep(500); await p.keyboard.press("Escape");
  const tag = ergo ? "ergonoi" : "outheis";
  await p.click("#tabList"); await sleep(300);
  const s0 = await st(p);
  const cols = await p.evaluate(() => [...document.querySelectorAll(".lvc")].map(c => c.querySelector(".lvt").textContent));
  check(cols.length >= 3, tag + ": groups as columns: " + cols.join(", "));
  check(await p.evaluate(() => document.querySelectorAll(".lvr").length) === s0.nodes.length, "a row for every node");
  // new group, then members row by row
  await p.click(".lvnew"); await sleep(150);
  await p.type("#lvGroupName", "Objectives"); await p.keyboard.press("Enter"); await sleep(250);
  for (const t of ["More customers", "Fewer complaints", "Faster delivery"]) { await p.keyboard.type(t); await p.keyboard.press("Enter"); await sleep(200); }
  await p.keyboard.press("Escape"); await sleep(250);
  let s1 = await st(p);
  const oc = Object.keys(s1.legend).find(c => s1.legend[c] === "Objectives");
  const mem = s1.nodes.filter(n => n.color === oc).map(n => n.title);
  check(oc && mem.join("|") === "More customers|Fewer complaints|Faster delivery", "a new group with three members typed row by row: " + mem.join("|"));
  check(s1.nodes.length === s0.nodes.length + 3, "no empty node left behind");
  // link: select the first member, drag its point onto a row of another column
  const a = s1.nodes.find(n => n.title === "More customers"), t = s1.nodes.find(n => n.title === "Who brings the stove?");
  await p.evaluate(() => { const s = document.getElementById("lvScroll"); s.scrollLeft = s.scrollWidth; }); await sleep(100);
  await p.click(`.lvr[data-nid="${a.id}"] .lvn`); await sleep(200);
  check(await p.evaluate(() => !!document.querySelector(".lvr.sel .lvdot")), "the selected row has the blue point");
  const d = await centre(p, ".lvr.sel .lvdot"), r = await centre(p, `.lvr[data-nid="${t.id}"]`);
  await p.mouse.move(d.x, d.y); await p.mouse.down(); await p.mouse.move((d.x + r.x) / 2, (d.y + r.y) / 2, { steps: 5 }); await p.mouse.move(r.x, r.y, { steps: 5 });
  check(await p.evaluate(() => !!document.querySelector("#lvArcs path.tmp") && !!document.querySelector(".lvr.tgt")), "a dashed line follows, the target row is marked");
  await p.screenshot({ path: OUT + `/list-linking-${tag}.png` });
  await p.mouse.up(); await sleep(250);
  s1 = await st(p);
  check(s1.edges.some(e => (e.from === a.id && e.to === t.id) || (e.to === a.id && e.from === t.id)), "dragging the point links the two");
  check(await p.evaluate(() => document.querySelectorAll("#lvArcs path:not(.tmp)").length) >= 1, "the link is drawn as an arc");
  // move a row into another column
  const mv = s1.nodes.find(n => n.title === "Faster delivery"), destC = t.color;
  const from = await centre(p, `.lvr[data-nid="${mv.id}"] .lvn`), to = await centre(p, `.lvc[data-c="${destC}"] .lvh`);
  await p.mouse.move(from.x, from.y); await p.mouse.down(); await p.mouse.move(from.x + 40, from.y + 5, { steps: 4 }); await p.mouse.move(to.x, to.y + 40, { steps: 8 });
  check(await p.evaluate(() => !!document.querySelector(".lvghost") && !!document.querySelector(".lvc.drop")), "a dragged row shows a ghost, the column is marked");
  await p.mouse.up(); await sleep(250);
  check((await st(p)).nodes.find(n => n.id === mv.id).color === destC, "dropped into another column, it changes its group");
  await p.keyboard.down("Control"); await p.keyboard.press("z"); await p.keyboard.up("Control"); await sleep(250);
  check((await st(p)).nodes.find(n => n.id === mv.id).color === oc, "Undo takes it back");
  // rename by a click on the selected row
  await p.evaluate(id => window.__lvsel = id, a.id);
  if (!(await p.evaluate(id => document.querySelector(`.lvr[data-nid="${id}"]`).classList.contains("sel"), a.id))) { await p.click(`.lvr[data-nid="${a.id}"] .lvn`); await sleep(150); }
  await p.click(`.lvr[data-nid="${a.id}"] .lvn`); await sleep(150);
  check(await p.evaluate(() => !!document.querySelector("[data-lved]")), "a click on the selected row opens its name");
  await p.evaluate(() => { const i = document.querySelector("[data-lved]"); i.value = "New customers"; i.blur(); }); await sleep(200);
  check((await st(p)).nodes.find(n => n.id === a.id).title === "New customers", "renamed in its row");
  // fold
  await p.click(`.lvc[data-c="${oc}"] .lvh`); await sleep(200);
  check(await p.evaluate(c => document.querySelector(`.lvc[data-c="${c}"]`).classList.contains("fold"), oc), "a click on the head folds the column");
  await p.screenshot({ path: OUT + `/list-${tag}.png` });
  await p.click(`.lvc[data-c="${oc}"] .lvh`); await sleep(200);
  // the map has the new nodes
  await p.click("#tabMap"); await sleep(300);
  check(await p.evaluate(() => [...document.querySelectorAll(".node")].some(n => /New customers/.test(n.textContent))), "the map shows the new nodes");
  check(!errs.length, "no errors " + errs.join("|"));
  await p.close();
}
// phone
const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.emulate({ viewport: { width: 390, height: 760, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, userAgent: "Mozilla/5.0 (iPhone)" });
await p.goto(process.env.MAP_URL); await sleep(700); await p.evaluate(() => localStorage.clear()); await p.reload(); await sleep(700);
await p.evaluate(() => document.getElementById("setDemo").click()); await sleep(500); await p.keyboard.press("Escape");
await p.tap('#bbar [data-v="list"]'); await sleep(300);
check(await p.evaluate(() => { const c = document.querySelector(".lvc").getBoundingClientRect(); return c.width > 340; }), "phone: one column fills the width");
await p.tap(".lvc .lvh"); await sleep(500);
check(await p.evaluate(() => !document.getElementById("pop").classList.contains("hidden") && document.querySelectorAll("#pop .opt").length >= 3), "phone: the head lists all groups");
await p.screenshot({ path: OUT + "/list-phone-menu.png" });
await p.evaluate(() => [...document.querySelectorAll("#pop .opt")].at(-1).click()); await sleep(600);
check(await p.evaluate(() => document.getElementById("lvScroll").scrollLeft > 100), "choosing a group scrolls to its column");
await p.screenshot({ path: OUT + "/list-phone.png" });
check(!errs.length, "no errors " + errs.join("|"));
await b.close();
