import SPELLS from 'common/SPELLS/warrior';
import TALENTS from 'common/TALENTS/warrior';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

/**
 * With the change in War Within pre-patch where Strength of Arms no longer gives 8 rage
 * when casting Overpower on a target below 35% health, the log still logs with the Strength of Arms
 * ability, so we just replace it with the Finishing Blows to get a better attribution.
 */
export default class FinishingBlowsResourceChange extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    return events.map((event) =>
      event.type === EventType.ResourceChange &&
      event.ability.guid === SPELLS.STRENGTH_OF_ARMS_RAGE.id
        ? {
            ...event,
            ability: {
              type: event.ability.type,
              abilityIcon: TALENTS.FINISHING_BLOWS_TALENT.icon,
              name: TALENTS.FINISHING_BLOWS_TALENT.name,
              guid: TALENTS.FINISHING_BLOWS_TALENT.id,
            },
          }
        : event,
    );
  }
}
