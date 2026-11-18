import puppeteer from "puppeteer-core";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.setViewport({ width: 1440, height: 860 });
await p.goto(process.env.MAP_URL); await sleep(600);
await p.evaluate(() => { localStorage.setItem("outheis-map.hidden", JSON.stringify(["#218380"])); }); // stale: first palette colour hidden
await p.reload(); await sleep(800);
await p.click("#emptyDemo"); await sleep(2500);
// scenario: new group, new node, assign it in the right column
await p.evaluate(() => document.querySelector('#side [data-gadd]').click()); await sleep(300);
await p.keyboard.type("Neu"); await p.keyboard.press("Enter"); await sleep(200);
await p.click("#btnAdd"); await sleep(300); await p.keyboard.type("Item"); await p.keyboard.press("Enter"); await sleep(300);
const nid = await p.evaluate(() => window.__map.state().nodes.find(n => n.title === "Item").id);
const bx = await (await p.$(`[data-nid="${nid}"]`)).boundingBox(); await p.mouse.click(bx.x + 3, bx.y + bx.height / 2); await sleep(300);
await p.evaluate(() => document.querySelector("#det [data-dgroup]").click()); await sleep(300);
await p.evaluate(() => [...document.querySelectorAll("#pop .opt")].find(o => o.textContent === "Neu").click()); await sleep(300);
check(await p.evaluate(i => { const el = document.querySelector(`[data-nid="${i}"]`); return el && getComputedStyle(el).display !== "none"; }, nid), "node stays visible after joining the new group");
check(await p.evaluate(() => getComputedStyle(document.getElementById("btnFit")).display !== "none" && getComputedStyle(document.getElementById("btnArrange")).display === "none"), "Fit on the map, Arrange not, while the left column is open");
await p.click("#btnDet"); await sleep(200);
check(await p.evaluate(() => getComputedStyle(document.getElementById("btnArrange")).display === "none"), "folding the right column alone does not bring Arrange");
await p.click("#btnMenu"); await sleep(200);
check(await p.evaluate(() => getComputedStyle(document.getElementById("btnArrange")).display !== "none"), "folding the left column shows Arrange on the map");
await p.click("#btnMenu"); await p.click("#btnDet");
check(!errs.length, "no errors " + errs.join("|")); await b.close();
