# οὐθείς Map

A mind map in a single HTML file: nodes in groups, links with or without direction, a note
for every node. It runs in the browser without a server and without loading anything from
the network.

Download `dist/outheis-map.html` and open it.

## Where the map is kept

- In the browser, after every change.
- In a connected text file (Chrome, Edge and Opera on computers): *File → Save to a file* in
  the left column (☰ on smaller screens). The file is written about two seconds after each
  change; after a browser restart the panel offers to resume writing, which the browser
  confirms once. The dot in the header is green when everything is kept, amber when changes
  are not in a file.
- Other browsers download the map as a text file; the dot shows when changes are not in a
  file yet, and the browser asks before closing.
- Earlier versions: every five minutes in which something changed, the last 50, under
  *File → Versions*.

The text format is described in [docs/format.md](docs/format.md). Markmap files
(markmap.js.org) can be imported and exported.

## Building

`src/map.src.html` is the source; `python3 build.py` embeds the fonts and writes
`dist/outheis-map.html`. Product name and colours sit in one marked block at the top of the
source (CSS) and in the `BRAND` object (script).

## Layout

The layout follows that of οὐθείς Agenda: a header with one task (the map's name, its state,
Map and Text, a new node), the groups and the file in a column on the left, the chosen node
in a column on the right. On computers both columns fold away (☰, the column symbol, or the
key `\`), so that the map takes the whole window. Below 1100 px the left column is a drawer
and the details come up as a sheet from below; on phones Map and Text are at the bottom.

## Working on the map

- A click on a node selects it and makes its name editable at once (on touch screens the
  name is edited in the details). A double click on a node makes a new node linked to it,
  in the same group, on a free place beside it.
- Links: a click on a link sets its label, the arrow (none, either direction, both ends)
  and a solid or dashed line. Labels sit horizontally beside the line where they cover no
  node and no other label.
- The pin on a node means placed by hand: layouts leave it. It appears when a node is
  dragged, and faintly on the selected node; a click on it pins or releases.
- *Untangle* lays the map out with as few crossing links and as short links as it can, as
  compact as it stays readable. Per connected part and from several roots: a radial tree
  (which as such has no crossings), the order of the children chosen recursively from the
  root down against the remaining crossings, springs to even the distances, a local search
  that moves or swaps nodes pass after pass until a pass changes nothing, no crossing is
  left or about three seconds are up, and a compaction that pulls nodes together as far as
  that adds no crossing and no overlap. The parts are packed side by side, nodes without
  links below. Untangle moves every node and releases the pins; *Arrange → Untangle around
  the … placed by hand* keeps them and improves only the rest. *Loosen* gives more room in
  steps, *Compact* closes the gaps again.
- *Unconnected nodes* (left column) lets the nodes without links stand out and the others
  step back.

## Groups

A group is a name with a colour. Tap a group in the left column to hide or show its nodes,
press and hold to show only this one; which groups are hidden is kept in the browser, not in
the map. *Edit* renames the groups and changes their colours: seventeen colours are offered
(the list from Miro), *Other colour …* opens the browser's colour chooser for any other; a
group keeps its place. The details of a node list its links with a short vertical bar in the
colour of the linked node's group. The heading of the details is the node itself: its group
as a vertical bar (click: another group) and its name (click: edit).

The tag symbol beside a group shows it as stickers: its nodes leave the canvas and appear
as small labels on the nodes linked to them. Some groups are attributes rather than
things; the map still describes everything with nodes and links.

## Fonts

Inter, IBM Plex Sans and IBM Plex Mono, under the SIL Open Font License (`fonts/`).
