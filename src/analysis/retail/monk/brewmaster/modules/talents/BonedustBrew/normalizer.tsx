import talents from 'common/TALENTS/monk';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';

export const debuffApplicationRelation = 'bdb-applyrefreshdebuff';
const links: EventLink[] = [
  {
    linkRelation: debuffApplicationRelation,
    linkingEventId: talents.BONEDUST_BREW_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: talents.BONEDUST_BREW_TALENT.id,
    referencedEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    anyTarget: true,
    anySource: false,
    forwardBufferMs: 600, // travel time
  },
];

export default class BonedustBrewCastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, links);
  }
}
