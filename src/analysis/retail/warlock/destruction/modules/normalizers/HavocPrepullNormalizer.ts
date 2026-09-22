import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType, ApplyDebuffEvent, CastEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

class HavocPrepullNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const fightStartTimestamp = this.owner.fight.start_time;
    const fabricatedEvents: (ApplyDebuffEvent | CastEvent)[] = [];

    for (const event of events) {
      if (!this.owner.byPlayer(event)) continue;

      if (event.type === EventType.ApplyDebuff) {
        if (event.ability?.guid !== SPELLS.HAVOC.id) continue;
        break;
      } else if (event.type === EventType.RemoveDebuff) {
        if (event.ability?.guid !== SPELLS.HAVOC.id) continue;
        fabricatedEvents.push({
          type: EventType.ApplyDebuff,
          ability: event.ability,
          sourceID: event.sourceID,
          sourceIsFriendly: event.sourceIsFriendly,
          targetID: event.targetID,
          targetInstance: event.targetInstance,
          targetIsFriendly: event.targetIsFriendly,
          timestamp: fightStartTimestamp,
          __fabricated: true,
        });
        fabricatedEvents.push({
          type: EventType.Cast,
          ability: event.ability,
          sourceID: event.sourceID ?? this.owner.playerId,
          sourceIsFriendly: event.sourceIsFriendly,
          targetID: event.targetID,
          targetInstance: event.targetInstance,
          targetIsFriendly: event.targetIsFriendly,
          timestamp: fightStartTimestamp,
          __fabricated: true,
        });
        break;
      }
    }
    return [...fabricatedEvents, ...events];
  }
}

export default HavocPrepullNormalizer;
