import EventsNormalizer from 'parser/core/EventsNormalizer';
import { AnyEvent, EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Analyzer';
import { TALENTS_SHAMAN } from 'common/TALENTS';

/** This normalizer adds a fabricated cast event when deeply rooted elements procs
 * to simulate a cast of Ascendance for the major cooldown analyzer */

const ASCENDANCE_ID = TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT.id;

class AscendanceNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.DEEPLY_ROOTED_ELEMENTS_TALENT);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    events.forEach((event: AnyEvent, idx: number) => {
      if (event.type === EventType.ApplyBuff && event.ability.guid === ASCENDANCE_ID) {
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

export default AscendanceNormalizer;
