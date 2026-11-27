import type { Scene } from "../scene";

/** True when the user asked the system for less motion. Safe where matchMedia is missing. */
export function prefersReducedMotion(win: { matchMedia?: (q: string) => { matches: boolean } } = globalThis as never): boolean {
  return win.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

/** Automatic rotation speed in radians per second; zero when reduced motion is on. */
export function autoSpin(reduced: boolean, radPerSec = 0.5): number {
  return reduced ? 0 : radPerSec;
}

/** Text for screen readers. Same for every output; the output name says how it is shown. */
export function describeScene(s: Scene, output: "flat" | "window" | "ghost-desk" | "card"): string {
  const how = {
    flat: "Flat view.",
    window: "Window view. Tilt or drag to see depth.",
    "ghost-desk": "Ghost Desk view, four mirrored copies.",
    card: "Printed card.",
  }[output];
  return `${s.title}. ${how} ${s.description}`;
}
