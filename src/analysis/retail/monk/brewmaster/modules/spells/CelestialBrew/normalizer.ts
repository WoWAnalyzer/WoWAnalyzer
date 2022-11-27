import talents from 'common/TALENTS/monk';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { AbsorbedEvent, DamageEvent, EventType } from 'parser/core/Events';

const relation = 'cb-absorb';
const reverseRelation = 'cb-absorb-reverse';
const CelestialBrewAbsorbLink: EventLink = {
  linkRelation: relation,
  linkingEventId: talents.CELESTIAL_BREW_TALENT.id,
  linkingEventType: EventType.Absorbed,
  referencedEventType: EventType.Damage,
  referencedEventId: null,
  backwardBufferMs: 100,
  anySource: true,
  anyTarget: false,
  maximumLinks: 1,
  reverseLinkRelation: reverseRelation,
  additionalCondition: (linkingEvent, referencedEvent) =>
    linkingEvent.type === EventType.Absorbed &&
    referencedEvent.type === EventType.Damage &&
    linkingEvent.extraAbility.guid === referencedEvent.ability.guid,
  isActive: (combatant) => combatant.hasTalent(talents.CELESTIAL_BREW_TALENT),
};

export default class CelestialBrewNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [CelestialBrewAbsorbLink]);
  }
}

export function damageEvent(event: AbsorbedEvent): DamageEvent | undefined {
  return event._linkedEvents?.find((rel) => rel.relation === relation)?.event as DamageEvent;
}

export function cbAbsorb(event: DamageEvent): AbsorbedEvent | undefined {
  return event._linkedEvents?.find((rel) => rel.relation === reverseRelation)
    ?.event as AbsorbedEvent;
}
