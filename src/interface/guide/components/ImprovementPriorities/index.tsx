import { ReactNode } from 'react';
import { Section } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { qualitativePerformanceToNumber } from 'common/combineQualitativePerformances';
import { TipBox, PerformanceTipBox } from '../TipBox';

/**
 * One thing a player can change to improve their throughput.
 *
 * A spec builds one of these for each check it runs and gives the list to
 * {@link ImprovementPriorities}. The component then shows the few that matter most.
 */
export interface ImprovementPriority {
  /** Stable identifier, used as the React key. */
  id: string;
  /** Short imperative heading. Example: "Cast Call Dreadstalkers closer to cooldown". */
  title: ReactNode;
  /** What happened in this fight, with numbers, and what to do instead. */
  description: ReactNode;
  /**
   * How well the player did on this check, from 0 to 1. A score of 1 means there is
   * nothing left to gain. The rank uses `score` together with `weight`.
   */
  score: number;
  /**
   * How much this check matters to damage, relative to the other checks.
   * Only the ratio between weights matters.
   */
  weight: number;
  /**
   * The rating for this check. The component shows only `Ok` and `Fail` priorities.
   * `Good` and `Perfect` count as "nothing to fix".
   */
  performance: QualitativePerformance;
}

export const DEFAULT_PRIORITY_LIMIT = 4;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/** The damage on the table for one priority: its weight, scaled by how far from perfect it was. */
export function priorityImpact(priority: ImprovementPriority): number {
  return priority.weight * (1 - clamp01(priority.score));
}

export function isActionable(priority: ImprovementPriority): boolean {
  return (
    priority.performance === QualitativePerformance.Ok ||
    priority.performance === QualitativePerformance.Fail
  );
}

/**
 * Keeps the priorities with room to improve, sorts them by impact, and cuts the list at
 * `limit`. Highest impact goes first. When two impacts are equal, the worse rating goes first.
 */
export function rankImprovementPriorities(
  priorities: ImprovementPriority[],
  limit: number = DEFAULT_PRIORITY_LIMIT,
): ImprovementPriority[] {
  return priorities
    .filter(isActionable)
    .sort(
      (a, b) =>
        priorityImpact(b) - priorityImpact(a) ||
        qualitativePerformanceToNumber(a.performance) -
          qualitativePerformanceToNumber(b.performance),
    )
    .slice(0, limit);
}

interface ImprovementPrioritiesProps {
  /** Every check the spec ran, with or without a problem found. */
  priorities: ImprovementPriority[];
  /** Maximum number of priorities to show. Defaults to 4. */
  limit?: number;
  /** Section title. */
  title?: ReactNode;
  /** Optional lead-in paragraph shown above the list. */
  intro?: ReactNode;
}

/**
 * A guide section that shows the few changes most likely to improve a player's throughput,
 * ranked by weighted impact. It shows at most `limit` items. It says so when it found fewer
 * than `limit`, and it says so when it found nothing to fix.
 */
export default function ImprovementPriorities({
  priorities,
  limit = DEFAULT_PRIORITY_LIMIT,
  title = 'What to Focus On',
  intro,
}: ImprovementPrioritiesProps) {
  const shown = rankImprovementPriorities(priorities, limit);
  const checked = priorities.length;
  const remaining = checked - shown.length;

  return (
    <Section title={title}>
      <p>
        {intro ?? (
          <>
            These are the changes that we estimate will improve your damage the most, ranked by
            impact. Each one is something you control during the fight. The sections below have the
            details.
          </>
        )}
      </p>
      {checked === 0 && (
        <TipBox type="info" title="No checks available">
          We did not have enough data to evaluate this fight.
        </TipBox>
      )}
      {checked > 0 && shown.length === 0 && (
        <TipBox type="success" title="Nothing major to fix">
          All {checked} of the things we check were in good shape this fight. The sections below
          have the details if you want more.
        </TipBox>
      )}
      {shown.map((priority, index) => (
        <PerformanceTipBox
          key={priority.id}
          performance={priority.performance}
          title={`Priority ${index + 1}`}
        >
          <strong>{priority.title}</strong>
          <div>{priority.description}</div>
        </PerformanceTipBox>
      ))}
      {shown.length > 0 && shown.length < limit && (
        <p style={{ opacity: 0.75, marginTop: 8 }}>
          <small>
            Only {shown.length} {shown.length === 1 ? 'thing' : 'things'} to improve. The other{' '}
            {remaining} {remaining === 1 ? 'check' : 'checks'} looked good.
          </small>
        </p>
      )}
    </Section>
  );
}

export {
  activeTimePriority,
  castEfficiencyPriority,
  linearScore,
  performanceForHigherIsBetter,
  performanceForLowerIsBetter,
  plural,
  resourceWastePriority,
  type PerformanceThresholds,
} from './helpers';
