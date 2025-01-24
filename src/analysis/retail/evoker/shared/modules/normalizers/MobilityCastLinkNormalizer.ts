import {
  ApplyBuffEvent,
  EventType,
  HasRelatedEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';

const TIME_SPIRAL_BUFF_APPLY = 'timeSpiralBuffApply'; // links cast to buff apply
const TIME_SPIRAL_PERSONAL_CONSUME = 'timeSpiralPersonalConsume'; // links Hover cast to buff consume

const CAST_BUFFER = 50;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: TIME_SPIRAL_BUFF_APPLY,
    reverseLinkRelation: TIME_SPIRAL_BUFF_APPLY,
    linkingEventId: [
      SPELLS.TIME_SPIRAL_DEATH_KNIGHT_BUFF.id,
      SPELLS.TIME_SPIRAL_DEMON_HUNTER_BUFF.id,
      SPELLS.TIME_SPIRAL_DRUID_BUFF.id,
      SPELLS.TIME_SPIRAL_EVOKER_BUFF.id,
      SPELLS.TIME_SPIRAL_HUNTER_BUFF.id,
      SPELLS.TIME_SPIRAL_HUNTER_BUFF.id,
      SPELLS.TIME_SPIRAL_MAGE_BUFF.id,
      SPELLS.TIME_SPIRAL_MONK_BUFF.id,
      SPELLS.TIME_SPIRAL_PALADIN_BUFF.id,
      SPELLS.TIME_SPIRAL_PRIEST_BUFF.id,
      SPELLS.TIME_SPIRAL_ROGUE_BUFF.id,
      SPELLS.TIME_SPIRAL_SHAMAN_BUFF.id,
      SPELLS.TIME_SPIRAL_WARLOCK_BUFF.id,
      SPELLS.TIME_SPIRAL_WARRIOR_BUFF.id,
    ],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS.TIME_SPIRAL_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER,
    backwardBufferMs: CAST_BUFFER,
    isActive: (C) => C.hasTalent(TALENTS.TIME_SPIRAL_TALENT),
  },
  {
    linkRelation: TIME_SPIRAL_PERSONAL_CONSUME,
    reverseLinkRelation: TIME_SPIRAL_PERSONAL_CONSUME,
    linkingEventId: SPELLS.HOVER.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.TIME_SPIRAL_EVOKER_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER,
    backwardBufferMs: CAST_BUFFER,
    isActive: (C) => C.hasTalent(TALENTS.TIME_SPIRAL_TALENT),
    maximumLinks: 1,
  },
];

class MobilityCastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function hasTimeSpiralCastEvent(event: ApplyBuffEvent | RefreshBuffEvent) {
  return HasRelatedEvent(event, TIME_SPIRAL_BUFF_APPLY);
}

export function hasTimeSpiralConsumeEvent(event: RemoveBuffEvent) {
  return HasRelatedEvent(event, TIME_SPIRAL_PERSONAL_CONSUME);
}

export default MobilityCastLinkNormalizer;
