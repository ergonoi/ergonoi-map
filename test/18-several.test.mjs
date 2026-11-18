// Selecting several nodes and setting their group at once: a frame with Shift (desktop),
// holding a node (touch), all matches of the search; in both themes.
const OUT = process.env.OUT || ".";
import puppeteer from "puppeteer-core";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const centres = p => p.evaluate(() => [...document.querySelectorAll(".node")].filter(e => e.getBoundingClientRect().width).map(e => { const r = e.getBoundingClientRect(); return { id: e.dataset.nid, x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, t: r.top, r: r.right, b: r.bottom }; }));
const state = p => p.evaluate(() => window.__map.state());
const selected = p => p.evaluate(() => [...document.querySelectorAll(".node.sel")].map(e => e.dataset.nid));
for (const ergo of [false, true]) for (const phone of [false, true]) {
  const tag = (phone ? "phone" : "desk") + (ergo ? "-ergonoi" : "");
  const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
  if (phone) await p.emulate({ viewport: { width: 390, height: 760, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, userAgent: "Mozilla/5.0 (iPhone)" }); else await p.setViewport({ width: 1400, height: 850 });
  await p.goto(process.env.MAP_URL); await sleep(800);
  await p.evaluate(e => { localStorage.clear(); if (e) { document.getElementById("btnSettings").click(); document.getElementById("setErgo").click(); document.getElementById("dlgSettings").close(); } }, ergo);
  await p.reload(); await sleep(800);
  await p.evaluate(() => document.getElementById("setDemo").click()); await sleep(600);
  await p.keyboard.press("Escape"); await sleep(200);
  check(await p.evaluate(e => document.documentElement.classList.contains("ergonoi") === e, ergo), tag + ": theme as set");
  if (!phone) {
    const cs = (await centres(p)).sort((a, b) => a.x - b.x).slice(0, 3);
    const x1 = Math.min(...cs.map(c => c.l)) - 12, y1 = Math.min(...cs.map(c => c.t)) - 12, x2 = Math.max(...cs.map(c => c.r)) + 12, y2 = Math.max(...cs.map(c => c.b)) + 12;
    await p.keyboard.down("Shift"); await p.mouse.move(x1, y1); await p.mouse.down(); await p.mouse.move((x1 + x2) / 2, (y1 + y2) / 2, { steps: 4 }); await p.mouse.move(x2, y2, { steps: 4 });
    check(await p.evaluate(() => getComputedStyle(document.getElementById("lasso")).display === "block"), tag + ": the frame is drawn");
    await p.screenshot({ path: OUT + `/several-frame-${tag}.png` });
    await p.mouse.up(); await p.keyboard.up("Shift"); await sleep(250);
    const got = await selected(p);
    check(got.length >= 3 && cs.every(c => got.includes(c.id)), tag + ": the frame selects the nodes in it (" + got.length + ")");
    check(await p.evaluate(() => /\d+ nodes/.test(document.getElementById("det").textContent)), "the details show several nodes");
    const before = await state(p);
    await p.evaluate(() => document.querySelector('#det [data-dgroup]').click()); await sleep(200);
    const target = await p.evaluate(() => { const o = [...document.querySelectorAll("#pop .opt")].find(b => !b.classList.contains("cur") && !/New group/.test(b.textContent)); o.click(); return o.textContent; });
    await sleep(250);
    const after = await state(p), cols = new Set(got.map(id => after.nodes.find(n => n.id === id).color));
    check(cols.size === 1, tag + ": all in one group (" + target + ")");
    await p.screenshot({ path: OUT + `/several-group-${tag}.png` });
    await p.keyboard.down("Control"); await p.keyboard.press("z"); await p.keyboard.up("Control"); await sleep(250);
    const back = await state(p);
    check(got.every(id => back.nodes.find(n => n.id === id).color === before.nodes.find(n => n.id === id).color), "one undo restores all groups");
    // Ctrl+Shift frame adds to the selection
    await p.mouse.click(5, 300); await sleep(150);
    const c0 = (await centres(p)).sort((a, b) => b.x - a.x)[0];
    await p.keyboard.down("Control"); await p.mouse.click(c0.x, c0.y); await p.keyboard.up("Control"); await sleep(150);
    await p.keyboard.down("Shift"); await p.keyboard.down("Control"); await p.mouse.move(x1, y1); await p.mouse.down(); await p.mouse.move(x2, y2, { steps: 5 }); await p.mouse.up(); await p.keyboard.up("Control"); await p.keyboard.up("Shift"); await sleep(200);
    const g2 = await selected(p);
    check(g2.includes(c0.id) && cs.every(c => g2.includes(c.id)), "Ctrl+Shift frame adds to the selection");
  } else {
    const cs = (await centres(p)).filter(c => c.y > 120 && c.y < 520).slice(0, 3);
    await p.touchscreen.touchStart(cs[0].x, cs[0].y); await sleep(700); await p.touchscreen.touchEnd(); await sleep(250);
    check(await p.evaluate(() => document.querySelector("header").classList.contains("multi") && document.getElementById("multiCount").textContent === "1 selected"), tag + ": holding a node starts selecting several");
    await p.touchscreen.tap(cs[1].x, cs[1].y); await sleep(200);
    await p.touchscreen.tap(cs[2].x, cs[2].y); await sleep(200);
    check(await p.evaluate(() => document.getElementById("multiCount").textContent === "3 selected"), "taps add nodes");
    await p.touchscreen.tap(5, 700); await sleep(200);
    check((await selected(p)).length === 3, "a tap beside the nodes keeps the selection");
    await p.screenshot({ path: OUT + `/several-${tag}.png` });
    await p.tap("#multiGroup"); await sleep(500);
    await p.screenshot({ path: OUT + `/several-menu-${tag}.png` });
    await p.evaluate(() => [...document.querySelectorAll("#pop .opt")].find(b => !b.classList.contains("cur") && !/New group/.test(b.textContent)).click()); await sleep(250);
    const st = await state(p);
    check(new Set(cs.map(c => st.nodes.find(n => n.id === c.id).color)).size === 1, tag + ": the header sets the group of all three");
    await p.touchscreen.tap(cs[2].x, cs[2].y); await sleep(200);
    check(await p.evaluate(() => document.getElementById("multiCount").textContent === "2 selected"), "a tap removes a node");
    await p.tap("#multiDone"); await sleep(200);
    check(await p.evaluate(() => !document.querySelector("header").classList.contains("multi") && !document.querySelector(".node.sel")), "Done ends the selection");
  }
  // all matches of the search
  if (phone) await p.tap("#btnSearch"); else { await p.mouse.click(5, 300); await p.keyboard.press("/"); }
  await sleep(150); await p.type("#searchQ", "e"); await sleep(300);
  const hits = await p.evaluate(() => Number(document.getElementById("searchCount").textContent.split(" of ")[1].split(" ")[0]));
  if (phone) await p.tap("#searchAll"); else await p.click("#searchAll");
  await sleep(250);
  check((await selected(p)).length === hits && await p.evaluate(() => document.getElementById("hsearch").classList.contains("hidden")), tag + ": the square selects all " + hits + " matches");
  if (phone) check(await p.evaluate(h => document.getElementById("multiCount").textContent === h + " selected", hits), "and the header shows them");
  check(!errs.length, "no errors " + errs.join("|"));
  await p.close();
}
await b.close();
