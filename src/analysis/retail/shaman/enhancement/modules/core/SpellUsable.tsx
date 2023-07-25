import { AbilityEvent, EventType } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import Stormbringer from 'analysis/retail/shaman/enhancement/modules/spells/Stormbringer';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  protected stormbringer!: Stormbringer;

  beginCooldown(triggeringEvent: AbilityEvent<any>, spellId: number) {
    if (triggeringEvent.type === EventType.FreeCast) {
      return;
    }

    super.beginCooldown(triggeringEvent, spellId);
  }
}

export default SpellUsable;
