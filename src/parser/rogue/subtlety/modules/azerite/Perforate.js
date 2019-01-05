import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

/**
 * Perforate
 * Cooldown of Shadow Blades is reduced by 0.5s per backstab
 */
class Perforate extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PERFORATE.id);
    
    if(!this.active){
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BACKSTAB), this.reduceCd);
  }

  reduceCd(event) {
    if (this.spellUsable.isOnCooldown(SPELLS.SHADOW_BLADES.id)) {
      this.spellUsable.reduceCooldown(SPELLS.SHADOW_BLADES.id, 500);
    }
  }
}

export default Perforate;
