import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const FROSTBOLT_CRIT_REDUCTION_MS = 500;

class FrozenOrb extends Analyzer {

	static dependencies = {
		combatants: Combatants,
		spellUsable: SpellUsable,
	}

	baseCooldown = 180;
	cooldownReduction = 0;

	on_initialized() {
		this.reductionAmount = FROSTBOLT_CRIT_REDUCTION_MS * this.combatants.selected.traitsBySpellId[SPELLS.FROZEN_VEINS_TRAIT.id];
	}

  on_byPlayer_damage(event) {
		if(event.ability.guid !== SPELLS.FROSTBOLT_DAMAGE.id || event.hitType !== HIT_TYPES.CRIT) {
			return;
		}
		if (this.spellUsable.isOnCooldown(SPELLS.ICY_VEINS.id)) {
			this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.ICY_VEINS.id,(this.reductionAmount));
		}
  }
}

export default FrozenOrb;
