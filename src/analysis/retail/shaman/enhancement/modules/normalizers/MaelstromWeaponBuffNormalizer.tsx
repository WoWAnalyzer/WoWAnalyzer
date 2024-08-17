import EventsNormalizer from 'parser/core/EventsNormalizer';
import { AnyEvent, EventType, HasAbility } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/shaman';
import { Options } from 'parser/core/Analyzer';

/**
 * This normalizer removes the duplicate 'refreshbuff' events that immediately follow
 * every 'applybuff' and 'applybuffstack' event, leaving 'refreshbuff' events exclusively for
 * gains at cap
 */
class MaelstromWeaponBuffNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);
    this.priority = -100;
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    const skipEvents = new Set<number>();
    events.forEach((event: AnyEvent, idx: number) => {
      if (skipEvents.has(idx)) {
        return;
      }

      if (event.type === EventType.Cast && event.ability.guid === SPELLS.TEMPEST_CAST.id) {
        /*
         * When Tempest is cast with the Storm Swell talent, it immediately fires a RefreshBuffStack event
         * which is later considered to be a wasted stack. In log analysis it always seems to be the very next event,
         * but loop forward on the same timestamp just to be safe
         */
        for (let forwardIndex = idx + 1; forwardIndex < events.length; forwardIndex += 1) {
          const forwardEvent = events[forwardIndex];
          if (forwardEvent.timestamp - event.timestamp > 0) {
            break;
          }
          if (
            forwardEvent.type === EventType.RefreshBuff &&
            forwardEvent.ability.guid === SPELLS.MAELSTROM_WEAPON_BUFF.id
          ) {
            skipEvents.add(forwardIndex);
            break;
          }
        }
      }

      if (HasAbility(event) && event.ability.guid === SPELLS.MAELSTROM_WEAPON_BUFF.id) {
        if (event.type === EventType.ApplyBuff || event.type === EventType.ApplyBuffStack) {
          fixedEvents.push(event);
          // look for a refresh event following this one
          for (let forwardIndex = idx; forwardIndex < events.length; forwardIndex += 1) {
            const forwardEvent = events[forwardIndex];
            if (forwardEvent.timestamp - event.timestamp > 10) {
              break;
            }
            if (
              forwardEvent.type === EventType.RefreshBuff &&
              forwardEvent.ability.guid === SPELLS.MAELSTROM_WEAPON_BUFF.id
            ) {
              skipEvents.add(forwardIndex);
              break;
            }
          }
        } else if (event.type === EventType.RefreshBuff && !skipEvents.has(idx)) {
          fixedEvents.push(event);
        } else if (
          event.type === EventType.RemoveBuff ||
          event.type === EventType.RemoveBuffStack
        ) {
          fixedEvents.push(event);
        }
      } else {
        fixedEvents.push(event);
      }
    });

    return fixedEvents;
  }
}

export default MaelstromWeaponBuffNormalizer;
