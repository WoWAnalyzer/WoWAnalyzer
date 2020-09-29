import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import { DispelEvent } from 'parser/core/Events';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  on_dispel(event: DispelEvent) {
    if (!this.owner.byPlayer(event)) {
      return;
    }

    const spellId = event.ability.guid;
    if (spellId === SPELLS.PURIFY.id) {
      super.beginCooldown(spellId, event);
    }
  }

  beginCooldown(spellId: number, cooldownTriggerEvent: any) {
    // Essentially having the purify cast not be able to trigger the cooldown, the dispel event does it instead.
    if (spellId === SPELLS.PURIFY.id) {
      return;
    }

    super.beginCooldown(spellId, cooldownTriggerEvent);
  }
}

export default SpellUsable;
