import EventsNormalizer from 'parser/core/EventsNormalizer';
import { AnyEvent, EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Analyzer';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';

/** This normalizer adds a fabricated cast event when deeply rooted elements or hot hand procs
 * to simulate a cast for the major cooldown analyzers */

const PROC_IDS = [TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT.id, SPELLS.HOT_HAND_BUFF.id];

class ProcNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_SHAMAN.DEEPLY_ROOTED_ELEMENTS_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_SHAMAN.HOT_HAND_TALENT);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    events.forEach((event: AnyEvent) => {
      if (
        (event.type === EventType.ApplyBuff || event.type === EventType.RefreshBuff) &&
        PROC_IDS.includes(event.ability.guid)
      ) {
        fixedEvents.push({
          type: EventType.Cast,
          ability: event.ability,
          sourceID: event.sourceID!,
          sourceIsFriendly: event.sourceIsFriendly,
          timestamp: event.timestamp,
          targetID: event.targetID!,
          targetIsFriendly: event.targetIsFriendly,
          __fabricated: true,
        });
      }

      fixedEvents.push(event);
    });
    return fixedEvents;
  }
}

export default ProcNormalizer;
