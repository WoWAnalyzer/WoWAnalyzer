import { Trans } from '@lingui/macro';
import { SpellLink } from 'interface';
import {
  Apl,
  CheckResult,
  InternalRule,
  spells,
  TargetType,
  Tense,
  Violation,
} from 'parser/shared/metrics/apl';
import { ConditionDescription } from 'parser/shared/metrics/apl/annotate';
import { RuleSpellsDescription } from 'parser/shared/metrics/apl/ChecklistRule';

export type ClaimData<T> = {
  claims: Set<Violation>;
  data: T;
};

export type ViolationExplainer<T> = {
  claim: (apl: Apl, result: CheckResult) => Array<ClaimData<T>>;
  /**
   * Render an explanation of the overall claims made.
   */
  render: (claim: ClaimData<T>, apl: Apl, result: CheckResult) => JSX.Element;
  /**
   * Render a description of an individual violation. What was done wrong? What should be done differently?
   */
  describer?: (props: {
    apl: Apl;
    violation: Violation;
    result: CheckResult;
  }) => JSX.Element | null;
};

export type AplViolationExplainers = Record<string, ViolationExplainer<any>>;

export const minClaimCount = (result: CheckResult): number =>
  Math.min(10, Math.floor((result.successes.length + result.violations.length) / 20));

/**
 * Useful default for filtering out spurious / low value explanations. Requires that at least 10 violations are claimed, and at least 40% of rule-related events were violations.
 */
const defaultClaimFilter = (
  result: CheckResult,
  rule: InternalRule,
  claims: Set<Violation>,
): boolean => {
  const successes = result.successes.filter((suc) => suc.rule === rule).length;

  return claims.size > minClaimCount(result) && claims.size / (successes + claims.size) > 0.4;
};

const overcastFillers: ViolationExplainer<InternalRule> = {
  claim: (apl, result) => {
    // only look for unconditional rules targeting a single spell.
    const unconditionalRules = apl.rules.filter(
      (rule) => rule.condition === undefined && rule.spell.type === TargetType.Spell,
    );
    const claimsByRule: Map<InternalRule, Set<Violation>> = new Map();

    result.violations.forEach((violation) => {
      const actualSpellId = violation.actualCast.ability.guid;
      const fillerRule = unconditionalRules.find((rule) =>
        spells(rule).some((spell) => spell.id === actualSpellId),
      );
      if (fillerRule) {
        const claims = claimsByRule.get(fillerRule) ?? new Set();
        claims.add(violation);
        if (!claimsByRule.has(fillerRule)) {
          claimsByRule.set(fillerRule, claims);
        }
      }
    });

    return Array.from(claimsByRule.entries())
      .filter(([rule, claims]) => defaultClaimFilter(result, rule, claims))
      .map(([rule, claims]) => ({ claims, data: rule }));
  },
  render: (claim) => (
    <Trans id="guide.apl.overcastFillers">
      You frequently cast <SpellLink id={spells(claim.data)[0].id} /> when more important spells
      were available.
    </Trans>
  ),
};

const droppedRule: ViolationExplainer<InternalRule> = {
  claim: (_apl, result) => {
    const claimsByRule: Map<InternalRule, Set<Violation>> = new Map();

    result.violations.forEach((violation) => {
      const claims = claimsByRule.get(violation.rule) ?? new Set();
      claims.add(violation);

      if (!claimsByRule.has(violation.rule)) {
        claimsByRule.set(violation.rule, claims);
      }
    });

    return Array.from(claimsByRule.entries())
      .filter(([rule, claims]) => defaultClaimFilter(result, rule, claims))
      .map(([rule, claims]) => ({ claims, data: rule }));
  },
  render: (claim) => (
    <Trans id="guide.apl.droppedRule">
      You frequently skipped casting <RuleSpellsDescription rule={claim.data} />{' '}
      <ConditionDescription prefix="when" rule={claim.data} tense={Tense.Past} />
    </Trans>
  ),
  describer: ({ violation }) => (
    <>
      {violation.rule.condition ? (
        <>
          <ConditionDescription prefix="When" rule={violation.rule} tense={Tense.Present} />, you{' '}
        </>
      ) : (
        'You '
      )}
      should cast <SpellLink id={violation.expectedCast[0].id} /> instead of{' '}
      <SpellLink id={violation.actualCast.ability.guid} />.
    </>
  ),
};

export const defaultExplainers: AplViolationExplainers = {
  overcastFillers,
  droppedRule,
};
