import { Options } from 'parser/core/Analyzer';
import {
  AnyEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  EventType,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import TALENTS from 'common/TALENTS/warlock';
import SPELLS from 'common/SPELLS';

const debug = false;

class PowerSiphonBuffCastNormalizer extends EventsNormalizer {
  // Power Siphon is often cast on prepull so we can start the encounter with
  // two charges of demonic cores already up, this adds both the cast event and
  // the second applybuffstack event to the prepull.

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.POWER_SIPHON_TALENT);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    let siphonedTwoImps = false;
    const firstEventIndex = this.getFightStartIndex(events);
    const firstTimestamp = events[firstEventIndex].timestamp;
    let prepullApplyEvent: ApplyBuffEvent | undefined;
    let prepullApplyIndex = -1;

    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];

      if (
        event.type === EventType.ApplyBuff &&
        event.ability.guid === SPELLS.POWER_SIPHON_BUFF.id
      ) {
        // expects the first applybuff to be on prepull, if its not then we didnt cast PS on prepull
        debug && this.log(`PS ApplyBuff ${event.timestamp - firstTimestamp}ms after pull`);
        if (event.timestamp !== firstTimestamp) {
          break;
        }
        prepullApplyIndex = i;
        prepullApplyEvent = event;
      }

      if (
        event.type === EventType.RemoveBuffStack &&
        event.ability.guid === SPELLS.POWER_SIPHON_BUFF.id
      ) {
        debug && this.log('PS RemoveBuffStack, did prepull?', prepullApplyEvent ? 'yes' : 'no');
        if (prepullApplyEvent) {
          siphonedTwoImps = true;
        }
      }
    }

    if (!prepullApplyEvent) {
      debug && this.log("Didn't do PS on prepull");
      return events;
    }

    // finding 2nd PS cast to set an estimated cast time for the prepull PS
    for (const event of events) {
      if (
        event.type === EventType.Cast &&
        event.ability.guid === TALENTS.POWER_SIPHON_TALENT.id &&
        event.timestamp - 30000 < prepullApplyEvent.timestamp
      ) {
        prepullApplyEvent.timestamp = event.timestamp - 30000;
      }
    }

    debug && this.log('removed prepull PS ApplyBuff');
    events.splice(prepullApplyIndex, 1);

    debug && this.log('Adding PS CastEvent to prepull');
    const fabCastEvent: CastEvent = {
      ability: {
        abilityIcon: TALENTS.POWER_SIPHON_TALENT.icon,
        name: TALENTS.POWER_SIPHON_TALENT.name,
        guid: TALENTS.POWER_SIPHON_TALENT.id,
        type: 32,
      },
      sourceID: this.selectedCombatant.id,
      sourceIsFriendly: true,
      timestamp: prepullApplyEvent.timestamp,
      type: EventType.Cast,
      targetIsFriendly: true,
      prepull: true,
      __fabricated: true,
    };

    events.unshift(fabCastEvent);

    if (siphonedTwoImps) {
      debug && this.log('Adding PS ApplyBuffStack to prepull');
      const sID = prepullApplyEvent.sourceID || -1;
      const fabApplyBuffStackEvent: ApplyBuffStackEvent = {
        ...prepullApplyEvent,
        stack: 2,
        sourceID: sID,
        type: EventType.ApplyBuffStack,
        timestamp: prepullApplyEvent.timestamp,
      };

      events.unshift(fabApplyBuffStackEvent);
    }

    events.unshift(prepullApplyEvent);

    return events;
  }
}

export default PowerSiphonBuffCastNormalizer;
