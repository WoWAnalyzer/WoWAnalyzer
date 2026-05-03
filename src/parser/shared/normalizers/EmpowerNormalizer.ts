import {
  AddRelatedEvent,
  CastEvent,
  EmpowerEndEvent,
  EventType,
  GetRelatedEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import Abilities from 'parser/core/modules/Abilities';

export const EMPOWER_CAST = 'EmpoweredCast';
export const EMPOWER_END = 'EmpowerEnd';

const EMPOWERED_CAST_BUFFER = 6000;

/** Creates links between cast Events and EmpowerEnd events for Empowers which can then be
 * used to verify whether the cast was finished or cancelled - will also create links between
 * Empower cast that consumed Tip the Scales.
 *
 * Empowers cast with Tip the Scales doesn't produce an EmpowerEnd event, only Cast event
 * so we will also create fabricate the missing EmpowerEnd events.
 *
 * Empowers can be released at empowerment level 0, which actually is a cancelled cast,
 * since the empower doesn't go on cooldown or trigger anything.
 * The handling of this happens in the channeling module
 *
 * */
class EmpowerNormalizer extends EventLinkNormalizer {
  static dependencies = {
    ...EventLinkNormalizer.dependencies,
    abilities: Abilities,
  };
  constructor(options: Options) {
    super(options, []);

    const empowers = this.owner // can abstract this to a method in abilities, but don't really think we need to tbh
      .getModule(Abilities)
      .activeAbilities.filter((a) => a.isEmpower)
      .flatMap((a) => a.spell);

    this.active = empowers.length > 0;

    this.eventLinks.push({
      linkRelation: EMPOWER_CAST,
      reverseLinkRelation: EMPOWER_END,
      linkingEventId: empowers,
      linkingEventType: EventType.EmpowerEnd,
      referencedEventId: empowers,
      referencedEventType: EventType.Cast,
      /** We only look backwards from the empowerEnd event to not accidentally add the link to a cancelled cast */
      backwardBufferMs: EMPOWERED_CAST_BUFFER,
      anyTarget: true,
      maximumLinks: 1,
      additionalCondition(linkingEvent, referencedEvent) {
        return (
          (linkingEvent as EmpowerEndEvent).empowermentLevel > 0 &&
          (linkingEvent as EmpowerEndEvent).ability.guid ===
            (referencedEvent as CastEvent).ability.guid
        );
      },
    });
  }
}

/** Use this to retroactively create a cast link */
export function createCastEndLink(castEvent: CastEvent, empowerEndEvent: EmpowerEndEvent) {
  AddRelatedEvent(castEvent, EMPOWER_END, empowerEndEvent);
  AddRelatedEvent(empowerEndEvent, EMPOWER_CAST, castEvent);
}

/** Use this to verify if an Empower was cancelled or finished casting.
 *
 * Returns true if the Empower was instant cast with Tip the Scales or if it has an associated empowerEnd event  */
export function empowerFinishedCasting(event: CastEvent): boolean {
  const endEvent: EmpowerEndEvent | undefined = GetRelatedEvent(event, EMPOWER_END);
  return endEvent !== undefined && endEvent.empowermentLevel > 0;
}
/** Get the associated empowerEnd event for an Empower cast */
export function getEmpowerEndEvent(event: CastEvent): EmpowerEndEvent | undefined {
  return GetRelatedEvent(event, EMPOWER_END, (e) => e.type === EventType.EmpowerEnd);
}

export function getEmpowerCastEvent(event: EmpowerEndEvent): CastEvent | undefined {
  return GetRelatedEvent(event, EMPOWER_CAST, (e) => e.type === EventType.Cast);
}

export default EmpowerNormalizer;
