/** Probability that a learner of rating `learner` answers an item of rating `item` correctly. */
export function eloExpected(learner: number, item: number): number {
  return 1 / (1 + 10 ** ((item - learner) / 400));
}
