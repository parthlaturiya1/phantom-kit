import fc from "fast-check";
import { describe, it } from "vitest";
import { ghostLayout } from "../../packages/kit";

const TAU = 2 * Math.PI;
const mod = (a: number) => ((a % TAU) + TAU) % TAU;

describe("ghost desk properties", () => {
  it("the four views keep the same angle offset for any rotation", () => {
    fc.assert(
      fc.property(fc.double({ min: -1000, max: 1000, noNaN: true }), (angle) => {
        const v = ghostLayout(angle);
        return v.every((q, k) => {
          const next = v[(k + 1) % 4];
          return Math.abs(mod(next.yaw - q.yaw) - Math.PI / 2) < 1e-6 && Math.abs(mod(next.rotation - q.rotation) - Math.PI / 2) < 1e-9;
        });
      }),
      { seed: 20261127, numRuns: 300 },
    );
  });
});
