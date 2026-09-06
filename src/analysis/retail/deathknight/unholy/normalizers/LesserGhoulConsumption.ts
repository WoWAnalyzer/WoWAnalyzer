import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';

// Include both consumers so a nearby Scourge Strike removal is not attributed
// to Soul Reaper. Removals can precede the cast in the combat log.
export const { normalizer: LesserGhoulConsumptionNormalizer, linkHelper: LesserGhoulConsumption } =
  EventLinkNormalizer.build({
    linkRelation: 'lesser-ghoul-consuming-cast',
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    linkingEventId: SPELLS.LESSER_GHOUL_BUFF.id,
    referencedEventId: [TALENTS.SOUL_REAPER_TALENT.id, TALENTS.SCOURGE_STRIKE_TALENT.id],
    referencedEventType: EventType.Cast,
    backwardBufferMs: 100,
    forwardBufferMs: 100,
    anyTarget: true,
    maximumLinks: 1,
    reverseLinkRelation: 'lesser-ghoul-consumption',
  });
