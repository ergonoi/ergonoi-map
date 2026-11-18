#!/usr/bin/env python3
"""Builds the map from src/map.src.html, with the fonts from fonts/ embedded:

  dist/outheis-map.html  one self-contained file, to open or pass on as it is
  site/                  the same page as index.html with manifest, service worker and
                         icons, installable as an app (GitHub Pages, see README)

brand.json sets the default theme (outheis or ergonoi) and the name, colour and icons of
the installed app; a choice in Settings still wins per browser. Edit the sources, never
the output.

Usage: python3 build.py
"""
import base64
import hashlib
import json
import pathlib
import re
import shutil

here = pathlib.Path(__file__).resolve().parent
brand = json.loads((here / "brand.json").read_text(encoding="utf-8"))
theme = brand["default"]
look = brand["themes"][theme]
version = (here / "VERSION").read_text(encoding="utf-8").strip()
src = (here / "src" / "map.src.html").read_text(encoding="utf-8")


def render(pwa):
    head = ('<link rel="manifest" href="manifest.webmanifest">\n'
            '<link rel="icon" type="image/png" sizes="32x32" href="icon-32.png">\n'
            '<link rel="apple-touch-icon" href="icon-180.png">\n'
            '<meta name="apple-mobile-web-app-capable" content="yes">') if pwa else ""
    marks = {"BRAND_NAME": look["name"], "BRAND_TITLE": look["name"], "THEME_COLOR": look["color"],
             "DEFAULT_THEME": theme, "VERSION": version, "PWA": "true" if pwa else "false", "PWA_HEAD": head}
    out = src
    for k, v in marks.items():
        out = out.replace("@@" + k + "@@", v)
    out = re.sub(r"@@FONT:([a-z0-9-]+)@@", lambda m: base64.b64encode((here / "fonts" / (m.group(1) + ".woff2")).read_bytes()).decode(), out)
    left = re.findall(r"@@[A-Z_:a-z0-9-]+@@", out)
    if left:
        raise SystemExit("unreplaced markers: " + ", ".join(sorted(set(left))))
    return out


(here / "dist").mkdir(exist_ok=True)
single = render(False)
(here / "dist" / "outheis-map.html").write_text(single, encoding="utf-8")
print(f"wrote dist/outheis-map.html (version {version}, theme {theme}, {len(single) // 1024} KB)")

site = here / "site"
shutil.rmtree(site, ignore_errors=True)
site.mkdir()
page = render(True)
(site / "index.html").write_text(page, encoding="utf-8")
for size in (32, 180, 192, 512):
    shutil.copy(here / "icons" / f"{theme}-{size}.png", site / f"icon-{size}.png")
manifest = {
    "name": look["name"], "short_name": look.get("short", look["name"]), "start_url": "./", "scope": "./",
    "display": "standalone", "background_color": "#FFFFFF", "theme_color": look["color"],
    "icons": [{"src": f"icon-{s}.png", "sizes": f"{s}x{s}", "type": "image/png", "purpose": "any maskable"} for s in (192, 512)],
}
(site / "manifest.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
cache_id = version + "-" + hashlib.sha256(page.encode()).hexdigest()[:8]
(site / "sw.js").write_text((here / "src" / "sw.js").read_text(encoding="utf-8").replace("@@CACHE_ID@@", cache_id), encoding="utf-8")
(site / ".nojekyll").write_text("")
print(f"wrote site/ (index.html, manifest, service worker {cache_id}, icons)")
