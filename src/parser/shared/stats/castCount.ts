import { AnyEvent, EventType } from 'parser/core/Events';
import stat, { Info } from 'parser/core/stat';

const castCount = (events: AnyEvent[], { playerId }: Info) =>
  events.reduce<{ [spellId: number]: number }>((obj, event) => {
    if (event.type === EventType.Cast && event.sourceID === playerId) {
      obj[event.ability.guid] = (obj[event.ability.guid] ?? 0) + 1;
    }
    return obj;
  }, {});

export default stat(castCount);
