# Gate 0 build: spec tasks 1 to 5

Date: 2026-11-27. Branch main, not pushed.

## Tasks done (all ticked in `.kiro/specs/kit-core/tasks.md`)

| Task | What | Where |
|---|---|---|
| 1 Scene file | `Scene` type, `parseScene` (named field errors, version, 256 KB and 2000 vertex limits), `serializeScene`, 4 built-in shapes | `packages/kit/src/scene/` |
| 2 Shared projection + flat | pure `project`, `renderFlat`, drag and arrow keys, reduced motion, screen reader text | `packages/kit/src/render/project.ts`, `flat.ts`, `a11y.ts` |
| 3 Window | `renderWindow`, tilt camera, drag fallback with one line | `render/window.ts` |
| 4 Ghost Desk | four mirrored views on black, honest line, setup guide with sharp-edge warning, small-screen check | `render/ghostdesk.ts` |
| 5 Printed card | `renderCard` SVG, fixed angles, item code, A4 and Letter, repeatable | `render/card.ts` |

Demo page: `apps/spinlab/src/main.tsx` (one page, four shape buttons, four output buttons, Print card button).

The four shapes (front view / top view):

| id | Front | Top |
|---|---|---|
| l-block | letter L | long rectangle |
| pyramid | triangle | square with an X |
| tri-prism | tall rectangle | triangle |
| log | eight-sided shape | rectangle |

A unit test checks that front and top differ for every shape.

## Test counts (from the last `npm.cmd run verify`)

| Kind | Count | Of which new |
|---|---|---|
| Unit (Vitest) | 33 tests, 5 files | 25 (scene 6, render 8, outputs 11) |
| Property (fast-check, seed 20261127, 300 runs each) | 3 tests | 2 (scene round trip, Ghost Desk equal angle offset) |
| e2e (Playwright, Chromium) | 4 tests | 3 (demo, Ghost Desk, A4 print) |
| axe | 0 violations on 5 screens (start page, Flat, Window, Ghost Desk, Card) | |

## Verify

`npm.cmd run verify`: all 9 steps passed (typecheck, lint, unit, property, build, e2e, secret scan, gitignore, provenance).

## Commits (author Parth Radheshyam Laturiya, not pushed)

- 260b6e6 S1-5: scene file, parse and serialize, 4 built-in shapes, tests
- 3223f5a S1-5: shared projection, flat output, reduced motion and description
- f40412b S1-5: window, Ghost Desk and printed card outputs with tests
- 0e5bf8b S1-5: Spin Lab demo page with four outputs and e2e tests
- this file: committed last as "S1-5: gate 0 build report" (see `git log -1`)

## How to open the demo

```
cd C:\Users\HP\.kiro\crew\workspace\phantom-kit
npm.cmd run build
npx.cmd vite preview apps/spinlab --port 4173
```

Open http://localhost:4173. To open it on a phone, add `--host` and use the PC address shown (same Wi-Fi). Tilt on iPhone asks for permission when you press Window.

## Ghost Desk group test for tomorrow (Sat Nov 28)

Pass = at least 4 of 5 people answer correctly on at least 3 of the 4 shapes.

1. Prepare. Use the biggest screen you have (a tablet beats a phone). Brightness to the maximum. Dim the room to normal room light (do not make it dark). Open the demo, press Ghost Desk, lay the device flat on a desk.
2. Make the pyramid. Measure one side of the dashed corner square on the screen (call it B). Cut 4 trapezoids from a clear sheet: bottom edge B, top edge B divided by 6, height B times 0.6. An adult cuts, because the edges are sharp. Tape them edge to edge into a pyramid with no top.
   If you have no pyramid: lean one clear sheet at about 45 degrees on the screen, fold a 2 cm strip at the bottom as a foot, and look through it from the bottom side only. Then only the bottom view is seen; say so in the notes.
3. Place it. Stand the pyramid, wide end down, inside the dashed corners. Fold or tilt so each face leans at about 45 degrees.
4. Seat 5 people about 1 m away, around the desk, at eye height with the pyramid. No film of children's faces (hands and cards only).
5. For each of the 4 shapes (press the shape button), ask each person two questions, separately and quietly: "What does it look like from the front?" and "What does it look like from the top?" Show them the 4 answers on a printed card (press Card, print) to choose from. Write one tick or cross per person.
6. Count. For each shape, count the people who got both answers right. A shape passes with 4 or more of 5. The test passes if 3 of 4 shapes pass. Write the result and a photo of the setup (no faces) in the notes.

## NOT VERIFIED

- Ghost Desk through a real clear sheet. Nobody has looked at it through a sheet yet. The mirror direction (shape top pointing away from the centre) is worked out on paper and may need flipping. If images look upside down, change `ctx.scale(1, -1)` in `render/ghostdesk.ts`.
- Pyramid size guide (top = B / 6, height = B x 0.6) is worked out by geometry, not tested with a sheet.
- Size at 1 m: the four views are each a quarter of the screen width. On a phone that is about 1.5 to 2 cm. They may be too small to read. A tablet is better.
- Window output with real device tilt (only the drag fallback was run, in a desktop browser). iPhone permission was not tried.
- Printing on a real printer and on US Letter. Print was tested as a PDF in Chromium: one A4 page, 210 mm wide. Letter fit is tested by numbers only.
- Browsers other than Chromium. Phone sizes. Lighthouse.
- Requirement 3.3 (no camera) holds because no camera code exists; there is no test for it.
- Tasks 6 to 12 are not started.
