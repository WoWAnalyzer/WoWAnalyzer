import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import EventFilter, {
  SELECTED_PLAYER,
  SELECTED_PLAYER_PET,
  SpellInfo,
} from 'parser/core/EventFilter';
import { HasAbility, AnyEvent, EventType } from 'parser/core/Events';
import Module from 'parser/core/Module';
import EventEmitter from 'parser/core/modules/EventEmitter';

type EventSearchOptions = {
  searchBackwards?: boolean;
  spell?: SpellInfo | SpellInfo[];
  count?: number;
  startTimestamp?: number;
  duration?: number;
  includePets?: boolean;
};

class EventHistory extends Module {
  protected buildFilter<ET extends EventType, E extends AnyEvent>(
    initialFilter: (event: E) => boolean,
    maxTime?: number,
    filterDef?: EventFilter<ET>,
  ) {
    let filter = initialFilter;

    if (filterDef) {
      const ee: EventEmitter = this.owner.getModule(EventEmitter);
      const prevFilter = filter;
      filter = (event) => {
        if (event.type !== filterDef.eventType) {
          return false;
        }
        return prevFilter(event);
      };
      const filterTo = filterDef.getTo();
      if (filterTo) {
        const prevFilter = filter;
        const toFilter = ee.createToCheck(filterTo);
        if (toFilter) {
          filter = (event) => {
            if (!toFilter(event)) {
              return false;
            }
            return prevFilter(event);
          };
        }
      }
      const filterBy = filterDef.getBy();
      if (filterBy) {
        const prevFilter = filter;
        const byFilter = ee.createByCheck(filterBy);
        if (byFilter) {
          filter = (event) => {
            if (!byFilter(event)) {
              return false;
            }
            return prevFilter(event);
          };
        }
      }
      const filterSpell = filterDef.getSpell();
      if (filterSpell) {
        const prevFilter = filter;
        const spellFilter = ee.createSpellCheck(filterSpell);
        filter = (event) => {
          if (!spellFilter(event)) {
            return false;
          }
          return prevFilter(event);
        };
      }
    }

    return filter;
  }

  /**
   * @param count the maximum number of events to return, or null for no limit
   * @param maxTime the maximum number of milliseconds to look back, or null for no limit
   * @param filterDef an optional EventFilter to apply to all events
   * @param fromTimestamp an optional timestamp to start searching from
   * @returns the last `count` events that match the given filters, with the oldest events first
   */
  public last<ET extends EventType, E extends AnyEvent<ET>>(
    count?: number,
    maxTime?: number,
    filterDef?: EventFilter<ET>,
    fromTimestamp?: number,
  ): E[] {
    let filter = (event: AnyEvent) => true;

    if (fromTimestamp) {
      const prevFilter = filter;
      filter = (event) => {
        if (!event.timestamp || event.timestamp > fromTimestamp) {
          return false;
        }
        return prevFilter(event);
      };
    }

    if (maxTime) {
      const minTime = fromTimestamp
        ? fromTimestamp - maxTime
        : this.owner.currentTimestamp - maxTime;
      const prevFilter = filter;
      filter = (event) => {
        if (!event.timestamp || event.timestamp < minTime) {
          return false;
        }
        return prevFilter(event);
      };
    }

    filter = this.buildFilter(filter, maxTime, filterDef);

    let history = this.owner.eventHistory.filter((event) => filter(event));
    if (count && count < history.length) {
      history = history.slice(-count);
    }
    return history as E[];
  }

  public next<ET extends EventType, E extends AnyEvent<ET>>(
    count?: number,
    maxTime?: number,
    filterDef?: EventFilter<ET>,
    fromTimestamp?: number,
  ): E[] {
    let filter = (event: AnyEvent) => true;

    if (fromTimestamp) {
      const prevFilter = filter;
      filter = (event) => {
        if (!event.timestamp || event.timestamp < fromTimestamp) {
          return false;
        }
        return prevFilter(event);
      };
    }

    if (maxTime) {
      const minTime = fromTimestamp
        ? fromTimestamp + maxTime
        : this.owner.currentTimestamp + maxTime;
      const prevFilter = filter;
      filter = (event) => {
        if (!event.timestamp || event.timestamp > minTime) {
          return false;
        }
        return prevFilter(event);
      };
    }

    filter = this.buildFilter(filter, maxTime, filterDef);

    let history = this.owner.eventHistory.filter((event) => filter(event));
    if (count && count < history.length) {
      history = history.slice(0, count);
    }
    return history as E[];
  }

  /**
   * @param searchBackwards specify whether you want to search for events forwards or backwards from a particular timestamp (true for backwards, false for forwards. Default is backwards).
   * @param eventType the event type to get (i.e. 'cast', 'begincast', EventType.Cast, EventType.BeginCast). Use EventType.Event for all events.
   * @param spell the specific spell (or an array of spells) you are searching for. Leave undefined for all spells.
   * @param count the number of events to get. Leave undefined for no limit.
   * @param startTimestamp the timestamp to start searching from. Searches search backwards from the startTimestamp. Leave undefined for the end of the fight
   * @param duration the amount of time in milliseconds to search. Leave undefined for no limit.
   * @returns an array of events that meet the provided criteria
   */
  getEvents<ET extends EventType>(
    eventType: ET,
    {
      searchBackwards,
      spell,
      count,
      startTimestamp,
      duration,
      includePets,
    }: EventSearchOptions = {},
  ): Array<AnyEvent<ET>> {
    const source = includePets ? SELECTED_PLAYER | SELECTED_PLAYER_PET : SELECTED_PLAYER;
    const eventFilter = spell
      ? new EventFilter(eventType).by(source).spell(spell)
      : new EventFilter(eventType).by(source);
    const events = searchBackwards
      ? this.last(count, duration, eventFilter, startTimestamp)
      : this.next(count, duration, eventFilter, startTimestamp);

    const filteredEvents = events.filter((e) =>
      HasAbility(e) ? !CASTS_THAT_ARENT_CASTS.includes(e.ability.guid) : true,
    );
    return filteredEvents;
  }

  /**
   * @param buff the spell object for the buff
   * @param eventType the type of event that you want to search for. i.e. EventType.Cast, EventType.BeginCast, etc. Use EventType.Event for all events.
   * @param spell an optional spell object to search. Omit or leave undefined to count all events
   * @returns an array of events that match the provided criteria
   */
  getEventsWithBuff<ET extends EventType>(
    buff: SpellInfo,
    eventType: ET,
    spell?: SpellInfo | SpellInfo[],
  ): Array<AnyEvent<ET>> {
    const events = this.getEvents(eventType, { searchBackwards: true, spell: spell });
    const filteredEvents = events.filter((e) =>
      this.selectedCombatant.hasBuff(buff.id, e.timestamp - 1),
    );
    return filteredEvents;
  }

  /**
   * @param buff the spell object for the buff
   * @param eventType the type of event that you want to search for. i.e. EventType.Cast, EventType.BeginCast, etc. Use EventType.Event for all events.
   * @param spell an optional spell object to search. Omit or leave undefined to count all events
   * @returns an array of events that match the provided criteria
   */
  getEventsWithoutBuff<ET extends EventType>(
    buff: SpellInfo,
    eventType: ET,
    spell?: SpellInfo | SpellInfo[],
  ): Array<AnyEvent<ET>> {
    const events = this.getEvents(eventType, { searchBackwards: true, spell: spell });
    const filteredEvents = events.filter(
      (e) => !this.selectedCombatant.hasBuff(buff.id, e.timestamp - 1),
    );
    return filteredEvents;
  }
}

export default EventHistory;
