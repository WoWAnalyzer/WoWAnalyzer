import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import calculateEffectiveDamageStacked from 'Parser/Core/calculateEffectiveDamageStacked';

const CHAOS_VISION_INCREASE = 0.06;

/*
* Chaos Vision (Artifact Trait)
* Increases damage dealt by Eye Beam by 6%
*/

class ChaosVision extends Analyzer {
	static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  damage = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.CHAOS_VISION.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_damage(event) {
 		if(event.ability.guid !== SPELLS.EYE_BEAM_DAMAGE.id){
 			return;
 		}

 		this.damage += calculateEffectiveDamageStacked(event, CHAOS_VISION_INCREASE, this.rank);
 	}

 	subStatistic() {
 		return (
 			<div className="flex">
 				<div className="flex-main">
 					<SpellLink id={SPELLS.CHAOS_VISION.id} />
 				</div>
 				<div className="flex-sub text-right">
 					{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} %
 				</div>
 			</div>
 		);
 	}
}

export default ChaosVision;
