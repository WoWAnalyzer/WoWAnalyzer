import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS';
import { CastEvent, DamageEvent, EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Analyzer';

const relation = 'execute_dmg';
const EXECUTE_LINK: EventLink = {
  linkRelation: relation,
  linkingEventId: [SPELLS.EXECUTE_GLYPHED.id, SPELLS.EXECUTE.id],
  linkingEventType: EventType.Cast,
  forwardBufferMs: 500,
  //seems quite large buffer, but its a long animation, and the combatlog is unreliable.
  //a few examples for the timestamps:
  //Cast3585726:Damage3586071 (~350ms)
  //Cast3889203:Damage3889540 (~340ms)
  //Cast3900203:Damage3900536 (~330ms)
  //assuming it varies with haste and server lag at the time.

  referencedEventId: [SPELLS.EXECUTE_DAMAGE.id, SPELLS.EXECUTE_GLYPHED.id],
  referencedEventType: EventType.Damage,
};

class ExecuteNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [EXECUTE_LINK]);
  }
}

export default ExecuteNormalizer;

export function damageEvent(event: CastEvent): DamageEvent {
  return event._linkedEvents?.find((rel) => rel.relation === relation)?.event as DamageEvent;
}
