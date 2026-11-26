# Requirements Document

## Introduction

The kit core is the shared engine in `packages/kit`. It holds one scene file that renders four outputs (flat, window, Ghost Desk, printed card), the Teacher Tap input, the Elo-style learner and item model, and the pack format with idempotent merge. Spin Lab and Card Forge are thin apps on top of it.

Honest lines that apply to every requirement:

- Ghost Desk is a Pepper's ghost illusion for 2 to 4 learners in a dim room. It is not a true hologram.
- Learning is Elo-style practice statistics. It is not AI. Kiro's AI is used only while building.
- Everything runs in the browser. No server, no analytics, no runtime AI, no CDN.

## Requirements

### Requirement 1: Scene file

**User Story:** As a teacher, I want one file to describe one 3D shape, so that the same shape appears in every output.

#### Acceptance Criteria

1. WHEN a scene file is loaded THEN the system SHALL validate it against the scene schema and report each invalid field by name.
2. WHEN a scene file has a version the system does not know THEN the system SHALL reject it and name the version it supports.
3. WHEN a valid scene is serialized and parsed again THEN the system SHALL return a scene equal to the original.
4. IF a scene file is larger than 256 KB or has more than 2,000 vertices THEN the system SHALL reject it with a message that states the limit.
5. WHEN a scene is loaded THEN the system SHALL derive every output from that one scene and SHALL NOT keep a second copy of the shape.

### Requirement 2: Flat output

**User Story:** As a learner, I want a plain 2D view of the shape, so that I can see it on any screen.

#### Acceptance Criteria

1. WHEN a scene is shown in flat view THEN the system SHALL draw it as a fixed-angle projection on a 2D canvas.
2. WHEN the user drags or presses an arrow key THEN the system SHALL rotate the shape in flat view.
3. WHEN a teacher opens the kit for the first time THEN the system SHALL show a shape and one visible next tap within 30 seconds.

### Requirement 3: Window output

**User Story:** As a learner, I want depth to change as I move, so that the shape feels solid.

#### Acceptance Criteria

1. WHEN the device reports tilt and the user allows it THEN the system SHALL shift the camera with the tilt to give depth.
2. IF tilt data is not available or permission is refused THEN the system SHALL fall back to drag control and say so in one line.
3. WHEN the window view is on THEN the system SHALL NOT use the camera or send any image off the device.

### Requirement 4: Ghost Desk output

**User Story:** As a teacher with no projector, I want a phone laid flat under a tilted clear sheet to show the shape to 2 to 4 learners, so that a small group shares one display.

#### Acceptance Criteria

1. WHEN Ghost Desk is chosen THEN the system SHALL draw the shape as four mirrored views on a black background, laid out for a clear sheet tilted about 45 degrees or a small pyramid.
2. WHEN Ghost Desk is chosen THEN the system SHALL show the text "Pepper's ghost illusion, best for 2 to 4 learners in a dim room. Not a true hologram."
3. WHEN the user turns on the setup guide THEN the system SHALL show the sheet size and fold steps and the warning that adults cut and fold clear sheets.
4. WHEN the shape rotates in Ghost Desk THEN the four views SHALL stay at the same angle relative to each other.
5. IF the screen is smaller than the minimum size for the layout THEN the system SHALL tell the user to use a larger phone or the flat view.

### Requirement 5: Printed card output

**User Story:** As a teacher, I want to print the same shape on cards, so that I can teach without a screen.

#### Acceptance Criteria

1. WHEN a teacher asks for cards THEN the system SHALL produce a print layout with the shape from a set of fixed angles, using black lines on white with no colour needed.
2. WHEN the card is printed THEN the system SHALL put a short item code on the card that matches the item in the scene.
3. WHEN the card layout is made from the same scene twice THEN the system SHALL give an identical result.
4. WHEN the print layout is shown THEN the system SHALL fit A4 and US Letter without cutting the shape.

### Requirement 6: Teacher Tap

**User Story:** As a teacher, I want to tap how many learners got an item right, so that I can record a lesson without names or devices for each learner.

#### Acceptance Criteria

1. WHEN a teacher records a lesson THEN the system SHALL ask "how many got it?" with a number from 0 to the class size, and SHALL store a correct count and a total count for the item.
2. IF the correct count is more than the class size or below 0 THEN the system SHALL reject the tap and keep the earlier value.
3. WHEN the teacher taps by mistake THEN the system SHALL offer one undo for the last tap.
4. WHEN a lesson is running THEN the system SHALL store no name, age, gender or timestamp.
5. WHEN a tap is recorded THEN the system SHALL NOT change item difficulty until the lesson ends.

### Requirement 7: Learner model and lesson-end recalibration

**User Story:** As a learner, I want the next question to match my level, so that practice is not too easy or too hard.

#### Acceptance Criteria

1. WHEN a learner answers an item THEN the system SHALL update that learner's rating with an Elo-style rule using the frozen item difficulty.
2. WHILE a lesson is running THE system SHALL keep every item difficulty at its value from the start of the lesson.
3. WHEN a lesson ends THEN the system SHALL recalibrate item difficulty once from the recorded counts, using pseudo-counts so a small class cannot swing difficulty past a set limit.
4. WHEN the next question is chosen THEN the system SHALL prefer an item whose difficulty is near the learner's rating.
5. WHEN the kit describes this model to a user THEN the system SHALL call it "practice statistics" and SHALL NOT call it AI.

### Requirement 8: Pack format and export

**User Story:** As a teacher, I want to share what my class learned as a small file, so that another class can start from it without a server.

#### Acceptance Criteria

1. WHEN a teacher exports a pack THEN the system SHALL write counts per item only, with no name, age, gender or timestamp.
2. WHEN an item has fewer than 5 answers THEN the system SHALL leave it out of the export.
3. WHEN a pack is exported THEN the system SHALL add a pack hash of its content and a unique export id.
4. WHEN the same content is exported twice THEN the two files SHALL have the same pack hash and different export ids.
5. IF no item has 5 answers THEN the system SHALL refuse to export and say how many more answers are needed.

### Requirement 9: Idempotent merge

**User Story:** As a teacher, I want to import packs from other classes safely, so that a file opened twice does not count twice.

#### Acceptance Criteria

1. WHEN a pack is imported THEN the system SHALL check the pack hash against the content and reject the file if they differ.
2. WHEN a pack with an export id already seen is imported THEN the system SHALL skip it and say it was already merged.
3. WHEN the same file is merged twice THEN the result SHALL equal the result of merging it once.
4. WHEN several packs are merged in any order THEN the result SHALL be the same.
5. IF a pack is malformed, has an unknown version or holds a field outside the allowed list THEN the system SHALL reject it and leave local data unchanged.
6. WHEN a merge finishes THEN the system SHALL record a lineage node whose parents are sorted, so the same history gives the same hash.

### Requirement 10: Errors and Pip

**User Story:** As a teacher, I want errors that say what went wrong and what to do, so that I can fix them in front of a class.

#### Acceptance Criteria

1. WHEN any user-visible error happens THEN the system SHALL show the cause and one fix button.
2. WHEN Pip shows an error THEN the message SHALL stay under 25 words.
3. WHEN an error happens THEN the system SHALL NOT lose the lesson in progress.

### Requirement 11: Privacy and offline

**User Story:** As a school, I want data to stay on the device, so that no learner information leaves the room.

#### Acceptance Criteria

1. WHEN the kit runs THEN the system SHALL make no network request after the first page load.
2. WHEN data is stored THEN the system SHALL store it only on the device.
3. WHEN a file is exported THEN the system SHALL NOT include any field not listed in the pack schema.

### Requirement 12: Access and quality

**User Story:** As a teacher, I want the kit to work with a keyboard, small phones and low vision, so that every learner can take part.

#### Acceptance Criteria

1. WHEN a user works with a keyboard THEN every control SHALL be reachable and visibly focused.
2. WHEN the axe check runs on each screen THEN it SHALL report 0 violations.
3. IF the user prefers reduced motion THEN the system SHALL stop automatic rotation.
4. WHEN a shape is shown THEN the system SHALL give a text description for screen readers.
