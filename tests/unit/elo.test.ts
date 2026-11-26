import { describe, expect, it } from "vitest";
import { eloExpected } from "../../packages/kit";

describe("eloExpected", () => {
  it("is 0.5 for equal ratings", () => {
    expect(eloExpected(1000, 1000)).toBe(0.5);
  });
  it("rises with learner rating", () => {
    expect(eloExpected(1200, 1000)).toBeGreaterThan(0.5);
  });
});
