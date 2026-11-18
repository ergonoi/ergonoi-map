const OUT = process.env.OUT || ".";
import puppeteer from "puppeteer-core";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
for (const phone of [false, true]) {
  const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
  if (phone) await p.emulate({ viewport: { width: 390, height: 760, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, userAgent: "Mozilla/5.0 (iPhone)" }); else await p.setViewport({ width: 1400, height: 850 });
  await p.goto(process.env.MAP_URL); await sleep(800);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await sleep(800);
  await p.evaluate(() => document.getElementById("setDemo").click()); await sleep(600);
  await p.keyboard.press("Escape");
  if (phone) await p.click("#btnSearch"); else { await p.mouse.click(700, 500); await p.keyboard.press("/"); }
  await sleep(200);
  check(await p.evaluate(() => !document.getElementById("hsearch").classList.contains("hidden") && document.activeElement.id === "searchQ"), (phone ? "phone" : "desk") + ": search opens with focus");
  await p.type("#searchQ", "o"); await sleep(300);
  const c1 = await p.evaluate(() => document.getElementById("searchCount").textContent);
  check(/^1 of \d+/.test(c1), "count shown: " + c1);
  check(await p.evaluate(() => document.querySelectorAll(".node.hit").length > 1 && document.querySelectorAll(".node.dim").length > 0 && document.querySelectorAll(".node.cur").length === 1), "matches marked, others dimmed");
  await p.type("#searchQ", "ld tow"); await sleep(300);
  check(await p.evaluate(() => document.getElementById("searchCount").textContent === "1 of 1" && document.querySelector(".node.cur").textContent.startsWith("Old town")), "narrowed to Old town, selected");
  await p.evaluate(() => { const i = document.getElementById("searchQ"); i.value = "ÖLD"; i.dispatchEvent(new Event("input")); }); await sleep(200);
  check(await p.evaluate(() => document.getElementById("searchCount").textContent === "1 of 1"), "case and accents ignored");
  await p.evaluate(() => { const i = document.getElementById("searchQ"); i.value = "e"; i.dispatchEvent(new Event("input")); }); await sleep(200);
  const n = await p.evaluate(() => Number(document.getElementById("searchCount").textContent.split(" of ")[1]));
  for (let k = 0; k < n; k++) await p.keyboard.press("Enter");
  check(await p.evaluate(() => document.getElementById("searchCount").textContent.startsWith("1 of")), "Enter cycles through all matches");
  await p.screenshot({ path: OUT + `/mapsearch-${phone ? "phone" : "desk"}.png` });
  await p.keyboard.press("Escape"); await sleep(200);
  check(await p.evaluate(() => document.getElementById("hsearch").classList.contains("hidden") && !document.querySelector(".node.dim")), "Escape closes and clears the marks");
  check(!errs.length, "no errors " + errs.join("|"));
  await p.close();
}
await b.close();
