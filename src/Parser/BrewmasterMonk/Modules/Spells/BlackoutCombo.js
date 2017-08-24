import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

class BlackoutCombo extends Module {
  blackoutComboConsumed = 0;
  blackoutComboWasted = 0;
  blackoutComboBuffs = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasTalent(SPELLS.BLACKOUT_COMBO_TALENT.id);
  }
  
}

export default BlackoutCombo;
