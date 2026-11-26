---
inclusion: fileMatch
fileMatchPattern: "packages/kit/engine/**"
---

# Engine rules

## Learner model

- Each learner has an Elo-style rating. After each answer, update it from the answer and the item difficulty.
- Item difficulty is frozen during a lesson. Learner updates use the frozen value.

## Recalibration

- At lesson end, recalibrate item difficulty from the recorded answers.
- Use a class offset or pseudo-counts so small classes do not swing difficulty.
- Never recalibrate mid-lesson.

## Pack format

- A pack holds counts per item only. No names, ages, gender or timestamps.
- Drop any item with fewer than 5 answers at export.
- A pack has a pack hash (of its content) and a unique export id.

## Merge

- Merge is idempotent. If an export id was already seen, skip it.
- Merging the same file twice gives the same result as merging once.
- Merge order must not change the result.

## Lineage

- Lineage is a hash-linked DAG.
- Each node lists its parents sorted, so the same history gives the same hash.
