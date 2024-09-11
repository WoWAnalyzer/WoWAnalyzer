import SPELLS from 'common/SPELLS/shaman';
import { Options } from 'parser/core/Analyzer';
import { AnyEvent, EventType, HasAbility } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { NormalizerOrder } from './constants';

class MaestromRefreshBuffNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);

    this.priority = NormalizerOrder.MaelstromWeaponRefreshBuffNormalizer;
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    for (let index = 0; index < events.length; index += 1) {
      const event = events[index];
      if (
        event.type === EventType.RefreshBuff &&
        event.ability.guid === SPELLS.MAELSTROM_WEAPON_BUFF.id
      ) {
        // if the prior event is a) on the same timestmap and b) applybuff or applybuffstack, remove this event
        // for the sake of simplicity, assume that the very first event isn't a maelstrom gain
        const priorEvent = events[index - 1];
        if (
          HasAbility(priorEvent) &&
          Math.abs(priorEvent.timestamp - event.timestamp) <= 5 &&
          [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RemoveBuffStack].includes(
            priorEvent.type,
          ) &&
          priorEvent.ability.guid === SPELLS.MAELSTROM_WEAPON_BUFF.id
        ) {
          continue;
        }
      }
      fixedEvents.push(event);
    }
    return fixedEvents;
  }
}

export default MaestromRefreshBuffNormalizer;
