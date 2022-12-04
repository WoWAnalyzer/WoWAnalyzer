import SPELLS from 'common/SPELLS/demonhunter';
import { CastEvent, EventType, GetRelatedEvents, RemoveBuffStackEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';

const SOUL_CONSUME_BUFFER = 50;

const SPIRIT_BOMB_SOUL_CONSUME = 'SoulCleaveSoulConsume';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: SPIRIT_BOMB_SOUL_CONSUME,
    referencedEventId: SPELLS.CONSUME_SOUL_VDH.id,
    referencedEventType: EventType.Heal,
    linkingEventId: TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: SOUL_CONSUME_BUFFER,
    backwardBufferMs: SOUL_CONSUME_BUFFER,
    anyTarget: true,
    maximumLinks: 5,
  },
];

export default class SpiritBombEventLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getSpiritBombSoulConsumptions(event: CastEvent): RemoveBuffStackEvent[] {
  return GetRelatedEvents(event, SPIRIT_BOMB_SOUL_CONSUME).filter(
    (e): e is RemoveBuffStackEvent => e.type === EventType.RemoveBuffStack,
  );
}
