import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS';
import { AnyEvent, ApplyBuffEvent, EventType } from 'parser/core/Events';

class GrimoireOfSacrificeNormalizer extends EventsNormalizer {
  // Grimoire of Sacrifice is an ability that you can cast before combat, and it sacrifices your pet
  // You gain its active ability and gain a buff that lasts for 1 hour or until pet is summoned (or obviously when player dies)
  // It's easily possible to pre-cast this before combat, and never let it drop, so the only GoSac related events are "damage" events, which screws up uptime calculations

  // Iterate through events, when the FIRST GoSac thing we encounter is a "damage" event, we can assume it was precasted, so insert a fabricated "applybuff" event in the beginning
  normalize(events: AnyEvent[]) {
    const firstEventIndex = this.getFightStartIndex(events);

    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      if (
        (event.type === EventType.ApplyBuff || event.type === EventType.RemoveBuff) &&
        event.ability &&
        event.ability.guid === SPELLS.GRIMOIRE_OF_SACRIFICE_BUFF
      ) {
        // first GoSac event is applybuff or removebuff, ignore the rest, return events as they are
        break;
      }
      if (
        event.type === EventType.Damage &&
        event.sourceID &&
        event.ability &&
        event.ability.guid === SPELLS.GRIMOIRE_OF_SACRIFICE_DAMAGE.id
      ) {
        // first GoSac event is damage, add the fabricated applybuff and return
        const fabricatedEvent: ApplyBuffEvent = {
          timestamp: events[firstEventIndex].timestamp,
          type: EventType.ApplyBuff,
          sourceID: event.sourceID,
          targetID: event.sourceID,
          sourceIsFriendly: true,
          targetIsFriendly: true,
          ability: {
            guid: SPELLS.GRIMOIRE_OF_SACRIFICE_BUFF.id,
            name: SPELLS.GRIMOIRE_OF_SACRIFICE_BUFF.name,
            abilityIcon: SPELLS.GRIMOIRE_OF_SACRIFICE_BUFF.icon,
            type: 0,
          },
          __fabricated: true,
        };
        events.unshift(fabricatedEvent);
        break;
      }
    }
    return events;
  }
}

export default GrimoireOfSacrificeNormalizer;
