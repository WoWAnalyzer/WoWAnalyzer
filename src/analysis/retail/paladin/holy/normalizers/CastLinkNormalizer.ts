import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType, GetRelatedEvents, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

export const LIGHTS_HAMMER_HEAL = 'LightsHammerHeal';
export const FROM_DAYBREAK = 'FromDaybreak';
export const DAYBREAK_HEALING = 'DaybreakHealing';
export const DAYBREAK_DAMAGE = 'DaybreakDamage';
export const DAYBREAK_MANA = 'DaybreakMana';

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
  {
    linkRelation: DAYBREAK_HEALING,
    linkingEventId: TALENTS.DAYBREAK_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.GLIMMER_OF_LIGHT_HEAL_TALENT.id,
    referencedEventType: [EventType.Heal, EventType.HealAbsorbed],
    forwardBufferMs: 350,
    anyTarget: true,
    reverseLinkRelation: FROM_DAYBREAK,
  },
  {
    linkRelation: DAYBREAK_DAMAGE,
    linkingEventId: TALENTS.DAYBREAK_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.GLIMMER_OF_LIGHT_DAMAGE_TALENT.id,
    referencedEventType: [EventType.Damage],
    forwardBufferMs: 350,
    anyTarget: true,
    reverseLinkRelation: FROM_DAYBREAK,
  },
  {
    linkRelation: DAYBREAK_MANA,
    linkingEventId: TALENTS.DAYBREAK_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.DAYBREAK_ENERGIZE.id,
    referencedEventType: [EventType.ResourceChange],
    anyTarget: true,
    reverseLinkRelation: FROM_DAYBREAK,
    forwardBufferMs: 100,
    backwardBufferMs: 100,
  },
];

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getLightsHammerHeals(event: HealEvent) {
  return [event].concat(GetRelatedEvents(event, LIGHTS_HAMMER_HEAL) as HealEvent[]);
}

export default CastLinkNormalizer;
