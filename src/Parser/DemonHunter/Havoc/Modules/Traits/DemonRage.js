import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import calculateEffectiveDamageStacked from 'Parser/Core/calculateEffectiveDamageStacked';

const DEMON_RAGE_INCREASE = 0.06;

const DEMON_RAGE_SPELLS = [
  SPELLS.DEMONS_BITE.id,
  SPELLS.DEMON_BLADES_FURY.id,
];

/*
* Demon Rage (Artifact Trait)
* Increases damage dealt by Demons Bite/Demon Blades by 6%
*/

class DemonRage extends Analyzer {
	static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  damage = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.DEMON_RAGE.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_damage(event) {
 		if(!DEMON_RAGE_SPELLS.includes(event.ability.guid)){
 			return;
 		}

 		this.damage += calculateEffectiveDamageStacked(event, DEMON_RAGE_INCREASE, this.rank);
 	}

 	subStatistic() {
 		return (
 			<div className='flex'>
 				<div className='flex-main'>
 					<SpellLink id={SPELLS.DEMON_RAGE.id}>
 						<SpellIcon id={SPELLS.DEMON_RAGE.id} noLink /> Demon Rage
 					</SpellLink>
 				</div>
 				<div className='flex-sub text-right'>
 					{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} %
 				</div>
 			</div>
 		);
 	}
}

export default DemonRage;