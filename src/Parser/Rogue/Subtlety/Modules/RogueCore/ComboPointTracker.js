import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import ResourceTracker from '../ResourceTracker/ResourceTracker';

class ComboPointTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
		spellUsable: SpellUsable,
  };

  danceReduction;

  on_initialized() {
    this.resourceType = 4;
    this.resourceName = "Combo Points";
    this.danceReduction = this.combatants.selected.hasTalent(SPELLS.ENVELOPING_SHADOWS_TALENT.id) ? 2500 : 1500;
  }

  onSpent(spent)  {
    if (this.spellUsable.isOnCooldown(SPELLS.SHADOW_DANCE.id)) {
			this.spellUsable.reduceCooldown(SPELLS.SHADOW_DANCE.id, this.danceReduction * spent );
    }
    if(this.combatants.selected.hasBuff(SPELLS.SUB_ROGUE_T21_2SET_BONUS.id 
      && this.spellUsable.isOnCooldown(SPELLS.SYMBOLS_OF_DEATH.id))){
			this.spellUsable.reduceCooldown(SPELLS.SYMBOLS_OF_DEATH.id, 200 * spent );
    }
  }
}

export default ComboPointTracker;