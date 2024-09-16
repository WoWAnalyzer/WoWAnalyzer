import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import { CastEvent, EventType, FreeCastEvent, HasRelatedEvent } from 'parser/core/Events';

export const TEMPEST_SOURCE_SPELL_EVENT_LINK = 'tempest-source';

class StormbringerEventLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [
      // Spending maelstrom
      {
        linkRelation: TEMPEST_SOURCE_SPELL_EVENT_LINK,
        linkingEventId: null,
        linkingEventType: [EventType.Cast, EventType.FreeCast],
        referencedEventId: SPELLS.TEMPEST_BUFF.id,
        referencedEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff],
        backwardBufferMs: -1, // don't check backwards at all
        forwardBufferMs: 350,
        anySource: true,
        anyTarget: true,
        maximumLinks: 1,
        reverseLinkRelation: TEMPEST_SOURCE_SPELL_EVENT_LINK,
        isActive: (c) => c.hasTalent(TALENTS.TEMPEST_TALENT),
        additionalCondition: (linkingEvent, referencedEvent) => {
          if (HasRelatedEvent(referencedEvent, TEMPEST_SOURCE_SPELL_EVENT_LINK)) {
            return false;
          }
          const event = (linkingEvent as CastEvent | FreeCastEvent)!; // only types that match linkingEventType will be checked
          const cr =
            getResource(event.classResources, RESOURCE_TYPES.MAELSTROM.id) ??
            getResource(event.classResources, RESOURCE_TYPES.MAELSTROM_WEAPON.id);
          return Boolean(cr && cr.cost && cr.cost > 0);
        },
      },
      {
        linkRelation: TEMPEST_SOURCE_SPELL_EVENT_LINK,
        linkingEventId: SPELLS.AWAKENING_STORMS_BUFF.id,
        linkingEventType: EventType.RemoveBuff,
        referencedEventId: SPELLS.TEMPEST_BUFF.id,
        referencedEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff],
        backwardBufferMs: 0, // StormbringerEventOrderNormalizer reorders the awakening storms removebuff to **after** the tempest applybuff
        forwardBufferMs: -1, // don't check forward at all
        anySource: true,
        anyTarget: true,
        maximumLinks: 1,
        reverseLinkRelation: TEMPEST_SOURCE_SPELL_EVENT_LINK,
        isActive: (c) => c.hasTalent(TALENTS.TEMPEST_TALENT),
        additionalCondition: (_, referencedEvent) => {
          return !HasRelatedEvent(referencedEvent, TEMPEST_SOURCE_SPELL_EVENT_LINK);
        },
      },
    ]);
  }
}

export default StormbringerEventLinkNormalizer;
