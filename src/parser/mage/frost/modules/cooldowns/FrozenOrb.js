import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/core/modules/SpellUsable';

const REDUCTION_MS = 500;

class FrozenOrb extends Analyzer {
	static dependencies = {
		spellUsable: SpellUsable,
	}

	baseCooldown = 60;
	cooldownReduction = 0;

	constructor(...args) {
		super(...args);
		this.hasWhiteoutTrait = this.selectedCombatant.hasTrait(SPELLS.WHITEOUT.id);
	  }

  	on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.BLIZZARD_DAMAGE.id && spellId !== SPELLS.ICE_LANCE_DAMAGE.id) {
			return;
		}
		if (this.spellUsable.isOnCooldown(SPELLS.FROZEN_ORB.id)) {
			if (spellId === SPELLS.BLIZZARD_DAMAGE.id) {
				this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.FROZEN_ORB.id, REDUCTION_MS);
			} else if (spellId === SPELLS.ICE_LANCE_DAMAGE.id && this.hasWhiteoutTrait) {
				this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.FROZEN_ORB.id, REDUCTION_MS);
			}
		}
		
  }
}

export default FrozenOrb;
