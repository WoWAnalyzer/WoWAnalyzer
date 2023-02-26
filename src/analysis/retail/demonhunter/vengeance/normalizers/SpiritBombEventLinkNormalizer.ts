import SPELLS from 'common/SPELLS/demonhunter';
import {
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';

const DAMAGE_BUFFER = 1500;
const SOUL_CONSUME_BUFFER = 150;

const SPIRIT_BOMB_DAMAGE = 'SpiritBombDamage';
const SPIRIT_BOMB_SOUL_CONSUME = 'SpiritBombSoulConsume';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: SPIRIT_BOMB_SOUL_CONSUME,
    referencedEventId: SPELLS.SOUL_FRAGMENT_STACK.id,
    referencedEventType: EventType.RemoveBuffStack,
    linkingEventId: TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: SOUL_CONSUME_BUFFER,
    backwardBufferMs: SOUL_CONSUME_BUFFER,
    anyTarget: true,
    maximumLinks: 5,
    reverseLinkRelation: SPIRIT_BOMB_SOUL_CONSUME,
  },
  {
    linkRelation: SPIRIT_BOMB_SOUL_CONSUME,
    referencedEventId: SPELLS.SOUL_FRAGMENT_STACK.id,
    referencedEventType: EventType.RemoveBuff,
    linkingEventId: TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: SOUL_CONSUME_BUFFER,
    backwardBufferMs: SOUL_CONSUME_BUFFER,
    anyTarget: true,
    maximumLinks: 1,
    reverseLinkRelation: SPIRIT_BOMB_SOUL_CONSUME,
  },
  {
    linkRelation: SPIRIT_BOMB_DAMAGE,
    referencedEventId: SPELLS.SPIRIT_BOMB_DAMAGE.id,
    referencedEventType: EventType.Damage,
    linkingEventId: TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: DAMAGE_BUFFER,
    backwardBufferMs: DAMAGE_BUFFER,
    anyTarget: true,
  },
];

export default class SpiritBombEventLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getSpiritBombSoulConsumptions(
  event: CastEvent,
): (RemoveBuffStackEvent | RemoveBuffEvent)[] {
  return GetRelatedEvents(event, SPIRIT_BOMB_SOUL_CONSUME).filter(
    (e): e is RemoveBuffStackEvent | RemoveBuffEvent =>
      e.type === EventType.RemoveBuffStack || e.type === EventType.RemoveBuff,
  );
}

export function getSpiritBombDamages(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(event, SPIRIT_BOMB_DAMAGE).filter(
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}
