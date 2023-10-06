import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS';
import { DamageEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';

const BUFFER_MS = 50;

const FROM_BITE = 'FromBite';
const CAUSED_RAMPANT_FEROCITY_HIT = 'CausedRampantFerocityHit';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: CAUSED_RAMPANT_FEROCITY_HIT,
    reverseLinkRelation: FROM_BITE,
    linkingEventId: SPELLS.FEROCIOUS_BITE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.RAMPANT_FEROCITY.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
  },
];

/**
 * Links Rampant Ferocity hits back to the Bite hit that procced it
 */
class RampantFerocityLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.RAMPANT_FEROCITY_TALENT);
  }
}

export default RampantFerocityLinkNormalizer;

/** Gets the Rampant Ferocity hits procced by this Bite hit */
export function getRampantFerocityHits(event: DamageEvent): DamageEvent[] {
  return GetRelatedEvents(
    event,
    CAUSED_RAMPANT_FEROCITY_HIT,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}
