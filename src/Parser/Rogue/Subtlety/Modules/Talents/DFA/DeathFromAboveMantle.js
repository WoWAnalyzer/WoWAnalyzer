import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Wrapper from 'common/Wrapper';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import { formatPercentage } from 'common/format';

import DamageTracker from 'Parser/Core/Modules/AbilityTracker';
import MantleDamageTracker from '../../../../Common/Legendaries/MantleDamageTracker';

class DeathFromAboveMantle extends Analyzer {
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
        const totalDfa = this.damageTracker.getAbility(SPELLS.DEATH_FROM_ABOVE_TALENT.id).casts;
        const buffedDfa = this.mantleDamageTracker.getAbility(SPELLS.DEATH_FROM_ABOVE_TALENT.id).casts;
		const buffedShare = buffedDfa / totalDfa;
		when(buffedShare).isLessThan(0.25)
			.addSuggestion((suggest,actual,recommended) => {
				return suggest(<Wrapper> When using <ItemLink id={ITEMS.MANTLE_OF_THE_MASTER_ASSASSIN.id} />, use <SpellLink id={SPELLS.VANISH.id} /> before <SpellLink id={SPELLS.DEATH_FROM_ABOVE_TALENT.id} /> combo.</Wrapper>)
					.icon(ITEMS.MANTLE_OF_THE_MASTER_ASSASSIN.icon)
					.actual(`${formatPercentage(actual)}% of Death from Above was cast with mantle buff.`)
					.recommended(`>${formatPercentage(recommended)} % is recommended`)
					.regular(recommended + 0.025).major(recommended + 0.05);
			});
	}
}

export default DeathFromAboveMantle;