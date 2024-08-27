import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS';
import { CastEvent, DamageEvent, EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Analyzer';

const relation = 'execute_dmg';
const executeCastDmgDelayBuffer = 500;

const EXECUTE_LINK: EventLink = {
  linkRelation: relation,
  linkingEventId: [SPELLS.EXECUTE_GLYPHED.id, SPELLS.EXECUTE.id],
  linkingEventType: EventType.Cast,
  forwardBufferMs: executeCastDmgDelayBuffer,

  referencedEventId: [SPELLS.EXECUTE_DAMAGE.id, SPELLS.EXECUTE_GLYPHED.id],
  referencedEventType: EventType.Damage,
};

class ExecuteLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [EXECUTE_LINK]);
  }
}

export default ExecuteLinkNormalizer;

export function damageEvent(event: CastEvent): DamageEvent | undefined {
  return event._linkedEvents?.find((rel) => rel.relation === relation)?.event as DamageEvent;
}
