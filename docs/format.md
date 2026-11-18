# The map as text

A map is plain text, one line per node, in the manner of the outheis agenda journal.
It is what the Text view shows and what a connected file holds.

```
Group: Places #group-places #color-218380
Group: Things to do #group-things-to-do #color-FFB400

Summer trip #id-1 #id-2 #link-plain #id-4 #link-plain #at-5222,4092
Lake shore {{bring towels}} #id-8 #group-places #id-2 #link-plain #id-9 #link-to #at-5160,4310 #pinned
```

## Group lines

`Group: <name> #group-<key> #color-<RRGGBB>` names a group and gives its colour. The key is
the name in lower case with other characters as `-`; nodes refer to it. A group without a
name gets the key `g<n>`. Grey (`#B8B4B4`) is "no group" and has no line.

## Node lines

In this order:

1. the text of the node;
2. its note, if any, in `{{…}}`; line breaks in the note are written as `\n`;
3. `#id-<n>`, the node's own id, always the first tag; it never changes;
4. `#group-<key>`, if the node belongs to a group;
5. for every link: `#id-<m>` of the other node, directly followed by its kind:
   `#link-plain` (no direction), `#link-to` (arrow from this node to m) or `#link-from`
   (arrow from m to this node);
6. `#at-<x>,<y>`, the position on the canvas;
7. `#pinned`, if the node was placed by hand (layouts leave it).

Every link stands on both of its nodes: `#id-9 #link-to` on node 8 goes with
`#id-8 #link-from` on node 9.

## Editing

Edits in the Text view are taken over with *Apply*, or when going back to the map; *Undo*
takes them back.

- A line keeps its node by its id; the text, group and position may change.
- A line without an id becomes a new node and gets the next free id. A line whose first tag
  is a link (`New idea #id-3 #link-plain`) is a new node too.
- A deleted line removes its node and its links.
- Links are compared with the map before the edit: a link that one of its two nodes newly
  names is made; a link that one of its two nodes no longer names is removed. A link need
  only be written or struck on one side; the other side is written back.
- A node without `#at-…` is placed beside its neighbours.
- An `#id-…` without a `#link-…` after it, an unknown tag or an id used twice is reported
  with its line number, and nothing is applied.
