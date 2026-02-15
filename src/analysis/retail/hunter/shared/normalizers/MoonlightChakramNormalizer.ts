import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { MOONLIGHT_CHAKRAM_BUFFER } from '../../survival/constants';
export const TRIGGER_TO_CHAKRAM_CAST = 'trigger_to_chakram_cast';
export const CHAKRAM_CAST_TO_DAMAGE = 'chakram_cast_to_damage';

const links: EventLink[] = [
  {
    linkRelation: TRIGGER_TO_CHAKRAM_CAST,
    linkingEventType: EventType.Cast,
    linkingEventId: [SPELLS.TRUESHOT.id, SPELLS.TAKEDOWN_PLAYER.id],
    referencedEventType: EventType.Cast,
    referencedEventId: SPELLS.MOONLIGHT_CHAKRAM_CAST.id,
    anyTarget: true,
    anySource: false,
    forwardBufferMs: MOONLIGHT_CHAKRAM_BUFFER,
    backwardBufferMs: 0,
    maximumLinks: 1,
  },
  {
    linkRelation: CHAKRAM_CAST_TO_DAMAGE,
    linkingEventType: EventType.Cast,
    linkingEventId: SPELLS.MOONLIGHT_CHAKRAM_CAST.id,
    referencedEventType: EventType.Damage,
    referencedEventId: SPELLS.MOONLIGHT_CHAKRAM_DAMAGE.id,
    anyTarget: true,
    anySource: false,
    forwardBufferMs: MOONLIGHT_CHAKRAM_BUFFER,
    backwardBufferMs: 0,
  },
];

export default class MoonlightChakramNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, links);
  }
}
