import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Tier20_4set from '../Items/Tier20_4set';

const BLIZZARD_REDUCTION_MS = 500;

class FrozenOrb extends Analyzer {

	static dependencies = {
		combatants: Combatants,
		tier20_4set: Tier20_4set,
		spellUsable: SpellUsable,
		abilityTracker: AbilityTracker,
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

	suggestions(when) {
		const totalCdr = this.cooldownReduction + this.tier20_4set.totalCdr;
		const frozenOrbCasts = this.abilityTracker.getAbility(SPELLS.FROZEN_ORB.id).casts;
		const fightDurationSeconds = this.owner.fightDuration / 1000;
		const frozenOrbOnCooldownSeconds = ((frozenOrbCasts * this.baseCooldown) - (totalCdr / 1000));
		const frozenOrbOnCooldownPercentage = frozenOrbOnCooldownSeconds / fightDurationSeconds;
		when(frozenOrbOnCooldownPercentage).isLessThan(0.95)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span><SpellLink id={SPELLS.FROZEN_ORB.id}/> was on Cooldown {formatPercentage(frozenOrbOnCooldownPercentage)}% of the time. Make sure you are casting Frozen Orb as much as possible. </span>)
					.icon(SPELLS.FROZEN_ORB.icon)
					.actual(`${formatPercentage(frozenOrbOnCooldownPercentage)}%`)
					.recommended(`${formatPercentage(recommended)}% is Recommended`)
					.regular(0.9).major(0.8);
			});
	}
}

export default FrozenOrb;
