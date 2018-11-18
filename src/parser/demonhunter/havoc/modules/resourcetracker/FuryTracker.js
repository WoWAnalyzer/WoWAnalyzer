import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resourcetracker/ResourceTracker';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const DOG_COOLDOWN_REDUCTION_MS = 1000/30;

class FuryTracker extends ResourceTracker {
	static dependencies = {
		...ResourceTracker.dependencies,
		spellUsable: SpellUsable,
	};

	totalCooldownReduction = 0;
	totalCooldownReductionWasted = 0;

	constructor(...args) {
    super(...args);
		this.resource = RESOURCE_TYPES.FURY;
	}

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		const blindFuryId = SPELLS.BLIND_FURY_TALENT.id;
		//TODO: Account for Eye Beam clipping
		// Blind Fury resource gain does not have an energize event so it is handled here
		if(spellId === SPELLS.EYE_BEAM.id && this.selectedCombatant.hasTalent(blindFuryId)) {
			this.processInvisibleEnergize(blindFuryId, 105);
		}
		super.on_byPlayer_cast(event);
	}

	getReducedCost(event) {
		if(!this.getResource(event).cost) {
			return 0;
		}
		let cost = this.getResource(event).cost;
		const spellId = event.ability.guid;
		if ((spellId === SPELLS.BLADE_DANCE.id || spellId === SPELLS.DEATH_SWEEP.id)
			 && (this.selectedCombatant.hasTalent(SPELLS.FIRST_BLOOD_TALENT.id) || this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_SLAYER.id))) {
			cost = cost - 20;
		}
		if(spellId === SPELLS.EYE_BEAM.id) {
			const rank = this.selectedCombatant.traitsBySpellId[SPELLS.WIDE_EYES.id];
			cost = cost - 5 * rank;
		}
		if(spellId === SPELLS.CHAOS_NOVA.id && this.selectedCombatant.hasTalent(SPELLS.UNLEASHED_POWER_TALENT.id)) {
			cost = 0;
		}
		this.reduceCooldown(cost);
		return cost;
	}


	reduceCooldown(cost) {
		if(!this.selectedCombatant.hasShoulder(ITEMS.DELUSIONS_OF_GRANDEUR.id)){
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
