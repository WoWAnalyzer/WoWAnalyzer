import {
  PUPIL_OF_ALEXSTRASZA_LINK,
  UPHEAVAL_RUMBLING_EARTH_LINK,
} from 'analysis/retail/evoker/augmentation/modules/normalizers/CastLinkNormalizer';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { DamageEvent, EventType, HasRelatedEvent } from 'parser/core/Events';
import { LIVING_FLAME_CAST_HIT } from './LeapingFlamesNormalizer';

const AFTERIMAGE_DAMAGE_LINK = 'AfterimageDamageLink';
//Test this
const BUFFER = 1000;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: AFTERIMAGE_DAMAGE_LINK,
    linkingEventId: SPELLS.FIRE_BREATH_DOT.id,
    linkingEventType: EventType.ApplyDebuff,
    referencedEventId: SPELLS.LIVING_FLAME_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: false,
    forwardBufferMs: BUFFER,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.AFTERIMAGE_TALENT),
    additionalCondition(_linkingEvent, referencedEvent) {
      return (
        !HasRelatedEvent(referencedEvent, LIVING_FLAME_CAST_HIT) &&
        !HasRelatedEvent(referencedEvent, PUPIL_OF_ALEXSTRASZA_LINK)
      );
    },
  },
  {
    linkRelation: AFTERIMAGE_DAMAGE_LINK,
    linkingEventId: SPELLS.UPHEAVAL_DAM.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.LIVING_FLAME_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: false,
    forwardBufferMs: BUFFER,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.AFTERIMAGE_TALENT) && c.hasTalent(TALENTS.UPHEAVAL_TALENT),
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        !HasRelatedEvent(referencedEvent, AFTERIMAGE_DAMAGE_LINK) &&
        !HasRelatedEvent(linkingEvent, UPHEAVAL_RUMBLING_EARTH_LINK) &&
        !HasRelatedEvent(referencedEvent, LIVING_FLAME_CAST_HIT) &&
        !HasRelatedEvent(referencedEvent, PUPIL_OF_ALEXSTRASZA_LINK)
      );
    },
  },
];

class AfterimageCastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AFTERIMAGE_TALENT);
  }
}

export function isFromAfterimageDamage(event: DamageEvent): boolean {
  return HasRelatedEvent(event, AFTERIMAGE_DAMAGE_LINK);
}

export default AfterimageCastLinkNormalizer;
