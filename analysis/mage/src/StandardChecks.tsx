import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import { SpellInfo } from 'parser/core/EventFilter';
import {
  EventType,
  AnyEvent,
  CastEvent,
  BeginChannelEvent,
  BeginCastEvent,
} from 'parser/core/Events';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';

class StandardChecks extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    eventHistory: EventHistory,
  };
  protected abilityTracker!: AbilityTracker;
  protected eventHistory!: EventHistory;

  castBreakdownDuringBuff(buff: SpellInfo) {
    /**
     * @param buff the spell object for the buff
     * @returns an array containing each unique spell cast and the number of times it was cast
     */
    const castEvents: CastEvent[] = this.getEventsDuringBuff(buff, EventType.Cast);
    const castArray: number[][] = [];
    castEvents &&
      castEvents.forEach((c) => {
        const index = castArray.findIndex((arr) => arr.includes(c.ability.guid));
        if (index !== -1) {
          castArray[index][1] += 1;
        } else {
          castArray.push([c.ability.guid, 1]);
        }
      });
    return castArray;
  }

  countTotalCasts(spell: SpellInfo) {
    return this.abilityTracker.getAbility(spell.id).casts;
  }

  countEventsDuringBuff(buff: SpellInfo, eventType: string, cast?: SpellInfo | undefined) {
    /**
     * @param buff the spell object for the buff
     * @param eventType the type of event that you want to search for. i.e. "cast", "begincast", EventType.Cast, EventType.BeginCast, etc.
     * @param cast an optional cast spell object to count. Omit or leave undefined to count all casts
     */
    const events = this.getEventsDuringBuff(buff, eventType, cast);
    return events.length;
  }

  getEventsDuringBuff(buff: SpellInfo, eventType: string, spell?: SpellInfo | undefined) {
    /**
     * @param buff the spell object for the buff
     * @param eventType the type of event that you want to search for. i.e. "cast", "begincast", EventType.Cast, EventType.BeginCast, etc.
     * @param spell an optional spell object to search. Omit or leave undefined to count all events
     */
    const buffRemovals: AnyEvent[] = this.eventHistory.last(
      undefined,
      undefined,
      Events.removebuff.by(SELECTED_PLAYER).spell(buff),
    );
    if (this.selectedCombatant.hasBuff(buff.id, this.owner.fight.end_time - 1)) {
      buffRemovals.push(this.eventHistory.last(1, undefined, Events.fightend)[0]);
    }
    let events: any;
    const filteredEvents: any = [];
    buffRemovals &&
      buffRemovals.forEach((e) => {
        const buffApply = this.eventHistory.last(
          1,
          undefined,
          Events.applybuff.by(SELECTED_PLAYER).spell(buff),
          e.timestamp,
        )[0];
        const buffDuration = e.timestamp - buffApply.timestamp - 1;
        switch (eventType) {
          case EventType.Cast:
            events = this.getCastEvents(undefined, e.timestamp, buffDuration, spell);
            break;
          case EventType.BeginCast:
            events = this.getBeginCastEvents(undefined, e.timestamp, buffDuration, spell);
            break;
        }
        events &&
          events.forEach((event: AnyEvent) => {
            filteredEvents.push(event);
          });
      });
    return filteredEvents;
  }

  getCastEvents(
    count?: number | undefined,
    startTimestamp?: number | undefined,
    duration?: number | undefined,
    spell?: SpellInfo | undefined,
  ) {
    const events = this.eventHistory.last(
      count,
      duration,
      spell ? Events.cast.by(SELECTED_PLAYER).spell(spell) : Events.cast.by(SELECTED_PLAYER),
      startTimestamp || this.owner.fight.end_time,
    );
    const filteredCasts: CastEvent[] = [];
    events &&
      events.forEach((cast) => {
        if (CASTS_THAT_ARENT_CASTS.includes(cast.ability.guid)) {
          return;
        } else {
          filteredCasts.push(cast);
        }
      });
    return filteredCasts;
  }

  getBeginCastEvents(
    count?: number | undefined,
    startTimestamp?: number | undefined,
    duration?: number | undefined,
    spell?: SpellInfo | undefined,
  ) {
    const events = this.eventHistory.last(
      count,
      duration,
      spell
        ? Events.begincast.by(SELECTED_PLAYER).spell(spell)
        : Events.begincast.by(SELECTED_PLAYER),
      startTimestamp || this.owner.fight.end_time,
    );
    const filteredCasts: BeginCastEvent[] = [];
    events &&
      events.forEach((cast) => {
        filteredCasts.push(cast);
      });
    return filteredCasts;
  }

  highlightTimeline(
    event: CastEvent | BeginChannelEvent | CastEvent[] | BeginChannelEvent[],
    tooltip: string,
  ) {
    if (Array.isArray(event)) {
      event.forEach((e) => {
        e.meta = e.meta || {};
        e.meta.isInefficientCast = true;
        e.meta.inefficientCastReason = tooltip;
      });
    } else {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = tooltip;
    }
  }
}

export default StandardChecks;
