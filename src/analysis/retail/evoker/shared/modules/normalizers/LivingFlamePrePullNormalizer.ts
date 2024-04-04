import { isFromBurnout } from 'analysis/retail/evoker/devastation/modules/normalizers/CastLinkNormalizer';
import SPELLS from 'common/SPELLS/evoker';
import { AnyEvent, BeginCastEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import Haste from 'parser/shared/modules/Haste';
import { isRealCast } from 'parser/shared/normalizers/Channeling';

/**
 * Living flame is a very common pre-pull cast
 * however it often occurs that you'll start channeling it pre-pull and only
 * the cast success event will trigger, this messes with how we handle GCDs and makes for a messy timeline
 * (PrePullNormalizer doesn't account for this since we don't have a way to define instant cast spells)
 *
 * This normalizer aims to correct those situation */
class LivingFlamePrePullNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
    haste: Haste,
  };
  protected haste!: Haste;
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = events;

    for (let eventIdx = 0; eventIdx < fixedEvents.length; eventIdx += 1) {
      const event = fixedEvents[eventIdx];
      // The first seen cast is not the proper type
      if (
        (event.type === EventType.BeginCast ||
          event.type === EventType.EmpowerStart ||
          event.type === EventType.EmpowerEnd) &&
        event.sourceID === this.owner.selectedCombatant.id
      ) {
        break;
      }

      // Check the first seen cast
      if (
        event.type === EventType.Cast &&
        isRealCast(event) &&
        event.sourceID === this.owner.selectedCombatant.id
      ) {
        // First cast found is not living flame or was instant
        if (event.ability.guid !== SPELLS.LIVING_FLAME_CAST.id || isFromBurnout(event)) {
          break;
        }

        // Fabricate the pre-pull event
        const startTime = Math.floor(event.timestamp - 1500 / (1 + this.haste.current));

        const beginCastEvent: BeginCastEvent = {
          ability: event.ability,
          type: EventType.BeginCast,
          timestamp: startTime,
          castEvent: event,
          channel: {
            type: EventType.BeginChannel,
            timestamp: startTime,
            ability: event.ability,
            sourceID: event.sourceID,
            isCancelled: false,
          },
          isCancelled: false,
          sourceID: event.sourceID,
          sourceIsFriendly: event.sourceIsFriendly,
          target: event.target ?? {
            name: 'Environment',
            id: -1,
            guid: 0,
            type: 'NPC',
            icon: 'NPC',
          },
          targetIsFriendly: event.targetIsFriendly,
          __fabricated: true,
          prepull: true,
        };

        fixedEvents.splice(eventIdx, 0, beginCastEvent);
        break;
      }
    }

    return fixedEvents;
  }
}
export default LivingFlamePrePullNormalizer;
