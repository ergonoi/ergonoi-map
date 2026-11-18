import puppeteer from "puppeteer-core";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.setViewport({ width: 1440, height: 860, deviceScaleFactor: 2 });
await p.goto(process.env.MAP_URL); await sleep(800);
await p.click("#emptyDemo"); await sleep(1500);
check(await p.evaluate(() => document.querySelectorAll("#side .grp").length === 4), "groups in side panel");
// tap a node
const nd = await p.$(".node"); const bx = await nd.boundingBox();
await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); await sleep(400);
check(await p.evaluate(() => !!document.getElementById("detTitle")), "detail shows node");
check(await p.evaluate(() => document.querySelectorAll("#det .vst").length >= 1), "links with colour sticks");
await p.screenshot({ path: "m-desk.png" });
// hide a group
await p.evaluate(() => document.querySelectorAll("#side .grp .eye")[3].click()); await sleep(300);
check(await p.evaluate(() => document.querySelectorAll(".node.gone").length > 0), "hiding a group hides its nodes");
await p.evaluate(() => document.querySelectorAll("#side .grp .eye")[3].click()); await sleep(300);
// fold columns
await p.keyboard.press("Escape"); await p.evaluate(() => document.activeElement.blur()); await p.keyboard.press("Backslash"); await sleep(400);
check(await p.evaluate(() => document.documentElement.classList.contains("noside") && document.documentElement.classList.contains("nodet") && document.getElementById("viewport").getBoundingClientRect().width > 1400), "backslash maximises the canvas");
await p.screenshot({ path: "m-desk-max.png" });
await p.keyboard.press("Backslash"); await sleep(300);
check(await p.evaluate(() => !document.documentElement.classList.contains("noside")), "backslash brings columns back");
await p.click("#btnMenu"); await sleep(300);
check(await p.evaluate(() => document.documentElement.classList.contains("noside")), "menu button folds left column");
await p.click("#btnMenu"); await sleep(300);
await p.click("#btnDet"); await sleep(300);
check(await p.evaluate(() => document.documentElement.classList.contains("nodet")), "details button folds right column");
await p.click("#btnDet"); await sleep(300);
// phone
const q = await b.newPage(); q.on("pageerror", e => errs.push(e.message));
await q.emulate({ viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, userAgent: "Mozilla/5.0 (iPhone)" });
await q.goto(process.env.MAP_URL); await sleep(1500);
await q.screenshot({ path: "m-ph1.png" });
await q.evaluate(() => document.getElementById("btnMenu").click()); await sleep(400);
await q.screenshot({ path: "m-ph2.png" });
await q.evaluate(() => document.getElementById("sdim").click()); await sleep(400);
const n2 = await q.$(".node"); const b2 = await n2.boundingBox();
await q.touchscreen.tap(b2.x + b2.width / 2, b2.y + b2.height / 2); await sleep(500);
check(await q.evaluate(() => !document.getElementById("det").classList.contains("hidden")), "phone: sheet opens");
await q.screenshot({ path: "m-ph3.png" });
check(!errs.length, "no errors " + errs.join(" | "));
await b.close();
