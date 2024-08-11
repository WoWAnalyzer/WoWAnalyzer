import SPELLS from 'common/SPELLS/classic/hunter';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

export const KILL_SHOT_DAMAGE = 'kill-shot-damage';

const link: EventLink = {
  linkRelation: KILL_SHOT_DAMAGE,
  linkingEventId: SPELLS.KILL_SHOT.id,
  linkingEventType: EventType.Cast,
  referencedEventId: SPELLS.KILL_SHOT.id,
  referencedEventType: EventType.Damage,
  maximumLinks: 1,
  backwardBufferMs: 0,
  forwardBufferMs: 3000,
};

export default class KillShotNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [link]);
  }
}
