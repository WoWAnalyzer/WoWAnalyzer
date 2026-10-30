import BaseEventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import {
  BeginCastEvent,
  CastEvent,
  EventType,
  GetRelatedEvent,
  HasRelatedEvent,
  SummonEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { EVENT_LINKS, CAST_BUFFER_MS } from '../constants';

const livelyTotemsCastLink: EventLink = {
  // Links the SUMMON event of the totems with the next CAST event of chain heal
  linkRelation: EVENT_LINKS.livelyTotemsOrigin,
  linkingEventId: [
    SPELLS.HEALING_TIDE_TOTEM.id,
    SPELLS.HEALING_STREAM_TOTEM.id,
    SPELLS.SPIRIT_LINK_TOTEM.id,
    SPELLS.STORMSTREAM_TOTEM.id,
  ],
  linkingEventType: [EventType.Summon],
  reverseLinkRelation: EVENT_LINKS.livelyTotemsChainHealCast, // Needed to be able to track the summon from the cast.
  referencedEventId: [TALENTS.CHAIN_HEAL_TALENT.id],
  referencedEventType: [EventType.Cast],
  forwardBufferMs: CAST_BUFFER_MS, //maximum time between totem summon and chainheal cast.
  maximumLinks: 1, //only one totem can be linked to a chainheal cast.
  anyTarget: true, //Player cannot choose the target of the livelyTotem chainheal cast.
  anySource: false, //Needed to prevent mixing up the link, in case of more than one shaman in the same raid fight.
  isActive(c) {
    return c.hasTalent(TALENTS.LIVELY_TOTEMS_TALENT);
  },
};

const livelyTotemsBeginCastLink: EventLink = {
  linkRelation: EVENT_LINKS.livelyTotemsBeginCastOrigin,
  linkingEventId: [
    SPELLS.HEALING_TIDE_TOTEM.id,
    SPELLS.HEALING_STREAM_TOTEM.id,
    SPELLS.SPIRIT_LINK_TOTEM.id,
    SPELLS.STORMSTREAM_TOTEM.id,
  ],
  linkingEventType: [EventType.Summon],
  reverseLinkRelation: EVENT_LINKS.livelyTotemsChainHealBeginCast,
  referencedEventId: [TALENTS.CHAIN_HEAL_TALENT.id],
  referencedEventType: [EventType.BeginCast],
  forwardBufferMs: CAST_BUFFER_MS,
  backwardBufferMs: CAST_BUFFER_MS, // in case the begincast is logged a few ms before the summon
  maximumLinks: 1,
  anyTarget: true,
  anySource: false,
  isActive(c) {
    return c.hasTalent(TALENTS.LIVELY_TOTEMS_TALENT);
  },
};

export function isLivelyTotemsChainHealCast(event: SummonEvent | CastEvent) {
  switch (event.type) {
    case EventType.Summon: {
      return GetRelatedEvent(event, EVENT_LINKS.livelyTotemsOrigin);
    }
    case EventType.Cast: {
      return GetRelatedEvent(event, EVENT_LINKS.livelyTotemsChainHealCast);
    }
  }
}

export function isLivelyTotemsChainHealBeginCast(event: BeginCastEvent): boolean {
  return HasRelatedEvent(event, EVENT_LINKS.livelyTotemsChainHealBeginCast);
}

class LivelyTotemsNormalizer extends BaseEventLinkNormalizer {
  constructor(options: Options) {
    super(options, [livelyTotemsCastLink, livelyTotemsBeginCastLink]);
  }
}

export default LivelyTotemsNormalizer;
