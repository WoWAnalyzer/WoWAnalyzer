import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

class DireCommandNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    const killCommandCastId = TALENTS_HUNTER.KILL_COMMAND_BEAST_MASTERY_TALENT.id;
    const direBeastCastId = [TALENTS_HUNTER.DIRE_BEAST_TALENT.id, SPELLS.DIRE_BEAST_GLYPHED.id];
    const direBeastSummonCastId = [SPELLS.DIRE_BEAST_SUMMON.id, SPELLS.DIRE_BEAST_GLYPHED.id];
    const relevantIds = [killCommandCastId, ...direBeastCastId];
    const bufferMs = 50;

    events.forEach((event: AnyEvent, idx: number) => {
      //We are only interested in Kill Command and Dire Beast casts
      fixedEvents.push(event);
      if (event.type !== EventType.Cast) {
        return;
      }
      const spellId = event.ability.guid;
      if (!relevantIds.includes(spellId)) {
        return;
      }
      //If it's a Dire Beast cast we need to look forward for a Kill Command cast to identify if it's a Dire Command proc
      //If it is we have to change it's type to FreeCast
      if (direBeastCastId.includes(spellId)) {
        for (let forwardIndex = idx; forwardIndex < events.length; forwardIndex += 1) {
          const forwardEvent = events[forwardIndex];
          if (forwardEvent.type !== EventType.Cast) {
            continue;
          }
          if (forwardEvent.ability.guid !== killCommandCastId) {
            continue;
          }
          if (forwardEvent.timestamp - event.timestamp > bufferMs) {
            break;
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
      }

      //If it's a Kill Command cast we need to look backward for a Dire Beast cast to identify if it's a Dire Command proc
      //if it is we have to move it backwards in the event list
      if (spellId === killCommandCastId) {
        let furthestBackIdx = 0;
        for (let backwardsIndex = idx; backwardsIndex >= 0; backwardsIndex -= 1) {
          const backwardsEvent = events[backwardsIndex];
          if (
            backwardsEvent.type !== EventType.Cast &&
            backwardsEvent.type !== EventType.FreeCast
          ) {
            continue;
          }
          if (!direBeastSummonCastId.includes(backwardsEvent.ability.guid)) {
            continue;
          }
          if (event.timestamp - backwardsEvent.timestamp > bufferMs) {
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
export default DireCommandNormalizer;
