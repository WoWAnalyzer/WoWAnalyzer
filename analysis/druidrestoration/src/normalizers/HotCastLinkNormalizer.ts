import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';

const CAST_TO_APPLY_BUFFER_MS = 100; // TODO can this be cut down?

const EVENT_LINKS: EventLink[] = [
  {
    linkingEventId: [SPELLS.REJUVENATION.id, SPELLS.REJUVENATION_GERMINATION.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.REJUVENATION.id,
    referencedEventType: [EventType.Cast],
    forwardBufferMs: CAST_TO_APPLY_BUFFER_MS,
    backwardBufferMs: CAST_TO_APPLY_BUFFER_MS,
  },
  {
    linkingEventId: SPELLS.REGROWTH.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.REGROWTH.id,
    referencedEventType: [EventType.Cast],
    forwardBufferMs: CAST_TO_APPLY_BUFFER_MS,
    backwardBufferMs: CAST_TO_APPLY_BUFFER_MS,
  },
  {
    linkingEventId: [SPELLS.LIFEBLOOM_HOT_HEAL.id, SPELLS.LIFEBLOOM_DTL_HOT_HEAL.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.LIFEBLOOM_HOT_HEAL.id,
    referencedEventType: [EventType.Cast],
    forwardBufferMs: CAST_TO_APPLY_BUFFER_MS,
    backwardBufferMs: CAST_TO_APPLY_BUFFER_MS,
  },
  {
    linkingEventId: SPELLS.WILD_GROWTH.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.WILD_GROWTH.id,
    referencedEventType: [EventType.Cast],
    forwardBufferMs: CAST_TO_APPLY_BUFFER_MS,
    backwardBufferMs: CAST_TO_APPLY_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkingEventId: [
      SPELLS.REJUVENATION.id,
      SPELLS.REJUVENATION_GERMINATION.id,
      SPELLS.REGROWTH.id,
      SPELLS.WILD_GROWTH.id,
      SPELLS.LIFEBLOOM_HOT_HEAL.id,
      SPELLS.LIFEBLOOM_DTL_HOT_HEAL.id,
    ],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.OVERGROWTH_TALENT.id,
    referencedEventType: [EventType.Cast],
    forwardBufferMs: CAST_TO_APPLY_BUFFER_MS,
    backwardBufferMs: CAST_TO_APPLY_BUFFER_MS,
  },
];

/**
 * When a HoT is cast on a target, the ordering of the Cast and ApplyBuff/RefreshBuff
 * can be semi-arbitrary, making analysis difficult.
 *
 * This normalizer adds a _linkedEvent to the ApplyBuff/RefreshBuff linking back to the Cast event
 * that caused it (if one can be found). No linked cast event can be used to detect procs.
 *
 * This normalizer adds links for Rejuvenation, Regrowth, Wild Growth, Lifebloom, and Overgrowth.
 */
class HotCastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}
export default HotCastLinkNormalizer;
