import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  TargettedEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';

export const HOLY_SHOCK_SOURCE = 'HolyShockSource';
const RISING_SUNLIGHT = 'RisingSunlight';

const SHORT_BUFFER_MS = 100;
const MED_BUFFER_MS = 350;
const LONG_BUFFER_MS = 1000;
const DIVINE_RESONANCE_DURATION_MS = 15000;

const EVENT_LINKS: EventLink[] = [
  // Attribute holy shock damage/heal events to a cast of Holy Shock
  {
    linkRelation: HOLY_SHOCK_SOURCE,
    reverseLinkRelation: HOLY_SHOCK_SOURCE,
    linkingEventId: TALENTS.HOLY_SHOCK_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.HOLY_SHOCK_HEAL.id, SPELLS.HOLY_SHOCK_DAMAGE.id],
    referencedEventType: [EventType.Heal, EventType.Damage],
    maximumLinks: 1,
    forwardBufferMs: SHORT_BUFFER_MS,
  },
  // Attribute holy shock damage/heal events to a cast of Divine Toll
  {
    linkRelation: HOLY_SHOCK_SOURCE,
    reverseLinkRelation: HOLY_SHOCK_SOURCE,
    linkingEventId: TALENTS.DIVINE_TOLL_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.HOLY_SHOCK_HEAL.id, SPELLS.HOLY_SHOCK_DAMAGE.id],
    referencedEventType: [EventType.Heal, EventType.Damage],
    maximumLinks: 6, // 10.1.5 bug -- divine toll sends 6 instead of 5
    forwardBufferMs: MED_BUFFER_MS,
    anyTarget: true,
    additionalCondition(_, referencedEvent) {
      return !HasRelatedEvent(referencedEvent, HOLY_SHOCK_SOURCE);
    },
  },
  // Find the holy shock cast that is going to trigger extra shocks from rising sunlight
  {
    linkRelation: RISING_SUNLIGHT,
    reverseLinkRelation: RISING_SUNLIGHT,
    linkingEventId: SPELLS.RISING_SUNLIGHT_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: TALENTS.HOLY_SHOCK_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    backwardBufferMs: SHORT_BUFFER_MS,
    maximumLinks: 1,
  },
  // Attribute 2 repeats of holy shock damage/heal events to Rising Sunlight talent
  {
    linkRelation: HOLY_SHOCK_SOURCE,
    reverseLinkRelation: HOLY_SHOCK_SOURCE,
    linkingEventId: SPELLS.RISING_SUNLIGHT_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [SPELLS.HOLY_SHOCK_HEAL.id, SPELLS.HOLY_SHOCK_DAMAGE.id],
    referencedEventType: [EventType.Heal, EventType.Damage],
    forwardBufferMs: LONG_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 2,
    additionalCondition(sourceEvent, referencedEvent) {
      const target = GetRelatedEvents(sourceEvent, RISING_SUNLIGHT).reduce(
        (prev: number | undefined, e) => prev || (e as CastEvent).targetID,
        undefined,
      );
      return (
        !HasRelatedEvent(referencedEvent, HOLY_SHOCK_SOURCE) &&
        (referencedEvent as TargettedEvent<EventType>).targetID === target
      );
    },
  },
  // Attribute 3 repeats of holy shock damage/heal events to Divine Resonance talent
  {
    linkRelation: HOLY_SHOCK_SOURCE,
    reverseLinkRelation: HOLY_SHOCK_SOURCE,
    linkingEventId: SPELLS.DIVINE_RESONANCE_TALENT_HOLY.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: [SPELLS.HOLY_SHOCK_HEAL.id, SPELLS.HOLY_SHOCK_DAMAGE.id],
    referencedEventType: [EventType.Heal, EventType.Damage],
    forwardBufferMs: DIVINE_RESONANCE_DURATION_MS + LONG_BUFFER_MS,
    maximumLinks: 3,
    anyTarget: true,
    additionalCondition(sourceEvent, referencedEvent) {
      if (HasRelatedEvent(referencedEvent, HOLY_SHOCK_SOURCE)) {
        return false;
      }
      // add 0.1s tolerance for being slightly faster than 5s.
      const since = (referencedEvent.timestamp - sourceEvent.timestamp) / 1000 + 0.1;
      return since > 5 && since % 5 < 1 && !HasRelatedEvent(referencedEvent, HOLY_SHOCK_SOURCE);
    },
  },
];

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default CastLinkNormalizer;
