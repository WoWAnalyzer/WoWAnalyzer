import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { TIERS } from 'game/TIERS';
import SPELLS from 'common/SPELLS';
import { ApplyBuffEvent, EventType, HasRelatedEvent, RefreshBuffEvent } from 'parser/core/Events';

const BUFFER_MS = 50;
const INSURANCE_FROM_BLOOM = 'Insurance from Bloom';
const HOT_FROM_INSURANCE = 'HoT from Insurance';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: INSURANCE_FROM_BLOOM,
    linkingEventId: SPELLS.INSURANCE_HOT_DRUID.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.LIFEBLOOM_BLOOM_HEAL.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
  },
  {
    linkRelation: HOT_FROM_INSURANCE,
    linkingEventId: [
      SPELLS.REJUVENATION.id,
      SPELLS.REJUVENATION_GERMINATION.id,
      SPELLS.REGROWTH.id,
      SPELLS.WILD_GROWTH.id,
    ],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.INSURANCE_HOT_DRUID.id,
    referencedEventType: [EventType.RemoveBuff, EventType.RefreshBuff],
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
  },
];

/**
 * Event links to assist analysis of Resto Druid's TWW S2 4pc set:
 *
 * Lifebloom's bloom has a 30% chance to apply Insurance! to its target for 10 sec.
 * When Insurance! is consumed or removed, it leaves a missing Rejuvenation, Regrowth, or
 * Wild Growth heal over time effect for 15 sec on its target.
 */
export default class TWW2TierSetNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.TWW2);
  }
}

export function isInsuranceFromBloom(event: ApplyBuffEvent | RefreshBuffEvent) {
  return HasRelatedEvent(event, INSURANCE_FROM_BLOOM);
}

export function isHotFromInsurance(event: ApplyBuffEvent | RefreshBuffEvent) {
  return HasRelatedEvent(event, HOT_FROM_INSURANCE);
}
