import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { EssenceBurstRefreshNormalizer } from '../../../shared';
import { GROUPING_EVENT_LINKS } from './GroupingEventLinks';
import { ESSENCE_BURST_EVENT_LINKS } from './EssenceBurstEventLinks';
import { ECHO_EVENT_LINKS } from './EchoEventLinks';
import { BRONZE_EVENT_LINKS } from './BronzeEventLinks';
import { GREEN_EVENT_LINKS } from './GreenEventLinks';
import { RED_EVENT_LINKS } from './RedEventLinks';
import { TIER_EVENT_LINKS } from './TierEventLinks';

const EVENT_LINKS: EventLink[] = [
  ...ECHO_EVENT_LINKS,
  ...ESSENCE_BURST_EVENT_LINKS,
  ...GROUPING_EVENT_LINKS,
  ...BRONZE_EVENT_LINKS,
  ...GREEN_EVENT_LINKS,
  ...RED_EVENT_LINKS,
  ...TIER_EVENT_LINKS,
];

/**
 * When a spell is cast on a target, the ordering of the Cast and ApplyBuff/RefreshBuff/(direct)Heal
 * can be semi-arbitrary, making analysis difficult.
 *
 * This normalizer adds a _linkedEvent to the ApplyBuff/RefreshBuff/RemoveBuff linking back to the Cast event
 * that caused it (if one can be found).
 *
 * This normalizer adds links for Echo and Temporal Anomaly
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  static dependencies = {
    ...EventLinkNormalizer.dependencies,
    essenceBurstRefreshNormalizer: EssenceBurstRefreshNormalizer,
  };
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}
export default CastLinkNormalizer;
