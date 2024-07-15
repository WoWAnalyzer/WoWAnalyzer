import Spell from 'common/SPELLS/Spell';
import SPELLS from 'common/SPELLS/classic/warlock';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { AnyEvent, CastEvent, EventType, HasSource } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const PREPULL_BUFFS = {
  [SPELLS.METAMORPHOSIS.id]: SPELLS.METAMORPHOSIS,
};
/**
 * Metamorphosis is supposed to be used prepull when snapshotting Mastery, leading to a missing cast event in logs.
 * This fabricates it if applyBuff is detected at fight start time.
 */
export default class MetamorphosisNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const newEvents = [...events];

    for (const event of events) {
      if (HasSource(event) && event.sourceID !== this.selectedCombatant.id) {
        continue;
      }
      if (
        event.type === EventType.ApplyBuff &&
        Object.values(PREPULL_BUFFS).some((buff) => buff.id === event.ability.guid) &&
        event.timestamp === this.owner.fight.start_time
      ) {
        const castEvent = PREPULL_BUFFS[event.ability.guid];

        const fabricatedEvents = this.fabricatePrepullEvent(castEvent);
        for (const event of fabricatedEvents) {
          newEvents.unshift(event);
        }
        break;
      }
    }
    return newEvents;
  }

  fabricatePrepullEvent(actualBuff: Spell): AnyEvent[] {
    const timestamp = this.owner.fight.start_time;
    const application = {
      timestamp,
      type: EventType.Cast,
      ability: {
        guid: actualBuff.id,
        name: actualBuff.name,
        abilityIcon: actualBuff.icon,
        type: MAGIC_SCHOOLS.ids.SHADOW,
      },

      sourceID: this.selectedCombatant.id,
      targetID: this.selectedCombatant.id,
      sourceIsFriendly: true,
      targetIsFriendly: true,
      __fabricated: true,
    } satisfies CastEvent;

    return [application];
  }
}
