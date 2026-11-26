---
inclusion: fileMatch
fileMatchPattern: "recipes/**"
---

# Recipes

A recipe is a small quiz type built from a one-line `spec.md`, using only the kit's public API (`packages/kit`). No deep imports.

## Steps

1. Write `recipes/<name>/spec.md`: one line saying what the learner sees and what counts as correct.
2. Create `recipes/<name>/` with an `index.ts` that exports the recipe using the public API.
3. Add tests in `recipes/<name>/` (unit, plus one fast-check property).
4. Add one ledger line for the recipe run.

## Public API

Every API below is PLANNED. None is built yet. Do not invent others.

- `loadScene(file)`: PLANNED
- `render(scene, output)`: PLANNED, outputs are flat, window, ghost-desk, card
- `makeItem(scene, answer)`: PLANNED
- `recordAnswer(lesson, item, correct)`: PLANNED

## Worked example: Shadow Match

Spec (one line): "Show a 3D shape; the learner picks which of three flat shadows it casts."

- Scene: one shape from the scene file.
- Item: `makeItem(scene, shadowId)`, with two wrong shadows as distractors.
- Answer: `recordAnswer(lesson, item, picked === shadowId)`.
- Output: the flat view for the choices; any of the four outputs for the shape. (PLANNED)
