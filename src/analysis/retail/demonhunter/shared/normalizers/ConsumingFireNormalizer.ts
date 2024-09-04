import EventsNormalizer from 'parser/core/EventsNormalizer';
import { Options } from 'parser/core/Module';
import { AnyEvent, EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';

// 2024-09-03 -- Consuming Fire double logs atm, so we're gonna delete one!
export default class ConsumingFireNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEMONIC_INTENSITY_TALENT);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];

    const consumingFire1Id = SPELLS.CONSUMING_FIRE_1.id;
    const consumingFire2Id = SPELLS.CONSUMING_FIRE_2.id;
    const bufferMs = 50;

    events.forEach((event: AnyEvent, idx: number) => {
      // We are only interested in Consuming Fire casts
      fixedEvents.push(event);
      if (event.type !== EventType.Cast) {
        return;
      }
      const spellId = event.ability.guid;
      if (spellId !== consumingFire2Id) {
        return;
      }

      // If we log a "Consuming Fire 2" cast, check if there was a preceding "Consuming Fire 1" cast
      // If there was, we delete the Consuming Fire 2 cast :3
      for (let backwardsIndex = idx; backwardsIndex >= 0; backwardsIndex -= 1) {
        const backwardsEvent = events[backwardsIndex];
        if (event.timestamp - backwardsEvent.timestamp > bufferMs) {
          continue;
        }
        if (backwardsEvent.type !== EventType.Cast) {
          continue;
        }
        if (backwardsEvent.ability.guid !== consumingFire1Id) {
          continue;
        }
        fixedEvents.pop();
      }
    });

    return fixedEvents;
  }
}
