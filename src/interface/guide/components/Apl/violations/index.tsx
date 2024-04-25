import styled from '@emotion/styled';
import { formatPercentage } from 'common/format';
import { useEvents, useInfo } from 'interface/guide';
import ProblemList, {
  NoProblem,
  Problem,
  ProblemRendererProps,
} from 'interface/guide/components/ProblemList';
import { Apl, CheckResult, Violation } from 'parser/shared/metrics/apl';
import React, { useMemo } from 'react';
import { useContext } from 'react';
import { ViolationTimeline } from '../timeline';
import {
  AplViolationExplainers,
  AplProblemData,
  minClaimCount,
  ViolationExplainer,
} from './claims';
import deduplicate, { DEDUP_WINDOW } from './deduplication';
import PassFailBar from 'interface/guide/components/PassFailBar';

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
  describer: ViolationExplainer<T>['describe'];
  claimData: AplProblemData<T>;
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

function AplViolationExplanation<T = unknown>({
  claimData,
  describer,
  children,
  totalViolations,
}: {
  claimData: AplProblemData<T>;
  describer: ViolationExplainer<T>['describe'];
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

/**
 * Show a list of problem explanations.
 *
 * Must be wrapped in `ExplanationSelectionContext` for the "Show Me!" buttons
 * to work.
 *
 * ## Technical Details
 *
 * The list of problems is constructed by applying the `claims` method from
 * each problem explainer, then doing (essentially) the following:
 *
 * 1. Add an explanation of the most common problem (defined as # of remaining
 *    claimed mistakes) to the list.
 * 2. Remove mistakes that were claimed by that problem from all other problem
 *    explanations.
 * 3. Repeat until no problems remain with at least `minClaimCount` mistakes
 *    remaining.
 *
 * This list is then rendered in the order they were added.
 *
 * The implementation is not particularly efficient, but performance shouldn't
 * be an issue since the number of problems should be small.
 */
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
      claim(apl, result).map((res): [string, AplProblemData<unknown>] => [key, res]),
    )
    .sort(([, resA], [, resB]) => resA.claims.size - resB.claims.size);

  const unclaimedViolations = new Set(result.violations);

  let remainingClaimData = claims.map(
    ([key, claimData]): [string, AplProblemData<unknown>, Set<Violation>] => [
      key,
      claimData,
      new Set(claimData.claims),
    ],
  );

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
        describer={explainers[key].describe}
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

  if (appliedClaims.length === 0) {
    return <NoProblem>No major problems found.</NoProblem>;
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

export default function ViolationProblemList<T = unknown>({
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

  const problems = deduplicate(claimData.claims).map(
    (violation): Problem<Violation> => ({
      range: {
        start: violation.actualCast.timestamp,
        end: violation.actualCast.timestamp,
      },
      context: {
        before: 5000,
        after: DEDUP_WINDOW,
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
