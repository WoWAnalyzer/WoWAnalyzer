import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { CastEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/rogue';

const MUTILATE_VANISH = 'MutilateVanish';
const MUTILATE_VANISH_BUFFER_MS = 3000;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: MUTILATE_VANISH,
    linkingEventType: EventType.Cast,
    linkingEventId: SPELLS.ENVENOM.id,
    referencedEventType: EventType.Cast,
    referencedEventId: SPELLS.VANISH.id,
    backwardBufferMs: MUTILATE_VANISH_BUFFER_MS,
    anyTarget: true,
  },
];

export default class MutilateVanishLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export const getVanishCast = (event: CastEvent) =>
  GetRelatedEvents(event, MUTILATE_VANISH)
    .filter((e): e is CastEvent => e.type === EventType.Cast)
    .at(0);
