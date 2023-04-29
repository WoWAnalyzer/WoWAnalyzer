import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType, GetRelatedEvents, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

export const LIGHTS_HAMMER_HEAL = 'LightsHammerHeal';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: LIGHTS_HAMMER_HEAL,
    linkingEventId: SPELLS.LIGHTS_HAMMER_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.LIGHTS_HAMMER_HEAL.id,
    referencedEventType: EventType.Heal,
    anyTarget: true,
    forwardBufferMs: 25,
    backwardBufferMs: 25,
    additionalCondition(linkingEvent, referencedEvent) {
      const linkEvent = linkingEvent as HealEvent;
      const refEvent = referencedEvent as HealEvent;
      return linkEvent.targetID !== refEvent.targetID;
    },
  },
];

/**
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getLightsHammerHeals(event: HealEvent) {
  return [event].concat(GetRelatedEvents(event, LIGHTS_HAMMER_HEAL) as HealEvent[]);
}

export default CastLinkNormalizer;
