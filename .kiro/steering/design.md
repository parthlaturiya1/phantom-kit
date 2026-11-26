---
inclusion: fileMatch
fileMatchPattern: "apps/**"
---

# App design rules

## Pip, the guide ghost

- Pip gives a mild boo, then one arrow to the next tap.
- Pip respects `prefers-reduced-motion`: no movement, the arrow stays.
- The user can switch Pip off. The app must still be usable.

## Errors

- Errors are funny and short.
- Every error shows the cause and one fix button.

## Screens

- One primary action per screen.
- Keyboard works everywhere. Contrast is readable in a dim room.

## Checks

- axe: 0 violations.
- Lighthouse accessibility: 100.
