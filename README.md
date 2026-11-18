# οὐθείς Map

A mind map in a single HTML file: nodes in groups, links with or without direction, a note
for every node. It runs in the browser without a server and without loading anything from
the network.

Download `dist/outheis-map.html` and open it.

## Layout

The layout follows the interface concept of οὐθείς Agenda: a header with one task, lists
of rows in the columns, choices in menus rather than in bars over the content.

- **Header:** the map's name (a click opens the map menu: name, groups, file, versions,
  print), whether it is kept, *Map* and *Text*, *+ Node*, the details column, help.
- **Left column:** groups, *Arrange*, *File*.
- **Right column:** the chosen node.
- **Canvas:** *Fit* bottom right, always; *Arrange* there too when the left column is
  folded.
- On computers both columns fold away (☰, the column symbol, or the key `\`), so that the
  map takes the whole window. Below 1100 px the left column is a drawer and the details
  come up as a sheet from below; on phones *Map* and *Text* are at the bottom.

## Nodes

- A click in the middle of a node makes its name editable; a click near its edge only
  selects it. On touch screens the name is edited in the details.
- A double click on a node makes a new node of the same group on a free place beside it,
  without a link. A double click on the canvas makes a node there. *+ Linked node* in the
  details makes one with a link. A new node is always brought into view.
- The blue handle of a selected node, dragged onto another node, links the two; dragged
  onto free space, it makes a new linked node. *Link to …* in the details does the same by
  tapping.
- The details are headed by the node itself: its group as a vertical bar (click: another
  group) and its name (click: edit; a clear button empties it). Below: its links, each with
  a drawn arrow and the colour bar of the linked node's group; the note; the actions.
- The grey dot on a node opens its note; it is dark when there is one.
- The pin keeps a node in place: Untangle leaves it where it is. Pins are set and released
  only on purpose (a click on the pin of the selected node, or *Keep in place* in the
  details); moving a node does not pin it. *Unpin all* appears under *Arrange* while there
  are pins.

## Links

A click on a link opens its menu: label, arrow (none, away from the node, towards it, both
ends) and a solid or dashed line. Directions are seen from the selected node. Labels sit
horizontally beside the line where they cover no node and no other label.

## Groups

A group is a name with a colour. A row in the left column shows its colour, name, number of
nodes, the sticker symbol and the eye.

- *+ Add group* makes a group together with a first node of it, in the middle of the view;
  the name given to the group goes to that node too.
- A click on the colour opens the group menu: fourteen strong colours (the house colours
  Teal, Amethyst, Wisteria, Scarlet, Amber, Blue and eight more chosen to stay apart; a node
  shows its colour only as a frame, so pale tones are left out), *Other colour …*, and last
  *Delete the group …*. Deleting a group with nodes asks which group they get, or deletes
  them as well. Undo takes it back.
- A click on the name renames it.
- The eye hides or shows the group; press and hold: only this group. Which groups are
  hidden is kept in the browser, not in the map.
- The sticker symbol shows the group as stickers: its nodes leave the canvas and appear as
  small labels on the nodes linked to them. For groups that are attributes rather than
  things; the map still describes everything with nodes and links.

## Arrange

- **Untangle** lays the map out with as few crossing links and as short links as it can.
  Per connected part and from several roots: a radial tree (which as such has no
  crossings), the order of the children chosen recursively from the root down against the
  remaining crossings, springs that repel only in the neighbourhood, a local search that
  moves or swaps nodes until a pass changes nothing, no crossing is left or about three
  seconds are up, and a compaction that pulls nodes together as far as that adds no
  crossing and no overlap. The parts are packed side by side, nodes without links below.
  With pins, the same search runs fitted to the pinned nodes; the menu offers to lay out
  everything, pinned nodes too.
- **By groups** sets every group in an area of its own and ranks by the arrows: a node from
  which arrows only go out stands at the top of its group, every arrow leads one row down;
  the groups are ranked the same way by the arrows between them, groups of the same rank
  side by side. The rows are ordered against crossings, also across groups.
- **Spacing − +** scales the map about its centre; the nodes keep their size, so the layout
  and its crossings stay as they are. − pushes apart what would overlap. After each step
  the map fills the window again.
- **Check overlaps** pushes overlapping nodes apart and marks crossing links.
- **Unconnected** (switch): nodes without any link stand out, the others step back; a link
  to a sticker counts.
- **Group areas** (switch): a soft area with the group's name behind each group.

## Where the map is kept

- In the browser, after every change.
- In a connected text file (Chrome, Edge and Opera on computers): *File → Save to a file*.
  The file is written about two seconds after each change; after a browser restart the
  panel offers to resume writing, which the browser confirms once. The dot in the header is
  green when everything is kept, amber when changes are not in a file.
- Other browsers download the map as a text file; the dot shows when changes are not in a
  file yet, and the browser asks before closing.
- Earlier versions: every five minutes in which something changed, the last 50, under
  *File → Versions*.
- *File → Markmap …* imports and exports Markmap files (markmap.js.org).

The text format, which also the *Text* view shows, is described in
[docs/format.md](docs/format.md).

## Print and PDF

*File → Print or PDF …* prints the map on DIN A4 to A0, portrait or landscape; *Save as
PDF* in the browser's print dialog makes the PDF, the paper size is set. For every format
the dialog shows the size the text of the nodes will have and recommends the smallest one
on which it keeps at least 12 pt. The map prints as it is shown: hidden groups stay hidden,
group areas print when they are on; name and date stand at the top.

## Building

`src/map.src.html` is the source; `python3 build.py` embeds the fonts and writes
`dist/outheis-map.html`. Product name and colours sit in one marked block at the top of the
source (CSS) and in the `BRAND` object (script).

## Fonts

Inter, IBM Plex Sans and IBM Plex Mono, under the SIL Open Font License (`fonts/`).
