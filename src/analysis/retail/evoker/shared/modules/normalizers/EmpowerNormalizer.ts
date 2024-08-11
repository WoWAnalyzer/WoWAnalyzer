import TALENTS from 'common/TALENTS/evoker';
import {
  AddRelatedEvent,
  AnyEvent,
  CastEvent,
  EmpowerEndEvent,
  EventType,
  GetRelatedEvent,
  HasRelatedEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EMPOWERS } from '../../constants';

const TIP_THE_SCALES_CONSUME = 'TipTheScalesConsume';
export const EMPOWERED_CAST = 'EmpoweredCast';

const EMPOWERED_CAST_BUFFER = 6000;
const TIP_THE_SCALES_CONSUME_BUFFER = 25;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: TIP_THE_SCALES_CONSUME,
    reverseLinkRelation: TIP_THE_SCALES_CONSUME,
    linkingEventId: TALENTS.TIP_THE_SCALES_TALENT.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: EMPOWERS,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: TIP_THE_SCALES_CONSUME_BUFFER,
    backwardBufferMs: TIP_THE_SCALES_CONSUME_BUFFER,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS.TIP_THE_SCALES_TALENT);
    },
  },
  {
    linkRelation: EMPOWERED_CAST,
    reverseLinkRelation: EMPOWERED_CAST,
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
 * so we will also create fabricate the missing EmpowerEnd events. */
class EmpowerNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    // Set to high priority so it runs before other normalizers
    this.priority -= 100;
  }

  /** Create EmpowerEnd events for Empowers cast with Tip the Scales
   * Also creates EMPOWERED_CAST link between the Cast and EmpowerEnd event */
  normalize(rawEvents: AnyEvent[]): AnyEvent[] {
    // Create initial EventLinks that we can then reference later
    const events = super.normalize(rawEvents);

    const fixedEvents: AnyEvent[] = [];
    const hasFont =
      this.owner.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT) ||
      this.owner.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT) ||
      this.owner.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_PRESERVATION_TALENT);

    events.forEach((event) => {
      if (event.type !== EventType.Cast || !isFromTipTheScales(event)) {
        fixedEvents.push(event);
        return;
      }

      const fabricatedEvent: EmpowerEndEvent = {
        ability: event.ability,
        timestamp: event.timestamp,
        sourceID: event.sourceID,
        sourceIsFriendly: event.sourceIsFriendly,
        targetID: event.targetID,
        targetIsFriendly: event.targetIsFriendly,
        type: EventType.EmpowerEnd,
        empowermentLevel: hasFont ? 4 : 3,
        __fabricated: true,
      };

      AddRelatedEvent(event, EMPOWERED_CAST, fabricatedEvent);
      AddRelatedEvent(fabricatedEvent, EMPOWERED_CAST, event);

      fixedEvents.push(event);
      fixedEvents.push(fabricatedEvent);
    });
    return fixedEvents;
  }
}

/** Returns true if the Empower was instant cast with Tip the Scales */
export function isFromTipTheScales(event: CastEvent): boolean {
  return HasRelatedEvent(event, TIP_THE_SCALES_CONSUME);
}

/** Use this to verify if an Empower was cancelled or finished casting.
 *
 * Returns true if the Empower was instant cast with Tip the Scales or if it has an associated empowerEnd event  */
export function empowerFinishedCasting(event: CastEvent): boolean {
  return HasRelatedEvent(event, EMPOWERED_CAST) || isFromTipTheScales(event);
}

/** Get the associated empowerEnd event for an Empower cast */
export function getEmpowerEndEvent(event: CastEvent): EmpowerEndEvent | undefined {
  return GetRelatedEvent(event, EMPOWERED_CAST, (e) => e.type === EventType.EmpowerEnd);
}

export default EmpowerNormalizer;
