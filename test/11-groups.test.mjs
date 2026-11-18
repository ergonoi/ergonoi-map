import puppeteer from "puppeteer-core";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await p.goto(process.env.MAP_URL); await sleep(800);
// a map with arrows: project -> formats -> audiences, documents hang below the project
await p.evaluate(() => {
  const text = `Group: Projekt #group-projekt #color-460A46
Group: Formate #group-formate #color-FF2E00
Group: Angesprochene #group-angesprochene #color-2B3BD6
Group: Dokumente #group-dokumente #color-FFB400
Open Furniture Culture #id-1 #group-projekt #id-2 #link-to #id-3 #link-to #id-4 #link-to #id-20 #link-to
Vortrag #id-2 #group-formate #id-1 #link-from #id-10 #link-to #id-11 #link-to #id-5 #link-to
Workshop #id-3 #group-formate #id-1 #link-from #id-6 #link-to #id-7 #link-to #id-12 #link-to
Firmenveranstaltung #id-4 #group-formate #id-1 #link-from #id-13 #link-to #id-8 #link-to
Lehrerfortbildung #id-5 #group-formate #id-2 #link-from #id-11 #link-to
Werkstatt für kleine Hände #id-6 #group-formate #id-3 #link-from #id-14 #link-to
Werkstatt für große Hände #id-7 #group-formate #id-3 #link-from #id-15 #link-to
Möbel bauen für ein Projekt #id-8 #group-formate #id-4 #link-from #id-13 #link-to
Erwachsene #id-10 #group-angesprochene #id-2 #link-from
Lehrer #id-11 #group-angesprochene #id-2 #link-from #id-5 #link-from
Jugendliche #id-12 #group-angesprochene #id-3 #link-from
Unternehmen #id-13 #group-angesprochene #id-4 #link-from #id-8 #link-from
Kinder #id-14 #group-angesprochene #id-6 #link-from
Senioren #id-15 #group-angesprochene #id-7 #link-from
Wichtige Dokumente #id-20 #group-dokumente #id-1 #link-from #id-21 #link-to #id-22 #link-to #id-23 #link-to
Website #id-21 #group-dokumente #id-20 #link-from #id-24 #link-plain
Präsentation Workshops #id-22 #group-dokumente #id-20 #link-from #id-3 #link-plain
Bildnutzungsrechte #id-23 #group-dokumente #id-20 #link-from
Digitale Medien #id-24 #group-dokumente #id-21 #link-plain
`;
  const t = document.getElementById("mapText"); document.getElementById("tabText").click(); t.value = text; document.getElementById("textApply").click(); document.getElementById("tabMap").click();
});
await sleep(800);
// scatter
await p.evaluate(() => { for (const n of window.__map.state().nodes) { n.x = 5000 + Math.random() * 1600; n.y = 4000 + Math.random() * 1000; } document.getElementById("btnFit").click(); });
await sleep(300);
await p.evaluate(() => document.querySelector('#side [data-ar="groups"]').click()); await sleep(1500);
await p.evaluate(() => document.getElementById("btnFit").click()); await sleep(400);
const r = await p.evaluate(() => { const st = window.__map.state(), N = t => st.nodes.find(n => n.title === t); return { root: N("Open Furniture Culture").y, vortrag: N("Vortrag").y, lehrer: N("Lehrerfortbildung").y, erw: N("Erwachsene").y, regions: document.querySelectorAll("#edges .regions rect").length }; });
console.log(r);
check(r.root < r.vortrag && r.vortrag < r.lehrer, "within Formate: Vortrag above Lehrerfortbildung (arrow)");
check(r.root < r.erw && r.vortrag < r.erw, "groups ranked: project above formats above audiences");
check(r.regions === 4, "four group areas drawn");
await p.screenshot({ path: "m-bygroups.png" });
await p.click("#titleBtn"); await sleep(300);
await p.keyboard.type("OFC Formate"); await p.keyboard.press("Enter"); await sleep(300);
check(await p.evaluate(() => document.getElementById("mapName").textContent === "OFC Formate" && /^Map: OFC Formate$/m.test(window.__map.toText())), "the map can be named; the name is in the text");
check(await p.evaluate(() => window.__map.fromText(window.__map.toText(), window.__map.snapshot()).title === "OFC Formate"), "the name is read back");
check(!errs.length, "no errors " + errs.join("|")); await b.close();
