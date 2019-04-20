import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resourcetracker/ResourceTracker';
import SPELLS from 'common/SPELLS';

class ComboPointTracker extends ResourceTracker {
  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.COMBO_POINTS;
  }

  on_byPlayer_damage(event) {
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

export default ComboPointTracker;
