import { EventType } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/evoker';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';

export const OBSIDIAN_SCALES_CAST_BUFF_LINK = 'obsidianScalesCastBuffLink';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: OBSIDIAN_SCALES_CAST_BUFF_LINK,
    reverseLinkRelation: OBSIDIAN_SCALES_CAST_BUFF_LINK,
    linkingEventId: TALENTS.OBSIDIAN_SCALES_TALENT.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS.OBSIDIAN_SCALES_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: 10,
    backwardBufferMs: 10,
  },
];

class ObsidianScalesCastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default ObsidianScalesCastLinkNormalizer;
