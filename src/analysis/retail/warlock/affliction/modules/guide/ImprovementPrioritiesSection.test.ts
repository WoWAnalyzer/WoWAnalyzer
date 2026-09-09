import TALENTS from 'common/TALENTS/warlock';
import type { Talent } from 'common/TALENTS/types';
import type { Info } from 'parser/core/metric';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { rankImprovementPriorities } from 'interface/guide/components/ImprovementPriorities';
import {
  buildAfflictionPriorities,
  type AfflictionPriorityInputs,
} from './ImprovementPrioritiesSection';

const MINUTE = 60000;

const ALL_TALENTS = [
  TALENTS.UNSTABLE_AFFLICTION_TALENT,
  TALENTS.HAUNT_TALENT,
  TALENTS.SUMMON_DARKGLARE_TALENT,
  TALENTS.DARK_HARVEST_TALENT,
  TALENTS.NIGHTFALL_TALENT,
];

const infoWith = (talents: Talent[]): Info =>
  ({
    fightDuration: 5 * MINUTE,
    fightStart: 0,
    combatant: { hasTalent: (talent: Talent) => talents.includes(talent) },
  }) as unknown as Info;

const uptime = (value: number, performance: QualitativePerformance, active = true) =>
  ({ active, uptime: value, DowntimePerformance: performance }) as never;

const castEfficiencyWith = (efficiencyBySpellId: Record<number, number>) =>
  ({
    getCastEfficiencyForSpell: (spell: { id: number }) => ({
      casts: 2,
      maxCasts: 3,
      efficiency: efficiencyBySpellId[spell.id],
      recommendedEfficiency: 0.9,
      averageIssueEfficiency: 0.85,
      majorIssueEfficiency: 0.75,
      gotMaxCasts: false,
    }),
  }) as never;

/** A player with room to improve on most checks. Analyzers are active only with their talent. */
const inputs = (talents = ALL_TALENTS): AfflictionPriorityInputs => {
  const has = (talent: Talent) => talents.includes(talent);
  return {
    info: infoWith(talents),
    castEfficiency: castEfficiencyWith({
      [TALENTS.SUMMON_DARKGLARE_TALENT.id]: 0.8,
      [TALENTS.DARK_HARVEST_TALENT.id]: 0.95,
    }),
    alwaysBeCasting: { downtimePercentage: 0.18, activeTimePercentage: 0.82 } as never,
    cancelledCasts: {
      castsCancelled: 12,
      totalCasts: 200,
      canceled: 0.06,
      cancelledPerformance: QualitativePerformance.Ok,
    } as never,
    agony: uptime(0.88, QualitativePerformance.Ok),
    corruption: uptime(0.97, QualitativePerformance.Good),
    unstableAffliction: uptime(0.62, QualitativePerformance.Fail),
    haunt: uptime(0.8, QualitativePerformance.Fail, has(TALENTS.HAUNT_TALENT)),
    darkglare: {
      active: has(TALENTS.SUMMON_DARKGLARE_TALENT),
      casts: [
        { timestamp: 0, dotCount: 2 },
        { timestamp: 1, dotCount: 3 },
      ],
    } as never,
    darkHarvest: {
      active: has(TALENTS.DARK_HARVEST_TALENT),
      casts: [
        { hits: [] },
        { hits: [{ hadAgony: true, hadCorruption: true, hadUA: true }] },
        { hits: [{ hadAgony: false, hadCorruption: false, hadUA: true }] },
      ],
    } as never,
    nightfall: { active: has(TALENTS.NIGHTFALL_TALENT), wastedProcs: 4 } as never,
    soulShards: { wasted: 3 } as never,
  };
};

describe('buildAfflictionPriorities', () => {
  it('builds one priority for each check that applies to the talents', () => {
    const ids = buildAfflictionPriorities(inputs()).map((p) => p.id);
    expect(ids).toEqual([
      'active-time',
      'cancelled-casts',
      'agony-uptime',
      'corruption-uptime',
      'unstable-affliction-uptime',
      'haunt-uptime',
      `cast-efficiency-${TALENTS.SUMMON_DARKGLARE_TALENT.id}`,
      'darkglare-dots',
      `cast-efficiency-${TALENTS.DARK_HARVEST_TALENT.id}`,
      'dark-harvest-coverage',
      'soul-shard-waste',
      'nightfall',
    ]);
  });

  it('skips the checks for talents the player does not have', () => {
    const ids = buildAfflictionPriorities(inputs([])).map((p) => p.id);
    expect(ids).toEqual([
      'active-time',
      'cancelled-casts',
      'agony-uptime',
      'corruption-uptime',
      'soul-shard-waste',
    ]);
  });

  it('ranks downtime, then the weak DoTs, then Dark Harvest coverage', () => {
    const ranked = rankImprovementPriorities(buildAfflictionPriorities(inputs()));
    expect(ranked.map((p) => p.id)).toEqual([
      'active-time',
      'unstable-affliction-uptime',
      'agony-uptime',
      'dark-harvest-coverage',
    ]);
  });

  it('rates Dark Harvest coverage from the per-cast ratings', () => {
    const coverage = buildAfflictionPriorities(inputs()).find(
      (p) => p.id === 'dark-harvest-coverage',
    );
    expect(coverage?.score).toBeCloseTo(1 / 3);
    expect(coverage?.performance).toBe(QualitativePerformance.Fail);
  });
});
