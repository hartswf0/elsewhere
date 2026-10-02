# Surface contract

How the three pages (`index.html`, `orange.html`, `grove.html`) are kept usable, accessible, and still delightful.
Every visible element is a claim about what matters now. If an element cannot say what true state it shows, what valid action it enables, or what consequence or recovery it exposes, it is cut.

## 1. Way

| Actor | Object | Operation | Completion |
|---|---|---|---|
| A visitor (mouse, touch, keyboard, or screen reader) | Watson's work: the selected pieces on the homepage, and every repository in the grove | Understand who he is, then find and open one piece | The piece is open, or the visitor leaves knowing where everything is |

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
| Scene cards | The links on screen right now, held still | **Cut** (they covered the drawing); the drawn objects are now the links, and the end card stays |
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
| Grove doorway on the homepage | One sentence and a search box | Keep; the search opens the grove filtered (`grove.html?q=`). The tree cards, most-used grid, tricks line and ripeness key are cut |

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

## Revision: the grove becomes a walk

**Cut:**
- the step-into-a-tree mode (a zoom you had to pay for before you could click anything);
- the hint bubble, the frame counter, and the back button;
- the gate's subtitle and the basket;
- the duplicate group-by-tree list;
- the meters on the signs.

**Now:**
- Scrolling down, or swiping and dragging sideways, is the camera dolly. He walks with you, his steps matched to the distance.
- Trees are laid out wide, so every orange can be clicked in place at walking zoom (about 45px targets).
- **Most used first:**
  - every repository gets a usefulness score: authored edits, hand-picked status, a live page, ripeness, recent activity, and size;
  - the "Picked first" stall at the gate holds the top 12;
  - trees appear in order of how useful their best work is;
  - within each tree, the best fruit hangs lowest and largest.
- **The stops bar** shows where you are and jumps anywhere. The arrow keys and the ‹ › buttons step from stop to stop.
- **The index** ranks all 311 by use, with edit counts. It can be sorted (most used, A–Z, recently tended, ripeness) and filtered by tree and ripeness, and it shares the grove's search; **/** focuses the search box.
- **Tab order:** only the oranges in front of you can be reached by Tab. A picked orange that scrolls out of view is put back.

## Revision: three tools, one peel

**Cut from the top:**
- the seven ripeness chips (now one Show filter);
- the status line (the count now sits beside the view it describes);
- the ✦ Tricks button (Watson is the button);
- the arrow buttons (the stops bar, the keys and swiping cover them).

**Three tools, one data set, one search, one filter:**
- **Walk:** the scrolling grove.
- **Crate:** a grid of large tiles, the easiest targets on a phone or for a tremor.
- **List:** the ranked index with sorting.

The view is remembered, and `?view=` links to one.

**Watson is a button:**
- pressing him cycles keepie-uppie, breakdance and duct tape;
- his label names the next trick;
- his tap area sits under every orange, so where they overlap, the orange wins.

**The peel, one modal for every orange:**
- It's a native `<dialog>`: it traps focus and closes with Esc, the ✕ button, a backdrop click, or Back (`#pick=`). The page behind it locks, and focus returns to the orange you came from.
- The skin falls away (skipped under reduced motion) to show the **live page in a sandboxed iframe**. Code-only repos show their **README**, fetched from GitHub.
- If a page won't embed, a note after 6 seconds offers to open it in a new tab.
- Previous/Next, or ← and →, step through the current filtered ranking.
- On phones it's a full-screen sheet.

**Hover preview:** on fine pointers only, resting on an orange or a tile for 0.45s shows the live page at small scale. It never appears on touch screens.

**Without JavaScript or with a modifier-click:** crate tiles and list names are real links to the project.

## Revision: a steady walk, every repository, a drawn bar, and Seasons

**The walk glitch: cause and fix.**
- **Cause:** while you scrolled, he chased a moving target. That popped him in and out of a zip pose, snapped him from walking to standing, flipped his facing, and switched the outline wobble on and off. On phones, the address bar showing and hiding fired a resize that jumped the scroll.
- **Fix:** while you scroll he is locked to the camera. His stride comes from the distance travelled, and the walk blends in and out with smoothed speed. He turns around only when the direction clearly changes, and the outline wobble runs only during real actions. Resizes that don't change the stage are ignored.
- **Measured, old → new:** facing flips 6 → 1 (the intended reversal), position jumps relative to the camera 48 → 0, zip-pose frames 49 → 0.

**Every repository:** 340, up from 311.
- The 29 created since the April 30 audit (forks and one empty repo excluded) are read from git:
  - planted = first commit; commits = commit count;
  - site = a root `index.html` or a `gh-pages` branch;
  - description = the first line of the README;
  - theme by keywords.
- "Tended" dates for recent repositories come from the live listing.

**The bar, drawn:**
- the blinking pixel face, then "The Grove" with its count and date;
- a search box styled as a tag;
- four tools as hand-drawn icons, with a wavy orange underline on the active one;
- one-tap fruit toggles on desktop (✦ hand-picked, new, and the five ripeness states), and a select on phones;
- a wavy ink line in place of the ruled border.

**Seasons:** the chronology.
- A ring per month, its height the number of projects planted that month. Each ring jumps to its month, and the view opens on the newest.
- Below, every month from newest to oldest, with its projects as large pills.
- Also: a "New this season" filter, "Newest planted" sorting in the list, and planted and tended dates in the modal.

## Revision: professional, and nothing to maintain

**Cut from the homepage:**
- the model sheet (three panels, peg bars, the caption); About is now a portrait and the bio, in the same grid as every other section;
- the grove section's most-used grid, new-this-season grid, tree cards, tricks line and ripeness key;
- the cinema, systems and writing scene cards, which covered the drawing.

**Nothing on the homepage goes stale:** no counts, no dates, no rankings. They live only in the grove, which says when it was picked.

**The systems are the links.** The Gumball Emotion Machine, the LEGO stack, Centaur Box and Coaxing the Ripples are each one large link: drawing and label together. Each wakes as he walks up, or on hover:
- the gumball crank turns and a gumball rolls out;
- the bricks drop into a stack as he approaches;
- Centaur Box's door swings open and the light comes on;
- the bird pecks and the rings go out.

The writing fingerpost's whole sign boards are links. Under reduced motion, each shows its finished state. The written version of the film and the work list below still hold every link for keyboard and screen-reader users.

## Revision: trees that are trees, places with landmarks, birds, and a Watson who says he's a button

**Trees:**
- Each tree has a trunk with a root flare, and limbs that fork into the canopy.
- The canopy has two layers: shaded back clumps, then lit front clumps with leafy edges. The limbs show between the clumps.
- A big theme is now a stand of several trees, about 34 oranges each, not one giant blob.
- Every tree sways slowly on its own. It flexes harder when he walks under it, and shakes when an orange is picked. The movement is under 2px at the fruit, so targets hold still enough to aim at.

**Places:** each theme's clearing has a landmark:
- a lectern whose book turns a page;
- a flickering television;
- a robot scarecrow that waves when he's near;
- a swing;
- a sundial whose shadow follows the real hour;
- a gramophone with rising notes;
- stacked archive crates;
- a turning wireframe cube;
- a cave with a fire;
- a chalkboard;
- a wheelbarrow of the rest.

The signs stand below the fruit and never cover it.

**Birds:**
- Birds perch on the canopies and peck.
- When he walks up, or when a tree is shaken, they fly ahead to another tree.
- A flock crosses the far sky.

**Watson says he's a button:**
- When he stands still, a thought bubble shows the next trick's tool (a ball, a boombox, a roll of tape) and "TAP ME". The bubble is itself the button.
- The bubble never covers an orange: it takes the first clear spot beside his head, or stays hidden.
- On hover he waves.
- After three taps in a session, the bubble only appears on hover.
- The walking hint now says "tap him for a trick".

**Reduced motion:** nothing sways or flies. The birds sit, and every landmark shows its still frame.

All of it is decoration: hidden from assistive technology and transparent to clicks. axe-core finds 0 violations.
