import styled from '@emotion/styled';
import { useInfo } from 'interface/guide';
import { AnyEvent } from 'parser/core/Events';
import { Apl, CheckResult, Violation } from 'parser/shared/metrics/apl';
import Casts, { isApplicableEvent } from 'interface/report/Results/Timeline/Casts';

import AplRules from './rules';

const EmbeddedTimelineContainer = styled.div<{ secondWidth?: number; secondsShown?: number }>`
  .spell-timeline {
    position: relative;

    .casts {
      box-shadow: unset;
    }
  }

  padding: 1rem 2rem;
  border-radius: 0.5rem;
  background: #222;

  box-sizing: content-box;
  width: ${(props) => {
    const width = (props.secondWidth ?? 60) * (props.secondsShown ?? 10);
    return `${width}px`;
  }};
`;

/**
 * Show the cast timeline around a violation.
 */
export function ViolationTimeline({
  violation,
  events,
  apl,
  results,
}: {
  events: AnyEvent[];
  violation: Violation;
  results: CheckResult;
  apl: Apl;
}): JSX.Element | null {
  const info = useInfo();

  if (!info) {
    return null;
  }

  const relevantEvents = events.filter(isApplicableEvent(info?.playerId ?? 0)).map((event) =>
    event === violation.actualCast
      ? {
          ...event,
          meta: {
            isEnhancedCast: true,
            enhancedCastReason: (
              <AplRules apl={apl} results={results} highlightRule={violation.rule} />
            ),
          },
        }
      : event,
  );

  return (
    <>
      <EmbeddedTimelineContainer secondWidth={60} secondsShown={12}>
        <div className="spell-timeline">
          <Casts
            start={relevantEvents[0].timestamp}
            movement={undefined}
            secondWidth={60}
            events={relevantEvents}
          />
        </div>
      </EmbeddedTimelineContainer>
    </>
  );
}
