import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import { CastEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';

const ESSENCE_BREAK_DURATION = 4000;

const ESSENCE_BREAK_BUFFED = 'EssenceBreakBuffed';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: ESSENCE_BREAK_BUFFED,
    referencedEventId: TALENTS.ESSENCE_BREAK_TALENT.id,
    referencedEventType: EventType.Cast,
    linkingEventId: [
      SPELLS.CHAOS_STRIKE.id,
      SPELLS.ANNIHILATION.id,
      SPELLS.BLADE_DANCE.id,
      SPELLS.DEATH_SWEEP.id,
    ],
    linkingEventType: EventType.Cast,
    forwardBufferMs: 0,
    backwardBufferMs: ESSENCE_BREAK_DURATION,
    anyTarget: true,
  },
];

export default class EssenceBreakNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getBuffedCasts(event: CastEvent): CastEvent[] {
  return GetRelatedEvents(event, ESSENCE_BREAK_BUFFED).filter(
    (e): e is CastEvent => e.type === EventType.Cast,
  );
}
