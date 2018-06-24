import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  hasConvergenceOfFates = false;
  constructor(...args) {
    super(...args);
    this.hasConvergenceOfFates = this.selectedCombatant.hasTrinket(ITEMS.CONVERGENCE_OF_FATES.id);
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
