import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';

/**
 * Links each {@link SPELLS.BOILING_POINT_BUFF Boiling Point} removal to the echo it started. A
 * removal with no echo is the buff expiring unused.
 *
 * The echo is usually logged at the same time as the removal, but can land before it (up to ~90ms
 * has been seen), so the link looks both ways.
 */
export const { normalizer: BoilingPointNormalizer, linkHelper: BoilingPointEcho } =
  EventLinkNormalizer.build({
    linkRelation: 'boiling-point-echo',
    linkingEventType: EventType.RemoveBuff,
    linkingEventId: SPELLS.BOILING_POINT_BUFF.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.BOILING_POINT_ECHO_BUFF.id,
    backwardBufferMs: 150,
    forwardBufferMs: 150,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(talents.BOILING_POINT_TALENT),
  });

export default BoilingPointNormalizer;
