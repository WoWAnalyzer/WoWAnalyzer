import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

const MS_BUFFER = 100;

class SummonOrderNormalizer extends EventsNormalizer {

  normalize(events) {
    const _events = [];

    events.forEach((event, idx) => {
      _events.push(event);

      if (this.isDogSummon(event) || this.isTyrantSummon(event)) {
        const castTimestamp = event.timestamp;

        for (let previousEventIndex = idx; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = _events[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > MS_BUFFER) {
            break;
          }
          if (this.isSharpenedDreadfangs(previousEvent, event) ||
            this.isDemonicConsumption(previousEvent, event) ||
            this.isDemonFire(previousEvent, event)) {
            this.swapEvents(_events, previousEventIndex, previousEvent);
          }
        }
      }
    });
    return _events;
  }

  // helper
  isSharpenedDreadfangs(previousEvent, event) {
    return previousEvent.type === EventType.Cast && previousEvent.ability.guid === SPELLS.SHARPENED_DREADFANGS.id && previousEvent.sourceInstance === event.targetInstance;
  }
  isTyrantSummon(event) {
    return event.type === EventType.Summon && event.ability.guid === SPELLS.SUMMON_DEMONIC_TYRANT.id;
  }
  isDogSummon(event) {
    return event.type === EventType.Summon && (event.ability.guid === SPELLS.DREADSTALKER_SUMMON_1.id || event.ability.guid === SPELLS.DREADSTALKER_SUMMON_2.id);
  }

  swapEvents(_events, previousEventIndex, previousEvent) {
    _events.splice(previousEventIndex, 1);
    _events.push(previousEvent);
    previousEvent.__modified = true;
  }

  isDemonFire(previousEvent, event) {
    return previousEvent.type === EventType.BeginCast && previousEvent.ability.guid === SPELLS.DEMONIC_TYRANT_DAMAGE.id && previousEvent.sourceInstance === event.targetInstance;
  }

  isDemonicConsumption(previousEvent, event) {
    return previousEvent.type === EventType.Cast && previousEvent.ability.guid === SPELLS.DEMONIC_CONSUMPTION_CAST.id && previousEvent.sourceInstance === event.targetInstance;
  }
}

export default SummonOrderNormalizer;
