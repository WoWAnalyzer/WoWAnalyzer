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
    const skipEvents: number[] = [];
    events.forEach((event: AnyEvent, idx: number) => {
      if (HasAbility(event) && event.ability.guid === SPELLS.MAELSTROM_WEAPON_BUFF.id) {
        if (event.type === EventType.ApplyBuff || event.type === EventType.ApplyBuffStack) {
          fixedEvents.push(event);
          // look for a refresh event following this one
          for (let forwardIndex = idx; forwardIndex < events.length; forwardIndex += 1) {
            const forwardEvent = events[forwardIndex];
            if (forwardEvent.timestamp - event.timestamp > 5) {
              break;
            }
            if (
              forwardEvent.type === EventType.RefreshBuff &&
              forwardEvent.ability.guid === SPELLS.MAELSTROM_WEAPON_BUFF.id
            ) {
              skipEvents.push(forwardIndex);
              break;
            }
          }
        } else if (event.type === EventType.RefreshBuff && !skipEvents.includes(idx)) {
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
