import SPELLS from 'common/SPELLS';
import { MappedEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const MS_BUFFER = 100;

class SummonOrderNormalizer extends EventsNormalizer {
  normalize(events: MappedEvent[]) {
    const _events: MappedEvent[] = [];

    events.forEach((event, idx) => {
      _events.push(event);

      if (this.isDogSummon(event) || this.isTyrantSummon(event)) {
        const castTimestamp = event.timestamp;

        for (let previousEventIndex = idx; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = _events[previousEventIndex];
          if (castTimestamp - previousEvent.timestamp > MS_BUFFER) {
            break;
          }
          if (this.isDemonFire(previousEvent, event)) {
            this.swapEvents(_events, previousEventIndex, previousEvent);
          }
        }
      }
    });
    return _events;
  }

  // helper
  isTyrantSummon(event: MappedEvent) {
    return (
      event.type === EventType.Summon && event.ability.guid === SPELLS.SUMMON_DEMONIC_TYRANT.id
    );
  }

  isDogSummon(event: MappedEvent) {
    return (
      event.type === EventType.Summon &&
      (event.ability.guid === SPELLS.DREADSTALKER_SUMMON_1.id ||
        event.ability.guid === SPELLS.DREADSTALKER_SUMMON_2.id)
    );
  }

  swapEvents(_events: MappedEvent[], previousEventIndex: number, previousEvent: MappedEvent) {
    _events.splice(previousEventIndex, 1);
    _events.push(previousEvent);
    previousEvent.__reordered = true;
  }

  isDemonFire(previousEvent: MappedEvent, event: MappedEvent) {
    return (
      previousEvent.type === EventType.BeginCast &&
      previousEvent.ability.guid === SPELLS.DEMONIC_TYRANT_DAMAGE.id
    );
  }
}

export default SummonOrderNormalizer;
