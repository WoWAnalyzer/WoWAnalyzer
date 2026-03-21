import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';

export const MARK_REMOVAL_TO_DAMAGE = 'mark_removal_to_damage';
export const MARK_APPLY_TO_RECENT_DAMAGE = 'mark_apply_to_recent_damage';

const links: EventLink[] = [
  {
    linkRelation: MARK_REMOVAL_TO_DAMAGE,
    linkingEventType: EventType.RemoveDebuff,
    linkingEventId: SPELLS.SENTINELS_MARK_DEBUFF.id,
    referencedEventType: EventType.Damage,
    referencedEventId: [SPELLS.WILDFIRE_BOMB_IMPACT.id, TALENTS.AIMED_SHOT_TALENT.id],
    anyTarget: false,
    anySource: false,
    forwardBufferMs: 100,
    backwardBufferMs: 100,
    maximumLinks: 1,
  },
  {
    linkRelation: MARK_APPLY_TO_RECENT_DAMAGE,
    linkingEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    linkingEventId: SPELLS.SENTINELS_MARK_DEBUFF.id,
    referencedEventType: EventType.Damage,
    referencedEventId: null,
    anyTarget: false,
    anySource: false,
    forwardBufferMs: 0,
    backwardBufferMs: 2000,
    maximumLinks: 1,
  },
];

export default class SentinelsMarkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, links);
  }
}
