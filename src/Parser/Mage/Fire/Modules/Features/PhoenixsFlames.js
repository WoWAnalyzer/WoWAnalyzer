import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const REDUCTION_MS = 10000;

class PhoenixsFlames extends Analyzer {

	static dependencies = {
		combatants: Combatants,
		spellUsable: SpellUsable,
	}

	cooldownReduction = 0;

	on_initialized() {
		this.active = this.combatants.selected.traitsBySpellId[SPELLS.PHOENIX_REBORN_TRAIT.id] > 0;
	}

  on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.PHOENIX_REBORN.id) {
			return;
		}
		if (this.spellUsable.isOnCooldown(SPELLS.PHOENIXS_FLAMES.id)) {
			this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.PHOENIXS_FLAMES.id,(REDUCTION_MS));
		}
  }
}

export default PhoenixsFlames;
