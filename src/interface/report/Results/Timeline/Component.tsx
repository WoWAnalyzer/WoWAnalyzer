import DragScroll from 'interface/DragScroll';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import CombatLogParser from 'parser/core/CombatLogParser';
import { AnyEvent, EventType, UpdateSpellUsableType } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import AurasModule from 'parser/core/modules/Auras';
import { useState } from 'react';

import './Timeline.scss';
import Auras from './Auras';
import Casts, { isApplicableEvent as isApplicableCastEvent } from './Casts';
import { EnemyCastsTimeline } from './EnemyCasts';
import Cooldowns from './Cooldowns';
import TimeIndicators from './TimeIndicators';

export function isApplicableUpdateSpellUsableEvent(event: AnyEvent, startTime: number) {
  if (!('updateType' in event)) {
    return false;
  }

  if (
    event.updateType !== UpdateSpellUsableType.EndCooldown &&
    event.updateType !== UpdateSpellUsableType.RestoreCharge
  ) {
    // begincooldown is unnecessary since endcooldown includes the start time
    return false;
  }
  if (event.updateType === UpdateSpellUsableType.RestoreCharge && event.timestamp < startTime) {
    //ignore restore charge events if they happen before the phase
    return false;
  }

  if (!('ability' in event)) {
    return false;
  }

  const spellId = event.ability.guid;
  if (CASTS_THAT_ARENT_CASTS.includes(spellId)) {
    return false;
  }
  return true;
}

interface Props {
  abilities: Abilities;
  enemyCasts: [];
  auras: AurasModule;
  movement: {
    start: number;
    end: number;
    distance: number;
  }[];
  parser: CombatLogParser;
  config?: {
    separateCastBars: number[][];
  };
  visibleAuras: Set<number>;
  showCooldowns: boolean;
  showGlobalCooldownDuration: boolean;
}
const Timeline = ({
  abilities,
  enemyCasts,
  auras,
  movement,
  parser,
  config,
  visibleAuras,
  showCooldowns,
  showGlobalCooldownDuration,
}: Props) => {
  const [zoom] = useState(2);
  const [padding, setPadding] = useState(0);

  const fight = parser.fight;
  const start = fight.start_time;
  const end = fight.end_time;
  const offset = fight.offset_time;
  const duration = end - start;
  const seconds = duration / 1000;
  const secondWidth = 120 / zoom;
  const totalWidth = seconds * secondWidth;

  const isApplicableEvent = (event: AnyEvent) => {
    switch (event.type) {
      case EventType.FilterCooldownInfo:
      case EventType.Cast:
        return isApplicableCast(event);
      case EventType.UpdateSpellUsable:
        return isApplicableUpdateSpellUsableEvent(event, start);
      case EventType.ApplyBuff:
      case EventType.RemoveBuff:
        return isApplicableBuffEvent(event);
      default:
        return false;
    }
  };

  const isApplicableCast = (event: AnyEvent) => {
    if (!('ability' in event)) {
      return false;
    }

    if (!parser.byPlayer(event)) {
      // Ignore pet/boss casts
      return false;
    }

    const spellId = event.ability.guid;
    if (CASTS_THAT_ARENT_CASTS.includes(spellId)) {
      return false;
    }

    const ability = abilities.getAbility(spellId);
    if (!ability || !ability.cooldown) {
      return false;
    }

    if (event.timestamp >= end) {
      return false;
    }

    return true;
  };

  const isApplicableBuffEvent = (event: AnyEvent) => {
    if (!('ability' in event)) {
      return false;
    }
    const ability = abilities.getAbility(event.ability.guid);
    return ability && ability.timelineCastableBuff === event.ability.guid;
  };

  const getEventsBySpellId = (events: AnyEvent[]) => {
    const eventsBySpellId = new Map();
    events.forEach((event) => {
      if (!isApplicableEvent(event)) {
        return;
      }

      if (!('ability' in event)) {
        return;
      }

      const spellId = _getCanonicalId(event.ability.guid);
      if (!eventsBySpellId.has(spellId)) {
        eventsBySpellId.set(spellId, []);
      }
      eventsBySpellId.get(spellId).push(event);
    });
    return eventsBySpellId;
  };

  const _getCanonicalId = (spellId: number) => {
    const ability = abilities.getAbility(spellId);
    if (!ability) {
      return spellId; // not a class ability
    }
    return ability.primarySpell;
  };

  const setContainerRef = (elem: HTMLDivElement | null) => {
    if (!elem || !elem.getBoundingClientRect) {
      return;
    }

    setPadding(elem.getBoundingClientRect().x + 15); // 15 for padding
  };

  const skipInterval = Math.ceil(40 / secondWidth);

  const eventsBySpellId = getEventsBySpellId(parser.eventHistory);

  const allSeparatedIds = config?.separateCastBars.flat() || [];

  const castEvents = [
    ...(config?.separateCastBars.map((spellIds: number[]) =>
      parser.eventHistory
        .filter(isApplicableCastEvent(parser.playerId))
        .filter((event) => spellIds.includes(event.ability?.guid)),
    ) || []),
    parser.eventHistory
      .filter(isApplicableCastEvent(parser.playerId))
      .filter((event) => !allSeparatedIds.includes(event.ability?.guid)),
  ];

  return (
    <>
      <div className="container" ref={setContainerRef} />
      <DragScroll className="spell-timeline-container">
        <div
          className="spell-timeline"
          style={
            {
              width: totalWidth + padding * 2,
              paddingTop: 0,
              paddingBottom: 0,
              paddingLeft: padding,
              paddingRight: padding, // we also want the user to have the satisfying feeling of being able to get the right side to line up
              margin: 'auto', //center horizontally if it's too small to take up the page
              '--cast-bars': castEvents.length,
            } as React.CSSProperties
          }
        >
          <EnemyCastsTimeline
            seconds={seconds}
            start={start}
            secondWidth={secondWidth}
            offset={offset}
            skipInterval={skipInterval}
          />
          <Auras
            start={start}
            secondWidth={secondWidth}
            parser={parser}
            auras={auras}
            visibleAuras={visibleAuras}
          />
          <TimeIndicators
            seconds={seconds}
            offset={offset}
            secondWidth={secondWidth}
            skipInterval={skipInterval}
          />
          {castEvents.map((events, index) => (
            <Casts
              key={index}
              start={start}
              secondWidth={secondWidth}
              events={events}
              // Only show on the main cast bar since that should default to standard casts
              movement={index === castEvents.length - 1 ? movement : undefined}
            />
          ))}
          <Cooldowns
            start={start}
            end={end}
            secondWidth={secondWidth}
            eventsBySpellId={eventsBySpellId}
            abilities={abilities}
          />
        </div>
      </DragScroll>
    </>
  );
};

export default Timeline;
