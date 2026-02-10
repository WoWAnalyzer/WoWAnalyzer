import styled from '@emotion/styled';
// force this to load if you render EmbeddedTimelineContainer
import './Timeline.scss';
import { useMemo, useRef, useState } from 'react';
import { useAnalyzer, useEvents, useInfo } from 'interface/guide';
import Auras from 'parser/core/modules/Auras';
import AuraTimeline from './Auras';

import TimeIndicators from './TimeIndicators';
import Casts, { isApplicableEvent } from './Casts';
import Cooldowns from './Cooldowns';
import Abilities from 'parser/core/modules/Abilities';
import { TimelineSettingsContext } from './Settings';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import SpellUsable from 'parser/shared/modules/SpellUsable';

/**
 * Container for embedding the timeline in another component.
 *
 * Use `SpellTimeline` component for wrapping the `Casts` component.
 */
const EmbeddedTimelineContainer = styled.div<{
  secondWidth?: number;
  secondsShown?: number;
  castBarCount?: number;
}>`
  .spell-timeline {
    position: relative;

    .casts {
      box-shadow: unset;
    }

    .cooldowns:only-child {
      margin-top: unset;
    }
  }

  --cast-bars: ${(props) => props.castBarCount ?? 1};

  padding: 1rem 2rem;
  overflow-x: clip;

  box-sizing: content-box;
  width: ${(props) => {
    const width = (props.secondWidth ?? 60) * (props.secondsShown ?? 10);
    return `${width}px`;
  }};
`;

export const SpellTimeline = ({
  ref,
  children,
}: React.PropsWithChildren<React.ComponentProps<'div'>> & {
  ref?: React.RefObject<HTMLDivElement | null>;
}) => (
  <div ref={ref} className="spell-timeline">
    {children}
  </div>
);

export default EmbeddedTimelineContainer;

interface AutoSizerTimelineContainerProps {
  secondsShown: number;
  castBarCount?: number;
  children?: React.ReactNode;
}

/**
 * Timeline container that automatically sets the width of seconds to prevent scrolling.
 *
 * If this is used inside a flexible container with no maximum size, it will continue
 * expanding forever. For that use case, use `EmbeddedTimelineContainer` instead and
 * set `secondWidth` manually.
 */
export const AutoSizerTimelineContainer = ({
  children,
  secondsShown,
  castBarCount,
}: AutoSizerTimelineContainerProps) => {
  // using this instead of AutoSizer because it works with the AnimateHeight component
  const [width, setWidth] = useState(0);
  const mutationObserver = useRef(
    new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rawWidth = entry.contentBoxSize[0].inlineSize;
        if (rawWidth > 0) {
          setWidth(Math.max(1, rawWidth));
        }
      }
    }),
  );
  const innerSecondWidth = width / secondsShown;

  return (
    <EmbeddedTimelineContainer
      secondsShown={secondsShown}
      castBarCount={castBarCount}
      secondWidth={0}
      style={{ width: '100%', boxSizing: 'border-box', maxWidth: '100%' }}
    >
      <div
        style={{ width: '100%' }}
        ref={(el) =>
          el ? mutationObserver.current.observe(el) : mutationObserver.current.disconnect()
        }
      >
        <TimelineSettingsContext value={{ secondWidth: innerSecondWidth }}>
          {children}
        </TimelineSettingsContext>
      </div>
    </EmbeddedTimelineContainer>
  );
};

export interface EasyTimelineProps {
  range: {
    start: number;
    end: number;
  };
  /**
   * IDs of auras (buffs) to show on the timeline.
   * If not provided or set to `true`, get the ids from the `Buffs` core analyzer.
   * If set to `false`, do not show auras.
   */
  auraIds?: number[] | boolean;
  /**
   * IDs of spells to show the cooldowns of.
   * If not provided, no cooldowns are shown.
   * If set to `true`, show all cooldowns (not recommended for inline use)
   */
  cooldownSpellIds?: number[] | true;
}

// TODO reorg names
// the goal of this component is to make it easy to declare a timeline view, without
// needing to aggregate events yourself. it should support the primary features of the timeline tab:
// - auras
// - casts
// - cooldowns
//
// auras and cooldowns need a bunch of work to handle dealing with a short slice of time. phase selections basically "just work" because phases are long enough for issues to work themselves out. a 10s cooldown window is not
//
// movement is not supported currently
export function EasyTimeline({ range, auraIds, cooldownSpellIds }: EasyTimelineProps) {
  const events = useEvents(range);
  const auraAnalyzer = useAnalyzer(Auras);
  const info = useInfo();
  const abilities = useAnalyzer(Abilities);
  const spellUsable = useAnalyzer(SpellUsable);
  const { combatLogParser } = useCombatLogParser();

  const secondsShown = (range.end - range.start) / 1000;
  const offset = range.start - (info?.originalFightStart ?? 0);
  const cooldownEventsBySpellId = useMemo(() => {
    const spellIds = Array.isArray(cooldownSpellIds)
      ? cooldownSpellIds
      : cooldownSpellIds
        ? (abilities?.abilities
            .filter((ability) => ability.enabled)
            .map((ability) => ability.primarySpell) ?? [])
        : [];
    const result = new Map();

    for (const id of spellIds) {
      result.set(id, spellUsable?.history(id)?.slice(range.start, range.end, true).data ?? []);
    }

    return result;
  }, [cooldownSpellIds, abilities, spellUsable, range.start, range.end]);

  const visibleAuras = useMemo(
    () => (Array.isArray(auraIds) ? new Set(auraIds) : undefined),
    [auraIds],
  );

  const filteredEvents = useMemo(
    () => (info ? events.filter(isApplicableEvent(info?.playerId)) : []),
    [events, info],
  );

  if (!abilities || !auraAnalyzer || !spellUsable) {
    return null;
  }

  return (
    <AutoSizerTimelineContainer secondsShown={secondsShown}>
      <SpellTimeline>
        {auraIds && (
          <AuraTimeline
            start={range.start}
            end={range.end}
            auras={auraAnalyzer}
            parser={combatLogParser}
            visibleAuras={visibleAuras}
          />
        )}
        <TimeIndicators seconds={secondsShown} offset={offset} skipInterval={2}>
          <Casts start={range.start} events={filteredEvents} />
        </TimeIndicators>
        <Cooldowns
          start={range.start}
          end={range.end}
          eventsBySpellId={cooldownEventsBySpellId}
          abilities={abilities}
          castsOmitted
        />
      </SpellTimeline>
    </AutoSizerTimelineContainer>
  );
}
