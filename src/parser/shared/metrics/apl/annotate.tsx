import { SpellLink } from 'interface';

import type { Tense, CheckResult, Rule } from './index';

export function ConditionDescription({
  tense,
  rule,
  prefix,
}: {
  rule: Rule;
  prefix?: string;
  tense?: Tense;
}) {
  if (!('condition' in rule)) {
    return null;
  }

  return (
    <>
      {' '}
      {prefix || 'because'} {rule.condition.describe(tense)}
    </>
  );
}

/**
 * Annotate a list of APL violations on the timeline.
 *
 * This mutates the input and will overwrite other annotations, but is
 * idempotent. There is no return value.
 */
export default function annotateTimeline(violations: CheckResult['violations']) {
  for (const violation of violations) {
    violation.actualCast.meta = {
      isInefficientCast: true,
      inefficientCastReason: (
        <>
          <SpellLink id={violation.expectedCast.id} /> was available and higher priority
          <ConditionDescription rule={violation.rule} />.
        </>
      ),
    };
  }
}
