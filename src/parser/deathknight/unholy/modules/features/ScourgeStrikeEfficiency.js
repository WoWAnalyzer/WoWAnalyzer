import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

class FesteringStrikeEfficiency extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  constructor(...args) {
    super(...args);
    this.activeSpell = this.selectedCombatant.hasTalent(SPELLS.CLAWING_SHADOWS_TALENT.id) ? SPELLS.CLAWING_SHADOWS_TALENT : SPELLS.SCOURGE_STRIKE;

    this.addEventListener(Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND), this.onWoundApply);
    this.addEventListener(Events.removedebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND), this.onWoundRemove);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND), this.onWoundRemove);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.activeSpell), this.onCast);
  }
  // used to track how many stacks a target has
  targets = {};

  totalCasts = 0;
  zeroWoundCasts = 0;

  onWoundApply(event){
		this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.stack;	
  }

  onWoundRemove(event){
		this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.stack || 0;
  }

  onCast(event){
    this.totalCasts += 1;
    if(this.targets.hasOwnProperty(encodeTargetString(event.targetID, event.targetInstance))){
      const currentTargetWounds = this.targets[encodeTargetString(event.targetID, event.targetInstance)];
      if(currentTargetWounds < 1){
        this.zeroWoundCasts += 1;
      }
    } else {
    this.zeroWoundCasts += 1;
    }    
  }

  suggestions(when) {
    const percentCastZeroWounds = this.zeroWoundCasts/this.totalCasts;
    const strikeEfficiency = 1 - percentCastZeroWounds;
    when(strikeEfficiency).isLessThan(0.80)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You are casting <SpellLink id={this.activeSpell.id} /> too often.  When spending runes remember to cast <SpellLink id={this.activeSpell.id} /> instead on targets with no stacks of <SpellLink id={this.activeSpell.id} /></span>)
            .icon(this.activeSpell.icon)
            .actual(`${formatPercentage(actual)}% of ${this.activeSpell.name} were used with Wounds on the target`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.20).major(recommended - 0.40);
        });
  }

  statistic() {
    const percentCastZeroWounds = this.zeroWoundCasts/this.totalCasts;
    const strikeEfficiency = 1 - percentCastZeroWounds;
    return (
      <StatisticBox
        icon={<SpellIcon id={this.activeSpell.id} />}
        value={`${formatPercentage(strikeEfficiency)} %`}
        label={`${this.activeSpell.name} Efficiency`}
        tooltip={`${this.zeroWoundCasts} out of ${this.totalCasts} ${this.activeSpell.name} were used with no Festering Wounds on the target.`}
        position={STATISTIC_ORDER.CORE(3)}
      />
    );
  }
}

export default FesteringStrikeEfficiency;
