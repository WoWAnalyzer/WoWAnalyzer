import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { SpellInfo } from 'parser/core/EventFilter';
import { HasTarget, HasHitpoints, EventType, CastEvent, AnyEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class SharedCode extends Analyzer {
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
    const beginCast = this.eventHistory.getEvents(EventType.BeginCast, {
      spell: SPELLS[cast.ability.guid],
      count: 1,
      startTimestamp: cast.timestamp,
    })[0];
    return cast.timestamp - beginCast.timestamp > 50;
  }

  /**
   * @param event the event you want to get the pre cast for
   * @param preCastSpell an optional spell that you want to look for. Leave undefined to get the precast spell regardless of what spell it is.
   * @returns the event for the precast spell, or undefined if none was found.
   */
  getPreCast(event: AnyEvent, preCastSpell?: SpellInfo | SpellInfo[]): CastEvent | undefined {
    return this.eventHistory
      .getEvents(EventType.Cast, {
        spell: preCastSpell,
        count: 1,
        startTimestamp: event.timestamp + 1,
        duration: 250,
      })
      .at(0);
  }

  /**
   * @param buff the spell object for the proc's buff.
   * @param spenderSpell the spell object (or an array of spell objects) that are used to spend the proc.
   * @param buffer the number of milliseconds to look before the buff removal
   * @param afterBuffer the number of milliseconds to look after the buff removel if the events are out of order.
   * @returns an array of remove buff events that had expired
   */
  getExpiredProcs(
    buff: SpellInfo,
    spenderSpell: SpellInfo | SpellInfo[],
    buffer = 0,
    afterBuffer = 0,
  ) {
    const events = this.eventHistory.getEvents(EventType.RemoveBuff, {
      spell: buff,
    });

    const filteredEvents = events.filter((e) => {
      const castEvent = this.eventHistory.getEvents(EventType.Cast, {
        spell: spenderSpell,
        count: 1,
        startTimestamp: e.timestamp + afterBuffer,
        duration: buffer,
      })[0];
      return !castEvent;
    });
    return filteredEvents;
  }

  /**
   * @param event the event that you want to check the target's health on.
   * @returns the target's health percentage (in decimal, i.e. 0.75 = 75%)
   */
  getTargetHealth(event: AnyEvent) {
    if (!HasTarget(event)) {
      return;
    }

    const target = encodeTargetString(event.targetID, event.targetInstance);
    const damageEvents = this.eventHistory.getEvents(EventType.Damage, {
      searchBackwards: false,
      startTimestamp: event.timestamp,
    });
    if (!damageEvents) {
      return;
    }

    const relevantEvent = damageEvents.find(
      (e) => target && target === encodeTargetString(e.targetID, e.targetInstance),
    );

    if (relevantEvent && HasHitpoints(relevantEvent)) {
      return relevantEvent.hitPoints / relevantEvent.maxHitPoints;
    } else {
      return;
    }
  }
  /**
   * @param buffActive filters based on whether the buff is active or inactive (true for active, false for inactive)
   * @param buff the spell object for the buff
   * @returns an array containing each unique spell cast and the number of times it was cast
   */
  castBreakdownByBuff(buffActive: boolean, buff: SpellInfo) {
    const castEvents = buffActive
      ? this.eventHistory.getEventsWithBuff(buff, EventType.Cast)
      : this.eventHistory.getEventsWithBuff(buff, EventType.Cast);
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
}

export default SharedCode;
