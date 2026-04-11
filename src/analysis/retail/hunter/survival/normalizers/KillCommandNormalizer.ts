import TALENTS from 'common/TALENTS/hunter';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';

/**
 * Links a Kill Command cast event to its corresponding focus resourcechange event
 * at the same timestamp, allowing analyzers to read the actual focus gained
 * (including waste from overcapping) directly from the cast event.
 */
const { normalizer: KillCommandNormalizer, linkHelper: KCFocusLink } = EventLinkNormalizer.build({
  linkRelation: 'kill-command-cast-focus',
  linkingEventId: TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id,
  referencedEventType: EventType.ResourceChange,
  forwardBufferMs: 0,
  anyTarget: true,
  maximumLinks: 1,
} as const);

export { KCFocusLink };
export default KillCommandNormalizer;
