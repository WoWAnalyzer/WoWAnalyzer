import talents from 'common/TALENTS/monk';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';

export const BOF_TARGET_HIT = 'bof-target';
const links: EventLink[] = [
  {
    linkRelation: BOF_TARGET_HIT,
    linkingEventType: EventType.Cast,
    linkingEventId: talents.BREATH_OF_FIRE_TALENT.id,
    referencedEventType: EventType.Damage,
    referencedEventId: talents.BREATH_OF_FIRE_TALENT.id,
    anyTarget: true,
    anySource: false,
    forwardBufferMs: 100,
  },
];

export default class BreathOfFireDebuffTargetNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, links);
  }
}
