import { SpellLink } from 'interface';
import React from 'react';

import type { CheckResult, Rule } from './index';

export function RuleDescription({ rule }: { rule: Rule }) {
  if (!('condition' in rule)) {
    return null;
  }

  return (
    <>
      The <SpellLink id={rule.spell.id} /> rule was active because {rule.condition.describe()}.
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
          <SpellLink id={violation.expectedCast.id} /> was available and higher priority.
          <RuleDescription rule={violation.rule} />
        </>
      ),
    };
  }
}
