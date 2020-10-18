import SPELLS from 'common/SPELLS';

import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';

import ComboPointTracker from '../../../shared/resources/ComboPointTracker';

class OutlawComboPointTracker extends ComboPointTracker {
  constructor(options){
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event) {
    const spellId = event.ability.guid;
    
    // Bonus hits from Sinister Strike are not included in the energize event, so add them in here
    if(spellId === SPELLS.SINISTER_STRIKE_PROC.id) {      
      let amount = 1;

      if(this.selectedCombatant.hasBuff(SPELLS.BROADSIDE.id)){
        amount = 2;
      }

      this.processInvisibleEnergize(SPELLS.SINISTER_STRIKE.id, amount);
    }
  }
}

export default OutlawComboPointTracker;
