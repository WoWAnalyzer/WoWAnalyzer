import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS';

const MS_BUFFER = 100;

class SummonOrderNormalizer extends EventsNormalizer {

  normalize(events) {
    const _events = [];

    events.forEach((event, idx) => {
      _events.push(event);

      // swap both dogs sharpened-dreadfangs cast and their summon
      if (this.isDogSummon(event)) {
        const castTimestamp = event.timestamp;

        for (let previousEventIndex = idx; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = _events[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > MS_BUFFER) {
            break;
          }
          if (previousEvent.type === 'cast' && previousEvent.ability.guid === SPELLS.SHARPENED_DREADFANGS.id && previousEvent.sourceInstance === event.targetInstance) {
            this.swapEvents(_events, previousEventIndex, previousEvent);
            break;
          }
        }
      }

      // swap demonic tyrant and its demonic consumption & begin_cast event with its summon
      if (event.type === 'summon' && event.ability.guid === SPELLS.SUMMON_DEMONIC_TYRANT.id) {
        const castTimestamp = event.timestamp;

        for (let previousEventIndex = idx; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = _events[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > MS_BUFFER) {
            break;
          }
          if (this.isDemonicConsumption(previousEvent, event) || this.isDemonFire(previousEvent, event)) {
            this.swapEvents(_events, previousEventIndex, previousEvent);
          }
        }
      }
    });
    return _events;
  }

  // helper
  isDogSummon(event) {
    return event.type === 'summon' && (event.ability.guid === SPELLS.DREADSTALKER_SUMMON_1.id || event.ability.guid === SPELLS.DREADSTALKER_SUMMON_2.id);
  }

  swapEvents(_events, previousEventIndex, previousEvent) {
    _events.splice(previousEventIndex, 1);
    _events.push(previousEvent);
    _events.__modified = true;
  }

  isDemonFire(previousEvent, event) {
    return previousEvent.type === 'begincast' && previousEvent.ability.guid === SPELLS.DEMONIC_TYRANT_DAMAGE.id && previousEvent.sourceInstance === event.targetInstance;
  }

  isDemonicConsumption(previousEvent, event) {
    return previousEvent.type === 'cast' && previousEvent.ability.guid === SPELLS.DEMONIC_CONSUMPTION_CAST.id && previousEvent.sourceInstance === event.targetInstance;
  }
}

export default SummonOrderNormalizer;
