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
import type Spell from 'common/SPELLS/Spell';
import React from 'react';

/**
 * Container for embedding the timeline in another component.
 *
 * Use `SpellTimeline` component for wrapping the `Casts` component.
 */
export const EmbeddedTimelineContainer = styled.div<{
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

export interface EmbeddedTimelineProps {
  range: {
    start: number;
    end: number;
  };
  /**
   * IDs of auras (buffs) to show on the timeline.
   * If not provided or set to `true`, get the ids from the `Buffs` core analyzer.
   * If set to `false`, do not show auras.
   *
   * At this time, ALL AURAS must be provided in your specs `Auras` / `Buffs` core analyzer. This is used to find the event data without re-scanning the entire fight.
   */
  auras?: (number | Spell)[] | boolean;
  /**
   * IDs of spells to show the cooldowns of.
   * If not provided, no cooldowns are shown.
   * If set to `true`, show all cooldowns (not recommended for inline use)
   */
  cooldowns?: (number | Spell)[] | true;
}

function toSpellId(value: number | Spell): number {
  if (typeof value === 'number') {
    return value;
  }

  return value.id;
}

function EmbeddedTimeline({ range, auras, cooldowns }: EmbeddedTimelineProps) {
  const events = useEvents(range);
  const auraAnalyzer = useAnalyzer(Auras);
  const info = useInfo();
  const abilities = useAnalyzer(Abilities);
  const spellUsable = useAnalyzer(SpellUsable);
  const { combatLogParser } = useCombatLogParser();

  const secondsShown = (range.end - range.start) / 1000;
  const offset = range.start - (info?.originalFightStart ?? 0);
  const cooldownEventsBySpellId = useMemo(() => {
    const spellIds = Array.isArray(cooldowns)
      ? cooldowns.map(toSpellId)
      : cooldowns
        ? (abilities?.abilities
            .filter((ability) => ability.enabled)
            .map((ability) => ability.primarySpell) ?? [])
        : [];
    const result = new Map();

    for (const id of spellIds) {
      result.set(id, spellUsable?.history(id)?.slice(range.start, range.end, true).data ?? []);
    }

    return result;
  }, [cooldowns, abilities, spellUsable, range.start, range.end]);

  const visibleAuras = useMemo(
    () => (Array.isArray(auras) ? new Set(auras.map(toSpellId)) : undefined),
    [auras],
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
        {auras && (
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

const MemoEmbeddedTimeline = React.memo(EmbeddedTimeline);

export default MemoEmbeddedTimeline;
