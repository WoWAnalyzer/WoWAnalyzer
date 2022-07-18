import Analyzer from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import { SpellInfo } from 'parser/core/EventFilter';
import { EventType, CastEvent, BeginChannelEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class StandardChecks extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
    enemies: Enemies,
    eventHistory: EventHistory,
  };
  protected abilityTracker!: AbilityTracker;
  protected spellUsable!: SpellUsable;
  protected enemies!: Enemies;
  protected eventHistory!: EventHistory;

  /**
   * @param buffActive filters based on whether the buff is active or inactive (true for active, false for inactive)
   * @param buff the spell object for the buff
   * @returns an array containing each unique spell cast and the number of times it was cast
   */
  castBreakdownByBuff(buffActive: boolean, buff: SpellInfo) {
    const castEvents: any = buffActive
      ? this.getEventsByBuff(true, buff, EventType.Cast)
      : this.getEventsByBuff(false, buff, EventType.Cast);
    const castArray: number[][] = [];
    castEvents &&
      castEvents.forEach((c: CastEvent) => {
        const index = castArray.findIndex((arr) => arr.includes(c.ability.guid));
        if (index !== -1) {
          castArray[index][1] += 1;
        } else {
          castArray.push([c.ability.guid, 1]);
        }
      });
    return castArray;
  }

  /**
   * @param spell the spell you want to count casts for.
   */
  countTotalCasts(spell: SpellInfo) {
    return this.abilityTracker.getAbility(spell.id).casts;
  }

  /**
   * @param buffActive filters based on whether the buff is active or inactive (true for active, false for inactive)
   * @param buff the spell object for the buff
   * @param eventType the type of event that you want to search for. i.e. "cast", "begincast", EventType.Cast, EventType.BeginCast, etc.
   * @param cast an optional cast spell object to count. Omit or leave undefined to count all casts
   */
  countEventsByBuff(buffActive: boolean, buff: SpellInfo, eventType: string, cast?: SpellInfo) {
    const events = buffActive
      ? this.getEventsByBuff(true, buff, eventType, cast)
      : this.getEventsByBuff(false, buff, eventType, cast);
    return events.length;
  }

  /**
   * @param buffActive filters based on whether the buff is active or inactive (true for active, false for inactive)
   * @param buff the spell object for the buff
   * @param eventType the type of event that you want to search for. i.e. "cast", "begincast", EventType.Cast, EventType.BeginCast, etc.
   * @param spell an optional spell object to search. Omit or leave undefined to count all events
   */
  getEventsByBuff(buffActive: boolean, buff: SpellInfo, eventType?: string, spell?: SpellInfo) {
    const events = this.getEvents(true, eventType, undefined, undefined, undefined, spell);
    const filteredEvents = events.filter((e) =>
      buffActive
        ? this.selectedCombatant.hasBuff(buff.id, e.timestamp - 1)
        : !this.selectedCombatant.hasBuff(buff.id, e.timestamp + 1),
    );
    return filteredEvents;
  }

  /**
   * @param castEvent the cast event that you want to check the target's health on.
   */
  getTargetHealth(castEvent: CastEvent) {
    const castTarget =
      castEvent.targetID && encodeTargetString(castEvent.targetID, castEvent.targetInstance);
    const damageEvents = this.getEvents(
      true,
      EventType.Damage,
      undefined,
      castEvent.timestamp,
      5000,
    );
    if (!damageEvents) {
      return;
    }

    const relevantEvent = damageEvents.find(
      (e) =>
        'targetID' in e &&
        e.targetID &&
        'targetInstance' in e &&
        e.targetInstance &&
        castTarget === encodeTargetString(e.targetID, e.targetInstance),
    );

    if (
      relevantEvent &&
      'hitPoints' in relevantEvent &&
      'maxHitPoints' in relevantEvent &&
      relevantEvent.hitPoints &&
      relevantEvent.maxHitPoints
    ) {
      return relevantEvent.hitPoints / relevantEvent.maxHitPoints;
    } else {
      return undefined;
    }
  }

  /**
   * @param searchBackwards specify whether you want to search for events forwards or backwards from a particular timestamp (true for backwards, false for forwards. Default is backwards).
   * @param eventType the event type to get (i.e. 'cast', 'begincast', EventType.Cast, EventType.BeginCast). Leave undefined for all events
   * @param count the number of events to get. Leave undefined for no limit.
   * @param startTimestamp the timestamp to start searching from. Searches search backwards from the startTimestamp. Leave undefined for the end of the fight
   * @param duration the amount of time in milliseconds to search. Leave undefined for no limit.
   * @param spell the specific spell object you are searching for. Leave undefined for all spells.
   */
  getEvents(
    searchBackwards: boolean = true,
    eventType?: string,
    count?: number,
    startTimestamp: number = this.owner.fight.end_time,
    duration?: number,
    spell?: SpellInfo,
  ) {
    const events = searchBackwards
      ? this.eventHistory.last(count, duration, undefined, startTimestamp)
      : this.eventHistory.next(count, duration, undefined, startTimestamp);

    let filteredEvents = events.filter(
      (e) => 'sourceID' in e && e.sourceID === this.selectedCombatant.id,
    );
    filteredEvents = filteredEvents.filter((e) => {
      if ('ability' in e && spell) {
        return (
          !CASTS_THAT_ARENT_CASTS.includes(e.ability.guid) &&
          e.ability.guid === spell.id &&
          (!eventType || eventType === e.type)
        );
      } else if ('ability' in e) {
        return (
          !CASTS_THAT_ARENT_CASTS.includes(e.ability.guid) && (!eventType || eventType === e.type)
        );
      } else {
        return !eventType || eventType === e.type;
      }
    });
    return filteredEvents;
  }

  /**
   * @param event the event you want to mark inefficient. Must be a Cast or BeginCast event.
   * @param tooltip the text you want displayed in the tooltip.
   */
  highlightInefficientCast(
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
