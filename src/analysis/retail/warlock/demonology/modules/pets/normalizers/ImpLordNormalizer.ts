import SPELLS from 'common/SPELLS';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { AnyEvent, CastEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

// Grimoire: Imp Lord isn't considered a cast, even in WCL
// This normalizer fabricates a proper CastEvent every time the summon occurs
class ImpLordNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];

    events.forEach((event) => {
      if (event.type === EventType.Summon && event.ability.guid === SPELLS.GRIMOIRE_IMP_LORD.id) {
        const fabricatedEvent: CastEvent = {
          timestamp: event.timestamp,
          type: EventType.Cast,
          sourceID: this.selectedCombatant.id,
          targetID: event.targetID,
          sourceIsFriendly: true,
          targetIsFriendly: true,
          ability: {
            name: SPELLS.GRIMOIRE_IMP_LORD.name,
            guid: SPELLS.GRIMOIRE_IMP_LORD.id,
            type: MAGIC_SCHOOLS.ids.Fire,
            abilityIcon: SPELLS.GRIMOIRE_IMP_LORD.icon,
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

export default ImpLordNormalizer;
