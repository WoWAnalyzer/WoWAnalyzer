import Combatants from 'Parser/Core/Modules/Combatants';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

class AstralPowerTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.resourceType = RESOURCE_TYPES.ASTRAL_POWER.id;
    this.resourceName = 'Astral Power';
  }

  getReducedCost(event) {
  	if (!this.getResource(event).cost) {
  		return 0;
  	}
  	const cost = this.getResource(event).cost / 10;
  	const abilityId = event.ability.guid;
  	if(abilityId === SPELLS.STARSURGE_MOONKIN.id) {
  		if(this.combatants.selected.hasBuff(SPELLS.THE_EMERALD_DREAMCATCHER.id)){
        const stacks = this.combatants.selected.getBuff(SPELLS.THE_EMERALD_DREAMCATCHER.id).stacks;
  			return cost - 5 * stacks;
  		}
  	} else if(abilityId === SPELLS.STARFALL_CAST.id) {
  		if(this.combatants.selected.hasTalent(SPELLS.SOUL_OF_THE_FOREST_TALENT_BALANCE.id) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_ARCHDRUID.id)){
  			return cost - 20;
  		}
  	}
  	return cost;
  }
}

export default AstralPowerTracker;