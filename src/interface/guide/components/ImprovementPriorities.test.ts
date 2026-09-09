import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  priorityImpact,
  rankImprovementPriorities,
  type ImprovementPriority,
} from './ImprovementPriorities';

const priority = (
  id: string,
  score: number,
  weight: number,
  performance: QualitativePerformance,
): ImprovementPriority => ({
  id,
  title: id,
  description: id,
  score,
  weight,
  performance,
});

describe('priorityImpact', () => {
  it('is the weight scaled by the distance from a perfect score', () => {
    expect(priorityImpact(priority('a', 0.75, 8, QualitativePerformance.Ok))).toBeCloseTo(2);
  });

  it('clamps the score to the 0 to 1 range', () => {
    expect(priorityImpact(priority('a', -1, 5, QualitativePerformance.Fail))).toBe(5);
    expect(priorityImpact(priority('a', 2, 5, QualitativePerformance.Fail))).toBe(0);
  });
});

describe('rankImprovementPriorities', () => {
  it('drops Good and Perfect priorities', () => {
    const ranked = rankImprovementPriorities([
      priority('good', 0.5, 10, QualitativePerformance.Good),
      priority('perfect', 0, 10, QualitativePerformance.Perfect),
      priority('ok', 0.9, 1, QualitativePerformance.Ok),
    ]);
    expect(ranked.map((p) => p.id)).toEqual(['ok']);
  });

  it('sorts by impact, highest first', () => {
    const ranked = rankImprovementPriorities([
      priority('light', 0, 2, QualitativePerformance.Fail),
      priority('heavy', 0.5, 10, QualitativePerformance.Ok),
      priority('medium', 0.2, 4, QualitativePerformance.Ok),
    ]);
    expect(ranked.map((p) => p.id)).toEqual(['heavy', 'medium', 'light']);
  });

  it('puts the worse rating first when the impact is equal', () => {
    const ranked = rankImprovementPriorities([
      priority('ok', 0.5, 4, QualitativePerformance.Ok),
      priority('fail', 0.5, 4, QualitativePerformance.Fail),
    ]);
    expect(ranked.map((p) => p.id)).toEqual(['fail', 'ok']);
  });

  it('cuts the list at the limit', () => {
    const priorities = Array.from({ length: 7 }, (_, i) =>
      priority(`p${i}`, 0, 7 - i, QualitativePerformance.Fail),
    );
    expect(rankImprovementPriorities(priorities).map((p) => p.id)).toEqual([
      'p0',
      'p1',
      'p2',
      'p3',
    ]);
    expect(rankImprovementPriorities(priorities, 2)).toHaveLength(2);
  });

  it('returns an empty list when nothing needs a fix', () => {
    expect(
      rankImprovementPriorities([priority('a', 1, 10, QualitativePerformance.Perfect)]),
    ).toEqual([]);
  });
});
