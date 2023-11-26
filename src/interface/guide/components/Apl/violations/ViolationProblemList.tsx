import styled from '@emotion/styled';
import { useEvents, useInfo } from 'interface/guide';
import ProblemList, { Problem, ProblemRendererProps } from 'interface/guide/components/ProblemList';
import { Apl, CheckResult, Violation } from 'parser/shared/metrics/apl';
import { useMemo } from 'react';
import { ViolationTimeline } from '../timeline';
import deduplicate, { DEDUP_WINDOW } from './deduplication';
import { SelectedExplanation } from './types';

export const AplViolationTimelineContainer = styled.div``;
const ViolationProblemContainer = styled.div`
  display: grid;
  grid-template-columns: auto max-content;
  grid-gap: 1rem;
`;

type Props<T> = SelectedExplanation<T> & { result: CheckResult; apl: Apl };

function ViolationProblemList<T = any>({
  describer: DescribeViolation,
  claimData,
  apl,
  result,
}: Props<T>): JSX.Element | null {
  const events = useEvents();
  const info = useInfo();

  const renderer = useMemo(
    () => (props: ProblemRendererProps<Violation>) =>
      (
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

export default ViolationProblemList;
