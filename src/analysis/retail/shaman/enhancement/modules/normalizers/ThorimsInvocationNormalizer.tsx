import spells from 'common/SPELLS/shaman';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const MAX_LOOK_FORWARD_MS = 10;
export class ThorimsInvocationNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    const thorimsInvocationCastIds = [
      spells.LIGHTNING_BOLT.id,
      TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT.id,
    ];
    const windstrikeId = spells.WINDSTRIKE_CAST.id;
    const relevantIds = [windstrikeId, ...thorimsInvocationCastIds];

    events.forEach((event: AnyEvent, idx: number) => {
      fixedEvents.push(event);

      // non-cast events are irrelevant
      if (event.type !== EventType.Cast) {
        return;
      }

      // only interested in Lightning Bolt and Chain Lightning
      const spellId = event.ability.guid;
      if (!relevantIds.includes(spellId)) {
        return;
      }

      // For ChL and LB casts, look forward in the current timestamp
      // for a Windstrike cast
      if (thorimsInvocationCastIds.includes(spellId)) {
        for (let forwardIndex = idx; forwardIndex < events.length; forwardIndex += 1) {
          const forwardEvent = events[forwardIndex];
          // The windstrike and auto cast occur on the same timestamp
          if (forwardEvent.timestamp - event.timestamp > MAX_LOOK_FORWARD_MS) {
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
        }
      }

      // Move non-freecast Windstrikes to be the first event on the timestamp
      if (spellId === windstrikeId) {
        let furthestBackIdx = 0;
        for (let backwardsIndex = idx; backwardsIndex >= 0; backwardsIndex -= 1) {
          const backwardsEvent = events[backwardsIndex];
          if (
            backwardsEvent.type !== EventType.FreeCast &&
            backwardsEvent.type !== EventType.Cast
          ) {
            continue;
          }
          if (!thorimsInvocationCastIds.includes(backwardsEvent.ability.guid)) {
            continue;
          }
          if (event.timestamp - backwardsEvent.timestamp > MAX_LOOK_FORWARD_MS) {
            if (furthestBackIdx > 0) {
              fixedEvents.splice(idx, 1);
              fixedEvents.splice(furthestBackIdx, 0, {
                ...event,
                timestamp: events[furthestBackIdx].timestamp,
                __reordered: true,
                __modified: true,
              });
            }
            break;
          }
          furthestBackIdx = backwardsIndex;
        }
      }
    });

    return fixedEvents;
  }
}
