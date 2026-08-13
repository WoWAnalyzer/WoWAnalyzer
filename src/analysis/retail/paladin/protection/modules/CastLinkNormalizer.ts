import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  EventType,
  DamageEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  ApplyBuffEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import HIT_TYPES from '../../../../../game/HIT_TYPES';

const BUFFER_MS = 100;
export const VANGUARD_CONSUMED = 'VanguardConsumed';
export const AVENGERS_SHIELD_SOURCE = 'AvengersShieldSource';

/** Divine Resonance repeats Avenger's Shield every 5s for 15s. */
const DIVINE_RESONANCE_DURATION_MS = 15000;
const DIVINE_RESONANCE_INTERVAL_S = 5;
const LONG_BUFFER_MS = 1000;
/** Avenger's Shield bounces to several targets, so one firing is several damage events. */
const MAX_AVENGERS_SHIELD_TARGETS = 5;
const GRAND_CRUSADER_CAST = 'FromHardcast';
const GRAND_CRUSADER_CRUSADER_STRIKE_CAST = 'FromHardcast';
const GRAND_CRUSADER_HAMMER_OF_THE_RIGHTEOUS_CAST = 'FromHardcast';
const GRAND_CRUSADER_BLESSED_HAMMER_CAST = 'FromHardCast';
const GRAND_CRUSADER_JUDGMENT_CRIT = 'FromHardCast';
const GRAND_CRUSADER_PARRY = 'FromHardCast';

const EVENT_LINKS: EventLink[] = [
  // Crusader Strike Cast
  {
    linkRelation: GRAND_CRUSADER_CAST,
    referencedEventId: TALENTS.GRAND_CRUSADER_TALENT.id,
    referencedEventType: EventType.ApplyBuff,
    linkingEventId: SPELLS.CRUSADER_STRIKE.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS.GRAND_CRUSADER_TALENT),
  },
  {
    linkRelation: GRAND_CRUSADER_CRUSADER_STRIKE_CAST,
    referencedEventId: SPELLS.CRUSADER_STRIKE.id,
    referencedEventType: EventType.Cast,
    linkingEventId: TALENTS.GRAND_CRUSADER_TALENT.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,
  },

  // Hammer of the Righteous Cast
  {
    linkRelation: GRAND_CRUSADER_CAST,
    referencedEventId: TALENTS.GRAND_CRUSADER_TALENT.id,
    referencedEventType: EventType.ApplyBuff,
    linkingEventId: TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS.GRAND_CRUSADER_TALENT),
  },
  {
    linkRelation: GRAND_CRUSADER_HAMMER_OF_THE_RIGHTEOUS_CAST,
    referencedEventId: TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT.id,
    referencedEventType: EventType.Cast,
    linkingEventId: TALENTS.GRAND_CRUSADER_TALENT.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,
  },

  // Blessed Hammer Cast
  {
    linkRelation: GRAND_CRUSADER_CAST,
    reverseLinkRelation: GRAND_CRUSADER_CAST,
    referencedEventId: SPELLS.GRAND_CRUSADER_BUFF.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    linkingEventId: TALENTS.BLESSED_HAMMER_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS.GRAND_CRUSADER_TALENT),
  },
  {
    linkRelation: GRAND_CRUSADER_BLESSED_HAMMER_CAST,
    reverseLinkRelation: GRAND_CRUSADER_BLESSED_HAMMER_CAST,
    referencedEventId: SPELLS.GRAND_CRUSADER_BUFF.id,
    referencedEventType: EventType.Cast,
    linkingEventId: SPELLS.GRAND_CRUSADER_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,
  },

  // Parry
  {
    linkRelation: GRAND_CRUSADER_CAST,
    reverseLinkRelation: GRAND_CRUSADER_CAST,
    referencedEventId: TALENTS.GRAND_CRUSADER_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.ApplyBuff],
    linkingEventId: TALENTS.BLESSED_HAMMER_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS.GRAND_CRUSADER_TALENT),
  },
  {
    linkRelation: GRAND_CRUSADER_PARRY,
    reverseLinkRelation: GRAND_CRUSADER_PARRY,
    referencedEventId: SPELLS.GRAND_CRUSADER_BUFF.id,
    referencedEventType: [EventType.ApplyBuff, EventType.ApplyBuff],
    linkingEventId: null,
    linkingEventType: EventType.Damage,
    forwardBufferMs: 100,
    backwardBufferMs: 100,
    anyTarget: true,
    anySource: true,
    isActive: (c) => c.hasTalent(TALENTS.GRAND_CRUSADER_TALENT),
    additionalCondition: (linkingEvent) =>
      linkingEvent.type === EventType.Damage && linkingEvent.hitType === HIT_TYPES.PARRY,
  },

  // Attribute Avenger's Shield damage to the hardcast that produced it.
  {
    linkRelation: AVENGERS_SHIELD_SOURCE,
    reverseLinkRelation: AVENGERS_SHIELD_SOURCE,
    linkingEventId: TALENTS.AVENGERS_SHIELD_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS.AVENGERS_SHIELD_TALENT.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: LONG_BUFFER_MS,
    maximumLinks: MAX_AVENGERS_SHIELD_TARGETS,
    anyTarget: true,
  },
  // Divine Toll fires an Avenger's Shield of its own, with no cast event of its own.
  {
    linkRelation: AVENGERS_SHIELD_SOURCE,
    reverseLinkRelation: AVENGERS_SHIELD_SOURCE,
    linkingEventId: TALENTS.DIVINE_TOLL_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS.AVENGERS_SHIELD_TALENT.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: LONG_BUFFER_MS,
    maximumLinks: MAX_AVENGERS_SHIELD_TARGETS,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS.DIVINE_TOLL_TALENT),
    additionalCondition: (_source, referenced) =>
      !HasRelatedEvent(referenced, AVENGERS_SHIELD_SOURCE),
  },
  // Divine Resonance repeats Avenger's Shield at 5s, 10s and 15s after Divine Toll.
  // These repeats emit damage but no cast event, so without this they are attributed
  // to nothing at all.
  {
    linkRelation: AVENGERS_SHIELD_SOURCE,
    reverseLinkRelation: AVENGERS_SHIELD_SOURCE,
    linkingEventId: SPELLS.DIVINE_RESONANCE_TALENT_HOLY.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: TALENTS.AVENGERS_SHIELD_TALENT.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: DIVINE_RESONANCE_DURATION_MS + LONG_BUFFER_MS,
    maximumLinks: 3 * MAX_AVENGERS_SHIELD_TARGETS,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS.DIVINE_RESONANCE_SHARED_TALENT),
    additionalCondition: (sourceEvent, referencedEvent) => {
      if (HasRelatedEvent(referencedEvent, AVENGERS_SHIELD_SOURCE)) {
        return false;
      }
      // Repeats land a fraction after each 5s tick, so allow a little tolerance either
      // way and require that we are past the first interval - the firing at offset ~0
      // belongs to Divine Toll, not to a Resonance repeat.
      const since = (referencedEvent.timestamp - sourceEvent.timestamp) / 1000 + 0.1;
      return since > DIVINE_RESONANCE_INTERVAL_S && since % DIVINE_RESONANCE_INTERVAL_S < 1;
    },
  },

  // Vanguard consumption. The buff is spent by Avenger's Shield, so a removebuff
  // that coincides with an Avenger's Shield cast was consumed rather than expired.
  {
    linkRelation: VANGUARD_CONSUMED,
    reverseLinkRelation: VANGUARD_CONSUMED,
    referencedEventId: SPELLS.VANGUARD_BUFF.id,
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    linkingEventId: TALENTS.AVENGERS_SHIELD_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,
  },

  // Judgement Crit - Tier 30 4pc
  {
    linkRelation: GRAND_CRUSADER_CAST,
    reverseLinkRelation: GRAND_CRUSADER_CAST,
    referencedEventId: SPELLS.GRAND_CRUSADER_BUFF.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    linkingEventId: SPELLS.JUDGMENT_CAST_PROTECTION.id,
    linkingEventType: EventType.Damage,
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS.GRAND_CRUSADER_TALENT),
  },
  {
    linkRelation: GRAND_CRUSADER_JUDGMENT_CRIT,
    reverseLinkRelation: GRAND_CRUSADER_JUDGMENT_CRIT,
    referencedEventId: SPELLS.GRAND_CRUSADER_BUFF.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    linkingEventId: SPELLS.JUDGMENT_CAST_PROTECTION.id,
    linkingEventType: EventType.Damage,
    forwardBufferMs: 100,
    backwardBufferMs: 100,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS.GRAND_CRUSADER_TALENT),
    additionalCondition: (linkingEvent) =>
      linkingEvent.type === EventType.Damage && linkingEvent.hitType === HIT_TYPES.CRIT,
  },
];

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [...EVENT_LINKS]);
  }
}

/**
 * Whether this Avenger's Shield damage came from a Divine Resonance repeat rather than
 * from a hardcast or from Divine Toll itself.
 */
export function isDivineResonanceShield(event: DamageEvent): boolean {
  return GetRelatedEvents(event, AVENGERS_SHIELD_SOURCE).some(
    (e) =>
      e.type === EventType.ApplyBuff && e.ability?.guid === SPELLS.DIVINE_RESONANCE_TALENT_HOLY.id,
  );
}

/** Whether this Vanguard stack was spent on an Avenger's Shield rather than expiring. */
export function consumedVanguard(event: RemoveBuffEvent | RemoveBuffStackEvent): boolean {
  return HasRelatedEvent(event, VANGUARD_CONSUMED);
}

export function gcJudgmentCrit(event: ApplyBuffEvent | RefreshBuffEvent): DamageEvent | undefined {
  return GetRelatedEvents<DamageEvent>(
    event,
    GRAND_CRUSADER_JUDGMENT_CRIT,
    (e): e is DamageEvent => e.type === EventType.Damage,
  ).at(-1);
}

export default CastLinkNormalizer;
