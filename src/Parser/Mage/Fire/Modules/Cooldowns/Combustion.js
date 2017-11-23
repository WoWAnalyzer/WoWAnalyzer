import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const COMBUST_REDUCTION_SPELLS = [
	SPELLS.FIREBALL.id,
	SPELLS.PYROBLAST.id,
	SPELLS.FIRE_BLAST.id,
];

class Combustion extends Analyzer {

	static dependencies = {
		combatants: Combatants,
		spellUsable: SpellUsable,
	}

	reductionAmount = 1000
	cooldownReduction = 0;

	on_initialized() {
		this.active = this.combatants.selected.hasTalent(SPELLS.KINDLING_TALENT.id);
	}

  on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if (!COMBUST_REDUCTION_SPELLS.includes(spellId) || event.hitType !== HIT_TYPES.CRIT) {
			return;
		}
		if (this.spellUsable.isOnCooldown(SPELLS.COMBUSTION.id)) {
			this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.COMBUSTION.id,(this.reductionAmount));
		}
  }
}

export default Combustion;
