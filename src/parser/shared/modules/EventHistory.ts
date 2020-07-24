import Module from 'parser/core/Module';
import { Event } from 'parser/core/Events';
import EventFilter from 'parser/core/EventFilter';
import EventEmitter from 'parser/core/modules/EventEmitter';

class EventHistory extends Module {

  /**
   * @param count the maximum number of events to return, or null for no limit
   * @param maxTime the maximum number of milliseconds to look back, or null for no limit
   * @param filterDef an optional EventFilter to apply to all events
   * @returns the last `count` events that match the given filters, with the oldest events first
   */
  public last<ET extends string, E extends Event<ET>>(count?: number, maxTime?: number, filterDef?: EventFilter<ET>): Array<E> {
    let filter = (event: Event<any>) => {
      return true;
    };

    if (maxTime) {
      const minTime = this.owner.currentTimestamp - maxTime;
      const prevFilter = filter;
      filter = (event: any) => {
        if (!event.timestamp || event.timestamp < minTime) {
          return false;
        }
        return prevFilter(event);
      };
    }

    if (filterDef) {
      const ee: EventEmitter = this.owner.getModule(EventEmitter);
      const prevFilter = filter;
      filter = event => {
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
          filter = event => {
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
          filter = event => {
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
        filter = event => {
          if (!spellFilter(event)) {
            return false;
          }
          return prevFilter(event);
        };
      }
    }

    let history = this.owner.eventHistory.filter(event => filter(event));
    if (count && count < history.length) {
      history = history.slice(-count);
    }
    return history as Array<E>;
  }

}

export default EventHistory;
