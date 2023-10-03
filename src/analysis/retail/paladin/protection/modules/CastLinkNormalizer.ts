import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  CastEvent,
  EventType,
  DamageEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  ApplyBuffEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import HIT_TYPES from '../../../../../game/HIT_TYPES';

const BUFFER_MS = 100;
const GRAND_CRUSADER_CAST = 'FromHardcast';
const GRAND_CRUSADER_CRUSADER_STRIKE_CAST = 'FromHardcast';
const GRAND_CRUSADER_HAMMER_OF_THE_RIGHTEOUS_CAST = 'FromHardcast';
const GRAND_CRUSADER_BLESSED_HAMMER_CAST = 'FromHardCast';
const GRAND_CRUSADER_JUDGMENT_CRIT = 'FromHardCast';
const GRAND_CRUSADER_PARRY = 'FromHardCast';
const FROM_HARDCAST = 'FromHardcast';
const CONSUMED_PROC = 'ConsumedProc';

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

class MyAbilityNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [...EVENT_LINKS]);
  }
}

export function gcJudgmentCrit(event: ApplyBuffEvent | RefreshBuffEvent): DamageEvent | undefined {
  return GetRelatedEvents<DamageEvent>(
    event,
    GRAND_CRUSADER_JUDGMENT_CRIT,
    (e): e is DamageEvent => e.type === EventType.Damage,
  ).at(-1);
}

export function getHardcast(event: DamageEvent): CastEvent | undefined {
  return GetRelatedEvents<CastEvent>(
    event,
    FROM_HARDCAST,
    (e): e is CastEvent => e.type === EventType.Cast,
  ).at(-1);
}

export function consumedProc(event: DamageEvent): boolean {
  return HasRelatedEvent(event, CONSUMED_PROC);
}

export default MyAbilityNormalizer;
