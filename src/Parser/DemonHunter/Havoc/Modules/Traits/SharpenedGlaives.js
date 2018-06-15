import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import calculateEffectiveDamageStacked from 'Parser/Core/calculateEffectiveDamageStacked';

const SHARPENED_GLAIVES_INCREASE = 0.05;

/*
* Sharpened Glaives (Artifact Trait)
* Increases damage dealt by Throw Glaive by 5%
*/

class SharpenedGlaives extends Analyzer {
	static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  damage = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.SHARPENED_GLAIVES.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_damage(event) {
 		if(event.ability.guid !== SPELLS.THROW_GLAIVE_HAVOC.id){
 			return;
 		}

 		this.damage += calculateEffectiveDamageStacked(event, SHARPENED_GLAIVES_INCREASE, this.rank);
 	}

 	subStatistic() {
 		return (
 			<div className="flex">
 				<div className="flex-main">
 					<SpellLink id={SPELLS.SHARPENED_GLAIVES.id} />
 				</div>
 				<div className="flex-sub text-right">
 					{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} %
 				</div>
 			</div>
 		);
 	}
}

export default SharpenedGlaives;
