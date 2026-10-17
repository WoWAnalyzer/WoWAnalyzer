import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';

export const EXTERMINATE_CONSUMER = 'exterminate-consumer';

/**
 * Links each {@link talents.EXTERMINATE_TALENT Exterminate} buff refresh or removal to the
 * Marrowrend/Obliterate cast that consumed a stack. A removal with no consumer is the buff
 * expiring, and a refresh with no consumer is a gain while capped.
 */
const consumerLink: EventLink = {
  linkRelation: EXTERMINATE_CONSUMER,
  linkingEventType: [EventType.RemoveBuff, EventType.RefreshBuff],
  linkingEventId: [SPELLS.EXTERMINATE_BUFF.id, SPELLS.EXTERMINATE_PAINFUL_DEATH_BUFF.id],
  referencedEventType: EventType.Cast,
  referencedEventId: [talents.MARROWREND_TALENT.id, talents.OBLITERATE_TALENT.id],
  anyTarget: true,
  // generally the cast is logged just before the buff event, but could be before or after.
  backwardBufferMs: 100,
  forwardBufferMs: 100,
  maximumLinks: 1,
  isActive: (c) => c.hasTalent(talents.EXTERMINATE_TALENT),
};

export default class WastedExterminateNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [consumerLink]);
  }
}
