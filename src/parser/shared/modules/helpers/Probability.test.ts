import { computeProbabilityRange } from './Probability';

describe('computeProbabilityRange', () => {
  it('should throw when there are 0 proc attempts', () => {
    expect(() => computeProbabilityRange(0, 0.1)).toThrowErrorMatchingInlineSnapshot(
      `[Error: cannot compute probability range for proc with 0 attempts]`,
    );
  });

  it('should throw when procProbabilities is an array whose length is not equal to `procAttempts`', () => {
    expect(() => computeProbabilityRange(100, [0.1, 0.2])).toThrowErrorMatchingInlineSnapshot(
      `[Error: You must supply a probability vector with the same length as the number of total tries into Poisson Binomial PMF]`,
    );
  });

  it('should match precomputed values when using a non-array proc chance', () => {
    const PROC_CHANCE = 0.1;
    // fairly forgiving error margin. cba to set up python to get more precise numbers right now
    const ABS_ERROR_MARGIN = 1e-12;
    const CASES: { args: [number, number]; result: number }[] = [
      { args: [0, 100], result: 0.000026561398887587544 },
      { args: [10, 100], result: 0.13186534682448858 },
      { args: [25, 100], result: 0.000008972933719565316 },
    ];

    for (const { args, result } of CASES) {
      const range = computeProbabilityRange(args[1], PROC_CHANCE);
      const actual = range.procProbabilities.find((point) => point.x === args[0])!;
      expect(Math.abs(actual.y - result)).toBeLessThanOrEqual(ABS_ERROR_MARGIN);
    }
  });
  const procChances = (count: number) => {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(i % 2 ? 0.25 : 0.1);
    }

    return result;
  };

  it('should match precomputed values when using an array proc chance', () => {
    // fairly forgiving error margin
    const ABS_ERROR_MARGIN = 1e-12;
    // this test actually doesn't use precomputed external values. it is a consistency test for refactoring work.
    // would be worth revalidating these numbers against scipy at some point

    const CASES: { args: [number, number]; result: number }[] = [
      { args: [0, 100], result: 2.918694512261613e-9 },
      { args: [10, 100], result: 0.013211692412731131 },
      { args: [25, 100], result: 0.014847417043472571 },
    ];

    for (const { args, result } of CASES) {
      const range = computeProbabilityRange(args[1], procChances(args[1]));
      const actual = range.procProbabilities.find((point) => point.x === args[0])!;
      expect(Math.abs(actual.y - result)).toBeLessThanOrEqual(ABS_ERROR_MARGIN);
    }
  });
});
