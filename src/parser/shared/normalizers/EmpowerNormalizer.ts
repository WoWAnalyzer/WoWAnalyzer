import {
  AddRelatedEvent,
  AnyEvent,
  CastEvent,
  EmpowerCancelEvent,
  EmpowerEndEvent,
  EventType,
  GetRelatedEvent,
  HasRelatedEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER, TALENTS_MONK } from 'common/TALENTS';

export const EMPOWERS = [
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
  // Monk
  TALENTS_MONK.SLICING_WINDS_TALENT.id,
  // Earthen
  SPELLS.AZERITE_SURGE.id,
];

// These empowers have their buffs tagged as unlogged which makes precise determination of cancel times impossible
const UNLOGGED_EMPOWERS = [
  SPELLS.UPHEAVAL.id,
  SPELLS.UPHEAVAL_FONT.id,
  SPELLS.ETERNITY_SURGE.id,
  SPELLS.ETERNITY_SURGE_FONT.id,
];

const TIP_THE_SCALES_CONSUME = 'TipTheScalesConsume';
const EMPOWER_CAST = 'EmpoweredCast';
export const EMPOWER_END = 'EmpowerEnd';
export const EMPOWER_CANCEL = 'EmpowerCancel';

const EMPOWERED_CAST_BUFFER = 6000;
const TIP_THE_SCALES_CONSUME_BUFFER = 25;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: TIP_THE_SCALES_CONSUME,
    reverseLinkRelation: TIP_THE_SCALES_CONSUME,
    linkingEventId: TALENTS_EVOKER.TIP_THE_SCALES_TALENT.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: EMPOWERS,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: TIP_THE_SCALES_CONSUME_BUFFER,
    backwardBufferMs: TIP_THE_SCALES_CONSUME_BUFFER,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.TIP_THE_SCALES_TALENT);
    },
  },
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

  /** Create EmpowerEnd events for Empowers cast with Tip the Scales
   * Also creates EMPOWERED_CAST link between the Cast and EmpowerEnd event */
  fixTTS(events: AnyEvent[], hasFont: boolean): AnyEvent[] {
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

  /** Create EmpowerCancel events for Empowers the were cancelled */
  fixCancelCast(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    let waitingForEnd = 0;
    events.forEach((event) => {
      if (
        (waitingForEnd == 0 &&
          (event.type !== EventType.Cast ||
            !EMPOWERS.includes(event.ability.guid) ||
            isFromTipTheScales(event) ||
            HasRelatedEvent(event, EMPOWER_END))) ||
        (waitingForEnd != 0 &&
          (event.type !== EventType.RemoveBuff || !EMPOWERS.includes(event.ability.guid)))
      ) {
        fixedEvents.push(event);
        return;
      }
      // Instantly push the unloggeds because you cant track them anyway
      // Wait for Removebuff for logged ones
      if (event.type === EventType.Cast) {
        if (UNLOGGED_EMPOWERS.includes(event.ability.guid)) {
          const fabricatedEvent: EmpowerCancelEvent = {
            ability: event.ability,
            timestamp: event.timestamp,
            sourceID: event.sourceID,
            sourceIsFriendly: event.sourceIsFriendly,
            targetID: event.targetID,
            targetIsFriendly: event.targetIsFriendly,
            type: EventType.EmpowerCancel,
            __fabricated: true,
          };

          AddRelatedEvent(event, EMPOWER_CANCEL, fabricatedEvent);
          AddRelatedEvent(fabricatedEvent, EMPOWER_CANCEL, event);

          fixedEvents.push(event);
          fixedEvents.push(fabricatedEvent);
        } else {
          fixedEvents.push(event);
          waitingForEnd = event.ability.guid;
        }
      }
      if (event.type === EventType.RemoveBuff && waitingForEnd == event.ability.guid) {
        const fabricatedEvent: EmpowerCancelEvent = {
          ability: event.ability,
          timestamp: event.timestamp,
          sourceID: event.sourceID,
          sourceIsFriendly: event.sourceIsFriendly,
          targetID: event.targetID,
          targetIsFriendly: event.targetIsFriendly,
          type: EventType.EmpowerCancel,
          __fabricated: true,
        };

        AddRelatedEvent(event, EMPOWER_CANCEL, fabricatedEvent);
        AddRelatedEvent(fabricatedEvent, EMPOWER_CANCEL, event);

        fixedEvents.push(event);
        fixedEvents.push(fabricatedEvent);
        waitingForEnd = 0;
      }
    });
    return fixedEvents;
  }

  normalize(rawEvents: AnyEvent[]): AnyEvent[] {
    // Create initial EventLinks that we can then reference later
    const events = super.normalize(rawEvents);

    const hasFont =
      this.owner.selectedCombatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_AUGMENTATION_TALENT) ||
      this.owner.selectedCombatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_DEVASTATION_TALENT) ||
      this.owner.selectedCombatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_PRESERVATION_TALENT);

    return this.fixCancelCast(this.fixTTS(events, hasFont));
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
  return HasRelatedEvent(event, EMPOWER_END) || isFromTipTheScales(event);
}

/** Get the associated empowerEnd event for an Empower cast */
export function getEmpowerEndEvent(event: CastEvent): EmpowerEndEvent | undefined {
  return GetRelatedEvent(event, EMPOWER_END, (e) => e.type === EventType.EmpowerEnd);
}

export function getEmpowerCastEvent(event: EmpowerEndEvent): CastEvent | undefined {
  return GetRelatedEvent(event, EMPOWER_CAST, (e) => e.type === EventType.Cast);
}

export default EmpowerNormalizer;
