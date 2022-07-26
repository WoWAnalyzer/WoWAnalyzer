import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import EventFilter, {
  SELECTED_PLAYER,
  SELECTED_PLAYER_PET,
  SpellInfo,
} from 'parser/core/EventFilter';
import {
  HasAbility,
  HasTarget,
  HasHitpoints,
  EventType,
  CastEvent,
  BeginChannelEvent,
  MappedEvent,
  AnyEvent,
} from 'parser/core/Events';
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
   * @param cast the cast event that should be evaluated
   * @returns a true/false of whether the precast was a hardcast or not
   */
  isHardcast(cast: CastEvent) {
    const beginCast = this.getEvents(
      true,
      EventType.BeginCast,
      1,
      cast.timestamp,
      undefined,
      SPELLS[cast.ability.guid],
    )[0];
    return cast.timestamp - beginCast.timestamp > 50;
  }

  /**
   * @param event the event you want to get the pre cast for
   * @param preCastSpell The spell object of the specific spell (or an array of spells) you want to check for
   * @returns a true/false of whether the precast was found or not.
   */
  checkPreCast(event: AnyEvent, preCastSpell: SpellInfo | SpellInfo[]) {
    const preCast = this.getPreCast(event, preCastSpell);
    return preCast ? true : false;
  }

  /**
   * @param event the event you want to get the pre cast for
   * @param preCastSpell an optional spell that you want to look for. Leave undefined to get the precast spell regardless of what spell it is.
   * @returns the event for the precast spell, or undefined if none was found.
   */
  getPreCast(event: AnyEvent, preCastSpell?: SpellInfo | SpellInfo[]) {
    return this.getEvents(true, EventType.Cast, 1, event.timestamp, 250, preCastSpell)[0];
  }

  /**
   * @param buffActive filters based on whether the buff is active or inactive (true for active, false for inactive)
   * @param buff the spell object for the buff
   * @returns an array containing each unique spell cast and the number of times it was cast
   */
  castBreakdownByBuff(buffActive: boolean, buff: SpellInfo) {
    const castEvents = buffActive
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
   * @param eventType The type of event you want to count. i.e. EventType.Cast, EventType.BeginCast, etc. Use EventType.Event for all events.
   * @param spell the spell you want to count casts for.
   * @returns the number of events found
   */
  countEvents(eventType: EventType, spell: SpellInfo) {
    const events = this.getEvents(true, eventType, undefined, undefined, undefined, spell);
    return events.length;
  }

  /**
   * @param buffActive filters based on whether the buff is active or inactive (true for active, false for inactive)
   * @param buff the spell object for the buff
   * @param eventType the type of event that you want to search for. i.e. EventType.Cast, EventType.BeginCast, etc. Use EventType.Event for all events.
   * @param cast an optional cast spell object to count. Omit or leave undefined to count all casts
   * @returns the number of events found
   */
  countEventsByBuff(buffActive: boolean, buff: SpellInfo, eventType: EventType, cast?: SpellInfo) {
    const events = buffActive
      ? this.getEventsByBuff(true, buff, eventType, cast)
      : this.getEventsByBuff(false, buff, eventType, cast);
    return events.length;
  }

  /**
   * @param buffActive filters based on whether the buff is active or inactive (true for active, false for inactive)
   * @param buff the spell object for the buff
   * @param eventType the type of event that you want to search for. i.e. EventType.Cast, EventType.BeginCast, etc. Use EventType.Event for all events.
   * @param spell an optional spell object to search. Omit or leave undefined to count all events
   * @returns an array of events that match the provided criteria
   */
  getEventsByBuff<ET extends EventType>(
    buffActive: boolean,
    buff: SpellInfo,
    eventType: ET,
    spell?: SpellInfo | SpellInfo[],
  ): Array<MappedEvent<ET>> {
    const events = this.getEvents(true, eventType, undefined, undefined, undefined, spell);
    const filteredEvents = events.filter((e) =>
      buffActive
        ? this.selectedCombatant.hasBuff(buff.id, e.timestamp - 1)
        : !this.selectedCombatant.hasBuff(buff.id, e.timestamp + 1),
    );
    return filteredEvents;
  }

  /**
   * @param buff the spell object for the proc's buff.
   * @param spenderSpell the spell object (or an array of spell objects) that are used to spend the proc.
   * @returns an array of remove buff events that had expired
   */
  getExpiredProcs(buff: SpellInfo, spenderSpell: SpellInfo | SpellInfo[]) {
    const events = this.getEvents(
      true,
      EventType.RemoveBuff,
      undefined,
      undefined,
      undefined,
      buff,
    );

    const filteredEvents = events.filter((e) => {
      const castEvent = this.getEvents(
        true,
        EventType.Cast,
        1,
        e.timestamp + 1,
        250,
        spenderSpell,
      )[0];
      return !castEvent;
    });
    return filteredEvents;
  }

  /**
   * @param buff the spell object for the proc's buff.
   * @param spenderSpell the spell object (or an array of spell objects) that are used to spend the proc.
   * @returns a numeric count of expired procs
   */
  countExpiredProcs(buff: SpellInfo, spenderSpell: SpellInfo | SpellInfo[]) {
    return this.getExpiredProcs(buff, spenderSpell).length;
  }

  /**
   * @param event the event that you want to check the target's health on.
   * @returns the target's health percentage (in decimal, i.e. 0.75 = 75%)
   */
  getTargetHealth(event: AnyEvent) {
    const target =
      (event.type === EventType.Cast || event.type === EventType.BeginCast) && HasTarget(event)
        ? encodeTargetString(event.targetID, event.targetInstance)
        : undefined;
    const damageEvents = this.getEvents(false, EventType.Damage, undefined, event.timestamp, 5000);
    if (!damageEvents) {
      return;
    }

    let relevantEvent;
    if (target) {
      relevantEvent = damageEvents.find(
        (e) => HasTarget(e) && target === encodeTargetString(e.targetID, e.targetInstance),
      );
    } else {
      relevantEvent = damageEvents[0];
    }

    if (relevantEvent && HasHitpoints(relevantEvent)) {
      return relevantEvent.hitPoints / relevantEvent.maxHitPoints;
    } else {
      return undefined;
    }
  }

  /**
   * @param searchBackwards specify whether you want to search for events forwards or backwards from a particular timestamp (true for backwards, false for forwards. Default is backwards).
   * @param eventType the event type to get (i.e. 'cast', 'begincast', EventType.Cast, EventType.BeginCast). Use EventType.Event for all events.
   * @param count the number of events to get. Leave undefined for no limit.
   * @param startTimestamp the timestamp to start searching from. Searches search backwards from the startTimestamp. Leave undefined for the end of the fight
   * @param duration the amount of time in milliseconds to search. Leave undefined for no limit.
   * @param spell the specific spell (or an array of spells) you are searching for. Leave undefined for all spells.
   * @returns an array of events that meet the provided criteria
   */
  getEvents<ET extends EventType>(
    searchBackwards: boolean = true,
    eventType: ET,
    count?: number,
    startTimestamp: number = this.owner.fight.end_time,
    duration?: number,
    spell?: SpellInfo | SpellInfo[],
    includePets: boolean = false,
  ): Array<MappedEvent<ET>> {
    const source = includePets ? SELECTED_PLAYER | SELECTED_PLAYER_PET : SELECTED_PLAYER;
    const eventFilter = spell
      ? new EventFilter(eventType).by(source).spell(spell)
      : new EventFilter(eventType).by(source);
    const events = searchBackwards
      ? this.eventHistory.last(count, duration, eventFilter, startTimestamp)
      : this.eventHistory.next(count, duration, eventFilter, startTimestamp);

    const filteredEvents = events.filter((e) =>
      HasAbility(e) ? !CASTS_THAT_ARENT_CASTS.includes(e.ability.guid) : true,
    );
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
