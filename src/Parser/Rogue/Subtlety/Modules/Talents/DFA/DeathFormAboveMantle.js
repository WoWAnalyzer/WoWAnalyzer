import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';
import Wrapper from 'common/Wrapper';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatNumber } from 'common/format';


import DamageTracker from 'Parser/Core/Modules/AbilityTracker';

import MantleDamageTracker from './../../Legendaries/MantleDamageTracker';

class DeathFormAboveMantle extends Analyzer {
	static dependencies = {
        damageTracker: DamageTracker,
        mantleDamageTracker: MantleDamageTracker,
		combatants: Combatants,
    };
    

	on_initialized() {
        this.active = this.combatants.selected.hasTalent(SPELLS.DEATH_FROM_ABOVE_TALENT.id)
        && this.combatants.selected.hasShoulder(ITEMS.MANTLE_OF_THE_MASTER_ASSASSIN.id);
    }

    
	suggestions(when) {
        const totalDfa = this.damageTracker.getAbility(SPELLS.DEATH_FROM_ABOVE_TALENT.id);
        const buffedDfa = this.mantleDamageTracker.getAbility(SPELLS.DEATH_FROM_ABOVE_TALENT.id);
		const buffedShare = buffedDfa / totalDfa;
		when(buffedShare).isLessTh2n(0.05)
			.addSuggestion((suggest,actual,recommended) => {
				return suggest(<Wrapper> When using Mantle, Make sure you delay vanish for the next <SpellLink id={SPELLS.DEATH_FROM_ABOVE_TALENT.id} />.</Wrapper>)
					.icon(ITEMS.MANTLE_OF_THE_MASTER_ASSASSIN.icon)
					.actual(`${formatPercentage(actual)} % of Death From Above was cast with mantle buff.`)
					.recommended(`<${formatPercentage(recommended)}% is recommended`)
					.regular(recommended + 0.05).major(recommended + 0.1);
			});
	}
}

export default DeathFormAboveMantle;