import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { MS_BUFFER_50 } from '../../shared/constants';

class DireCommandNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    const killCommandCastId = TALENTS_HUNTER.KILL_COMMAND_BEAST_MASTERY_TALENT.id;
    const direBeastSummonId = [
      SPELLS.DIRE_BEAST_SUMMON.id,
      SPELLS.DIRE_BEAST_GLYPHED.id,
      SPELLS.DARKHOUND_SUMMON.id,
    ];
    const relevantIds = [killCommandCastId, ...direBeastSummonId];

    events.forEach((event: AnyEvent, idx: number) => {
      //We are only interested in Kill Command casts and Dire Beast summons
      fixedEvents.push(event);
      if (event.type !== EventType.Summon) {
        return;
      }
      const spellId = event.ability.guid;
      if (!relevantIds.includes(spellId)) {
        return;
      }
      //If it's a Dire Beast summon we need to look backwards for a Kill Command cast to identify if it's a Dire Command proc
      //If it is we have to change it's type to FreeCast
      if (direBeastSummonId.includes(spellId)) {
        for (let backwardsIndex = idx; backwardsIndex >= 0; backwardsIndex -= 1) {
          const backwardsEvent = events[backwardsIndex];
          if (backwardsEvent.type !== EventType.Cast) {
            continue;
          }
          if (backwardsEvent.ability.guid !== killCommandCastId) {
            continue;
          }
          if (backwardsEvent.timestamp - event.timestamp > MS_BUFFER_50) {
            break;
          }
          fixedEvents.splice(idx - 1, 1, {
            ...event,
            type: EventType.FreeCast,
            __modified: true,
          });
          break;
        }
      }
    });
    return fixedEvents;
  }
}
export default DireCommandNormalizer;
