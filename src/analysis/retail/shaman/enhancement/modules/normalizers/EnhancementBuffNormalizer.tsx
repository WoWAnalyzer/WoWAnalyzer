import SPELLS from 'common/SPELLS/shaman';
import { Options } from 'parser/core/Analyzer';
import { AnyEvent, EventType, HasAbility } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { NormalizerOrder } from './constants';

class EnhancementBuffNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);

    this.priority = NormalizerOrder.MaelstromWeaponRefreshBuffNormalizer;
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    for (let index = 0; index < events.length; index += 1) {
      const event = events[index];
      if (
        index > 0 &&
        event.type === EventType.RefreshBuff &&
        [SPELLS.MAELSTROM_WEAPON_BUFF.id, SPELLS.STORM_UNLEASHED_BUFF.id].includes(
          event.ability.guid,
        )
      ) {
        const spellId = event.ability.guid;
        // if the prior event is a) on the same timestmap and b) applybuff or applybuffstack, remove this event
        // for the sake of simplicity, assume that the very first event isn't a maelstrom gain
        const priorEvent = events[index - 1];
        if (
          HasAbility(priorEvent) &&
          Math.abs(priorEvent.timestamp - event.timestamp) <= 5 &&
          [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RemoveBuffStack].includes(
            priorEvent.type,
          ) &&
          priorEvent.ability.guid === spellId
        ) {
          continue;
        }
      }

      // sometimes a tempest buff is remove then immediately reapplied, so skip both events entirely
      if (event.type === EventType.RemoveBuff && event.ability.guid === SPELLS.TEMPEST_BUFF.id) {
        const nextEvent = events[index + 1];
        if (
          nextEvent.type === EventType.ApplyBuff &&
          nextEvent.ability.guid === SPELLS.TEMPEST_BUFF.id &&
          Math.abs(nextEvent.timestamp - event.timestamp) <= 2
        ) {
          index = index + 2;
          continue;
        }
      }

      fixedEvents.push(event);
    }
    return fixedEvents;
  }
}

export default EnhancementBuffNormalizer;
