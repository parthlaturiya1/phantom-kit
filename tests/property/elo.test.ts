import fc from "fast-check";
import { describe, it } from "vitest";
import { eloExpected } from "../../packages/kit";

describe("eloExpected properties", () => {
  const rating = fc.integer({ min: 0, max: 3000 });
  it("stays in [0,1] and is symmetric", () => {
    fc.assert(
      fc.property(rating, rating, (a, b) => {
        const p = eloExpected(a, b);
        return p >= 0 && p <= 1 && Math.abs(p + eloExpected(b, a) - 1) < 1e-12;
      }),
    );
  });
});
