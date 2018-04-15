import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const BLIZZARD_REDUCTION_MS = 500;

class FrozenOrb extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		spellUsable: SpellUsable,
	};

	baseCooldown = 60;
	cooldownReduction = 0;

  on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.BLIZZARD_DAMAGE.id) {
			return;
		}
		if (this.spellUsable.isOnCooldown(SPELLS.FROZEN_ORB.id)) {
			this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.FROZEN_ORB.id, BLIZZARD_REDUCTION_MS);
		}
  }
}

export default FrozenOrb;
