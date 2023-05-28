import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import { CastEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';

const ESSENCE_BREAK_DURATION = 4000;
const ESSENCE_BREAK_EYE_BEAM_BUFFER = 4000;
const ESSENCE_BREAK_VENGEFUL_RETREAT_BUFFER = 4000;

const ESSENCE_BREAK_BUFFED = 'EssenceBreakBuffed';
const ESSENCE_BREAK_AFTER_EYE_BEAM = 'EssenceBreakAfterEyeBeam';
const ESSENCE_BREAK_AFTER_VENGEFUL_RETREAT = 'EssenceBreakAfterVengefulRetreat';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: ESSENCE_BREAK_BUFFED,
    referencedEventId: [
      SPELLS.CHAOS_STRIKE.id,
      SPELLS.ANNIHILATION.id,
      SPELLS.BLADE_DANCE.id,
      SPELLS.DEATH_SWEEP.id,
    ],
    referencedEventType: EventType.Cast,
    linkingEventId: TALENTS.ESSENCE_BREAK_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: ESSENCE_BREAK_DURATION,
    backwardBufferMs: 0,
    anyTarget: true,
  },
  {
    linkRelation: ESSENCE_BREAK_AFTER_EYE_BEAM,
    referencedEventId: TALENTS.EYE_BEAM_TALENT.id,
    referencedEventType: EventType.Cast,
    linkingEventId: TALENTS.ESSENCE_BREAK_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: 0,
    backwardBufferMs: ESSENCE_BREAK_EYE_BEAM_BUFFER,
    anyTarget: true,
  },
  {
    linkRelation: ESSENCE_BREAK_AFTER_VENGEFUL_RETREAT,
    referencedEventId: TALENTS.VENGEFUL_RETREAT_TALENT.id,
    referencedEventType: EventType.Cast,
    linkingEventId: TALENTS.ESSENCE_BREAK_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: 0,
    backwardBufferMs: ESSENCE_BREAK_VENGEFUL_RETREAT_BUFFER,
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

export function getPreviousVengefulRetreat(event: CastEvent): CastEvent | undefined {
  return GetRelatedEvents(event, ESSENCE_BREAK_AFTER_VENGEFUL_RETREAT)
    .filter((e): e is CastEvent => e.type === EventType.Cast)
    .find(Boolean);
}

export function getPreviousEyeBeam(event: CastEvent): CastEvent | undefined {
  return GetRelatedEvents(event, ESSENCE_BREAK_AFTER_EYE_BEAM)
    .filter((e): e is CastEvent => e.type === EventType.Cast)
    .find(Boolean);
}
