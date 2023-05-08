import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

export default class BarbedShotNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    const possibleBarbedShotBuffs = [
      SPELLS.BARBED_SHOT_BUFF.id,
      SPELLS.BARBED_SHOT_BUFF_2.id,
      SPELLS.BARBED_SHOT_BUFF_3.id,
      SPELLS.BARBED_SHOT_BUFF_4.id,
      SPELLS.BARBED_SHOT_BUFF_5.id,
      SPELLS.BARBED_SHOT_BUFF_6.id,
      SPELLS.BARBED_SHOT_BUFF_7.id,
      SPELLS.BARBED_SHOT_BUFF_8.id,
    ];

    events.forEach((event: AnyEvent, idx: number) => {
      fixedEvents.push(event);
      if (event.type !== EventType.Cast) {
        return;
      }
      if (event.ability.guid !== TALENTS.BARBED_SHOT_TALENT.id) {
        return;
      }
      for (let backwardsIndex = idx; backwardsIndex >= 0; backwardsIndex -= 1) {
        const backwardsEvent = events[backwardsIndex];
        if (backwardsEvent.type !== EventType.ApplyBuff) {
          continue;
        }
        if (!possibleBarbedShotBuffs.includes(backwardsEvent.ability.guid)) {
          continue;
        }
        if (event.timestamp - backwardsEvent.timestamp > MS_BUFFER_100) {
          break;
        }
        fixedEvents.splice(idx, 1);
        fixedEvents.splice(backwardsIndex, 0, { ...event, __reordered: true });
        break;
      }
    });
    return fixedEvents;
  }
}
