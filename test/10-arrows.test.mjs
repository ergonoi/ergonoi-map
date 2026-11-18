import puppeteer from "puppeteer-core";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.setViewport({ width: 1440, height: 860, deviceScaleFactor: 2 });
await p.goto(process.env.MAP_URL); await sleep(800);
await p.click("#emptyDemo"); await sleep(3000);
const id = t => p.evaluate(t => window.__map.state().nodes.find(n => n.title === t).id, t);
const st = await (await p.$(`[data-nid="${await id("Places")}"]`)).boundingBox();
await p.mouse.click(st.x + 3, st.y + st.height / 2); await sleep(400);
const btns = await p.$$("#det [data-dedge]"); check(btns.length >= 2, "links in the details carry a drawn arrow button");
// choose the link to "Lake shore"
const which = await p.evaluate(() => [...document.querySelectorAll("#det [data-dedge]")].findIndex(x => x.closest("button").textContent.includes("Lake shore")));
await btns[which].click(); await sleep(300);
check(await p.evaluate(() => /Link from Places/i.test(document.querySelector("#pop .head").textContent)), "menu is seen from the selected node");
await p.screenshot({ path: "m-arrow-menu.png", clip: { x: 1000, y: 80, width: 440, height: 520 } });
await p.evaluate(() => [...document.querySelectorAll("#pop .seg button")].find(x => /^From Places/.test(x.title)).click()); await sleep(300);
check(await p.evaluate(async (a, b) => { const e = window.__map.state().edges.find(e => (e.from === a && e.to === b) || (e.from === b && e.to === a)); return e.from === a && e.directed && !e.both; }, await id("Places"), await id("Lake shore")), "outgoing arrow runs from the selected node");
// now from Lake shore's view: incoming
const ls = await (await p.$(`[data-nid="${await id("Lake shore")}"]`)).boundingBox();
await p.mouse.click(ls.x + 3, ls.y + ls.height / 2); await sleep(400);
check(await p.evaluate(() => { const s = document.querySelector("#det [data-dedge]"); return s && s.innerHTML.includes("M-2 6") === false; }), "detail shows arrow");
await p.evaluate(() => document.querySelector("#det [data-dedge]").click()); await sleep(300);
check(await p.evaluate(() => [...document.querySelectorAll("#pop .seg button")].find(x => x.getAttribute("aria-pressed") === "true").title.startsWith("From Places to Lake shore")), "from the other end the same link shows as incoming");
await p.screenshot({ path: "m-arrow-det.png", clip: { x: 1060, y: 80, width: 380, height: 360 } });
check(!errs.length, "no errors " + errs.join("|")); await b.close();
