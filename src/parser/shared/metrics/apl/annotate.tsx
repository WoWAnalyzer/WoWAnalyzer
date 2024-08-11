import { SpellLink } from 'interface';

import type { Tense, CheckResult, InternalRule, Violation } from './index';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

export function ConditionDescription({
  tense,
  rule,
  prefix,
}: {
  rule: InternalRule;
  prefix?: string;
  tense?: Tense;
}) {
  if (!('condition' in rule)) {
    return null;
  }

  const desc = rule.condition?.describe(tense);
  const customPrefix = rule.condition?.prefix ?? prefix ?? 'because';

  if (!desc || desc === '') {
    return null;
  }

  return (
    <>
      {' '}
      {customPrefix}
      {customPrefix ? ' ' : ''}
      {desc}
    </>
  );
}

function InefficientCastAnnotation({ violation }: { violation: Violation }) {
  return (
    <>
      {violation.expectedCast.map((spell, index) => (
        <>
          {index > 0 ? ' and ' : ''}
          <SpellLink key={spell.id} spell={spell.id} />
        </>
      ))}{' '}
      {violation.expectedCast.length > 1 ? 'were' : 'was'} available and higher priority
      <ConditionDescription rule={violation.rule} />.
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
    addInefficientCastReason(
      violation.actualCast,
      <InefficientCastAnnotation violation={violation} />,
    );
  }
}
