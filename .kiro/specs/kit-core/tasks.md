# Implementation Plan

- [x] 1. Scene file
  - [x] 1.1 Define the `Scene` type and schema in `packages/kit/src/scene`
    - _Requirements: 1.1, 1.2, 1.4_
  - [x] 1.2 Write `parseScene` and `serializeScene` with named field errors
    - _Requirements: 1.1, 1.3_
  - [x] 1.3 Unit tests for good and bad files, and a property test for the round trip
    - _Requirements: 1.3, 1.4_

- [x] 2. Shared projection and flat output
  - [x] 2.1 Write the pure `project` function
    - _Requirements: 1.5_
  - [x] 2.2 Write `renderFlat` with drag and arrow-key rotation
    - _Requirements: 2.1, 2.2, 12.1_
  - [x] 2.3 Add the screen reader description and reduced-motion handling
    - _Requirements: 12.3, 12.4_

- [ ] 3. Window output
  - [ ] 3.1 Write `renderWindow` with tilt and the drag fallback
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ] 3.2 Unit test the fallback when tilt is missing
    - _Requirements: 3.2_

- [ ] 4. Ghost Desk output
  - [ ] 4.1 Write `renderGhostDesk` with four mirrored views on black
    - _Requirements: 4.1, 4.4_
  - [ ] 4.2 Add the honest-line text and the setup guide with the sharp-edge warning
    - _Requirements: 4.2, 4.3_
  - [ ] 4.3 Add the small-screen check
    - _Requirements: 4.5_
  - [ ] 4.4 Property test that the four views keep the same angle offset
    - _Requirements: 4.4_

- [ ] 5. Printed card output
  - [ ] 5.1 Write `renderCard` as SVG with fixed angles and the item code
    - _Requirements: 5.1, 5.2_
  - [ ] 5.2 Fit A4 and Letter, and test that the output is repeatable
    - _Requirements: 5.3, 5.4_

- [ ] 6. Lesson and Teacher Tap
  - [ ] 6.1 Write `startLesson` that freezes difficulty, and `tap` with range checks
    - _Requirements: 6.1, 6.2, 6.5, 7.2_
  - [ ] 6.2 Add `undo` and save of lesson state after each tap
    - _Requirements: 6.3, 10.3_
  - [ ] 6.3 Check that no name, age, gender or timestamp is stored
    - _Requirements: 6.4_
  - [ ] 6.4 Property test that `tap` never changes item difficulty
    - _Requirements: 6.5, 7.2_

- [ ] 7. Learner model and recalibration
  - [ ] 7.1 Write the Elo-style learner update and item picking
    - _Requirements: 7.1, 7.4_
  - [ ] 7.2 Write `endLesson` with pseudo-counts, clamp and the 100 point cap
    - _Requirements: 7.3_
  - [ ] 7.3 Property tests for Elo direction and recalibration bounds
    - _Requirements: 7.1, 7.3_
  - [ ] 7.4 Check that user-facing text says "practice statistics" and never "AI"
    - _Requirements: 7.5_

- [ ] 8. Pack export
  - [ ] 8.1 Write canonical JSON and the pack hash
    - _Requirements: 8.3, 8.4_
  - [ ] 8.2 Write `exportPack` with the 5-answer rule and the export id
    - _Requirements: 8.1, 8.2, 8.3, 8.5_
  - [ ] 8.3 Property tests for privacy and hash behaviour
    - _Requirements: 8.1, 8.2, 8.4, 11.3_

- [ ] 9. Pack import and merge
  - [ ] 9.1 Write `verifyPack` with hash, version and allowed-field checks
    - _Requirements: 9.1, 9.5_
  - [ ] 9.2 Write `merge` with the seen-id set
    - _Requirements: 9.2, 9.3, 9.4_
  - [ ] 9.3 Write the lineage DAG with sorted parents
    - _Requirements: 9.6_
  - [ ] 9.4 Property tests for idempotence, order and lineage hash
    - _Requirements: 9.3, 9.4, 9.6_

- [ ] 10. Errors and Pip
  - [ ] 10.1 Define the typed errors with cause and one fix
    - _Requirements: 10.1_
  - [ ] 10.2 Write Pip messages under 25 words and test their length
    - _Requirements: 10.2_

- [ ] 11. Privacy and offline checks
  - [ ] 11.1 Add a Playwright test that fails on any network request after load
    - _Requirements: 11.1, 11.2_

- [ ] 12. App wiring and final checks
  - [ ] 12.1 Wire Spin Lab to scene, outputs, learner model and Pip
    - _Requirements: 2.3, 7.1, 7.4_
  - [ ] 12.2 Wire Card Forge to cards, Teacher Tap, export and merge
    - _Requirements: 5.1, 6.1, 8.1, 9.2_
  - [ ] 12.3 Add the 30-second test in Playwright
    - _Requirements: 2.3_
  - [ ] 12.4 Run axe on every screen and fix all violations
    - _Requirements: 12.1, 12.2_
  - [ ] 12.5 Do a hand check of Ghost Desk with a real clear sheet and note the result
    - _Requirements: 4.1, 4.2_
