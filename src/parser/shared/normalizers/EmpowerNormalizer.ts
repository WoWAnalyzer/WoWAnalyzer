import {
  AddRelatedEvent,
  CastEvent,
  EmpowerEndEvent,
  EventType,
  GetRelatedEvent,
  HasRelatedEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import Abilities from 'parser/core/modules/Abilities';

const EMPOWERS: number[] = [];

export const EMPOWER_CAST = 'EmpoweredCast';
export const EMPOWER_END = 'EmpowerEnd';

const EMPOWERED_CAST_BUFFER = 6000;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: EMPOWER_CAST,
    reverseLinkRelation: EMPOWER_END,
    linkingEventId: EMPOWERS,
    linkingEventType: EventType.EmpowerEnd,
    referencedEventId: EMPOWERS,
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
  },
];

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
    super(options, EVENT_LINKS);
    this.owner
      .getModule(Abilities)
      ?.abilitiesThatAreEmpowers.forEach((a: number) => EMPOWERS.push(a));
    console.log(EMPOWERS);
    this.active = EMPOWERS.length > 0;
    //Run ASAP
    this.priority = this.owner.getModule(Abilities).priority;
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
  return HasRelatedEvent(event, EMPOWER_END);
}
/** Get the associated empowerEnd event for an Empower cast */
export function getEmpowerEndEvent(event: CastEvent): EmpowerEndEvent | undefined {
  return GetRelatedEvent(event, EMPOWER_END, (e) => e.type === EventType.EmpowerEnd);
}

export function getEmpowerCastEvent(event: EmpowerEndEvent): CastEvent | undefined {
  return GetRelatedEvent(event, EMPOWER_CAST, (e) => e.type === EventType.Cast);
}

export default EmpowerNormalizer;
