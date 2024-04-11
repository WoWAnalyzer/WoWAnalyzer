import {
  AnyEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  EmpowerEndEvent,
  EventType,
} from 'parser/core/Events';
import EmpowerNormalizer from './EmpowerNormalizer';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import EventsNormalizer from 'parser/core/EventsNormalizer';

/**
 * Leaping Flames Buff gains stacks equal to the Empowerment Level of the Fire Breath that triggered it
 * But the event is only logged as an ApplyBuffStack if the buff is refreshed, otherwise it is simply
 * and ApplyBuff - We would like to know the stack count to be able to properly attribute the hits
 * provided from this buff in the LeapingFlamesNormalizer
 * So this normalizer will change the event to be an ApplyBuffStack and attribute the appropriate stack count
 */
class LeapingFlamesBuffNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
    empowerNormalizer: EmpowerNormalizer,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LEAPING_FLAMES_TALENT);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    let empowerEvent: EmpowerEndEvent | undefined;
    let leapingApplyEvent: ApplyBuffEvent | undefined;

    const createBuffStackEvent = (
      event: ApplyBuffEvent,
      empowerLevel: number = 1,
    ): ApplyBuffStackEvent | ApplyBuffEvent => {
      if (empowerLevel === 1) {
        // There are no stacks so no need to make it a BuffStack event
        return event;
      }

      const buffEvent: ApplyBuffStackEvent = {
        ...event,
        type: EventType.ApplyBuffStack,
        stack: empowerLevel,
        sourceID: event.sourceID ?? this.selectedCombatant.id, // for some reason sourceID can be undefined on applyBuff events
        __modified: true,
      };
      return buffEvent;
    };

    events.forEach((event) => {
      if (event.type !== EventType.ApplyBuff && event.type !== EventType.EmpowerEnd) {
        fixedEvents.push(event);
        return;
      }

      if (
        event.ability.guid !== SPELLS.LEAPING_FLAMES_BUFF.id &&
        event.ability.guid !== SPELLS.FIRE_BREATH.id &&
        event.ability.guid !== SPELLS.FIRE_BREATH_FONT.id
      ) {
        fixedEvents.push(event);
        return;
      }

      if (event.type === EventType.EmpowerEnd) {
        if (leapingApplyEvent && event.timestamp >= leapingApplyEvent.timestamp) {
          // Leaping comes before Empower
          const buffEvent = createBuffStackEvent(leapingApplyEvent, event.empowermentLevel);

          fixedEvents.push(event);
          fixedEvents.push(buffEvent);

          leapingApplyEvent = undefined;
          empowerEvent = undefined;
          return;
        }

        // Leaping comes after Empower
        empowerEvent = event;
        fixedEvents.push(event);
        return;
      }

      if (event.ability.guid !== SPELLS.LEAPING_FLAMES_BUFF.id) {
        // Don't want to change the fire breath events
        fixedEvents.push(event);
        return;
      }

      if (empowerEvent && event.timestamp >= empowerEvent.timestamp) {
        // Leaping came after empower
        const buffEvent = createBuffStackEvent(event, empowerEvent.empowermentLevel);
        fixedEvents.push(buffEvent);

        leapingApplyEvent = undefined;
        empowerEvent = undefined;
        return;
      }

      leapingApplyEvent = event;
      return;
    });

    return fixedEvents;
  }
}

export default LeapingFlamesBuffNormalizer;
