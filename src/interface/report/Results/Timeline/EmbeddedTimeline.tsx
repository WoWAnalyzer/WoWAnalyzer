import cssComponent from 'interface/utils/css-component';
import styles from './EmbeddedTimeline.module.scss';
import isPropValid from '@emotion/is-prop-valid';
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
import DragScroll from 'interface/DragScroll';

/**
 * Container for embedding the timeline in another component.
 *
 * Use `SpellTimeline` component for wrapping the `Casts` component.
 */
export const EmbeddedTimelineContainer = cssComponent(
  DragScroll,
  styles.EmbeddedTimelineContainer,
  ['castBarCount', 'secondWidth', 'secondsShown'] as const,
);

const ResponsiveEmbeddedTimelineContainer = cssComponent(
  EmbeddedTimelineContainer,
  styles.ResponsiveEmbeddedTimelineContainer,
  [] as const,
);

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
  minSecondWidth?: number;
}

/**
 * Extra spacing to allow spell icons positioned at exactly the left/right boundaries to display
 * without causing scrollbars.
 *
 * This is set to the equivalent of 2.2rem, the size of a spell icon on the timeline.
 */
const OVERFLOW_WIDTH_OFFSET = 22;

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
  minSecondWidth,
}: AutoSizerTimelineContainerProps) => {
  // using this instead of AutoSizer because it works with the AnimateHeight component
  const [width, setWidth] = useState(0);
  const [scrollable, setScrollable] = useState(false);
  const containerSizeObserver = useRef(
    new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rawWidth = entry.contentBoxSize[0].inlineSize;
        if (rawWidth > 0) {
          setWidth(Math.max(1, rawWidth));
        }

        // we can't directly use a ref with `DragScroll` because it uses an old-style ref for the element
        const parent = entry.target.parentElement;
        if (parent) {
          setScrollable(parent.scrollWidth > parent.clientWidth);
        }
      }
    }),
  );
  const innerSecondWidth = Math.max(
    (width - OVERFLOW_WIDTH_OFFSET) / secondsShown,
    minSecondWidth ?? 0,
  );

  return (
    <ResponsiveEmbeddedTimelineContainer
      secondsShown={secondsShown}
      castBarCount={castBarCount}
      secondWidth={innerSecondWidth}
      style={{ cursor: scrollable ? 'grab' : 'default' }}
    >
      <div
        style={{ width: '100%' }}
        ref={(el) =>
          el
            ? containerSizeObserver.current.observe(el)
            : containerSizeObserver.current.disconnect()
        }
      >
        <TimelineSettingsContext value={{ secondWidth: innerSecondWidth }}>
          {children}
        </TimelineSettingsContext>
      </div>
    </ResponsiveEmbeddedTimelineContainer>
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
  /**
   * The method to use to order cooldowns. `dynamic` (default) matches the normal timeline, listing
   * cooldowns in order of frequency. `fixed` orders them in a consistent order that
   * depends only on the list of cooldowns (and their properties). It may differ between
   * fights, but not within a fight.
   */
  cooldownOrder?: 'fixed' | 'dynamic';
  /**
   * Force off-gcd abilities to overlap rather than stack. Use if you want to guarantee
   * consistent timeline height.
   */
  overlapOffGcds?: boolean;
  /**
   * Whether to display the cooldown legend. Defaults to true. In smaller embeds, it can be beneficial to disable it.
   */
  cooldownLegend?: boolean;
}

function toSpellId(value: number | Spell): number {
  if (typeof value === 'number') {
    return value;
  }

  return value.id;
}

function EmbeddedTimelineRaw({
  range,
  auras,
  cooldowns,
  cooldownOrder,
  overlapOffGcds,
  cooldownLegend = true,
}: EmbeddedTimelineProps) {
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
    <AutoSizerTimelineContainer secondsShown={secondsShown} minSecondWidth={30}>
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
          <Casts start={range.start} events={filteredEvents} overlapOffGcds={overlapOffGcds} />
        </TimeIndicators>
        <Cooldowns
          start={range.start}
          end={range.end}
          eventsBySpellId={cooldownEventsBySpellId}
          abilities={abilities}
          castsOmitted
          fixedCooldownOrder={cooldownOrder === 'fixed'}
          disableLegend={!cooldownLegend}
        />
      </SpellTimeline>
    </AutoSizerTimelineContainer>
  );
}

const EmbeddedTimeline = React.memo(EmbeddedTimelineRaw);

export default EmbeddedTimeline;
