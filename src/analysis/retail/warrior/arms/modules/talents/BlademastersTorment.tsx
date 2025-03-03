import EventsNormalizer from 'parser/core/EventsNormalizer';
import { AnyEvent, EventType } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/warrior';
import { Options } from 'parser/core/Module';

export default class BlademastersTormentNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLADEMASTERS_TORMENT_TALENT);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];

    const bladestormId = TALENTS.BLADESTORM_TALENT.id;
    const avatarId = TALENTS.AVATAR_TALENT.id;
    const relevantIds = [bladestormId, avatarId];
    const bufferMs = 50;

    events.forEach((event: AnyEvent, idx: number) => {
      //We are only interested in Kill Command and Dire Beast casts
      fixedEvents.push(event);
      if (event.type !== EventType.Cast) {
        return;
      }
      const spellId = event.ability.guid;
      if (!relevantIds.includes(spellId)) {
        return;
      }

      // if it's a Bladestorm cast, we need to check before it to see if there was an Avatar cast
      if (spellId === bladestormId) {
        for (let backwardsIndex = idx; backwardsIndex >= 0; backwardsIndex -= 1) {
          const backwardsEvent = events[backwardsIndex];
          if (event.timestamp - backwardsEvent.timestamp > bufferMs) {
            continue;
          }
          if (
            backwardsEvent.type !== EventType.Cast &&
            backwardsEvent.type !== EventType.FreeCast
          ) {
            continue;
          }
          if (backwardsEvent.ability.guid !== avatarId) {
            continue;
          }
          fixedEvents.splice(idx, 1);
          fixedEvents.push({
            ...event,
            type: EventType.FreeCast,
            __modified: true,
          });
        }
      }

      // if it's an Avatar cast, we need to check before it to see if there was a Bladestorm cast
      if (spellId === avatarId) {
        for (let backwardsIndex = idx; backwardsIndex >= 0; backwardsIndex -= 1) {
          const backwardsEvent = events[backwardsIndex];
          if (event.timestamp - backwardsEvent.timestamp > bufferMs) {
            continue;
          }
          if (
            backwardsEvent.type !== EventType.Cast &&
            backwardsEvent.type !== EventType.FreeCast
          ) {
            continue;
          }
          if (backwardsEvent.ability.guid !== bladestormId) {
            continue;
          }
          fixedEvents.splice(idx, 1);
          fixedEvents.push({
            ...event,
            type: EventType.FreeCast,
            __modified: true,
          });
        }
      }
    });

    return fixedEvents;
  }
}
