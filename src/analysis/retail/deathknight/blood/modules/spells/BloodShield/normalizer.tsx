import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { AbsorbedEvent, DamageEvent, EventType } from 'parser/core/Events';

export const BLOOD_SHIELD_ABSORB = 'blood-shield-absorb';
export const BLOOD_SHIELD_ABSORBED_HIT = 'blood-shield-absorbed-hit';

const absorbLink: EventLink = {
  linkRelation: BLOOD_SHIELD_ABSORBED_HIT,
  reverseLinkRelation: BLOOD_SHIELD_ABSORB,
  linkingEventId: SPELLS.BLOOD_SHIELD.id,
  linkingEventType: EventType.Absorbed,
  referencedEventId: null,
  referencedEventType: EventType.Damage,
  backwardBufferMs: 100,
  forwardBufferMs: 100,
  maximumLinks: 1,
  anySource: true,
  anyTarget: false,
  additionalCondition: (linkingEvent, referencedEvent) =>
    (referencedEvent as DamageEvent).ability.guid ===
    (linkingEvent as AbsorbedEvent).extraAbility.guid,
};

export default class BloodShieldNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [absorbLink]);
  }
}
