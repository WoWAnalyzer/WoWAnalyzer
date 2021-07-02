import { EventType } from 'parser/core/Events';
import stat, { Stat } from 'parser/core/stat';

const castCount: Stat = (events, { playerId }) =>
  events.reduce<{ [spellId: number]: number }>((obj, event) => {
    if (event.type === EventType.Cast && event.sourceID === playerId) {
      obj[event.ability.guid] = (obj[event.ability.guid] ?? 0) + 1;
    }
    return obj;
  }, {});

export default stat(castCount);
