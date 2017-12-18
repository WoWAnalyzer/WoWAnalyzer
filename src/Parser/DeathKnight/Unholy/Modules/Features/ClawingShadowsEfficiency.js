import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

class ClawingShadowsEfficiency extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };
  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CLAWING_SHADOWS_TALENT.id);
  }
  // used to track how many stacks a target has
  targets = {};

  totalClawingShadowsCasts = 0;
  clawingShadowCastsZeroWounds = 0;

  on_byPlayer_applydebuffstack(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.FESTERING_WOUND.id){
		this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.stack;
	}
  }

  on_byPlayer_removedebuffstack(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.FESTERING_WOUND.id){
		this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.stack;
    }
  }

  on_byPlayer_removedebuff(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.FESTERING_WOUND.id){
		this.targets[encodeTargetString(event.targetID, event.targetInstance)] = 0;
	}
  }

  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.CLAWING_SHADOWS_TALENT.id){
		  this.totalClawingShadowsCasts++;
		  if(this.targets.hasOwnProperty(encodeTargetString(event.targetID, event.targetInstance))){
			  const currentTargetWounds = this.targets[encodeTargetString(event.targetID, event.targetInstance)];
			  if(currentTargetWounds < 1){
				  this.clawingShadowCastsZeroWounds++;
			  }
		  } else {
			this.clawingShadowCastsZeroWounds++;
      }
    }
  }

  suggestions(when) {
    const percentCastZeroWounds = this.clawingShadowCastsZeroWounds/this.totalClawingShadowsCasts;
    const strikeEfficiency = 1 - percentCastZeroWounds;
    when(strikeEfficiency).isLessThan(0.80)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You are casting <SpellLink id={SPELLS.CLAWING_SHADOWS_TALENT.id}/> too often.  When spending runes remember to cast <SpellLink id={SPELLS.FESTERING_STRIKE.id}/> instead on targets with no stacks of <SpellLink id={SPELLS.FESTERING_WOUND.id}/></span>)
            .icon(SPELLS.CLAWING_SHADOWS_TALENT.icon)
            .actual(`${formatPercentage(actual)}% of Clawing Shadows were used with Wounds on the target`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.20).major(recommended - 0.40);
        });
  }

  statistic() {
    const percentCastZeroWounds = this.clawingShadowCastsZeroWounds/this.totalClawingShadowsCasts;
    const strikeEfficiency = 1 - percentCastZeroWounds;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CLAWING_SHADOWS_TALENT.id} />}
        value={`${formatPercentage(strikeEfficiency)} %`}
        label={'Clawing Shadows Efficiency'}
        tooltip={`${this.clawingShadowCastsZeroWounds} out of ${this.totalClawingShadowsCasts} Clawing Shadows were used with no Festering Wounds on the target.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default ClawingShadowsEfficiency;
