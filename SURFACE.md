# Surface contract

How the three pages (`index.html`, `orange.html`, `grove.html`) are kept usable, accessible, and still delightful.
Every visible element is a claim about what matters now. If an element cannot say what true state it shows, what valid action it enables, or what consequence or recovery it exposes, it is cut.

## 1. Way

| Actor | Object | Operation | Completion |
|---|---|---|---|
| A visitor (mouse, touch, keyboard, or screen reader) | Watson's work: 17 selected pieces, 311 repositories | Understand who he is, then find and open one piece | The piece is open, or the visitor leaves knowing where everything is |

The film and the grove are the art. They must never stand between a visitor and the work.

## 2. Obstruction found (and fixed)

- **1000vh of film before anything is reachable.** The fix: a skip link as the first Tab stop, a fixed scene bar, and a written version of the film for screen readers.
- **Moving, tiny targets (Fitts's law).** The fix: still scene cards hold the links that drift past in the film, every control is at least 40 to 44px tall, and an orange's tap area grows with its spacing (about 30px minimum).
- **No sign that the film continues.** The fix: the scene bar shows progress, and a "Keep scrolling" nudge appears only after you stop.
- **Film titles hidden from screen readers mid-scroll.** The fix: the moving titles are hidden from assistive technology, and a full written version of the film is always readable, with the page's one real `h1`.
- **The game's rows were links that selected instead of opening, with a link nested inside each.** The fix: during play each row is a toggle button with its selected state announced, and "open" sits beside it.
- **The grove's search claimed to be a combobox but held buttons inside a listbox.** The fix: a plain input, a live match count, and a list of buttons, with ↓, ↑ and Esc.
- **Two keyboard stops per tree (the leaves and the sign).** The fix: one stop per tree, the leaves.
- **Every orange in the grove reachable at once (311 links).** The fix: only the open tree's matching oranges are reachable by keyboard or screen reader.
- **Picking made you wait about 3 seconds for the animation.** The fix: the card opens instantly, and the walk and reach play as a record of what happened.
- **Faint grey text at 2.9:1 and an orange focus ring at 2.4:1, both failing.** The fix: the faint grey merges into the muted grey (4.7 to 5.5:1), and focus rings are ink (16:1).
- **The line boil kept moving while nothing changed.** The fix: in the grove it runs only while he is acting. Motion reports real change.

## 3. Keep / cut ledger

| Element | Claim | Verdict |
|---|---|---|
| Film intertitles | The current beat of the story | Keep visually; hidden from assistive tech (the written version carries them) |
| Scene bar | Where you are in the film; jump anywhere | Keep |
| Scene cards | The links on screen right now, held still | Keep, shown only during their scene |
| "Keep scrolling" nudge | The film continues | Keep, shown only after you stop |
| The drifting links in the drawing | Same as the scene cards | Keep as art; not the only path |
| Exposure-sheet counter | Scene, camera, frame | Keep as delight; hidden from assistive tech |
| Tree sign as a link | Same as the tree's leaves | **Cut** from keyboard and screen reader (still clickable) |
| `--faint` grey | Nothing `--muted` didn't already say | **Cut** (merged) |
| Search "combobox" pattern | A false widget | **Cut** for a plain search with a result list |
| Pick animation as a gate | Nothing true | **Cut**; it plays alongside the open card |
| Hidden game (face, Konami code) | A different way to read the work | Keep; labeled honestly, with its on/off state announced |
| The basket | A random ripe orange | Keep; labeled, reachable only in the grove overview |
| Tricks (keepie-uppie, breakdance, duct tape) | He is a character, not a cursor; duct tape proposes a new work from three real ones | Keep: a labeled menu plus J, B and T; disabled while a pick is active; each trick announced; the camera pushes in only to show it; skipped under reduced motion (the outcome is still announced); one unprompted trick per visit after 15 seconds idle |
| Grove doorway on the homepage | Search, the 11 trees, and tricks, one click from the work | Keep; the search opens the grove filtered (`grove.html?q=`), each tree links to `#tree=`, each trick to `#trick=` |

## 4. State map

| State | Home film | Grove |
|---|---|---|
| REST | Title, Skip, scene bar | The grove overview: trees, search, filters, list below |
| READY | A scene card while a scene is on screen | A tree is open; its oranges can be tabbed and picked |
| WORKING | — | The camera moves and he walks (can't block: the card is already open) |
| CHANGED | The scene bar updates | Live announcement: "In the tree…", "Picked…", "Back in the grove…"; filters dim what doesn't match and the count updates |
| COMPLETE | End card: "Walk into the grove" | The card: Open the page / Code |
| RECOVERY | Scene tabs, Skip, the browser's Back button | "Put it back", Esc, Back, Prev/Next; focus returns to where you were |
| FAULT | No JavaScript: a note links to the work list | An unknown `#pick` is ignored; the list always works |

## 5. Wireframes

```
HOME / film                          GROVE / tree open, orange picked
┌────────────────────────────────┐   ┌───────────────────────────────────────┐
│ [Skip the film]  (on focus)    │   │ [Skip to list]          (on focus)    │
│ face  name           nav       │   │ search ............  chips   status  │
│        intertitle              │   │ ‹ The grove                  ┌──────┐ │
│      ( drawing / scene )       │   │      (tree, oranges)         │ card │ │
│ ┌scene card┐                   │   │  ‹      he holds it      ›   │ Open │ │
│ │link link │      [nudge]      │   │                              │ Back │ │
│ └──────────┘                   │   │                              └──────┘ │
│ ▔Title▔Page▔Fall▔Cinema… [Skip]│   │ strip: tree tree tree tree …          │
└────────────────────────────────┘   └───────────────────────────────────────┘
```

## 6. Contract

1. The first Tab stop on every page skips the art.
2. Everything in the art is also in plain HTML (the work list, the written version of the film, the grove list).
3. No action waits on an animation. Animation reports what already happened.
4. Every state has a URL; Back always recovers.
5. Focus moves to what changed and returns to where you came from.
6. Each change is announced once, in words that say what changed.
7. Targets are at least 40px tall and hold still while you aim.
8. Text is at least 4.5:1; focus rings are at least 3:1 (ink, 16:1).
9. Reduced motion: the camera cuts instead of moving, he arrives without walking, and the nudge doesn't bounce.
10. Easter eggs stay: the hidden game, the Konami code, the basket, the exposure sheet, and the tricks. Each is labeled truthfully and reachable without a mouse.

## 7. Failure

- **No JavaScript:** the film shows a note linking to the work and the grove; the grove's list and the work sections are static HTML.
- **Missing portrait:** the photo panel and the poster hide; nothing else depends on them.
- **Unknown deep link:** ignored; the grove opens in its overview.
- **The audit's limits:** axe-core and scripted keyboard flows pass, but no one has tested with a real screen reader (VoiceOver or NVDA) yet. That is the next check.

## 8. Implementation

- `index.html`: a skip link; the written version of the film; the scene bar, scene cards and nudge; game rows as toggle buttons with their state; real headings; contrast and focus fixes.
- `orange.html`: a skip link, the written version of the film, contrast and focus fixes.
- `grove.html`: a skip link and help text; a live announcer; honest search; focus management; roving tab order per tree; hit areas sized to spacing; the instant card; the boil only while acting; the basket easter egg.
- Verified with axe-core (WCAG 2.1 A/AA and best practice): 0 violations on all three pages. Keyboard flows were scripted in Playwright.
