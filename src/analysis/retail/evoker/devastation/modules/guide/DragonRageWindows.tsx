import { SubSection } from 'interface/guide';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import Casts, { isApplicableEvent } from 'interface/report/Results/Timeline/Casts';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { RageWindowCounter } from '../abilities/DragonRage';
import { AnyEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS';
import './styling.scss';

export function DragonRageWindowSection({
  rageWindows,
  events,
  info,
}: {
  rageWindows: RageWindowCounter[];
  events: AnyEvent[];
  info: Info;
}) {
  const windowDurations: string[] = useMemo(() => [], []);
  const windows = useMemo(
    () =>
      rageWindows.map((window) => {
        const relevantEvents = events
          .filter(isApplicableEvent(info?.playerId ?? 0))
          .filter(
            (event) =>
              event.timestamp && event.timestamp >= window.start && event.timestamp <= window.end,
          );

        const duration = `(${((window.end - window.start) / 1000).toFixed(1)}s)`;
        windowDurations.push(duration);

        if (relevantEvents.length === 0) {
          return 'No events in this window';
        }

        return (
          <Fragment key={`${window.start}_${window.end}`}>
            {window.fightEndDuringDR && <>Fight ended during Dragonrage.</>}
            <ExplanationAndDataSubSection
              explanationPercent={30}
              explanation={<Statistics window={window} />}
              data={
                <div style={{ overflowX: 'auto' }}>
                  <EmbeddedTimelineContainer
                    secondWidth={60}
                    secondsShown={(window.end - window.start) / 1000}
                  >
                    <SpellTimeline>
                      <Casts
                        start={relevantEvents[0].timestamp}
                        secondWidth={60}
                        events={relevantEvents}
                      />
                    </SpellTimeline>
                  </EmbeddedTimelineContainer>
                </div>
              }
            />
          </Fragment>
        );
      }),
    [rageWindows, windowDurations, events, info],
  );

  const [windowIndex, setWindowIndex] = useState(0);
  const window = windows[windowIndex];
  const windowDuration = windowDurations[windowIndex];

  useEffect(() => setWindowIndex(0), [windows]);

  return (
    <SubSection className="dragonrage-window-container">
      <header>
        <span>
          Dragonrage Window {windowIndex + 1} out of {windows.length} {windowDuration}
        </span>
        <div className="btn-group">
          <button
            onClick={() => setWindowIndex(Math.max(0, windowIndex - 1))}
            disabled={windowIndex === 0}
          >
            <span className="icon-button glyphicon glyphicon-chevron-left" aria-hidden />
          </button>
          <button
            disabled={windowIndex === windows.length - 1}
            onClick={() => setWindowIndex(Math.min(windows.length - 1, windowIndex + 1))}
          >
            <span className="icon-button glyphicon glyphicon-chevron-right" aria-hidden />
          </button>
        </div>
      </header>
      {window}
    </SubSection>
  );
}

// Need something prettier lol
function Statistics({ window }: { window: RageWindowCounter }) {
  return (
    <ul>
      <li>
        <SpellLink spell={SPELLS.FIRE_BREATH} /> - {window.fireBreaths}/2 casts
      </li>
      <li>
        <SpellLink spell={SPELLS.ETERNITY_SURGE} /> - {window.eternitySurges}/2 casts
      </li>
      <li>
        <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} /> - {window.essenceBursts} casts
      </li>
      <li>
        <SpellLink spell={SPELLS.DISINTEGRATE} /> - {window.disintegrateTicks} ticks
      </li>
      <li>
        <SpellLink spell={TALENTS.PYRE_TALENT} /> - {window.pyres} casts
      </li>
    </ul>
  );
}
