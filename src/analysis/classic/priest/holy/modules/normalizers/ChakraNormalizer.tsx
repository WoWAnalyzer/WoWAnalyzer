import type Spell from 'common/SPELLS/Spell';
import SPELLS from 'common/SPELLS/classic';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { AnyEvent, ApplyBuffEvent, EventType, HasSource } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const CHAKRA_BUFFS = {
  [SPELLS.HOLY_WORD_CHASTISE.id]: SPELLS.CHAKRA_CHASTISE_BUFF,
  [SPELLS.HOLY_WORD_SANCTUARY.id]: SPELLS.CHAKRA_SANCTUARY_BUFF,
  [SPELLS.HOLY_WORD_SERENITY.id]: SPELLS.CHAKRA_SERENITY_BUFF,
};

/**
 * The Chakra buffs in classic Cata are not logged if applied pre-pull. This fabricates one on pull if missing.
 */
export default class ChakraNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const newEvents = [...events];

    for (const event of events) {
      if (HasSource(event) && event.sourceID !== this.selectedCombatant.id) {
        continue;
      }
      if (
        event.type === EventType.ApplyBuff &&
        Object.values(CHAKRA_BUFFS).some((buff) => buff.id === event.ability.guid)
      ) {
        // we have seen a chakra applybuff before any removals, this means that we started with no Chakra or that there is another fabricated application due to seeing a removal without an apply
        break;
      }
      if (event.type === EventType.Cast && CHAKRA_BUFFS[event.ability.guid]) {
        const actualBuff = CHAKRA_BUFFS[event.ability.guid];

        const fabricatedEvents = this.fabricateChakraChange(actualBuff);
        for (const event of fabricatedEvents) {
          newEvents.unshift(event);
        }
        break;
      }
    }

    return newEvents;
  }

  fabricateChakraChange(actualBuff: Spell): AnyEvent[] {
    const timestamp = this.owner.fight.start_time;
    const application = {
      timestamp,
      type: EventType.ApplyBuff,
      ability: {
        guid: actualBuff.id,
        name: actualBuff.name,
        abilityIcon: actualBuff.icon,
        type: MAGIC_SCHOOLS.ids.HOLY,
      },

      sourceID: this.selectedCombatant.id,
      targetID: this.selectedCombatant.id,
      sourceIsFriendly: true,
      targetIsFriendly: true,
      __fabricated: true,
    } satisfies ApplyBuffEvent;

    return [application];
  }
}
