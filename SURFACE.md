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

## Revision: the Shed (pruning, collections, play)

`shed.html` is the gardener's shed at the edge of the grove. It is linked from the grove's bar and the homepage.

**Prune:**
- One project at a time, in a chosen pile: least used, blossoms and fallen, untended longest, newest, most used, or one tree.
- Each project can be kept, pruned, featured or skipped, by button, swipe, or the keys P/K/F/S and the arrow keys. U undoes.
- The card shows the project's facts, links and an optional live preview.
- A side tree records the decisions: kept fruit in the crown, featured fruit with a star, pruned fruit on the ground.
- A decisions ledger lets you clear any one of them.

**Collect:**
- Named collections with a note, built with a search-and-add list.
- Items can be reordered and removed with buttons.
- Deleting a collection takes two presses.

**Play** (best scores are kept in the browser):
- **Catch:** a 40-second basket game; the projects you catch are listed as links.
- **Older or newer:** which was planted first?
- **Which tree?:** which theme a project grows on.

**Publishing without code:**
- Edits stay in this browser until Publish. Publish downloads `curation.js`, which you upload to the repository root.
- The grove reads it on load: pruned projects fall to the ground (marked "pruned" in the crate and list), and featured ones become hand-picked and lead the "Picked first" stall.
- The homepage lists published collections under the grove search.
- Visitors' edits never leave their own browser.

axe-core finds 0 violations on the homepage, the grove and the shed.

## Revision: the games, inside the grove

The three games now live in one shared file, `games.js`, used by both the Shed and the Grove. Best scores are shared between the two pages.

**Ways in:**
- a Play button in the grove's bar;
- a GAMES board standing in the clearing after the "Picked first" stall, with one plaque per game.

The games open in a panel over the walk, so the grove stays on screen. The panel closes with ✕ or Esc, and "All games" returns to the menu.

**Catch is played in the world:**
- The tree in front of you shakes, its real oranges wobble and drop, and Watson walks under them holding a basket.
- Move him with ← →, the mouse, dragging, or the on-screen pads.
- Missed oranges land on the ground. Rotten ones cost a point.
- While the game runs, scrolling is held still and the oranges can't be picked.
- After 40 seconds every orange returns to its branch. What you caught is listed, and each one opens in the peel.
- "Next tree" moves on and plays again under the next tree.

**The quizzes answer with a place:**
- After each answer in Older or newer and Which tree?, the camera walks to the orange and it glows.
- Every name in the feedback opens the project in the peel.

axe-core finds 0 violations on the grove and the shed.

## Revision: six games, and Watson plays them too

**New games:**
- **Toss** (in the grove): five rounds of throwing real oranges into a crate. You and Watson face the same distance and wind each round.
  - Aim by dragging back from him like a slingshot, or with the keys (↑ ↓ angle, ← → power, Space to throw), or with the panel buttons.
  - A dotted line previews only the first part of the arc.
  - The physics runs in fixed steps, so the preview, Watson's aim and the real flight agree.
- **More work?:** which of two projects got more edits by hand.
- **Pairs:** a memory game matching projects to what they do, taking turns with Watson.

**Watson plays:**
- In every quiz he answers after you; his pick is tagged and the score reads "You n · Watson n". He is right about 50 to 62% of the time, depending on the game.
- In Pairs he remembers about 70% of the cards he sees.
- In Toss he works out the throw that would land dead centre, then his hand shakes a little.
- In Catch, "Watson's turn" after your round has him play the same tree on his own: he goes for the ripest orange he can reach, dodges rotten ones, and sometimes misses. "Watch Watson play Catch" is also in the menu.

**He reacts:** arms up when he's right, a head shake when he's wrong, a breakdance when he wins a match, a shrug and a tip of his glasses when you beat him.

**Elsewhere:**
- `grove.html#play=toss` (or any game) opens a game directly.
- The Shed has More work? and Pairs, and links to Toss in the grove.
- The GAMES board in the grove now has six plaques, in a wider clearing.

## Revision: magic

**Trees:**
- Every trunk has a sleepy face. The eyes open as he comes near, follow him, blink, and smile when he's close. The tree looks surprised when one of its oranges is picked.
- Ripe and hand-picked oranges catch the light (a small glint).
- Pollen drifts up from the canopies by day, and leaves let go and flutter down.
- Picking an orange throws a ring and a burst of sparkles.

**Light that follows the visitor's clock:**
- Day (7–5), dusk (5–7:30 and at dawn), night otherwise.
- At dusk: a rose sky and a low sun; lanterns in every tree.
- At night: a navy sky with twinkling stars and a moon, glowing eyes in the trunks, fireflies, lit lanterns, sleeping birds, an owl, and bats in place of the flock.
- A round button at the top left of the grove cycles day → dusk → night, with its label and an announcement. `?sky=` sets it from the URL.
- The fruit and the signs are never tinted.

**Creatures:**
- Birds come in four kinds (dove, robin, bluebird, goldfinch). They sing (notes rise from the beak) and hop and sing when tapped.
- Cats sleep under some trees, with zzz's and breathing. They sit up and watch him as he passes, swish their tails, and purr with hearts when tapped.
- Butterflies wander the blossoming trees. When he stands still a few seconds, one lands on his head, and it leaves when he walks.
- Snails with orange shells cross slowly under the trees, leaving a shimmering trail. Tapped, they hide in the shell.
- The owl (dusk and night) watches him and hoots when tapped.

**Accessibility:**
- All of it is decoration, hidden from assistive technology.
- The tap targets sit on canopy tops and the ground, away from the oranges.
- Under reduced motion nothing drifts, flies or crawls, and each creature shows its still state.
- axe-core finds 0 violations.

## Revision: thick description (after Clifford Geertz)

Geertz's point: a twitch and a wink are the same movement of an eyelid. What separates them is how thickly you describe the context. The grove now lets you choose.

**The Thicken dial** (beside the sky button, remembered; `?thick=0–3`):
- **Thin:** only the oranges.
- **Named:** every orange carries its name.
- **Webs:** silk threads with dewdrops join projects that share distinctive words (IDF-weighted overlap of name and description).
  - Nearby threads show at rest; long threads across the grove appear only for the orange you point at or focus.
  - Its web turns orange and its kin are ringed.
  - A spider hangs from the tree in front of you.
- **Field notes:** an observer's handwritten notes over each tree:
  - counts by ripeness;
  - the most tended;
  - the oldest and newest;
  - the word it shares most with another tree.

  A note at the gate frames the grove as a culture, not a list. Watson winks, under a note asking "A twitch, or a wink?"

**Each card thickens** (remembered):
1. **Thin:** a repository called X.
2. **What it does.**
3. **Where it grows:** its tree and its kin, which open in place.
4. **When, and how much:** planted, with how many others that month; tended until; edits; and what its ripeness means.
5. **A thick reading:** one composed sentence, ending on the twitch and the wink, with a citation.

The orange beside the control gains a rind for each layer.

All the layers are decoration or plain text. axe-core finds 0 violations.

## Revision: the film, thickened

The homepage film has its own Thicken button in the film bar, beside "Skip the film". Its setting is remembered.
- **Thin:** the film as it was.
- **Glossed:**
  - Each drawn work carries a handwritten margin note, with a leader line, taken from that work's own description in the work list ("It translates a model's claim into legal parts…").
  - The cinema gets one note listing its films as verbs.
- **Webbed:** silk threads with a dewdrop join works that share a tension (authorship, abundance, opacity, misclassification). The tension is written on the thread in orange.
- **Field notes:**
  - An observer's note fades in at each scene: the blank page, the hole, the fall, the landing, the cinema, the four machines, the signpost, the grove, and the pencil handed over.
  - At the end Watson winks beside "A twitch, or a wink?"

**One source for both readings:** the field notes are written once, in the film's written version, under "Read thickly: field notes on the film". Screen readers read them there, and the drawing builds its notes from that list. The glosses and webs come from the work list's own data (`data-phrase`, `data-ten`), so they stay true if the work list changes.

axe-core finds 0 violations.

## Revision: the television plays a film

The Media Theory landmark is now a larger set, playing a 13-second multiplane loop inside its screen (clipped):
1. A tiny Watson walks. The sky, far hills and middle trees pan at different speeds, and the sun crosses.
2. He reaches an orange tree and picks the orange. It grows to fill the screen.
3. It peels into eight segments, and a film strip runs through, its frames showing the same scene.
4. A television inside the television shows the scene, and the camera zooms into it until it becomes the screen. Static, then the loop begins again (the medium is the message).

A ticker along the bottom scrolls the names of the real projects on the Media Theory tree.

Tapping the set changes the channel: a burst of static and a jump ahead. Under reduced motion it holds one still frame.

## Revision: every landmark tells a story; the house that language built; the live sky

**Landmark stories** (loops of 11–14 seconds; still under reduced motion):
- **Lectern:** a page turns; "once", "upon" and "a time" rise out of the book, fold into paper birds, and fly off.
- **Robot scarecrow:** a crow lands on its arm instead of fleeing. Its light turns into a heart, its head tilts, and the crow leaves. It still waves at Watson.
- **Swing:** an orange swings higher and higher, lets go, and arcs into a basket that fills up. Another drops onto the seat.
- **Sundial:** keeps the real hour. Beside it a seed grows into a tree, flowers, fruits, drops its orange, and starts again.
- **Gramophone:** the record spins, a bird keeps time on the horn, and the notes curl into a spiral.
- **Archive:** the lid opens and the papers (named after that tree's projects) fly out, lay themselves in a row, and file back in.
- **Wireframe:** the cube rounds itself into a sphere, becomes an orange that bounces, and squares up again.
- **Plato's cave:** the fire throws shadow puppets across the wall: a bird, an orange, a figure in glasses.
- **Chalkboard:** chalk writes "thin → thick", "say · see · do" and "describe ≠ depict"; then the eraser sweeps.
- **Wheelbarrow:** one orange hops out, rolls off to look for its tree, looks around, and comes back.
- **Television:** the multiplane film, as before.

**The house that language built:** a new place at the end of the walk, and the last stop in the stops bar.
- As he walks toward it, it assembles from words: nouns lay the floor, verbs are the bricks, the roof is the sentence "interfaces for worlds that don't exist yet", the door is "prompt", the two windows read "meta" and "phor", and "story" rises letter by letter from the chimney.
- A cumulative rhyme grows on a sign beside it, ending "and the reader walks in."
- The rhyme is also in the page for screen readers.

**The live sky:**
- **Location:** a city guessed from the browser's time zone (no prompt, about 75 zones; otherwise a longitude from the UTC offset). "Use my location" asks the browser; the result is rounded to two decimals and kept only for the visit.
- **Sunrise and sunset** are computed locally (SunCalc/NOAA formulas). Day, dusk and night follow them, including polar day and night.
- **Weather** comes from Open-Meteo:
  - cloud cover greys the day sky and brings more clouds;
  - wind strengthens the trees' sway;
  - rain or drizzle falls in slanted streaks, and Watson holds an umbrella;
  - snow drifts;
  - fog lies in bands over the far rows;
  - storms add lightning flashes;
  - fireflies and pollen stay in when it's wet.

  Results are cached for 30 minutes in the session.
- **The sun button** opens a small panel: an honest status line (where, how the place was found, sunrise, sunset, temperature in °F or °C by locale, conditions), Live/Day/Dusk/Night, Live/Clear/Rain/Snow/Fog/Storm, "Use my location", and a note on what is shared. `?sky=` and `?wx=` set it from the URL.
- **Graceful failure:** if the request fails, is blocked, or takes over 6 seconds, the status says so plainly. The weather stays fair, and the time of day still follows the visitor's clock. If geolocation is refused or unavailable, the time zone guess stays. Nothing breaks.

Verified: the failure path (request blocked) and the success path (a mocked rain response), at desktop and mobile widths and under reduced motion. axe-core finds 0 violations.

## Revision: the fall reads, the umbrella is held, the sun moves

- **The fall:** below the page edge are ten real lines of a poem, falling past him at near-camera depth, with a paper halo so they read over the scribbles. They are part of the written version of the film. They fade out at the landing.
- **The film's sun** crosses the sky as you scroll, from the landing to the grove, and turns golden at the encounter.
- **The grove's umbrella** hangs from his actual hand.
- **The grove's sun:**
  - it sits where the real sun is, on an arc from east at sunrise to west at sunset; at night the moon follows the night's arc;
  - it rises into place when the page opens and glides when the time of day is changed by hand;
  - it jumps straight there under reduced motion.

## Revision: the signs open each tree; every tree is its own colour and emblem

**Distinct trees.** Each theme has its own colour and a drawn emblem: a book, a television, a robot, a pointer, an hourglass, a note, a box, a cube, a flame, a chalkboard, an orange. Its sign also has one of four board shapes (plain, pill, arrow, banner). The colour and emblem repeat on the sign, in the stops bar and in the sheet, so a tree is recognised wherever it appears.

**The sheet: the easy view.**
- **Ways in:** tap a tree's sign, tap the stop you're already standing at, or follow `#open=<tree>`.
- **Layout:** a dialog in the tree's colour (full screen on phones), showing the name, count, number ripe and years planted.
- **Moving between trees:** previous and next trees (with their emblems) and "Walk to this tree". Swipe sideways, or use ← and →, to change trees.
- **Finding a project:**
  - filter chips with counts (all, hand-picked, each ripeness);
  - sort by most used, newest planted, recently tended, or A to Z;
  - every project as a large tile (orange, name, two-line description, ripeness, planted date).
- **Recently opened:** a row of the last ten projects opened anywhere, one tap to reopen. It is kept in the browser.
- **The card:** a tile opens the usual card on top of the sheet. Its Previous and Next step through the sheet's own filtered list. Closing the card returns to the sheet with focus on the tile; closing the sheet returns focus to where you came from.

axe-core finds 0 violations at desktop and phone widths.

## Revision: a quieter operational surface

**The tree sheet, cut to what it's for:**
- **Header:** one row with ‹ (previous tree), the emblem, the name and the count, › (next tree), and ✕. The tree's colour is a thin rule at the top, no longer a filled block. The neighbouring trees' names are in each arrow's label and tooltip.
- **Filters:** one scrolling row with All and its count, then ✦ (hand-picked) and a dot for each ripeness, each with its count. The words live in labels and tooltips. The sort control is a small menu at the end of the row.
- **Projects:** a dense list, with a ripeness dot, the name, the planted month in a column on the right, and one line of description, separated by hairlines. About 14 rows fit on a phone screen, against 5 cards before.
- **The bottom of the list:** "Walk to this tree" (a text button) and the recently opened projects.

**The grove bar on phones:** two rows, not three. The title remains for screen readers. The filter menu sits beside the search, and the six tools share the second row with smaller labels.

**Signs** now stand at the centre of their stand, beside Watson rather than behind him.

axe-core finds 0 violations.

## Revision: inside every repository, the good stuff first

**The problem:** repositories hold many pages (momsaic alone has 217), named in versions (`game (3).html`, `game-v5-final.html`, `game_fixed.html`). Some aren't published at all, and the best work, like momsaic's games, was invisible.

**The index** (`tools/crawl-inside.py`, giving `inside.js`):
- For each repository it shallow-clones the Pages branch (or the default branch) without file contents and lists every HTML file.
- It folds versions into families:
  - by name stem, ignoring `(n)`, `vN`, `final`, `fixed`, `copy` and the like;
  - by a shared first word when three or more files share it;
  - by identical titles.
- It fetches only the best page of each family, to read its `<title>` and description.
- Ranking:
  - versions count as evidence of care, capped so generated data folders don't dominate;
  - then size and kind (game, tool, world, film, music, talk, text);
  - then a description;
  - test, backup and template pages sink.
- 340 repositories and 9,883 files became 4,501 distinct pages: 278 games, 674 tools, 492 worlds and more. Eight repositories couldn't be cloned (empty).

**Where it shows:**
- **The card's "Inside" section:** the page count (and how many files were folded), kind tabs with counts, and the ten best pages ("best" marks the top three).
  - A page loads straight into the card's view. "N versions" expands to the other versions.
  - "Open this page ↗" follows whatever is showing.
  - A repository without a site now opens on its best page, through raw.githack, instead of only its README.
- **Search** reaches inside: under the projects it lists "Inside the projects" matches by page title, file name, description or kind. "futbol" finds the Fútbolmas games; "game" finds games.
- **The tree sheet** has a Projects / Inside switch. Inside lists the pages of this tree, or of the whole grove (identical copies across repositories shown once), filtered by kind.
- **llms.txt** lists the four best pages of every repository with four or more pages, for crawlers.

## Round 24: where the juice is (quality, read from evidence)

The question: inside each repository, what is actually *good*?

**How pages are read.** `tools/assess-pages.py` opens the best page of every family (4,297 pages in 286 repositories), plus the local scripts it loads, and records evidence:
- what you can do in it: canvas, game loop, 3D, shaders, keys, touch, gamepad, score and physics, sound, camera, voice, model calls, networking, saving, export and import, the number of controls;
- how big it is: lines of code;
- whether it is ready for a stranger: a real title, phone layout, instructions, labels, a favicon, placeholder text;
- whether it works on its own: missing local files;
- the words a visitor meets first: headings and buttons.

`tools/juice.py` turns that evidence into a reading:
- **Five marks out of three:** Play, Craft (versions and code, by corpus quantile), Polish, Reach, Distinct (rare words across the grove).
- **A verdict** naming the strongest pattern. Counts are for the current crawl:

  | Verdict | Pages | What it means |
  |---|---|---|
  | Gem | 272 | Play 3, polished, reaches phones, real craft, top 7% |
  | Long work | 203 | |
  | Instrument | 622 | |
  | Toy | 806 | |
  | Reading | 374 | |
  | Sketch | 743 | |
  | Solid | 1,011 | |
  | Rough | 266 | Missing files or unfinished |

- **"Good:"** phrases such as "15 versions · game loop · 3D · keys + touch · sound".
- **"Needs:"** phrases such as "no instructions", "no phone layout", "3 missing files", "unlabelled controls".
- **Juice**, a weighted sum used for ranking: play counts most, then craft, polish, reach and distinctiveness.

This is evidence, not taste. The text says so: "It tells you where to look first; only opening the page tells you if it is good."

**Where it shows:**
- **Grove card, Inside:** pages ranked by juice. Each row has a five-bar mark and "Verdict · good things". The open page gets a full reading (bars, Good, Needs). "Ranked by juice: how pages are read" explains the rubric.
- **Tree sheet, Inside:** rows carry the mark and the reading, and the whole-grove list is ranked by juice.
- **Search:** "gem", "toys" and so on find pages by verdict.
- **The Shed has a new view, Juice ("Where the juice is"):** every page across the grove, with filters by verdict, search, sort by any mark (or versions, or most needs), copies folded, and "☆ Feature" to feature the page's repository (published like any curation). A side list gives the juiciest repositories.
- **Shed pruning:** each card shows what is inside the repository (counts of gems, long works and instruments, and its juiciest page). There are new "Most juice inside" and "Least juice inside" piles.
- **llms.txt:** the 30 juiciest pages across the grove, with verdicts and reasons; each repository's top pages carry their reasons.

**Refresh:** run `python3 tools/crawl-inside.py`, then `python3 tools/assess-pages.py`, then the build.

## Round 25: the juice bar (pictures and plain words)

**Pictures.** `tools/shoot-pages.js` opens the juiciest pages in headless Chromium and photographs them. That is 845 pages, chosen by `tools/pick-shots.py`: the top across the grove with copies folded, and at least three per repository.
- Each page is served straight out of a blob-less git clone, so only the files the page asks for are fetched.
- CDN libraries (jsDelivr, unpkg, esm.sh, cdnjs, Tailwind) are served from the npm registry, so three.js and WebGL scenes render for real.
- Thumbnails are 480×300 WebP files of about 2–8 KB in `thumbs/`. Blank renders are dropped.

**Plain words.** Each page gets two kinds of description:
- **A sentence from its evidence**, for example "A 3D game, played with keys or touch, with sound and voice. It connects to others online. Tended across 15 versions."
- **Its own words** where it has them: the meta description, or the first real paragraph. Instructions, code and placeholders are filtered out.

**Where it shows:**
- **Shed → Juice ("The juice bar")** is a picture grid. Each card has a thumbnail, verdict, title, repository, description, five-bar mark and what is good. "Ledger" switches to the dense list with small thumbnails.
  - Tapping a card opens the **preview**: the live page beside its reading (the sentence, its own words, the marks, Good, Needs, Open, Feature, Find it in the grove).
  - ← and → step through the list, and so does swiping on phones. Esc returns focus to the card.
  - On phones it is two columns, with the filters in one sideways row.
- **Grove card, Inside:** rows carry thumbnails, and the open page's reading adds its picture, sentence and own words. A link leads to the juice bar.
- **Tree sheet, Inside:** rows carry thumbnails and the page's own words.
- **Homepage, the Grove section:** a "From inside the grove" strip with the twelve juiciest pages, one per repository, each with a picture and a description (`juicetop.js`, about 4 KB).

**Refresh:** run `python3 tools/crawl-inside.py`, `python3 tools/assess-pages.py`, `python3 tools/pick-shots.py` and `node tools/shoot-pages.js` (which needs playwright, sharp and semver), then the build.

## Round 26: the employer's path

The question: can someone hiring get the facts in one click, without clicking through a thing to reach a thing?

- **Résumé.** `resume.html` is a printable résumé built only from facts already on the site. `resume.pdf` is generated from it in Chromium: two Letter pages, tagged and accessible.
  - It covers education, selected work, publications and talks, recognition, skills, and earlier work.
  - It has no dates and no employment history, because the site doesn't state them. Add them in `resume.html` and regenerate the PDF.
- **Nav.** About · Work · Grove · Contact · a filled **Résumé PDF** button that links straight to the file. On phones: About · Work · Résumé.
- **About → "At a glance".** Now, Education, Published, Recognition, Builds with, Methods. Below it: Download résumé (PDF) · Résumé on the web · Email · GitHub.
  - "Builds with" lists only what the code in the grove shows: three.js/WebGL (863 pages), Web Audio (1,295), Canvas (1,541), LLM API calls (229), camera and vision (275), shaders (128), speech (122), networking (96), ARIA labelling (1,601).
- **Every work item has a picture.** The pictures are rendered from the pages themselves and stored in `img/work/`; the film engines were photographed while playing. Items with no page to photograph get a typographic tile instead.
  - Each item also carries a type label (Tool, Essay, Film engine, Talk · ELO 2026, Paper · NordiCHI 2024…) with ↗ for external links and → for internal ones.
- **Selected projects, by body of work:** open by default, so no click is needed to see them.
- **Keywords:**
  - title: "Research Engineer and Creative Technologist · Generative Media, HCI, AI Filmmaking";
  - a meta keywords tag, plus skills and methods in the JSON-LD `knowsAbout`;
  - the résumé PDF as `subjectOf`, with its own ProfilePage JSON-LD;
  - the résumé in the sitemap and in llms.txt.

## Round 27: pictures from inside the experience

Many first-pass thumbnails showed a title screen ("THUNDER RIGS · ENTER THE FIELD"), so pages from the same family looked the same. `tools/shoot-pages.js` now steps inside before taking the picture:
1. It presses the largest visible start control ("Enter…", "Start", "Play", "Initialize", "Build", "Continue"…) and waits for the next page if the button navigates.
2. It clicks the stage, presses Enter, and holds ↑/W and →/D for a moment.
3. It keeps the new picture only if the screen actually changed and isn't blank; otherwise it keeps the first screen.
4. The first screen is kept too, as `<key>.menu.webp`, so it can be compared later or left out of any CLIP embedding.

Result: 834 pages re-shot, and 221 of them now show the experience itself (3D scenes, games mid-play, tools with content) instead of the menu. Pages that weren't re-shot keep their first-pass picture.

## Round 28: ideas, and many views of each page

**Ideas.** One idea lives in many repositories and many pages. For example, CINEOSIS spans 205 pages in 14 repositories, and Thunder Rigs 16 pages in 6. `tools/ideas.py` groups pages into ideas in two ways:
- **Known lineages:** CINEOSIS, Thunder Rigs, Fútbolmas, ICARO, Ripples, LEGOS, TRACTOR/WAG…
- **Recurring names:** two-word title phrases that recur across two or more repositories.

Copies are folded together, which leaves 59 ideas.

**Views.** `tools/shoot-views.js` opens the top pages of each idea, plus every top page that still had no picture (325 pages in all), and photographs each page in several states:
1. the first screen;
2. after its start control;
3. after a nudge of the keys and pointer;
4. after each of up to four modes, tabs or menu choices (with destructive and settings controls skipped);
5. scrolled down.

Views that look the same (64-bit difference hash) are folded. Each view keeps the **operation that produced it** and the heading on screen, so a page's views read as an operational description. For example: "Opens on THUNDER RIGS; press “ENTER WORKBENCH” → HELLO; open “WORLD” → WORLD."

**Choosing the best image.** CLIP cannot run here, because the model host is blocked. Instead, a local visual score ranks the views:
- it rewards colour (Hasler–Süsstrunk), structure (edge density), tonal range (entropy), and the share of the screen that is canvas, video or images;
- it penalises screens that are mostly text.

The best view becomes the page's thumbnail. Each idea leads with its most visual page, and no two ideas lead with the same page or a near-identical picture.

**Where it shows:**
- **The juice bar opens on Ideas.** Each card shows the idea's best picture, its page and repository counts, how its best page unfolds, and a strip of four other pages.
- **Opening an idea lists its most visual pages,** each with its views and their operations. Tapping a view opens the preview on that view.
- **The preview** has "Views · how it unfolds": the operation line and the views, one tap each, with a "Live page" button to go back.
- **llms.txt** lists the 25 ideas, each with its best page and how that page unfolds.

**Coverage:** 667 views of 295 pages. Pictured: 97 of the top 100 pages, 287 of the top 300 and 225 of 235 gems. The rest stay dark without a GPU, a video file or a camera.

## Round 29: the real résumé, Nushi, local CLIP, and a way in for large media

- **Résumé from the source.** `resume.html` and `resume.pdf` now follow Watson's own résumé (Research Engineer and Creative Technologist):
  - experience with dates: Georgia Tech, Xsolla (Babka privacy research; Nushi AI artist), Genesis STEAM (patent application US20210241650A1), Ojo Joven / Fulbright;
  - the BA from Sewanee;
  - the four selected works with Demo, Code and Source links;
  - six publications and talks with their records;
  - skills including Python, OpenCLIP, SAM 2.1, OpenCV and FFmpeg; Spanish; LinkedIn.
  The PDF is two Letter pages, tagged.
- **Homepage "At a glance"** gains Experience, the BA, talks and awards, Python and the media-AI tools, and LinkedIn (also in Contact and the JSON-LD `sameAs`). llms.txt gains the same facts.
- **Nushi and VideoChopper** joins the systems list, linking to the VideoChopper video, until its media arrives.
- **CLIP, run locally.** `tools/clip_embed.py` is meant for Watson's own machine, where OpenCLIP already runs for CINEOSIS:
  - it embeds `views/` and `thumbs/`;
  - it scores each picture against a small vocabulary of looks (title screen, menu, 3D scene, film still, dashboard…);
  - it writes `tools/clip.json`.
  When that file is committed, the build:
  - marks down title screens, menus and blank screens when choosing each page's best view;
  - finds six look-alikes per page across the grove, shown in the preview as "Looks like · elsewhere in the grove";
  - makes the look tags searchable.
  Without the file, the build behaves exactly as before.
- **Large media.** `tools/media-intake.sh <project> <files>` turns videos into a poster, three stills and a 6-second silent loop (WebM and MP4, usually under 2 MB), and images into 1600px WebP. The output goes to `media/<project>/` with a manifest. Full-length videos belong on YouTube or Vimeo, linked from the manifest.

## Round 30: Nushi, from the Notion page

After the environment's network was opened to Notion, the public page "AI Temporal Media Pipeline" was read through Notion's API. All 31 of its files were downloaded with signed links: 17 images and 14 videos, 979 MB.

`tools/media-intake.sh nushi` made them web-sized (31 MB) in `media/nushi/`, with a manifest that records the source page. Two choices were made by looking at the footage:
- The hero loop was re-cut from a stretch where the live feed is actually restyled.
- The 36-second camera pass was identified as the source of the nine 4-second sections.

**`nushi.html`** is a case study laid out as the research guide recommends:
- the title and a role/client/date/status/tools block;
- the hero loop of Nushi Vision as streamed;
- what it was, with campaign reach attributed to the creative producer;
- **from camera to screen**: the booth wiring diagram (ATEM switcher, three operators, two screens) and the four handoffs;
- **VideoChopper**: the two problems, the three pipeline diagrams, the method, and the Colab and YouTube links;
- **one clip, end to end**: the driving footage, the source clip, nine sections with their key frames, and the Space Invaders key style;
- what didn't work yet;
- reuse after GDC, with a student remix credited to Vaishali Jain;
- the tools used;
- shared credits.

Videos play only on screen; with reduced motion they wait for a Play button. The two inspiration images (other people's work) are linked, not copied.

The homepage's Nushi item now opens the case study, with a real picture. The case study is also in the sitemap and llms.txt.
