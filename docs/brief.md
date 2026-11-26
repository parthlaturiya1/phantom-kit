# Phantom Kit brief (public)

**A phone makes a 3D shape float above the desk. A teacher prints the same shape as cards. The kit learns each class's level from the lessons the teacher records.**

## Who it is for

Teachers in schools and tuition centres with no projector and few screens, and learners who find 3D drawings hard.

## What is in the kit

| Part | What it does |
|---|---|
| Scene file | One 3D shape, four outputs: flat view, window view (depth as you move), Ghost Desk, printed card |
| Ghost Desk | A phone flat on the desk under a clear sheet tilted about 45 degrees (or a small pyramid). 2 to 4 learners close by see the shape float, best in a dim room |
| Spin Lab (app) | Practice game for learners: which shape matches? Level adapts after each answer |
| Card Forge (app) | Teacher tool: print cards, Teacher Tap ("how many got it?"), merge class packs |
| Shadow Match (recipe) | A third quiz type built by a Kiro hook from a one-line spec |
| Pip | The guide ghost: a mild boo, then one arrow to the next tap. Funny errors that always show the cause and one fix button |

## Honest lines

- Ghost Desk is a Pepper's ghost illusion, not a true hologram. A study of pyramid pseudo-holograms in primary schools found more fun and motivation, not more learning. We use it as a shared display and a hook.
- The kit learns with Elo-style practice statistics (as in Math Garden, Klinkenberg et al. 2011). It is statistics, not AI. Kiro's AI is used only while building.
- It learns from each lesson the teacher records and each pack the teacher shares. Difficulty is frozen during a lesson and updated at the end.
- Related tools: Plickers (paper answer cards), pyramid hologram videos, Math Garden. We did not find one that combines a shared floating display, printed cards and class packs that update with no server.

## Privacy

Data stays on the device. Exports hold counts per item only: no names, ages, gender or timestamps. No item is exported with fewer than 5 answers. Each export has a unique id and a pack hash; a file merged twice is counted once. No faces of minors on film; hands and cards only.

## Safety

Clear sheets and pyramids can have sharp edges: adults cut and fold them.
