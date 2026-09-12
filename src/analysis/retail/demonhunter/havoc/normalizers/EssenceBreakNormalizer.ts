import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import { CastEvent, DamageEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';

const ESSENCE_BREAK_DURATION = 4000;
const ESSENCE_BREAK_DURATION_MID2_TIER = 6000;
const ESSENCE_BREAK_EYE_BEAM_BUFFER = 4000;
const ESSENCE_BREAK_VENGEFUL_RETREAT_BUFFER = 4000;

const ESSENCE_BREAK_BUFFED = 'EssenceBreakBuffed';
const ESSENCE_BREAK_BUFFED_MID2_TIER = 'EssenceBreakBuffedMID2Tier';
const ESSENCE_BREAK_AFTER_EYE_BEAM = 'EssenceBreakAfterEyeBeam';
const ESSENCE_BREAK_AFTER_VENGEFUL_RETREAT = 'EssenceBreakAfterVengefulRetreat';
const ESSENCE_BREAK_INITIAL_DAMAGE = 'EssenceBreakInitialDamage';

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
    linkRelation: ESSENCE_BREAK_BUFFED_MID2_TIER,
    referencedEventId: [
      SPELLS.CHAOS_STRIKE.id,
      SPELLS.ANNIHILATION.id,
      SPELLS.BLADE_DANCE.id,
      SPELLS.DEATH_SWEEP.id,
    ],
    referencedEventType: EventType.Cast,
    linkingEventId: TALENTS.ESSENCE_BREAK_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: ESSENCE_BREAK_DURATION_MID2_TIER,
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
  {
    linkRelation: ESSENCE_BREAK_INITIAL_DAMAGE,
    referencedEventId: TALENTS.ESSENCE_BREAK_TALENT.id,
    referencedEventType: EventType.Damage,
    linkingEventId: TALENTS.ESSENCE_BREAK_TALENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: 50,
    backwardBufferMs: 50,
    anyTarget: true,
  },
];

export default class EssenceBreakNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getBuffedCasts(event: CastEvent): CastEvent[] {
  return GetRelatedEvents(
    event,
    ESSENCE_BREAK_BUFFED,
    (e): e is CastEvent => e.type === EventType.Cast,
  );
}

export function getBuffedCastsMID2Tier(event: CastEvent): CastEvent[] {
  return GetRelatedEvents(
    event,
    ESSENCE_BREAK_BUFFED_MID2_TIER,
    (e): e is CastEvent => e.type === EventType.Cast,
  );
}

export function getInitialHits(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(
    event,
    ESSENCE_BREAK_INITIAL_DAMAGE,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}

export function getPreviousVengefulRetreat(event: CastEvent): CastEvent | undefined {
  return GetRelatedEvents<CastEvent>(
    event,
    ESSENCE_BREAK_AFTER_VENGEFUL_RETREAT,
    (e): e is CastEvent => e.type === EventType.Cast,
  ).find(Boolean);
}
