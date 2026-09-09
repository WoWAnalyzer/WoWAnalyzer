import type { ReactNode } from 'react';
import type Spell from 'common/SPELLS/Spell';
import { formatDuration, formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import type CastEfficiency from 'parser/shared/modules/CastEfficiency';
import type AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import type ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import type { ImprovementPriority } from './index';

/**
 * Building blocks for the "What to Focus On" section. Each helper turns the data of one
 * core analyzer into an {@link ImprovementPriority}. It returns null when the check does not
 * apply. The spec decides the weight and the wording. README.md in this folder has the guide.
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

interface ResourceWastePriorityOptions {
  tracker: ResourceTracker | undefined;
  fightDuration: number;
  weight: number;
  /** The resource name as shown to the player, in the singular and the plural. */
  resourceName: { one: string; many: string };
  /** The spender used to express the waste: "enough for N more casts of X". */
  spender: Spell;
  unitsPerCast: number;
  /** Waste per minute. At or below `good` is fine. At or below `ok` is a small issue. */
  thresholds: PerformanceThresholds;
  /** The waste per minute at which the score reaches 0. */
  worst: number;
  /** Defaults to "Waste less <resource>". Pass one for a countable resource ("Waste fewer ..."). */
  title?: ReactNode;
  /** One sentence on how to prevent the waste. */
  advice?: ReactNode;
  id?: string;
}

/** Priority for a resource generated at its cap. Works with any `ResourceTracker`. */
export function resourceWastePriority({
  tracker,
  fightDuration,
  weight,
  resourceName,
  spender,
  unitsPerCast,
  thresholds,
  worst,
  title,
  advice,
  id,
}: ResourceWastePriorityOptions): ImprovementPriority | null {
  if (!tracker || fightDuration <= 0) {
    return null;
  }
  const wasted = tracker.wasted;
  const perMinute = wasted / (fightDuration / 60000);
  const missedCasts = Math.floor(wasted / unitsPerCast);

  return {
    id: id ?? 'resource-waste',
    title: title ?? `Waste less ${resourceName.many}`,
    description: (
      <>
        You generated {wasted} {wasted === 1 ? resourceName.one : resourceName.many} while you were
        already at the cap ({perMinute.toFixed(1)} per minute).
        {missedCasts > 0 && (
          <>
            {' '}
            That is enough for {missedCasts} more <SpellLink spell={spender} />{' '}
            {plural(missedCasts, 'cast')}.
          </>
        )}{' '}
        {advice ?? 'When you are close to the cap, spend before you cast a generator.'}
      </>
    ),
    score: linearScore(perMinute, 0, worst),
    weight,
    performance:
      wasted === 0
        ? QualitativePerformance.Perfect
        : performanceForLowerIsBetter(perMinute, thresholds),
  };
}
