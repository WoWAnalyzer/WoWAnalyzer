import { CastEvent, EventType, FreeCastEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  beginCooldown(
    triggeringEvent: CastEvent | FreeCastEvent,
    spellId: number = triggeringEvent.ability.guid,
  ) {
    if (triggeringEvent.type === EventType.FreeCast) {
      // ignore the event
      return;
    }
    super.beginCooldown(triggeringEvent, spellId);
  }
}

export default SpellUsable;
