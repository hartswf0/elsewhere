# Multiplane cartoons

One hand-drawn shot per page, built the way a classical studio builds a shot, after the house directive in `STUDIO.md`.

- `cartoon.js`: the engine. Planes at depths, a camera (near planes move more, `screen_motion ∝ camera_motion / depth`), rigs (Watson, robot, bird, Nushi, props), lines that boil on twos, and a player with Play, ‹ › (flip drawing to drawing), Onion skin, Planes (pulls the sheets apart), and "How this shot is drawn" (action, beats, keys, exposure sheet, planes, camera reason).
- `shots.js`: the shots. Each is a page's argument as one dramatic action.

## A shot, in the studio's terms

| Studio | In `shots.js` |
|---|---|
| Phase 1, interpret: one sentence of dramatic action | `action` |
| Beats: the minimum readable events | `beats` |
| Layout, multiplane stack | `planes` (`depth`: near < 1 < far; `why` says what each plane is for) |
| Model sheet | the rig and its `base` pose |
| Key drawings, breakdowns | `drawings` named `K01…`, `B01…` |
| Exposure sheet | `seq`: `[drawing, frames, spacing, note]`, at 24 fps, drawn on twos |
| Spacing | `hold`, `snap`, `linear`, `out` (slow-out), `in` (slow-in), `inout`, `overshoot` |
| Camera, and why it moves | `camera` (same format as `seq`) and `cameraWhy` |
| Peak check | `poster`, the frame shown to people who prefer reduced motion |

To add a shot, write the action sentence first, then the keys, and play only the keys (› steps key to key) before adding breakdowns. Put a figure on the page with `<figure class="mp-shot" data-shot="name"></figure>`, followed by `shots.js` and then `cartoon.js`.

People who prefer reduced motion get a still frame (the poster) and play only on request. Every shot has an `alt` description of the whole action.

## Diagram films (`dfilm.js`, `films.js`)

A diagram already on a page can become the film. `<svg data-film="id">` draws itself in, in the order its argument runs: boxes pop, arrows ink along their length, numbers count up, words type, and a small paper slip (the line of dialogue) travels the arrows, with an optional cast from `cartoon.js`. Nothing is added to the diagram's content: cues address the diagram's own elements by index, and the last frame is the original diagram (checked element for element). It plays once when half visible; Play, ‹ › step through its beats, and a subtitle reads the beat from the slide's own text. Reduced motion, print and no-JS show the original diagram. Each is labelled "drawn sequence, not a recorded run". First used on the nine diagrams of the Centaur Box deck.

Image diagrams: `<img data-film="id">` with `w`, `h` and `regions` in the film. A raster cannot be taken apart, so a veil the colour of the page dims it and each region opens a hole, station by station, while the slip follows the signal; the last frame removes the veil. Used for the Nushi booth wiring diagram.

Films so far: the Centaur Box deck (9), After the Scene: LEGOS (4), The Adviser Leaves the Room (6, with no cast or gags given the subject), and the Nushi booth (1). On those pages the separate cartoon gave way to the films. Every cartoon that remains carries the label "Illustration · a drawn cartoon of the idea, not footage of the work."

New figures drawn as films: where a page had no diagram of its own, `tools/films2.py` draws one of the page's argument and its film together (elements are named while drawing, and cues refer to names). `python3 tools/films2.py out.json && python3 tools/install2.py out.json` writes the SVG into each page and the specs into `films.js`. So far: the blueberry test (Ripples), a brick written as a line (LEGO), the image arrives before the movie (Play Freedom), the shield keeps its changes (Operative Ekphrasis), and I · it · we · they (The Pronoun Alibi). Growing Entanglements films its own five figures.
