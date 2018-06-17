import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    combatants: Combatants,
  };

  on_dispel(event) {
    if (!this.owner.byPlayer(event)) {
      return;
    }

    const spellId = event.ability.guid;
    if (spellId === SPELLS.PURIFY_SPIRIT.id) {
      super.beginCooldown(spellId, event.timestamp);
    }
  }

  beginCooldown(spellId, timestamp) {
    // Essentially having the purify spirit cast not be able to trigger the cooldown, the dispel event does it instead.
    if (spellId === SPELLS.PURIFY_SPIRIT.id) {
      return;
    }

    super.beginCooldown(spellId, timestamp);
  }
}

export default SpellUsable;
