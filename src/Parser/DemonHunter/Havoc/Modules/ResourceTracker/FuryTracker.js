import Combatants from 'Parser/Core/Modules/Combatants';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const DOG_COOLDOWN_REDUCTION_MS = 1000/30;

class FuryTracker extends ResourceTracker {
	static dependencies = {
		combatants: Combatants,
		spellUsable: SpellUsable,
	};

	totalCooldownReduction = 0;
	totalCooldownReductionWasted = 0;

	on_initialized() {
		this.resourceType = RESOURCE_TYPES.FURY.id;
		this.resourceName = 'Fury';
	}

	getReducedCost(event) {
		if(!this.getResource(event).cost) {
			return 0;
		}
		let cost = this.getResource(event).cost;
		const spellId = event.ability.guid;
		if ((spellId === SPELLS.BLADE_DANCE.id || spellId === SPELLS.DEATH_SWEEP.id) 
			 && (this.combatants.selected.hasTalent(SPELLS.FIRST_BLOOD_TALENT.id) || this.combatants.selected.hasRing(SPELLS.SOUL_OF_THE_SLAYER.id))) {
			cost = cost - 20;
		}
		if(spellId === SPELLS.EYE_BEAM.id) {
			const rank = this.combatants.selected.traitsBySpellId[SPELLS.WIDE_EYES.id];
			cost = cost - 5 * rank;
		}
		if(spellId === SPELLS.CHAOS_NOVA.id && this.combatants.selected.hasTalent(SPELLS.UNLEASHED_POWER_TALENT.id)) {
			cost = 0;
		}
		this.reduceCooldown(cost);
		return cost;
	}
	

	reduceCooldown(cost) {
		if(!this.combatants.selected.hasShoulder(ITEMS.DELUSIONS_OF_GRANDEUR.id)){
			return;
		}
		const spellId = SPELLS.METAMORPHOSIS_HAVOC.id;
		if(!this.spellUsable.isOnCooldown(spellId)){
			this.totalCooldownReductionWasted += cost * DOG_COOLDOWN_REDUCTION_MS;
			return;
		}
		const reduction = this.spellUsable.reduceCooldown(spellId, cost * DOG_COOLDOWN_REDUCTION_MS);
		this.totalCooldownReduction += reduction;
	}

	get cooldownReduction(){
    return this.totalCooldownReduction / 1000;
  }

  get cooldownReductionWasted(){
    return this.totalCooldownReductionWasted / 1000;
  }
}

export default FuryTracker;