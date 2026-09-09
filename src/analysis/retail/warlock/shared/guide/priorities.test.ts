import SPELLS from 'common/SPELLS';
import type CastEfficiency from 'parser/shared/modules/CastEfficiency';
import type AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import type ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  activeTimePriority,
  castEfficiencyPriority,
  linearScore,
  performanceForHigherIsBetter,
  performanceForLowerIsBetter,
  soulShardWastePriority,
} from './priorities';

const MINUTE = 60000;

const castEfficiencyWith = (data: Record<string, unknown> | null) =>
  ({ getCastEfficiencyForSpell: () => data }) as unknown as CastEfficiency;

const efficiencyData = (efficiency: number | null, casts = 7, maxCasts = 8) => ({
  casts,
  maxCasts,
  efficiency,
  recommendedEfficiency: 0.9,
  averageIssueEfficiency: 0.85,
  majorIssueEfficiency: 0.75,
  gotMaxCasts: casts === maxCasts,
});

describe('linearScore', () => {
  it('is 1 at best and 0 at worst, in either direction', () => {
    expect(linearScore(0, 0, 0.3)).toBe(1);
    expect(linearScore(0.3, 0, 0.3)).toBe(0);
    expect(linearScore(0.15, 0, 0.3)).toBeCloseTo(0.5);
    expect(linearScore(1, 1, 0.6)).toBe(1);
    expect(linearScore(0.8, 1, 0.6)).toBeCloseTo(0.5);
  });

  it('clamps outside the range', () => {
    expect(linearScore(0.9, 0, 0.3)).toBe(0);
    expect(linearScore(-1, 0, 0.3)).toBe(1);
  });

  it('handles best equal to worst', () => {
    expect(linearScore(2, 2, 2)).toBe(1);
    expect(linearScore(3, 2, 2)).toBe(0);
  });
});

describe('performance thresholds', () => {
  it('rates lower-is-better values', () => {
    const thresholds = { perfect: 0.02, good: 0.1, ok: 0.2 };
    expect(performanceForLowerIsBetter(0.01, thresholds)).toBe(QualitativePerformance.Perfect);
    expect(performanceForLowerIsBetter(0.1, thresholds)).toBe(QualitativePerformance.Good);
    expect(performanceForLowerIsBetter(0.15, thresholds)).toBe(QualitativePerformance.Ok);
    expect(performanceForLowerIsBetter(0.21, thresholds)).toBe(QualitativePerformance.Fail);
  });

  it('rates higher-is-better values and skips Perfect without a threshold', () => {
    const thresholds = { good: 0.95, ok: 0.85 };
    expect(performanceForHigherIsBetter(1, thresholds)).toBe(QualitativePerformance.Good);
    expect(performanceForHigherIsBetter(0.9, thresholds)).toBe(QualitativePerformance.Ok);
    expect(performanceForHigherIsBetter(0.5, thresholds)).toBe(QualitativePerformance.Fail);
  });
});

describe('castEfficiencyPriority', () => {
  const build = (data: Record<string, unknown> | null) =>
    castEfficiencyPriority({
      castEfficiency: castEfficiencyWith(data),
      spell: SPELLS.SUMMON_DEMONIC_TYRANT,
      weight: 9,
    });

  it('returns null without cast efficiency data', () => {
    expect(build(null)).toBeNull();
    expect(build(efficiencyData(null))).toBeNull();
    expect(
      castEfficiencyPriority({
        castEfficiency: undefined,
        spell: SPELLS.SUMMON_DEMONIC_TYRANT,
        weight: 9,
      }),
    ).toBeNull();
  });

  it('maps efficiency onto the spell thresholds', () => {
    expect(build(efficiencyData(0.7, 8, 8))?.performance).toBe(QualitativePerformance.Perfect);
    expect(build(efficiencyData(0.99))?.performance).toBe(QualitativePerformance.Perfect);
    expect(build(efficiencyData(0.92))?.performance).toBe(QualitativePerformance.Good);
    expect(build(efficiencyData(0.8))?.performance).toBe(QualitativePerformance.Ok);
    expect(build(efficiencyData(0.7))?.performance).toBe(QualitativePerformance.Fail);
  });

  it('uses the efficiency as the score and the spell id in the key', () => {
    const priority = build(efficiencyData(0.8));
    expect(priority?.score).toBe(0.8);
    expect(priority?.weight).toBe(9);
    expect(priority?.id).toBe(`cast-efficiency-${SPELLS.SUMMON_DEMONIC_TYRANT.id}`);
  });
});

describe('activeTimePriority', () => {
  const build = (downtime: number) =>
    activeTimePriority({
      alwaysBeCasting: {
        downtimePercentage: downtime,
        activeTimePercentage: 1 - downtime,
      } as unknown as AlwaysBeCasting,
      fightDuration: 5 * MINUTE,
      weight: 10,
      thresholds: { perfect: 0.02, good: 0.1, ok: 0.2 },
      worst: 0.3,
      movementTips: 'tips',
    });

  it('returns null without the analyzer', () => {
    expect(
      activeTimePriority({
        alwaysBeCasting: undefined,
        fightDuration: MINUTE,
        weight: 10,
        thresholds: { good: 0.1, ok: 0.2 },
        worst: 0.3,
        movementTips: 'tips',
      }),
    ).toBeNull();
  });

  it('rates downtime against the thresholds and scores it linearly', () => {
    expect(build(0.05)?.performance).toBe(QualitativePerformance.Good);
    expect(build(0.188)?.performance).toBe(QualitativePerformance.Ok);
    expect(build(0.25)?.performance).toBe(QualitativePerformance.Fail);
    expect(build(0.15)?.score).toBeCloseTo(0.5);
  });
});

describe('soulShardWastePriority', () => {
  const build = (wasted: number, minutes: number) =>
    soulShardWastePriority({
      tracker: { wasted } as unknown as ResourceTracker,
      fightDuration: minutes * MINUTE,
      weight: 5,
      spender: SPELLS.HAND_OF_GULDAN_CAST,
      shardsPerCast: 3,
    });

  it('returns null without a tracker or a fight', () => {
    expect(
      soulShardWastePriority({
        tracker: undefined,
        fightDuration: MINUTE,
        weight: 5,
        spender: SPELLS.HAND_OF_GULDAN_CAST,
        shardsPerCast: 3,
      }),
    ).toBeNull();
    expect(build(3, 0)).toBeNull();
  });

  it('is Perfect with no waste and rates waste per minute', () => {
    expect(build(0, 5)?.performance).toBe(QualitativePerformance.Perfect);
    expect(build(2, 5)?.performance).toBe(QualitativePerformance.Good);
    expect(build(9, 7)?.performance).toBe(QualitativePerformance.Ok);
    expect(build(20, 5)?.performance).toBe(QualitativePerformance.Fail);
  });

  it('scores waste per minute linearly down to 0 at 10 shards per 3 minutes', () => {
    expect(build(0, 5)?.score).toBe(1);
    expect(build(10, 3)?.score).toBe(0);
    expect(build(5, 3)?.score).toBeCloseTo(0.5);
  });
});
