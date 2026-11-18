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
const order = () => p.evaluate(() => [...document.querySelectorAll("#side [data-gname]")].map(x => x.value));

const o1 = await order();
await p.click('#side [data-gc="#2B8A3E"]'); await sleep(300);
const n = await p.evaluate(() => [...document.querySelectorAll("#pop .opt")].filter(o => o.querySelector(".ln")).length + 1); console.log("options", n);
check(n === 14 - 4 + 1, "10 free colours and Other colour …");
await p.screenshot({ path: OUT + "/map4-colours.png" });
await p.evaluate(() => [...document.querySelectorAll("#pop .opt")].find(o => o.textContent === "Teal").click()); await sleep(300);
check(JSON.stringify(await order()) === JSON.stringify(o1), "group keeps its place after recolouring");
// colour chooser
await p.click('#side [data-gc="#218380"]'); await sleep(300);
await p.evaluate(() => { const i = document.querySelector('#pop input[type=color]'); i.value = "#123456"; i.dispatchEvent(new Event("change")); }); await sleep(300);
check(await p.evaluate(() => window.__map.state().legend["#123456"] === "Places") && JSON.stringify(await order()) === JSON.stringify(o1), "colour chooser sets any colour, place kept");
console.log(errs.length ? errs : "no errors"); await b.close();
