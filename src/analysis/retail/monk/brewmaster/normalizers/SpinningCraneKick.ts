import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';

export const SCK_DAMAGE_LINK = 'sck-damage';
export const SCK_CAST_LINK = 'sck-cast';

// the damage link is the reverse of the cast link.
//
// structured this way so that we only link each damage event to the most recent cast.
//
// NOTE: this is technically incorrect (the extra ticks at the end of the 2nd
// cast when chaining should be attributed differently) but this is currently
// only used for target detection so its okay.
const castLink: EventLink = {
  linkRelation: SCK_CAST_LINK,
  reverseLinkRelation: SCK_DAMAGE_LINK,
  linkingEventId: SPELLS.SPINNING_CRANE_KICK_DAMAGE.id,
  referencedEventId: SPELLS.SPINNING_CRANE_KICK_BRM.id,
  linkingEventType: EventType.Damage,
  referencedEventType: EventType.Cast,
  anyTarget: true,
  backwardBufferMs: 1600,
  maximumLinks: 1,
};

export default class SpinningCraneKickLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [castLink]);
  }
}
