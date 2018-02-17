import Combatants from 'Parser/Core/Modules/Combatants';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

class AstralPowerTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  totalCooldownReduction = 0;
  totalCooldownReductionWasted = 0;

  on_initialized() {
    this.resource = RESOURCE_TYPES.ASTRAL_POWER;
  }

  getReducedCost(event) {
  	if (!this.getResource(event).cost) {
  		return 0;
  	}
  	let cost = this.getResource(event).cost / 10;
  	const abilityId = event.ability.guid;
  	if (abilityId === SPELLS.STARSURGE_MOONKIN.id && this.combatants.selected.hasBuff(SPELLS.THE_EMERALD_DREAMCATCHER.id)) {
      const stacks = this.combatants.selected.getBuff(SPELLS.THE_EMERALD_DREAMCATCHER.id).stacks;
      cost = cost - 5 * stacks;
  	} else if (abilityId === SPELLS.STARFALL_CAST.id && (this.combatants.selected.hasTalent(SPELLS.SOUL_OF_THE_FOREST_TALENT_BALANCE.id) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_ARCHDRUID.id))) {
  			cost = cost - 20;
  	}
    this.reduceCooldown(cost);
  	return cost;
  }

  reduceCooldown(cost){
    if (!this.combatants.selected.hasFinger(ITEMS.IMPECCABLE_FEL_ESSENCE.id)){
      return;
    }
    const COOLDOWN_REDUCTION_MS = 1000/12;
    let cooldownID = SPELLS.CELESTIAL_ALIGNMENT.id;
    if(this.combatants.selected.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id)){
      cooldownID = SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id;
    }
    if (!this.spellUsable.isOnCooldown(cooldownID)){
      this.totalCooldownReductionWasted += cost * COOLDOWN_REDUCTION_MS;
      return;
    }
    const reduction = this.spellUsable.reduceCooldown(cooldownID, cost * COOLDOWN_REDUCTION_MS);
    this.totalCooldownReduction += reduction;
  }

  get cooldownReduction(){
    return this.totalCooldownReduction;
  }

  get cooldownReductionWasted(){
    return this.totalCooldownReductionWasted;
  }

}

export default AstralPowerTracker;
