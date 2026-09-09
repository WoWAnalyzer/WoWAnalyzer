import type { ReactNode } from 'react';
import type Spell from 'common/SPELLS/Spell';
import { formatDuration, formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import type { ImprovementPriority } from 'interface/guide/components/ImprovementPriorities';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import type CastEfficiency from 'parser/shared/modules/CastEfficiency';
import type AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import type ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

/**
 * Building blocks for the "What to Focus On" section of the Warlock specs.
 * Each helper turns the data of one analyzer into an {@link ImprovementPriority}. It returns
 * null when the check does not apply. The spec decides the weight and the wording.
 */

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/** Linear score from 0 to 1. It is 1 at `best` and 0 at `worst`, in either direction. */
export function linearScore(actual: number, best: number, worst: number): number {
  if (best === worst) {
    return actual === best ? 1 : 0;
  }
  return clamp01((actual - worst) / (best - worst));
}

export interface PerformanceThresholds {
  /** Values on the good side of this value (inclusive) are Perfect. Optional. */
  perfect?: number;
  /** Values on the good side of this value (inclusive) are Good. */
  good: number;
  /** Values on the good side of this value (inclusive) are Ok. All other values are Fail. */
  ok: number;
}

/** Rates a value where lower is better, such as downtime or waste per minute. */
export function performanceForLowerIsBetter(
  actual: number,
  { perfect, good, ok }: PerformanceThresholds,
): QualitativePerformance {
  if (perfect !== undefined && actual <= perfect) {
    return QualitativePerformance.Perfect;
  }
  if (actual <= good) {
    return QualitativePerformance.Good;
  }
  if (actual <= ok) {
    return QualitativePerformance.Ok;
  }
  return QualitativePerformance.Fail;
}

/** Rates a value where higher is better, such as uptime or efficiency. */
export function performanceForHigherIsBetter(
  actual: number,
  { perfect, good, ok }: PerformanceThresholds,
): QualitativePerformance {
  if (perfect !== undefined && actual >= perfect) {
    return QualitativePerformance.Perfect;
  }
  if (actual >= good) {
    return QualitativePerformance.Good;
  }
  if (actual >= ok) {
    return QualitativePerformance.Ok;
  }
  return QualitativePerformance.Fail;
}

export const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
  count === 1 ? singular : pluralForm;

interface CastEfficiencyPriorityOptions {
  castEfficiency: CastEfficiency | undefined;
  spell: Spell;
  weight: number;
  /** One or two short sentences on why the cooldown matters, or when it is fine to hold it. */
  why?: ReactNode;
  id?: string;
}

/**
 * Priority for a cooldown that the player must use close to on-cooldown. It uses the
 * thresholds the spec set for the spell in its `Abilities` list, so it agrees with the
 * Cast Efficiency panel.
 */
export function castEfficiencyPriority({
  castEfficiency,
  spell,
  weight,
  why,
  id,
}: CastEfficiencyPriorityOptions): ImprovementPriority | null {
  const data = castEfficiency?.getCastEfficiencyForSpell(spell);
  if (!data || data.efficiency === null) {
    return null;
  }
  const { casts, maxCasts, recommendedEfficiency, majorIssueEfficiency, gotMaxCasts } = data;
  const efficiency = clamp01(data.efficiency);

  let performance: QualitativePerformance;
  if (gotMaxCasts || efficiency >= 0.98) {
    performance = QualitativePerformance.Perfect;
  } else if (efficiency >= recommendedEfficiency) {
    performance = QualitativePerformance.Good;
  } else if (efficiency >= majorIssueEfficiency) {
    performance = QualitativePerformance.Ok;
  } else {
    performance = QualitativePerformance.Fail;
  }

  const missed = Math.max(0, maxCasts - casts);
  const title =
    casts === 0 ? (
      <>
        Use <SpellLink spell={spell} />
      </>
    ) : (
      <>
        Cast <SpellLink spell={spell} /> closer to cooldown
      </>
    );

  return {
    id: id ?? `cast-efficiency-${spell.id}`,
    title,
    description: (
      <>
        {casts === 0 ? (
          <>
            You never cast it. This fight had time for {maxCasts} {plural(maxCasts, 'cast')}.
          </>
        ) : (
          <>
            You cast it {casts} {plural(casts, 'time')}. This fight had time for {maxCasts}{' '}
            {plural(maxCasts, 'cast')} ({formatPercentage(efficiency, 0)}% efficiency). That is{' '}
            {missed} missed {plural(missed, 'cast')}.
          </>
        )}
        {why && <> {why}</>}
      </>
    ),
    score: efficiency,
    weight,
    performance,
  };
}

interface ActiveTimePriorityOptions {
  alwaysBeCasting: AlwaysBeCasting | undefined;
  fightDuration: number;
  weight: number;
  /** Downtime fractions. At or below `good` is fine. At or below `ok` is a small issue. */
  thresholds: PerformanceThresholds;
  /** The downtime fraction at which the score reaches 0. */
  worst: number;
  /** Spec-specific advice on what to cast while moving. */
  movementTips: ReactNode;
}

/** Priority for time spent not casting. */
export function activeTimePriority({
  alwaysBeCasting,
  fightDuration,
  weight,
  thresholds,
  worst,
  movementTips,
}: ActiveTimePriorityOptions): ImprovementPriority | null {
  if (!alwaysBeCasting) {
    return null;
  }
  const downtime = clamp01(alwaysBeCasting.downtimePercentage);
  const active = clamp01(alwaysBeCasting.activeTimePercentage);

  return {
    id: 'active-time',
    title: 'Reduce your downtime',
    description: (
      <>
        You cast spells for {formatPercentage(active, 1)}% of the fight. That is{' '}
        {formatDuration(fightDuration * downtime)} of downtime. Damage lost while the GCD is idle
        does not come back. {movementTips}
      </>
    ),
    score: linearScore(downtime, 0, worst),
    weight,
    performance: performanceForLowerIsBetter(downtime, thresholds),
  };
}

interface SoulShardWastePriorityOptions {
  tracker: ResourceTracker | undefined;
  fightDuration: number;
  weight: number;
  /** The spender used to express the waste: "enough for N more casts of X". */
  spender: Spell;
  shardsPerCast: number;
}

/**
 * Priority for Soul Shards generated at the cap. The thresholds are the same as the ones
 * the shared `SoulShardDetails` module uses for its suggestion.
 */
export function soulShardWastePriority({
  tracker,
  fightDuration,
  weight,
  spender,
  shardsPerCast,
}: SoulShardWastePriorityOptions): ImprovementPriority | null {
  if (!tracker || fightDuration <= 0) {
    return null;
  }
  const wasted = tracker.wasted;
  const perMinute = wasted / (fightDuration / 60000);
  const missedCasts = Math.floor(wasted / shardsPerCast);

  return {
    id: 'soul-shard-waste',
    title: 'Waste fewer Soul Shards',
    description: (
      <>
        You generated {wasted} Soul {plural(wasted, 'Shard')} while you were already at 5 (
        {perMinute.toFixed(1)} per minute).
        {missedCasts > 0 && (
          <>
            {' '}
            That is enough for {missedCasts} more <SpellLink spell={spender} />{' '}
            {plural(missedCasts, 'cast')}.
          </>
        )}{' '}
        At 4 or 5 shards, spend before you cast a generator.
      </>
    ),
    score: linearScore(perMinute, 0, 10 / 3),
    weight,
    performance:
      wasted === 0
        ? QualitativePerformance.Perfect
        : performanceForLowerIsBetter(perMinute, { good: 5 / 10, ok: 5 / 3 }),
  };
}
