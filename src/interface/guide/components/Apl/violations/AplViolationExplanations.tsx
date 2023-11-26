import styled from '@emotion/styled';
import { NoProblem } from 'interface/guide/components/ProblemList';
import { Apl, CheckResult, Violation } from 'parser/shared/metrics/apl';
import { AplViolationExplainers, AplProblemData, minClaimCount } from './claims';
import AplViolationExplanation from './AplViolationExplanation';

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

type Props = {
  apl: Apl;
  result: CheckResult;
  explainers: AplViolationExplainers;
};

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

const AplViolationExplanations = ({ apl, result, explainers }: Props): JSX.Element => {
  const claims = Object.entries(explainers)
    .flatMap(([key, { claim }]) =>
      claim(apl, result).map((res): [string, AplProblemData<any>] => [key, res]),
    )
    .sort(([, resA], [, resB]) => resA.claims.size - resB.claims.size);

  const unclaimedViolations = new Set(result.violations);

  let remainingClaimData = claims.map(
    ([key, claimData]): [string, AplProblemData<any>, Set<Violation>] => [
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
};

export default AplViolationExplanations;
