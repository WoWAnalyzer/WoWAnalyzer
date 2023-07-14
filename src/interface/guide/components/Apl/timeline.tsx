import { useInfo } from 'interface/guide';
import { MappedEvent } from 'parser/core/Events';
import { Apl, CheckResult, Violation } from 'parser/shared/metrics/apl';
import Casts, { isApplicableEvent } from 'interface/report/Results/Timeline/Casts';

import AplRules from './rules';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';

/**
 * Show the cast timeline around a violation.
 */
export function ViolationTimeline({
  violation,
  events,
  apl,
  results,
}: {
  events: MappedEvent[];
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
        <SpellTimeline>
          <Casts
            start={relevantEvents[0].timestamp}
            movement={undefined}
            secondWidth={60}
            events={relevantEvents}
          />
        </SpellTimeline>
      </EmbeddedTimelineContainer>
    </>
  );
}
