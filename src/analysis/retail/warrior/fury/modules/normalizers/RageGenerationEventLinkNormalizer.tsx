import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

export const RAGE_GENERATING_CAST = 'Rage-Generating-Cast';
const castEventBuffer = 5; // base 2s channel, hasted but shouldn't affect buffer window

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: RAGE_GENERATING_CAST,
    linkingEventId: [
      SPELLS.CRUSHING_BLOW.id,
      SPELLS.BLOODBATH.id,
      SPELLS.RAGING_BLOW.id,
      SPELLS.BLOODTHIRST.id,
      SPELLS.EXECUTE_FURY.id,
      SPELLS.WHIRLWIND_FURY_CAST.id,
    ],
    linkingEventType: EventType.ResourceChange,
    referencedEventId: [
      SPELLS.CRUSHING_BLOW.id,
      SPELLS.BLOODBATH.id,
      SPELLS.RAGING_BLOW.id,
      SPELLS.BLOODTHIRST.id,
      SPELLS.EXECUTE_FURY.id,
      SPELLS.WHIRLWIND_FURY_CAST.id,
    ],
    referencedEventType: EventType.Cast,
    forwardBufferMs: castEventBuffer,
    backwardBufferMs: castEventBuffer,
    anyTarget: true,
  },
];

class RageGenerationEventLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default RageGenerationEventLinkNormalizer;
