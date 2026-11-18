const OUT = process.env.OUT || ".";
import puppeteer from "puppeteer-core";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const errs = [];
const p = await (await b.createBrowserContext()).newPage(); p.on("pageerror", e => errs.push(e.message));
await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
await p.goto(process.env.MAP_URL); await sleep(800);
await p.click("#emptyDemo"); await sleep(1500);
const id = t => p.evaluate(t => window.__map.state().nodes.find(n => n.title === t).id, t);
let bb = await (await p.$(`[data-nid="${await id("Lake shore")}"]`)).boundingBox();
await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(300);
await p.click("#det [data-dgroup]"); await sleep(300);
const items = await p.evaluate(() => [...document.querySelectorAll("#pop .opt")].map(o => o.textContent));
console.log(items.join(" | "));
check(!items.includes("unnamed") && items.includes("New group …"), "menu: groups in use and New group …");
const w = await p.evaluate(() => document.getElementById("pop").offsetWidth); console.log("pop width", w);
await p.screenshot({ path: OUT + "/map3-menu.png" });
await p.evaluate(() => [...document.querySelectorAll("#pop .opt")].find(o => o.textContent === "New group …").click()); await sleep(100);
await p.keyboard.type("Swimming"); await p.keyboard.press("Enter"); await sleep(300);
check(await p.evaluate(() => Object.values(window.__map.state().legend).includes("Swimming")), "new group named and assigned");
// recolour a group from the bar

await p.click('#side [data-gc="#2B8A3E"]'); await sleep(300);
const opts = await p.evaluate(() => [...document.querySelectorAll("#pop .opt")].map(o => o.textContent));
console.log("free:", opts.join(", "));
await p.screenshot({ path: OUT + "/map3-colour.png" });
await p.evaluate(() => [...document.querySelectorAll("#pop .opt")].find(o => o.querySelector(".ln")).click()); await sleep(300);
check(await p.evaluate(() => !window.__map.state().nodes.some(n => n.color === "#2B8A3E") && Object.values(window.__map.state().legend).includes("Places")), "group recoloured, name kept");
// link menu width
const e = await p.$("#edges path.hit"); const eb = await e.boundingBox();
await p.evaluate(() => { const h = document.querySelector("#edges path.hit"); const r = h.getBoundingClientRect(); });
console.log(errs.length ? errs : "no errors"); await b.close();
