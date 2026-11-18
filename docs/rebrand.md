# Rebranding a clone as ergonoi Map

The repository builds οὐθείς Map; the ergonoi look and name are built in as a second theme,
switched on per browser in *Settings and help → Display → ergonoi theme*. That switch is the
preview: whatever a clone would show can be tried in this repository first.

A clone that is to show *ergonoi Map* by default:

1. Clone or fork the repository into the ergonoi organisation.
2. In `brand.json` set `"default": "ergonoi"` and `"site"` to the clone's own address (the
   link preview needs it absolute). Nothing else changes: page title, wordmark, colours,
   manifest name, theme colour, the icons and the link preview (`icons/ergonoi-*.png`)
   follow.
3. `python3 build.py`, or push to main: the Pages workflow builds and publishes `site/`
   (Pages → Source: GitHub Actions in the clone's settings).
4. Optionally adjust the opening lines of `README.md`.

What stays the same, on purpose:

- The storage key (`outheis-map` in the `BRAND` object) and the file format. Maps saved as
  files open in either build. Browser storage belongs to the address, so the two sites do
  not see each other's maps in any case.
- The switch in Settings: users of the clone can still choose the outheis look.

Changes to the app itself are made here and taken over by the clone with a pull or merge;
the clone should carry no other changes than `brand.json`, so that this stays a fast-forward
apart from that one line.
