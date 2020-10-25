import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';

class Incarnation extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  
  constructor(options){
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT), this.onApplyBuff);
  }

  onApplyBuff(event) {
    if (this.spellUsable.isOnCooldown(SPELLS.MANGLE_BEAR.id)) {
      this.spellUsable.endCooldown(SPELLS.MANGLE_BEAR.id);
    }
    if (this.spellUsable.isOnCooldown(SPELLS.THRASH_BEAR.id)) {
      this.spellUsable.endCooldown(SPELLS.THRASH_BEAR.id);
    }
  }
}

export default Incarnation;
