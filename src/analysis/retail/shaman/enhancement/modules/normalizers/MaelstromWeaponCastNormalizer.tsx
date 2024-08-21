import { AnyEvent, EventType, HasAbility, HasRelatedEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { MAELSTROM_WEAPON_INSTANT_CAST } from './EventLinkNormalizer';
import { MAELSTROM_WEAPON_ELIGIBLE_SPELLS } from '../../constants';
import { Options } from 'parser/core/Analyzer';
import { NormalizerOrder } from './constants';

/** This normalizer removes the begincast event, and fabricated beginchannel and endchannel
 * events for instant cast enhancement spells */

const MAELSTROM_WEAPON_ELIGIBLE_SPELL_IDs = MAELSTROM_WEAPON_ELIGIBLE_SPELLS.map(
  (spell) => spell.id,
);

class MaelstromWeaponCastNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);

    // this normalizer depends on the event link normalizer to have already run, so setting a lower priority to enforce later execution (higher value = lower priority)
    this.priority = NormalizerOrder.MaelstromWeaponCastNormalizer;
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    events.forEach((event: AnyEvent) => {
      if (HasAbility(event) && MAELSTROM_WEAPON_ELIGIBLE_SPELL_IDs.includes(event.ability.guid)) {
        if (
          event.type === EventType.BeginCast ||
          event.type === EventType.BeginChannel ||
          event.type === EventType.EndChannel
        ) {
          // probably do something here
        }
      }
      fixedEvents.push(event);
    });
    return fixedEvents;
  }
}


export default MaelstromWeaponCastNormalizer;
