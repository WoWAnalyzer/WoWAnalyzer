import { MappedEvent, EventType } from 'parser/core/Events';
import metric from 'parser/core/metric';

/**
 * Returns an object with the total amount of casts per spell.
 */
const castCount = (events: MappedEvent[], playerId: number) =>
  events.reduce<{ [spellId: number]: number }>((obj, event) => {
    if (event.type === EventType.Cast && event.sourceID === playerId) {
      obj[event.ability.guid] = (obj[event.ability.guid] ?? 0) + 1;
    }
    return obj;
  }, {});

export default metric(castCount);
