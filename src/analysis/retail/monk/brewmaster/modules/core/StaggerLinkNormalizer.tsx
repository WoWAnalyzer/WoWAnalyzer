import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { AbsorbedEvent, DamageEvent, EventType } from 'parser/core/Events';

export const StaggerDamageSource = 'StaggerDamageSource';
export const StaggerAbsorb = 'StaggerAbsorb';
const staggerLinks: EventLink[] = [
  {
    linkRelation: StaggerDamageSource,
    linkingEventId: SPELLS.STAGGER.id,
    linkingEventType: EventType.Absorbed,
    referencedEventId: null,
    referencedEventType: EventType.Damage,
    forwardBufferMs: 100,
    anySource: true,
    anyTarget: false,
    reverseLinkRelation: StaggerAbsorb,
    maximumLinks: 1,
    additionalCondition: (linkingEvent, referencedEvent) => {
      const absorb = linkingEvent as AbsorbedEvent;
      const prev = referencedEvent as DamageEvent;

      return absorb.extraAbility.guid === prev.ability.guid;
    },
  },
];

export default class StaggerLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, staggerLinks);
  }
}
