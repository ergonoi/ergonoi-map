import puppeteer from "puppeteer-core";
import fs from "fs";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.setViewport({ width: 1440, height: 860, deviceScaleFactor: 2 });
await p.goto(process.env.MAP_URL); await sleep(800);
await p.click("#emptyDemo"); await sleep(2500);
// + in a group row
const n0 = await p.evaluate(() => window.__map.state().nodes.length);
// + Add group makes a first node named like the group
await p.evaluate(() => document.querySelector('#side [data-gadd]').click()); await sleep(400);
check(await p.evaluate(n => { const st = window.__map.state(), m = st.nodes[st.nodes.length - 1]; return st.nodes.length === n + 1 && m.title === "New group" && st.legend[m.color] === "New group"; }, n0), "a new group comes with a first node named like it");
await p.keyboard.type("Beach"); await p.keyboard.press("Enter"); await sleep(300);
check(await p.evaluate(() => { const st = window.__map.state(), m = st.nodes[st.nodes.length - 1]; return m.title === "Beach" && st.legend[m.color] === "Beach"; }), "naming the group names its first node");
// print dialog
await p.evaluate(() => document.querySelector('#side [data-f="print"]').click()); await sleep(300);
const info = await p.evaluate(() => ({ open: document.getElementById("dlgPrint").open, rec: document.querySelector("#prFormats .rec")?.closest("button").dataset.prf, texts: [...document.querySelectorAll("#prFormats button")].map(x => x.textContent), hint: document.getElementById("prHint").textContent }));
console.log(info);
check(info.open && info.rec, "print dialog with a recommended format");
await p.screenshot({ path: "m-print.png" });
// print to PDF with the chosen page size
await p.evaluate(() => { window.print = () => {}; document.getElementById("prGo").click(); }); await sleep(200);
const pdf = await p.pdf({ preferCSSPageSize: true, printBackground: true });
fs.writeFileSync("map-print.pdf", pdf);
const txt = Buffer.from(pdf).toString("latin1"); const mb = /MediaBox \[0 0 ([0-9.]+) ([0-9.]+)\]/.exec(txt);
console.log("mediabox pt", mb && mb.slice(1));
check(!!mb, "PDF written");
check(!errs.length, "no errors " + errs.join("|")); await b.close();
