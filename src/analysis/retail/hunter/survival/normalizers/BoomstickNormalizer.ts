import SPELLS from 'common/SPELLS/hunter';
import TALENTS from 'common/TALENTS/hunter';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Channeling from 'parser/shared/normalizers/Channeling';

export const BOOMSTICK_CAST_HIT = 'boomstick-cast-hit';
export const BOOMSTICK_CAST_END = 'boomstick-cast-end';
export const BOOMSTICK_NEXT_CAST = 'boomstick-next-cast';
const MAX_CHANNEL_BUFFER_MS = 4000;

const EVENT_LINKS: EventLink[] = [
  // Link damage to cast
  {
    linkRelation: BOOMSTICK_CAST_HIT,
    reverseLinkRelation: BOOMSTICK_CAST_HIT,
    linkingEventId: SPELLS.BOOMSTICK_DAMAGE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: TALENTS.BOOMSTICK_TALENT.id,
    referencedEventType: EventType.Cast,
    backwardBufferMs: MAX_CHANNEL_BUFFER_MS,
    anyTarget: true,
  },
  // Link end channel to cast
  {
    linkRelation: BOOMSTICK_CAST_END,
    reverseLinkRelation: BOOMSTICK_CAST_END,
    linkingEventId: TALENTS.BOOMSTICK_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS.BOOMSTICK_TALENT.id,
    referencedEventType: EventType.EndChannel,
    forwardBufferMs: MAX_CHANNEL_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
  },
  // Link the EndChannel event to potential clipped ability
  {
    linkRelation: BOOMSTICK_NEXT_CAST,
    linkingEventId: TALENTS.BOOMSTICK_TALENT.id,
    linkingEventType: EventType.EndChannel,
    referencedEventId: null,
    referencedEventType: [EventType.Cast, EventType.BeginCast],
    forwardBufferMs: 100,
    anyTarget: true,
    maximumLinks: 1,
  },
];

class BoomstickNormalizer extends EventLinkNormalizer {
  static dependencies = {
    ...EventLinkNormalizer.dependencies,
    channeling: Channeling,
  };

  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default BoomstickNormalizer;
