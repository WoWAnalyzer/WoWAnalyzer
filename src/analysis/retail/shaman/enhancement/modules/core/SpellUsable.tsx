import { AbilityEvent, EventType } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  beginCooldown(triggeringEvent: AbilityEvent<any>, spellId: number) {
    if (triggeringEvent.type === EventType.FreeCast) {
      return;
    }

    super.beginCooldown(triggeringEvent, spellId);
  }
}

export default SpellUsable;
