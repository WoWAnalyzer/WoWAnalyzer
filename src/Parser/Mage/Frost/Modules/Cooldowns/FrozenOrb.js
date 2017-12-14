import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Tier20_4set from '../Items/Tier20_4set';

const BLIZZARD_REDUCTION_MS = 500;

class FrozenOrb extends Analyzer {

	static dependencies = {
		combatants: Combatants,
		tier20_4set: Tier20_4set,
		spellUsable: SpellUsable,
	}

	baseCooldown = 60;
	cooldownReduction = 0;

	on_initialized() {
		this.hasTierBonus = this.combatants.selected.hasBuff(SPELLS.FROST_MAGE_T20_4SET_BONUS_BUFF.id);
	}

  on_byPlayer_damage(event) {
		if(event.ability.guid !== SPELLS.BLIZZARD_DAMAGE.id) {
			return;
		}
		if (this.spellUsable.isOnCooldown(SPELLS.FROZEN_ORB.id)) {
			this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.FROZEN_ORB.id, BLIZZARD_REDUCTION_MS);
		}
  }
}

export default FrozenOrb;
