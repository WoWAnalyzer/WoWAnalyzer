import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';
import Combatants from 'Parser/Core/Modules/Combatants';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    combatants: Combatants,
  };

  hasConvergenceOfFates = false;
  on_initialized() {
    this.hasConvergenceOfFates = this.combatants.selected.hasTrinket(ITEMS.CONVERGENCE_OF_FATES.id);
  }

  beginCooldown(spellId, ...args) {
    if (this.hasConvergenceOfFates && spellId === SPELLS.BATTLE_CRY.id) {
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(spellId);
      }
    }

    super.beginCooldown(spellId, ...args);
  }
}

export default SpellUsable;
