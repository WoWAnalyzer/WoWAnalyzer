import {
  PUPIL_OF_ALEXSTRASZA_LINK,
  UPHEAVAL_CAST_DAM_LINK,
} from 'analysis/retail/evoker/augmentation/modules/normalizers/CastLinkNormalizer';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { DamageEvent, EventType, GetRelatedEvent, HasRelatedEvent } from 'parser/core/Events';
import { isFromLeapingFlames, LIVING_FLAME_CAST_HIT } from './LeapingFlamesNormalizer';
import { AFTERIMAGE_MAX_HITS } from '../../constants';

const AFTERIMAGE_CAST_LINK = 'AfterimageCastLink';
const AFTERIMAGE_DAMAGE_LINK = 'AfterimageDamageLink';
const CHRONO_FLAME_DAMAGE_LINK = 'ChronoFlameDamageLink';
//Test this
const AFTERIMAGE_BUFFER = 1000;
const CAST_BUFFER_MS = 100;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: AFTERIMAGE_CAST_LINK,
    reverseLinkRelation: AFTERIMAGE_CAST_LINK,
    linkingEventId: [
      TALENTS.UPHEAVAL_TALENT.id,
      SPELLS.UPHEAVAL_FONT.id,
      SPELLS.FIRE_BREATH.id,
      SPELLS.FIRE_BREATH_FONT.id,
    ],
    linkingEventType: EventType.EmpowerEnd,
    referencedEventId: SPELLS.LIVING_FLAME_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: AFTERIMAGE_BUFFER,
    maximumLinks: AFTERIMAGE_MAX_HITS,
    additionalCondition(_linkingEvent, referencedEvent) {
      return isNotFromOtherLFSources(referencedEvent as DamageEvent);
    },
  },
  {
    linkRelation: AFTERIMAGE_DAMAGE_LINK,
    reverseLinkRelation: AFTERIMAGE_DAMAGE_LINK,
    linkingEventId: SPELLS.FIRE_BREATH_DOT.id,
    linkingEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    referencedEventId: SPELLS.LIVING_FLAME_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: false,
    forwardBufferMs: AFTERIMAGE_BUFFER,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.AFTERIMAGE_TALENT),
    additionalCondition(_linkingEvent, referencedEvent) {
      return (
        isNotFromOtherLFSources(referencedEvent as DamageEvent) &&
        HasRelatedEvent(referencedEvent, AFTERIMAGE_CAST_LINK)
        // If Fire Breath becomes able to be procced without a cast (e.g. like Undermine tier set, or Stasis),
        // this last condition will have to change. This hasn't happened for this empower yet, but has been
        // possible for every other empower.
      );
    },
  },
  {
    linkRelation: AFTERIMAGE_DAMAGE_LINK,
    reverseLinkRelation: AFTERIMAGE_DAMAGE_LINK,
    linkingEventId: SPELLS.UPHEAVAL_DAM.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.LIVING_FLAME_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: false,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.AFTERIMAGE_TALENT) && c.hasTalent(TALENTS.UPHEAVAL_TALENT),
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        !HasRelatedEvent(referencedEvent, AFTERIMAGE_DAMAGE_LINK) &&
        isNotFromOtherLFSources(referencedEvent as DamageEvent) &&
        HasRelatedEvent(referencedEvent, AFTERIMAGE_CAST_LINK) &&
        HasRelatedEvent(linkingEvent, UPHEAVAL_CAST_DAM_LINK)
        // If something like the Undermine tier set is added again, the last two conditions will have to change.
      );
    },
  },
  {
    linkRelation: CHRONO_FLAME_DAMAGE_LINK,
    reverseLinkRelation: CHRONO_FLAME_DAMAGE_LINK,
    linkingEventId: SPELLS.LIVING_FLAME_DAMAGE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.CHRONO_FLAME_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: false,
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.CHRONO_FLAME_TALENT),
  },
];

class AfterimageCastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AFTERIMAGE_TALENT);
    this.priority += 100;
  }
}

export function isFromAfterimageDamage(event: DamageEvent): boolean {
  return HasRelatedEvent(event, AFTERIMAGE_DAMAGE_LINK);
}

export function getChronoFlameDamageLink(event: DamageEvent): DamageEvent | undefined {
  return GetRelatedEvent<DamageEvent>(event, CHRONO_FLAME_DAMAGE_LINK);
}

function isNotFromOtherLFSources(event: DamageEvent): boolean {
  return (
    !HasRelatedEvent(event, LIVING_FLAME_CAST_HIT) &&
    !HasRelatedEvent(event, PUPIL_OF_ALEXSTRASZA_LINK) &&
    !isFromLeapingFlames(event)
  );
}

export default AfterimageCastLinkNormalizer;
