# Design Document

## Overview

`packages/kit` is a pure TypeScript library with no DOM dependency except in `render/`. Spin Lab and Card Forge import it. All state stays on the device. No server, no analytics, no runtime AI, no CDN.

Honest lines: Ghost Desk is a Pepper's ghost illusion, not a true hologram. Learning is Elo-style practice statistics, not AI.

## Architecture

```
scene file --> parse/validate --> Scene
                                   |
     +-----------+-----------------+----------------+
     v           v                 v                v
   flat       window           ghostdesk          card
  (canvas)  (canvas+tilt)   (4 mirrored views)  (print SVG)

Teacher Tap --> Lesson --> end of lesson --> recalibrate --> Item stats
                                                  |
                                       export --> Pack --> merge --> Lineage
```

Modules in `packages/kit/src`:

| Module | Job |
|---|---|
| `scene/` | schema, parse, serialize, validate |
| `render/` | one projection function, four output adapters |
| `lesson/` | Teacher Tap, undo, lesson state |
| `engine/` | learner rating, item difficulty, recalibration, item picking |
| `pack/` | export, pack hash, export id, import check |
| `merge/` | idempotent merge, seen-id set, lineage DAG |
| `errors/` | typed errors with cause and one fix |

## Components and Interfaces

```ts
parseScene(text: string): Result<Scene, SceneError[]>
serializeScene(s: Scene): string
project(s: Scene, view: ViewParams): Projected          // pure, shared by all outputs
renderFlat(p: Projected, ctx: CanvasRenderingContext2D): void
renderWindow(s: Scene, tilt: Tilt | null, ctx): void
renderGhostDesk(s: Scene, angle: number, ctx): void      // four views, one angle
renderCard(s: Scene, angles: number[], paper: "A4" | "Letter"): string  // SVG text

startLesson(state: Stats): Lesson                         // freezes difficulty
tap(l: Lesson, item: ItemId, correct: number, total: number): Result<Lesson, TapError>
undo(l: Lesson): Lesson
endLesson(l: Lesson): Stats                               // the only place difficulty changes

exportPack(s: Stats, rng: () => string): Result<Pack, ExportError>
verifyPack(p: unknown): Result<Pack, PackError>
merge(local: Stats, packs: Pack[], seen: Set<string>): { stats: Stats; seen: Set<string> }
```

Teacher Tap is the only way counts enter a lesson. Learner answers in Spin Lab use `answer(learner, item, correct)`, which updates only the learner rating.

## Data Models

### Scene file (`.phantom.json`)

```ts
type Scene = {
  version: 1;
  id: string;              // item code, 3 to 12 chars, [a-z0-9-]
  title: string;           // max 60 chars
  vertices: [number, number, number][];   // max 2000, each in [-1, 1]
  edges: [number, number][];              // indexes into vertices
  faces?: number[][];
  description: string;     // text for screen readers
  baseDifficulty: number;  // starting rating, default 1000
};
```

Limit: 256 KB. Unknown keys are rejected.

### Stats

```ts
type ItemStat = { item: string; right: number; total: number; difficulty: number };
type Stats = { items: Record<string, ItemStat>; classOffset: number };
```

### Learner and recalibration

- Expected score: `E = 1 / (1 + 10^((difficulty - rating) / 400))`.
- Learner update: `rating += K * (correct - E)`, with `K = 32`, using the frozen difficulty.
- Lesson-end recalibration, once per item with `total > 0`:
  `pRight = (right + a * pPrior) / (total + a)`, with prior weight `a = 10`.
  `difficulty = baseDifficulty - 400 * log10(pRight / (1 - pRight))`, with `pRight` clamped to [0.02, 0.98].
  The change per lesson is capped at 100 points.
- Shortcut: fixed constants, no per-class tuning. Upgrade only if field data shows drift.

### Pack format

```ts
type Pack = {
  version: 1;
  exportId: string;   // 128-bit random, hex
  packHash: string;   // SHA-256 hex of canonical JSON of `items`
  items: { item: string; right: number; total: number }[];  // sorted by item, total >= 5
};
```

No other field is allowed. No names, ages, gender or timestamps. Canonical JSON means sorted keys and no spaces, so the same content gives the same hash. The export id is outside the hash, so two exports of the same content share a hash and differ in id.

### Idempotent merge

- `seen` is a set of export ids kept on the device.
- For each pack in order: reject if the hash does not match; skip if `exportId` is in `seen`; else add `right` and `total` per item and add the id to `seen`.
- Addition is commutative and associative, and the seen-set check makes repeats no-ops. So merging twice equals once, and order does not matter.
- After a merge, difficulty is recomputed from merged counts by the recalibration rule, not applied step by step. This keeps order from mattering.

### Lineage

A hash-linked DAG. Node = `{ id: hash(sortedParents + packHash), parents: string[] (sorted), packHash }`. The same history gives the same node hash.

## The four outputs

| Output | Method | Notes |
|---|---|---|
| Flat | `project` to 2D canvas | drag and arrow keys rotate |
| Window | camera shifts with device tilt | fall back to drag if tilt is missing or refused; no camera use |
| Ghost Desk | four views, rotated 0, 90, 180, 270 degrees, mirrored, on black | text: "Pepper's ghost illusion, best for 2 to 4 learners in a dim room. Not a true hologram." Setup guide with fold steps and the sharp-edge warning |
| Printed card | SVG with fixed angles and item code | black on white, A4 and Letter |

All four call the same `project` function, so they cannot disagree on shape.

## Error Handling

Every error is a typed value `{ code, cause, fix }`. The UI shows the cause and one fix button. Pip says it in under 25 words.

| Error | Cause shown | Fix button |
|---|---|---|
| SceneInvalid | field name and rule | Pick another file |
| SceneTooBig | the limit | Pick another file |
| TiltMissing | no tilt data | Use drag |
| TapOutOfRange | count above class size | Fix the number |
| ExportTooFew | needs N more answers | Keep teaching |
| PackHashMismatch | file was changed | Ask for a new file |
| PackAlreadyMerged | export id seen | Skip it |
| PackMalformed | field not allowed | Pick another file |

Errors never discard the lesson in progress. Lesson state is saved to local storage after each tap.

## Testing Strategy

Unit tests (Vitest):
- Scene schema accepts good files and rejects each bad field.
- Card layout is the same for the same scene.
- Recalibration caps, clamps and pseudo-counts.

Property tests (fast-check), fixed seed, at least 200 runs each:
1. Scene round trip: `parse(serialize(s))` equals `s`.
2. Merge idempotent: merging a pack twice equals merging once.
3. Merge order: any permutation of packs gives the same stats.
4. Pack privacy: no exported key is outside the schema, and no item has total below 5.
5. Pack hash: same content gives the same hash; any changed count changes it.
6. Frozen difficulty: `tap` and `answer` never change any item difficulty.
7. Recalibration bounds: difficulty change is at most 100 and never NaN.
8. Elo: a correct answer never lowers the rating; a wrong one never raises it.
9. Lineage: parents order does not change the node hash.
10. Ghost Desk: the four views keep the same angle offset for any rotation.

Other checks:
- Playwright smoke: a shape and one next tap show within 30 seconds of load.
- axe: 0 violations per screen.
- Network: a test fails if any request happens after load.
- Verify gate: `npm run verify` must stay green.

Not testable in code: how the Ghost Desk looks through a real clear sheet. That needs a hand check with a real sheet.
