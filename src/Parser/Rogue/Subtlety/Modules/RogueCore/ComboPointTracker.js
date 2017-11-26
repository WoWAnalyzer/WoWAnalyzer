import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import ResourceTracker from '../ResourceTracker/ResourceTracker';

class ComboPointTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
		spellUsable: SpellUsable,
  };

  on_initialized() {
    this.resourceType = 4;
    this.resourceName = "Combo Points";
  }

  onSpent(spent)  {    
    const combatant = this.combatants.selected;

    if (this.spellUsable.isOnCooldown(SPELLS.SHADOW_DANCE.id)) {
      const reduction = combatant.hasTalent(SPELLS.ENVELOPING_SHADOWS_TALENT.id) ? 2500 : 1500;

			this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.SHADOW_DANCE.id, reduction * spent );
    }
    if(combatant.hasBuff(SPELLS.SUB_ROGUE_T21_2SET_BONUS.id)){
			this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.SYMBOLS_OF_DEATH.id, 200 * spent );
    }
  }
}

export default ComboPointTracker;