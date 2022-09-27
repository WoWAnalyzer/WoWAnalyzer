import styled from '@emotion/styled';
import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { PassFailBar, useEvents, useInfo } from 'interface/guide';
import ProblemList, { Problem, ProblemRendererProps } from 'interface/guide/ProblemList';
import {
  spells,
  Apl,
  CheckResult,
  InternalRule,
  TargetType,
  Violation,
  Tense,
} from 'parser/shared/metrics/apl';
import { ConditionDescription } from 'parser/shared/metrics/apl/annotate';
import { RuleSpellsDescription } from 'parser/shared/metrics/apl/ChecklistRule';
import React, { useMemo } from 'react';
import { useContext } from 'react';
import { ViolationTimeline } from './timeline';

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

const minClaimCount = (result: CheckResult): number =>
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

const EmbedContainer = styled.div`
  background: #222;
  border-radius: 0.5em;
  padding: 1em 1.5em;
  display: grid;
  grid-gap: 2rem;
  grid-template-columns: 1fr max-content;
  align-content: center;
  align-items: center;
`;

const ShowMeButton = styled.button`
  appearance: none;
  background: #333;
  border-radius: 0.5rem;
  padding: 1rem;
  border: none;
  box-shadow: 1px 1px 3px #111;

  &:hover {
    filter: brightness(120%);
  }
`;

export type SelectedExplanation<T> = {
  describer: ViolationExplainer<T>['describer'];
  claimData: ClaimData<T>;
};

export const ExplanationSelectionContext = React.createContext<
  (selection: SelectedExplanation<any>) => void
>(() => undefined);

const ClaimCountBar = styled(PassFailBar)`
  .pass-bar {
    background-color: hsl(348.9, 69.5%, 39.8%);
  }

  .fail-bar {
    background-color: hsl(0, 0%, 20%);
  }
`;

const ClaimCountDescription = styled.div`
  display: grid;
  grid-template-columns: max-content auto;
  grid-gap: 1rem;
  align-items: start;
`;

function AplViolationExplanation<T = any>({
  claimData,
  describer,
  children,
  totalViolations,
}: {
  claimData: ClaimData<T>;
  describer?: ViolationExplainer<T>['describer'];
  children: React.ReactChild;
  totalViolations: number;
}): JSX.Element {
  const setSelection = useContext(ExplanationSelectionContext);

  return (
    <EmbedContainer>
      <div>
        {children}
        <ClaimCountDescription>
          <small>{formatPercentage(claimData.claims.size / totalViolations, 0)}% of mistakes</small>{' '}
          <ClaimCountBar pass={claimData.claims.size} total={totalViolations} />
        </ClaimCountDescription>
      </div>
      <ShowMeButton onClick={() => setSelection?.({ describer, claimData })}>Show Me!</ShowMeButton>
    </EmbedContainer>
  );
}

const ExplanationList = styled.ul`
  list-style: none;
  padding-left: 0;

  li {
    margin-top: 1rem;

    &:first-of-type {
      margin-top: initial;
    }
  }
`;

export function AplViolationExplanations({
  apl,
  result,
  explainers,
}: {
  apl: Apl;
  result: CheckResult;
  explainers: AplViolationExplainers;
}): JSX.Element {
  const claims = Object.entries(explainers)
    .flatMap(([key, { claim }]) =>
      claim(apl, result).map((res): [string, ClaimData<any>] => [key, res]),
    )
    .sort(([, resA], [, resB]) => resA.claims.size - resB.claims.size);

  const unclaimedViolations = new Set(result.violations);

  let remainingClaimData = claims.map(([key, claimData]): [
    string,
    ClaimData<any>,
    Set<Violation>,
  ] => [key, claimData, new Set(claimData.claims)]);

  const appliedClaims = [];

  // very inefficient approach, performance hinges on claim list being short
  while (remainingClaimData.length > 0) {
    const [key, claimData, remainingClaims] = remainingClaimData.pop()!;
    for (const violation of remainingClaims) {
      unclaimedViolations.delete(violation);
    }
    const explanation = explainers[key].render(claimData, apl, result);
    appliedClaims.push(
      <AplViolationExplanation
        claimData={claimData}
        describer={explainers[key].describer}
        totalViolations={result.violations.length}
      >
        {explanation}
      </AplViolationExplanation>,
    );

    remainingClaimData = remainingClaimData
      .map((datum) => {
        for (const violation of remainingClaims) {
          datum[2].delete(violation);
        }
        return datum;
      })
      .filter(([, , otherClaims]) => otherClaims.size > minClaimCount(result))
      .sort(([, , setA], [, , setB]) => setA.size - setB.size);
  }

  return (
    <ExplanationList>
      {appliedClaims.map((result, ix) => (
        <li key={ix}>{result}</li>
      ))}
    </ExplanationList>
  );
}

export const AplViolationTimelineContainer = styled.div``;

const ViolationProblemContainer = styled.div`
  display: grid;
  grid-template-columns: auto max-content;
  grid-gap: 1rem;
`;

export default function ViolationProblemList<T = any>({
  describer: DescribeViolation,
  claimData,
  apl,
  result,
}: SelectedExplanation<T> & { result: CheckResult; apl: Apl }): JSX.Element | null {
  const events = useEvents();
  const info = useInfo();

  const renderer = useMemo(
    () => (props: ProblemRendererProps<Violation>) => (
      <ViolationProblemContainer>
        {DescribeViolation && (
          <div>
            <DescribeViolation violation={props.problem.data} result={result} apl={apl} />
          </div>
        )}
        <div>
          <ViolationTimeline
            violation={props.problem.data}
            events={props.events}
            results={result}
            apl={apl}
          />
        </div>
      </ViolationProblemContainer>
    ),
    [DescribeViolation, result, apl],
  );

  if (!info) {
    return null;
  }

  const problems = Array.from(claimData.claims).map(
    (violation): Problem<Violation> => ({
      range: {
        start: violation.actualCast.timestamp,
        end: violation.actualCast.timestamp,
      },
      context: {
        before: 5000,
        after: 7000,
      },
      data: violation,
    }),
  );

  return (
    <AplViolationTimelineContainer>
      <ProblemList
        events={events}
        info={info}
        renderer={renderer}
        problems={problems}
        label="Example"
      />
    </AplViolationTimelineContainer>
  );
}
