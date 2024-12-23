import { AnyEvent, ApplyBuffEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';

const FERAL_SPIRIT_BUFFS = [
  SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE.id,
  SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE.id,
  SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON.id,
  SPELLS.FERAL_SPIRIT_BUFF_EARTHEN_WEAPON.id,
];
const ELEMENTAL_SPIRIT_DURATION = 15000;

class ElementalSpiritsPrepullNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    if (this.selectedCombatant.hasTalent(TALENTS.FERAL_SPIRIT_TALENT)) {
      const handledEvents = new Set<number>();
      const newEvents: AnyEvent[] = [];

      // for each elemental spirit buff, look for the first removebuff and find or fabricate a matching applybuff
      FERAL_SPIRIT_BUFFS.forEach((spellId) => {
        events.forEach((event, index) => {
          if (event.timestamp - this.owner.fight.start_time >= ELEMENTAL_SPIRIT_DURATION) {
            return;
          }

          // find first removebuff of an elemental spirit buff
          if (event.type === EventType.RemoveBuff && event.ability.guid === spellId) {
            // look for a matching applybuff
            for (let backwardsIndex = index - 1; backwardsIndex >= 0; backwardsIndex -= 1) {
              const backwardsEvent = events[backwardsIndex];
              if (
                !handledEvents.has(backwardsIndex) &&
                backwardsEvent.type === EventType.ApplyBuff &&
                backwardsEvent.ability.guid === event.ability.guid &&
                Math.abs(event.timestamp - backwardsEvent.timestamp - ELEMENTAL_SPIRIT_DURATION) <=
                  100
              ) {
                handledEvents.add(backwardsIndex);
                return;
              }
            }

            // didn't find one, so fabricate it
            const applyBuff: ApplyBuffEvent = {
              ability: event.ability,
              targetID: event.targetID,
              sourceID: event.sourceID,
              targetIsFriendly: true,
              sourceIsFriendly: true,
              type: EventType.ApplyBuff,
              timestamp: event.timestamp - ELEMENTAL_SPIRIT_DURATION,
              __fabricated: true,
            };
            newEvents.push(applyBuff);

            return;
          }
        });
      });
      events.splice(0, 0, ...newEvents);
    }

    return events;
  }
}

export default ElementalSpiritsPrepullNormalizer;
