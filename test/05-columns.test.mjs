import puppeteer from "puppeteer-core";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.setViewport({ width: 1440, height: 860, deviceScaleFactor: 2 });
await p.goto(process.env.MAP_URL); await sleep(800);
await p.click("#emptyDemo"); await sleep(2500);
const id = t => p.evaluate(t => window.__map.state().nodes.find(n => n.title === t).id, t);
const box = async t => (await p.$(`[data-nid="${await id(t)}"]`)).boundingBox();
// click = edit
let a = await box("Places"); await p.mouse.click(a.x + a.width / 2, a.y + a.height / 2); await sleep(300);
check(await p.evaluate(() => !!document.querySelector(".node input")), "a click puts the node into edit mode");
await p.keyboard.press("Escape"); await sleep(200);
// dblclick = new linked node beside, same group
const n0 = await p.evaluate(() => window.__map.state().nodes.length);
a = await box("Places"); await p.mouse.click(a.x + a.width / 2, a.y + a.height / 2, { clickCount: 2 }); await sleep(500);
const r = await p.evaluate(() => { const st = window.__map.state(); const m = st.nodes[st.nodes.length - 1], par = st.nodes.find(n => n.title === "Places"); return { n: st.nodes.length, same: m.color === par.color, linked: st.edges.some(e => (e.from === m.id && e.to === par.id) || (e.to === m.id && e.from === par.id)), dist: Math.hypot(m.x - par.x, m.y - par.y) }; });
console.log(r);
check(r.n === n0 + 1 && r.same && !r.linked && r.dist > 60, "double-click: new node beside, same group, no link");
const overl = await p.evaluate(() => { const nn = [...document.querySelectorAll(".node")]; const els = nn.map(e => e.getBoundingClientRect()); window.__ovl = []; for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) { const A = els[i], B = els[j]; if (A.left < B.right && A.right > B.left && A.top < B.bottom && A.bottom > B.top) window.__ovl.push(nn[i].textContent + " | " + nn[j].textContent); } let o = 0; for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) { const A = els[i], B = els[j]; if (A.left < B.right && A.right > B.left && A.top < B.bottom && A.bottom > B.top) o++; } return o; });
console.log(await p.evaluate(() => window.__ovl)); check(overl === 0, "no overlapping nodes after it (" + overl + ")");
await p.keyboard.type("Beach"); await p.keyboard.press("Enter"); await sleep(200);
// unconnected toggle
await p.evaluate(() => { const st = window.__map.state(); st.nodes.push({ id: "n99", title: "Loose idea", color: "#B8B4B4", x: 5000, y: 3600, pinned: false }); }); await p.evaluate(() => document.querySelector('#side [data-unconn]').click()); await sleep(300);
check(await p.evaluate(() => document.querySelectorAll(".node.bg").length > 5 && !document.querySelector('[data-nid="n99"]').classList.contains("bg")), "Unconnected: linked nodes step back");
await p.evaluate(() => document.querySelector('#side [data-unconn]').click()); await sleep(200);
// edge label + both arrows via state + format roundtrip
const t = await p.evaluate(() => { const st = window.__map.state(); const e = st.edges[0]; e.label = "needs approval"; e.both = true; e.directed = true; e.dashed = true; return window.__map.toText(); });
check(/#link-both #dashed #label-"needs approval"/.test(t), "text carries both arrows, dashed, label");
const back = await p.evaluate(t => { const s2 = window.__map.fromText(t, window.__map.snapshot()); const e = s2.edges.find(e => e.label); return e && e.both && e.dashed && e.label; }, t);
check(back === "needs approval", "label read back from text");
await p.evaluate(() => { document.querySelector("#tabMap").click(); }); await p.mouse.click(700, 830); await sleep(300);
// a click near the edge only selects
a = await box("Lake shore"); await p.mouse.click(a.x + 3, a.y + a.height / 2); await sleep(300);
check(await p.evaluate(() => !document.querySelector(".node input")) && await p.evaluate(i => document.querySelector(`[data-nid="${i}"]`).classList.contains("sel"), await id("Lake shore")), "a click at the edge selects without editing");
// pin toggle: select a node, click its pin
a = await box("Old town"); await p.mouse.click(a.x + 3, a.y + a.height / 2); await sleep(200);
const pin = await p.$(`[data-nid="${await id("Old town")}"] .pin`); check(!!pin, "selected node shows its pin");
const pb = await pin.boundingBox(); const before = await p.evaluate(i => window.__map.state().nodes.find(n => n.id === i).pinned, await id("Old town"));
await p.mouse.click(pb.x + pb.width / 2, pb.y + pb.height / 2); await sleep(300);
check(await p.evaluate((i, b) => window.__map.state().nodes.find(n => n.id === i).pinned === !b, await id("Old town"), before), "click on the pin toggles it");
// messy map: untangle
await p.evaluate(() => {
  const st = window.__map.state(); st.nodes.length = 0; st.edges.length = 0;
  const cols = ["#D64090", "#2B8A3E", "#F97316", "#B39DDB"];
  for (let i = 1; i <= 30; i++) st.nodes.push({ id: "n" + i, title: "Node " + i + (i % 3 ? "" : " longer"), color: cols[i % 4], x: 5000 + Math.random() * 1800 - 900, y: 4000 + Math.random() * 1200 - 600, pinned: false });
  let k = 1; for (let i = 2; i <= 30; i++) st.edges.push({ id: "e" + k++, from: "n" + (1 + Math.floor(Math.random() * (i - 1))), to: "n" + i, directed: false });
  for (let j = 0; j < 5; j++) { const x = 1 + Math.floor(Math.random() * 30), y = 1 + Math.floor(Math.random() * 30); if (x !== y) st.edges.push({ id: "e" + k++, from: "n" + x, to: "n" + y, directed: false }); }
  st.legend = {};
});
await p.evaluate(() => { document.getElementById("btnFit").click(); });
const stat = () => p.evaluate(() => { const st = window.__map.state(); const L = st.edges.map(e => { const a = st.nodes.find(n => n.id === e.from), b = st.nodes.find(n => n.id === e.to); return Math.hypot(a.x - b.x, a.y - b.y); }); let c = 0; const d = (a, b, q) => (b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x); for (let i = 0; i < st.edges.length; i++) for (let j = i + 1; j < st.edges.length; j++) { const e = st.edges[i], f = st.edges[j]; if (e.from === f.from || e.from === f.to || e.to === f.from || e.to === f.to) continue; const N = id => st.nodes.find(n => n.id === id); const [P, Q, R, S] = [N(e.from), N(e.to), N(f.from), N(f.to)]; if ((d(R, S, P) > 0) !== (d(R, S, Q) > 0) && (d(P, Q, R) > 0) !== (d(P, Q, S) > 0)) c++; } const xs = st.nodes.map(n => n.x), ys = st.nodes.map(n => n.y); return { cross: c, maxLen: Math.round(Math.max(...L)), avgLen: Math.round(L.reduce((s, x) => s + x, 0) / L.length), area: Math.round((Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)) / 1000) }; });
console.log("before", await stat());
await p.evaluate(() => document.querySelector('#side [data-ar="untangle"]').click()); await sleep(5000);
const s1 = await stat(); console.log("untangled", s1);
await p.screenshot({ path: "m-untangle.png" });
check(s1.cross <= 2, "few crossings after Untangle");
await p.evaluate(() => document.querySelector('#side [data-ar="loosen"]').click()); await sleep(5000);
const s2 = await stat(); console.log("loosened", s2);
check(s2.area > s1.area, "Loosen gives more room");
// stickers
await p.evaluate(() => { const st = window.__map.state(); st.legend["#2B3BD6"] = "Status"; st.nodes.push({ id: "n50", title: "urgent", color: "#2B3BD6", x: 5000, y: 4000, pinned: false }, { id: "n51", title: "done", color: "#2B3BD6", x: 5100, y: 4000, pinned: false }); st.edges.push({ id: "e50", from: "n1", to: "n50" }, { id: "e51", from: "n2", to: "n50" }, { id: "e52", from: "n2", to: "n51" }); document.getElementById("btnFit").click(); });
await sleep(300);
await p.evaluate(() => { document.querySelector('#side [data-unconn]').click(); }); await sleep(100); await p.evaluate(() => { document.querySelector('#side [data-unconn]').click(); }); await sleep(200);
await p.evaluate(() => document.querySelector('#side [data-gtag="#2B3BD6"]').click()); await sleep(400);
check(await p.evaluate(() => document.querySelector('[data-nid="n50"]').classList.contains("stk") && document.querySelectorAll('[data-nid="n2"] .st').length === 2), "group shown as stickers on the linked nodes");
check(/#stickers/.test(await p.evaluate(() => window.__map.toText())), "text marks the group #stickers");
await p.evaluate(() => document.querySelector('[data-nid="n2"] .st').scrollIntoView()); const stb = await (await p.$('[data-nid="n2"] .st')).boundingBox();
console.log('stb', stb, await p.evaluate((x, y) => { const e = document.elementFromPoint(x, y); return e ? e.className + '|' + (e.closest('.node')?.dataset.nid) : 'none'; }, stb.x + 5, stb.y + 5)); await p.mouse.click(stb.x + 5, stb.y + 5); await sleep(300);
check(await p.evaluate(() => document.getElementById("detTitle")?.value === "urgent"), "click on a sticker shows its node");
await p.screenshot({ path: "m-stickers.png" });
// delete a group with nodes: they go to another group
const gcount = await p.evaluate(() => window.__map.state().nodes.filter(n => n.color === "#2B3BD6").length);
await p.evaluate(() => document.querySelector('#side [data-gc="#2B3BD6"]').click()); await sleep(200);
await p.evaluate(() => [...document.querySelectorAll("#pop .opt")].find(o => o.textContent.startsWith("Delete the group")).click()); await sleep(300);
await p.evaluate(() => [...document.querySelectorAll("#pop .opt")].find(o => o.textContent === "no group").click()); await sleep(300);
check(await p.evaluate(n => !window.__map.state().legend["#2B3BD6"] && window.__map.state().nodes.filter(m => m.color === "#B8B4B4").length >= n, gcount), "deleting a group moves its nodes to the chosen group");
// Unpin all in the left column
await p.evaluate(() => { const st = window.__map.state(); st.nodes[0].pinned = true; st.nodes[1].pinned = true; document.querySelector('#side [data-unconn]').click(); document.querySelector('#side [data-unconn]').click(); }); await sleep(300);
await p.evaluate(() => document.querySelector('#side [data-ar="unpin"]').click()); await sleep(300);
check(await p.evaluate(() => !window.__map.state().nodes.some(n => n.pinned)), "Unpin all releases every pin");
// clear button in the name field
await p.evaluate(() => { const st = window.__map.state(); }); 
const nb = await p.$(".node:not(.stk):not(.gone)"); const nbb = await nb.boundingBox(); await p.mouse.click(nbb.x + 3, nbb.y + nbb.height / 2); await sleep(300);
await p.focus("#detTitle"); await sleep(100);
const cb = await (await p.$('#det [data-fclear="detTitle"]')).boundingBox();
await p.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); await sleep(150);
check(await p.evaluate(() => document.getElementById("detTitle").value === "" && document.activeElement.id === "detTitle"), "clear button empties the name and keeps the focus");
check(!errs.length, "no errors " + errs.join(" | "));
await b.close();
