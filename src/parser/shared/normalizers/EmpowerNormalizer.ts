import {
  CastEvent,
  EmpowerEndEvent,
  EventType,
  GetRelatedEvent,
  HasRelatedEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER, TALENTS_MONK } from 'common/TALENTS';

// Maybe get a reasonable list of empower spells that doesnt require manual updating ?
const EMPOWERS = [
  // Shared
  SPELLS.FIRE_BREATH.id,
  SPELLS.FIRE_BREATH_FONT.id,
  // Devastation
  SPELLS.ETERNITY_SURGE.id,
  SPELLS.ETERNITY_SURGE_FONT.id,
  // Augmentation
  SPELLS.UPHEAVAL.id,
  SPELLS.UPHEAVAL_FONT.id,
  // Preservation
  // TALENTS.SPIRITBLOOM_TALENT.id,
  SPELLS.SPIRITBLOOM_FONT.id,
  TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
  SPELLS.DREAM_BREATH_FONT.id,
  SPELLS.AZERITE_SURGE.id,
  TALENTS_MONK.SLICING_WINDS_TALENT.id,
];

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
 *
 * To handle this we look at the complementary buff with the spell id and trigger an EmpowerCancel event when the BuffRemove event happens.
 * There are a few spells that do not have a logged buff attached which instead get the EmpowerCancel event attached to the CastEvent itself
 * */
class EmpowerNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    // Set to high priority so it runs before other normalizers
    this.priority -= 100;
  }
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
