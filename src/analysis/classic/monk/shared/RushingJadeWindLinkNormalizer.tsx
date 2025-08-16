import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

export const RJW_DAMAGE = 'rjw-damage';
export const RJW_CAST = 'rjw-cast';

const RJW_SPELL_DAMAGE = 148187;
const RJW_SPELL_CAST = 116847;
const RJW_DURATION = 6000;

const damageLink = {
  linkRelation: RJW_CAST,
  reverseLinkRelation: RJW_DAMAGE,
  linkingEventId: RJW_SPELL_DAMAGE,
  linkingEventType: EventType.Damage,
  anyTarget: true,
  referencedEventId: RJW_SPELL_CAST,
  referencedEventType: EventType.Cast,
  maximumLinks: 1,
  // larger backward buffer to help with extensions
  backwardBufferMs: 1.2 * RJW_DURATION,
} satisfies EventLink;

export default class RushingJadeWindLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [damageLink]);
  }
}
