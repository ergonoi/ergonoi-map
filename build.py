#!/usr/bin/env python3
"""Builds dist/outheis-map.html: src/map.src.html with the fonts from fonts/ embedded,
so the map stays one self-contained file. Edit src/map.src.html, never the output.

Usage: python3 build.py
"""
import base64
import pathlib
import re

here = pathlib.Path(__file__).resolve().parent
BRAND = {"BRAND_NAME": "οὐθείς Map", "BRAND_TITLE": "οὐθείς Map"}
version = (here / "VERSION").read_text(encoding="utf-8").strip()
out = (here / "src" / "map.src.html").read_text(encoding="utf-8")
for k, v in BRAND.items():
    out = out.replace("@@" + k + "@@", v)
out = out.replace("@@VERSION@@", version)
out = re.sub(r"@@FONT:([a-z0-9-]+)@@", lambda m: base64.b64encode((here / "fonts" / (m.group(1) + ".woff2")).read_bytes()).decode(), out)
left = re.findall(r"@@[A-Z_:a-z0-9-]+@@", out)
if left:
    raise SystemExit("unreplaced markers: " + ", ".join(sorted(set(left))))
(here / "dist").mkdir(exist_ok=True)
(here / "dist" / "outheis-map.html").write_text(out, encoding="utf-8")
print(f"wrote dist/outheis-map.html (version {version}, {len(out) // 1024} KB)")
