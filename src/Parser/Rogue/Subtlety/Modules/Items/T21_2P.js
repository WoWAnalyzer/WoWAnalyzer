import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import ResourceTypes from 'common/RESOURCE_TYPES';
import Analyzer from 'Parser/Core/Analyzer';

class T21_2P extends Analyzer {
  static dependencies = {
    combatants: Combatants,
		spellUsable: SpellUsable,
  };

	on_initialized(){
		this.active = this.combatants.selected.hasBuff(SPELLS.SUB_ROGUE_T21_2SET_BONUS.id);
  }

  on_byPlayer_spendresource(event){
    const spent = event.resourceChange;
    if(event.resourceChangeType !== ResourceTypes.COMBO_POINTS) return;

    if(this.spellUsable.isOnCooldown(SPELLS.SYMBOLS_OF_DEATH.id)){
			this.spellUsable.reduceCooldown(SPELLS.SYMBOLS_OF_DEATH.id, 200 * spent );
    }
  }
}

export default T21_2P;