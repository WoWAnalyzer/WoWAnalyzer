import {
  AddRelatedEvent,
  AnyEvent,
  CastEvent,
  EmpowerEndEvent,
  EventType,
  HasRelatedEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { EMPOWERS as EMPOWERS_EVOKER } from 'analysis/retail/evoker/shared';
import EmpowerNormalizer, {
  EMPOWER_CAST,
  EMPOWER_END,
} from 'parser/shared/normalizers/EmpowerNormalizer';

const TIP_THE_SCALES_CONSUME = 'TipTheScalesConsume';

const TIP_THE_SCALES_CONSUME_BUFFER = 25;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: TIP_THE_SCALES_CONSUME,
    reverseLinkRelation: TIP_THE_SCALES_CONSUME,
    linkingEventId: TALENTS_EVOKER.TIP_THE_SCALES_TALENT.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: EMPOWERS_EVOKER,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: TIP_THE_SCALES_CONSUME_BUFFER,
    backwardBufferMs: TIP_THE_SCALES_CONSUME_BUFFER,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.TIP_THE_SCALES_TALENT);
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
 * This is handled in the channeling module via empowerChannelSpec
 * */
class TipTheScalesNormalizer extends EventLinkNormalizer {
  static dependencies = {
    ...EventLinkNormalizer.dependencies,
    empowerNormalizer: EmpowerNormalizer,
  };
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }

  /** Create EmpowerEnd events for Empowers cast with Tip the Scales
   * Also creates EMPOWERED_CAST link between the Cast and EmpowerEnd event */
  normalize(rawEvents: AnyEvent[]): AnyEvent[] {
    // Create initial EventLinks that we can then reference later
    const events = super.normalize(rawEvents);

    const hasFont =
      this.owner.selectedCombatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_AUGMENTATION_TALENT) ||
      this.owner.selectedCombatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_DEVASTATION_TALENT) ||
      this.owner.selectedCombatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_PRESERVATION_TALENT);

    const fixedEvents: AnyEvent[] = [];
    events.forEach((event) => {
      if (event.type !== EventType.Cast || !isFromTipTheScales(event)) {
        if (event.type !== EventType.EmpowerEnd || event.empowermentLevel > 0) {
          fixedEvents.push(event);
        }
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

      AddRelatedEvent(event, EMPOWER_END, fabricatedEvent);
      AddRelatedEvent(fabricatedEvent, EMPOWER_CAST, event);

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

export default TipTheScalesNormalizer;
