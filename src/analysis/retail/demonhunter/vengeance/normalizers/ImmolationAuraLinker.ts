import SPELLS from 'common/SPELLS/demonhunter';
import { CastEvent, DamageEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';

const SOUL_GENERATE_BUFFER = 500;

const IMMOLATION_AURA_INITIAL_HIT = 'ImmolationAuraInitialHit';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: IMMOLATION_AURA_INITIAL_HIT,
    referencedEventId: SPELLS.IMMOLATION_AURA_INITIAL_HIT_DAMAGE.id,
    referencedEventType: EventType.Damage,
    linkingEventId: SPELLS.IMMOLATION_AURA.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: SOUL_GENERATE_BUFFER,
    backwardBufferMs: SOUL_GENERATE_BUFFER,
    anyTarget: true,
  },
];

/**
 * The applybuff from demonic is logged before the cast of Eye Beam.
 * This normalizes events so that the Eye Beam applybuff always comes before the Meta Havoc buff
 **/
export default class ImmolationAuraLinker extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getImmolationAuraInitialHits(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(
    event,
    IMMOLATION_AURA_INITIAL_HIT,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}
