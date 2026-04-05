import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { DamageEvent, EventType, GetRelatedEvent, HasRelatedEvent } from 'parser/core/Events';

const GLORY_OF_THE_DAWN_TRIGGER = 'glory-of-the-dawn-trigger';
const GLORY_OF_THE_DAWN_TRIGGER_BUFFER_MS = 1000;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: GLORY_OF_THE_DAWN_TRIGGER,
    reverseLinkRelation: GLORY_OF_THE_DAWN_TRIGGER,
    linkingEventId: SPELLS.GLORY_OF_THE_DAWN_DAMAGE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: [SPELLS.RISING_SUN_KICK_DAMAGE.id, SPELLS.RUSHING_WIND_KICK_DAMAGE.id],
    referencedEventType: EventType.Damage,
    backwardBufferMs: GLORY_OF_THE_DAWN_TRIGGER_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
  },
];

class GloryOfTheDawnLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function gloryOfTheDawnTrigger(event: DamageEvent): DamageEvent | undefined {
  return GetRelatedEvent<DamageEvent>(event, GLORY_OF_THE_DAWN_TRIGGER);
}

export function triggeredGloryOfTheDawnFromRushingWindKick(event: DamageEvent): boolean {
  return (
    HasRelatedEvent(event, GLORY_OF_THE_DAWN_TRIGGER) &&
    event.ability.guid === SPELLS.RUSHING_WIND_KICK_DAMAGE.id
  );
}

export function triggeredGloryOfTheDawnFromRisingSunKick(event: DamageEvent): boolean {
  const triggerEvent = gloryOfTheDawnTrigger(event);
  return triggerEvent?.ability.guid === SPELLS.RISING_SUN_KICK_DAMAGE.id;
}

export default GloryOfTheDawnLinkNormalizer;
