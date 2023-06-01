import spells from 'common/SPELLS/shaman';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

export class ThorimsInvocationNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    const thorimsInvocationCastIds = [
      spells.LIGHTNING_BOLT.id,
      TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT.id,
    ];
    const windstrikeId = spells.WINDSTRIKE_CAST.id;

    events.forEach((event: AnyEvent, idx: number) => {
      fixedEvents.push(event);

      // non-cast events are irrelevant
      if (event.type !== EventType.Cast) {
        return;
      }

      // only interested in Lightning Bolt and Chain Lightning
      const spellId = event.ability.guid;
      if (!thorimsInvocationCastIds.includes(spellId)) {
        return;
      }

      // eslint-disable-next-line no-debugger
      debugger;

      // Look forward for a Windstrike cast
      for (let forwardIndex = idx; forwardIndex < events.length; forwardIndex += 1) {
        const forwardEvent = events[forwardIndex];
        // The windstrike and auto cast occur on the same timestamp
        if (forwardEvent.timestamp - event.timestamp > 0) {
          break;
        }

        if (forwardEvent.type !== EventType.Cast || forwardEvent.ability.guid !== windstrikeId) {
          continue;
        }

        fixedEvents.splice(idx, 1);
        fixedEvents.push({
          ...event,
          type: EventType.FreeCast,
          __modified: true,
          __reordered: true,
        });
        break;
      }
    });

    return fixedEvents;
  }
}
