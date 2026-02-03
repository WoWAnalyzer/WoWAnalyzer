import SPELLS from 'common/SPELLS';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { AnyEvent, CastEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

// Void Metamorphosis isn't considered a cast, even in WCL (as of 2nd week of 12.0.0 prepatch)
// This normalizer fabricates a proper CastEvent every time the buff is applied to the player
class VoidMetamorphosisNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];

    events.forEach((event) => {
      if (
        event.type === EventType.ApplyBuff &&
        event.ability.guid === SPELLS.VOID_METAMORPHOSIS_BUFF.id
      ) {
        console.log('void meta event', event);
        const fabricatedEvent: CastEvent = {
          timestamp: event.timestamp,
          type: EventType.Cast,
          sourceID: this.selectedCombatant.id,
          targetID: event.sourceID,
          sourceIsFriendly: true,
          targetIsFriendly: true,
          ability: {
            name: SPELLS.VOID_METAMORPHOSIS_CAST.name,
            guid: SPELLS.VOID_METAMORPHOSIS_CAST.id,
            type: MAGIC_SCHOOLS.ids.PHYSICAL,
            abilityIcon: SPELLS.VOID_METAMORPHOSIS_CAST.icon,
          },
          __fabricated: true,
        };

        fixedEvents.push(fabricatedEvent);
      }

      fixedEvents.push(event);
    });

    return fixedEvents;
  }
}

export default VoidMetamorphosisNormalizer;
