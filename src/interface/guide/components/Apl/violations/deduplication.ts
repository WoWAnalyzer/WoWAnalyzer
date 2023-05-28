import { Violation } from 'parser/shared/metrics/apl';

export const DEDUP_WINDOW = 7000;

/**
 * The purpose of this code is to reduce the number of overlapping errors shown
 * in the Apl component of the guide.
 *
 * When a player forgets a high-priority spell, they often get several errors
 * in a row due to the same rule. We don't need to show each error in the
 * problem list individually---just pick the first one.
 *
 * The violation set provided should be claims for a single explainer. That is:
 * they should all be the same problem.
 */
export default function deduplicate(violations: Set<Violation>): Violation[] {
  const raw = Array.from(violations).sort(
    (a, b) => a.actualCast.timestamp - b.actualCast.timestamp,
  );

  const result: Violation[] = [];
  const runStart = () => result[result.length - 1]?.actualCast.timestamp;

  for (const violation of raw) {
    if (runStart() === undefined || runStart() + DEDUP_WINDOW < violation.actualCast.timestamp) {
      result.push(violation);
    }
  }

  return result;
}
