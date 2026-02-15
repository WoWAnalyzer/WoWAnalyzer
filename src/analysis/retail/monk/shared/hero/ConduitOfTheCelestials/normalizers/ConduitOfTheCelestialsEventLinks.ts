import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import talents from 'common/TALENTS/monk';
import { DamageEvent, EventType, GetRelatedEvents, HealEvent } from 'parser/core/Events';
import { CAST_BUFFER_MS } from 'analysis/retail/monk/mistweaver/normalizers/EventLinks/EventLinkConstants';
import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Module';
import SPECS from 'game/SPECS';
import { CELESTIAL_CONDUIT_MAX_DURATION, CELESTIAL_CONDUIT_MAX_TARGETS } from '../constants';

export const CELESTIAL_CONDUIT_CAST = 'CelestialConduitCast';
export const CELESTIAL_CONDUIT = 'CelestialConduit';
export const RESTORE_BALANCE_APPLY = 'restoreBalanceApply';
export const UNITY_FOTRC = 'UnityFlightOfTheRedCrane';
export const UNITY_COTWT = 'UnityCourageOfTheWhiteTiger';
export const UNITY_SOTBO = 'UnityStrengthOfTheBlackOx';

const CELESTIAL_CONDUIT_LINKS: EventLink[] = [
  {
    linkRelation: CELESTIAL_CONDUIT_CAST,
    reverseLinkRelation: CELESTIAL_CONDUIT_CAST,
    linkingEventId: [SPELLS.CELESTIAL_CONDUIT_HEAL.id, SPELLS.CELESTIAL_CONDUIT_DAMAGE.id],
    linkingEventType: [EventType.Heal, EventType.Damage],
    referencedEventId: [
      talents.CELESTIAL_CONDUIT_MISTWEAVER_TALENT.id,
      talents.CELESTIAL_CONDUIT_WINDWALKER_TALENT.id,
    ],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CELESTIAL_CONDUIT_MAX_DURATION,
    isActive(c) {
      return (
        c.hasTalent(talents.CELESTIAL_CONDUIT_MISTWEAVER_TALENT) ||
        c.hasTalent(talents.CELESTIAL_CONDUIT_WINDWALKER_TALENT)
      );
    },
  },
  //grouping damage and heal events on tick
  {
    linkRelation: CELESTIAL_CONDUIT,
    linkingEventId: [SPELLS.CELESTIAL_CONDUIT_HEAL.id, SPELLS.CELESTIAL_CONDUIT_DAMAGE.id],
    linkingEventType: [EventType.Heal, EventType.Damage],
    referencedEventId: [SPELLS.CELESTIAL_CONDUIT_HEAL.id, SPELLS.CELESTIAL_CONDUIT_DAMAGE.id],
    referencedEventType: [EventType.Heal, EventType.Damage],
    anyTarget: true,
    maximumLinks: CELESTIAL_CONDUIT_MAX_TARGETS,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return (
        c.hasTalent(talents.CELESTIAL_CONDUIT_MISTWEAVER_TALENT) ||
        c.hasTalent(talents.CELESTIAL_CONDUIT_WINDWALKER_TALENT)
      );
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        linkingEvent.type === referencedEvent.type &&
        (linkingEvent as HealEvent | DamageEvent).targetID !==
          (referencedEvent as HealEvent | DamageEvent).targetID
      );
    },
  },
];

const UNITY_WITHIN_EVENT_LINKS: EventLink[] = [
  //flight of the red crane unity
  {
    linkRelation: UNITY_FOTRC,
    reverseLinkRelation: UNITY_FOTRC,
    linkingEventId: SPELLS.FLIGHT_OF_THE_RED_CRANE_UNITY.id,
    linkingEventType: EventType.Heal,
    referencedEventId: [
      SPELLS.UNITY_WITHIN_CAST.id,
      talents.CELESTIAL_CONDUIT_MISTWEAVER_TALENT.id,
      talents.CELESTIAL_CONDUIT_WINDWALKER_TALENT.id,
    ],
    referencedEventType: [EventType.Cast, EventType.EndChannel],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(talents.UNITY_WITHIN_TALENT) && c.specId === SPECS.MISTWEAVER_MONK.id;
    },
  },
  //courage of the white tiger unity
];

class ConduitOfTheCelestialsEventLinks extends EventLinkNormalizer {
  constructor(options: Options) {
    const EVENT_LINKS: EventLink[] = [...CELESTIAL_CONDUIT_LINKS, ...UNITY_WITHIN_EVENT_LINKS];

    super(options, EVENT_LINKS);
  }
}

export function getConduitEventGrouping(event: HealEvent | DamageEvent) {
  if (event.type === EventType.Heal) {
    return GetRelatedEvents(event, CELESTIAL_CONDUIT) as HealEvent[];
  }
  return GetRelatedEvents(event, CELESTIAL_CONDUIT) as DamageEvent[];
}

export default ConduitOfTheCelestialsEventLinks;
