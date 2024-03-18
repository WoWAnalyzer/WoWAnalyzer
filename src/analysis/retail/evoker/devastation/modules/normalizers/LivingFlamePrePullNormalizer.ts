import SPELLS from 'common/SPELLS/evoker';
import { AnyEvent, BeginCastEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { isFromBurnout } from './CastLinkNormalizer';
import Haste from 'parser/shared/modules/Haste';

/**
 * Living flame is the most commonly pre-pull casted spell for Devastation
 * however it often occurs that you'll start channeling it pre-pull and only
 * the cast success event (PrePullNormalizer doesn't account for this since we don't have a way to define instant cast spells)
 * will trigger, this messes with how we handle GCDs and makes for a messy timeline.
 *
 * This normalizer aims to correct those situation
 */
class LivingFlamePrePullNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
    haste: Haste,
  };
  protected haste!: Haste;
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    let lastBeginCastEvent: BeginCastEvent | undefined;

    events.forEach((event) => {
      if (!lastBeginCastEvent) {
        if (
          event.type === EventType.BeginCast &&
          event.ability.guid === SPELLS.LIVING_FLAME_CAST.id
        ) {
          lastBeginCastEvent = event;
        }

        if (
          event.type === EventType.Cast &&
          event.ability.guid === SPELLS.LIVING_FLAME_CAST.id &&
          !isFromBurnout(event)
        ) {
          fixedEvents.push({
            ...event,
            // Try to get the proper GCD time
            timestamp: event.timestamp - 1500 / (1 + this.haste.current),
            __modified: true,
            prepull: true,
          });
          return;
        }
      }
      fixedEvents.push(event);
    });
    return fixedEvents;
  }
}
export default LivingFlamePrePullNormalizer;
