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

- A click in the middle of a node selects it and makes its name editable at once; a click
  near its edge only selects it (on touch screens the name is edited in the details). A double click on a node makes a new node in the same group
  on a free place beside it, without a link; *+ Linked node* in the details makes one with
  a link.
- Links: a click on a link sets its label, the arrow (none, either direction, both ends)
  and a solid or dashed line. Directions are always seen from the selected node (*from
  here*, *to here*); in its details every link carries a small drawn arrow that opens this
  menu. Labels sit horizontally beside the line where they cover no
  node and no other label.
- The pin on a node keeps it in place: Untangle leaves it where it is. Pins are set and
  released only on purpose, with a click on the pin of the selected node (faint while
  unpinned) or *Keep in place* in its details; moving a node does not pin it. *Unpin all*
  in the left column releases every pin.
- *Untangle* lays the map out with as few crossing links and as short links as it can, as
  compact as it stays readable. Per connected part and from several roots: a radial tree
  (which as such has no crossings), the order of the children chosen recursively from the
  root down against the remaining crossings, springs to even the distances, a local search
  that moves or swaps nodes pass after pass until a pass changes nothing, no crossing is
  left or about three seconds are up, and a compaction that pulls nodes together as far as
  that adds no crossing and no overlap. The parts are packed side by side, nodes without
  links below. Pinned nodes stay where they are and Untangle improves the rest from
  where it is; *Arrange → Untangle everything, pinned nodes too* lays out all of it. *Loosen* gives more room in
  steps, *Compact* closes the gaps again.
- *Arrange* in the left column is a list like *File*: *Untangle*, *By groups*, *Spacing*
  with − (Compact) and + (Loosen), *Check overlaps* (pushes overlapping nodes apart and marks
  crossing links), and two switches: *Unconnected* (nodes without any link stand out, the
  others step back; a link to a sticker counts) and *Group areas* (a soft area behind each
  group). *Fit* is always on the map, bottom right; *Arrange* appears there too when the
  left column is folded.
- The gear opens a short help, the example and the restore of an old backup. Markmap import
  and export are under *File*.

- *By groups* sets every group in an area of its own and ranks by the arrows: a node from
  which arrows only go out stands at the top of its group, every arrow leads one row down;
  the groups are ranked the same way by the arrows between them, groups of the same rank
  stand side by side. The rows are ordered against crossings, also across groups.
- The name of the map is set in the menu under the title, and kept in its text.
- *Print or PDF …* (left column, or the menu under the title) prints the map on DIN A4 to
  A0, portrait or landscape; *Save as PDF* in the browser's print dialog makes the PDF. For
  every format the dialog shows the size the text of the nodes will have and recommends the
  smallest format on which it keeps at least 12 pt. The map prints as it is shown: hidden
  groups stay hidden, group areas print when they are on.

## Groups

A group is a name with a colour. *+ Add group* makes a group together with a first node of
it, in the middle of the view; the name given to the group goes to that node too. Tap a
group's eye in the left column to hide or show its nodes,
press and hold to show only this one; which groups are hidden is kept in the browser, not in
the map. A click on its colour changes the colour, a click on its name renames it. Fourteen strong
colours are offered, since a node shows its colour only as a frame: the house colours
(Teal, Amethyst, Wisteria, Scarlet, Amber, Blue) and eight more chosen to stay apart from
them and from each other; *Other colour …* opens the browser's colour chooser for any
other. A group keeps its place. The details of a node list its links with a short vertical bar in the
colour of the linked node's group. The heading of the details is the node itself: its group
as a vertical bar (click: another group) and its name (click: edit).

A click on a group's colour opens its menu: another colour, or delete at the bottom. Deleting a group without nodes goes at once; with nodes, a menu
asks which group they get instead (or no group), or deletes them as well. Undo takes it
back.

The tag symbol in a group's row shows it as stickers: its nodes leave the canvas and appear
as small labels on the nodes linked to them. Some groups are attributes rather than
things; the map still describes everything with nodes and links.

## Fonts

Inter, IBM Plex Sans and IBM Plex Mono, under the SIL Open Font License (`fonts/`).
