import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AbilityEvent,
  CastEvent,
  EventType,
  GetRelatedEvent,
  HasAbility,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';

const REMOVE_BUFFER_MS = 50;

const CONSUMED_HOT = 'ConsumedHot';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: CONSUMED_HOT,
    linkingEventId: SPELLS.SWIFTMEND.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [
      SPELLS.REJUVENATION.id,
      SPELLS.REJUVENATION_GERMINATION.id,
      SPELLS.REGROWTH.id,
      SPELLS.WILD_GROWTH.id,
      SPELLS.RENEWING_BLOOM.id,
    ],
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: REMOVE_BUFFER_MS,
  },
];

class SwiftmendNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    // with VI, Swiftmend doesn't remove HoTs - disable this to avoid false positives
    this.active = !this.selectedCombatant.hasTalent(TALENTS_DRUID.VERDANT_INFUSION_TALENT);
  }
}

export function getRemovedHot(event: CastEvent): AbilityEvent<any> | undefined {
  return GetRelatedEvent(event, CONSUMED_HOT, HasAbility);
}

export default SwiftmendNormalizer;
