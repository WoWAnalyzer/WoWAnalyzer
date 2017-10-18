import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import GetDamageBonus from '../PaladinCore/GetDamageBonus';

const RET_PALADIN_T21_2SET_MODIFIER = 0.6;

class Tier21_2set extends Module {
	static dependencies ={
		combatants: Combatants,
	};

	damageDone = 0;

	on_initalized() {
		this.active = this.combatants.selected.hasBuff(SPELLS.RET_PALADIN_T21_2SET_BONUS.id);
	}

	on_byPlayer_damage(event){
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.JUDGMENT_CAST.id){
			return;
		}
		this.damageDone += GetDamageBonus(event, RET_PALADIN_T21_2SET_MODIFIER);
	}

	item() {
    return {
      id: `spell-${SPELLS.RET_PALADIN_T21_2SET_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.RET_PALADIN_T21_2SET_BONUS.id} />,
      title: <SpellLink id={SPELLS.RET_PALADIN_T21_2SET_BONUS.id} />,
      result: (
        <dfn data-tip={`
          The effective damage contributed by tier 21 2 peice.<br/>
          Damage: ${this.owner.formatItemDamageDone(this.damageDone)}<br/>
          Total Damage: ${formatNumber(this.damageDone)}`}
        >
          {this.owner.formatItemDamageDone(this.damageDone)}
        </dfn>
      ),
    };
  }
}

export default Tier21_2set;