import SPELLS from 'common/SPELLS';
import { TALENTS_PALADIN } from 'common/TALENTS';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { CastEvent, EventType, GetRelatedEvents } from 'parser/core/Events';

const CRUSADE_MINIMAL_DURATION = 8000;

const CASTS_DURING_WAKE = 'DivineHammerDuringCrusade';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: CASTS_DURING_WAKE,
    referencedEventId: [SPELLS.DIVINE_HAMMER_CAST.id, SPELLS.HAMMER_OF_LIGHT.id],
    referencedEventType: EventType.Cast,
    linkingEventId: TALENTS_PALADIN.WAKE_OF_ASHES_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: CRUSADE_MINIMAL_DURATION,
    anyTarget: true,
  },
];

class WakeOfAshesNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getCastsDuringWake(event: CastEvent): CastEvent[] {
  return GetRelatedEvents<CastEvent>(
    event,
    CASTS_DURING_WAKE,
    (e): e is CastEvent => e.type === EventType.Cast,
  );
}

export default WakeOfAshesNormalizer;
