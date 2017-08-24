import React from 'react';

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatNumber } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

class ChiBurst extends Module {
  castChiBurst = 0;
  healing = 0;
  targetsChiBurst = 0;
  avgChiBurstTargets = 0;
  raidSize = 0;


  on_initialized(){
    this.active = this.owner.selectedCombatant.hasTalent(SPELLS.CHI_BURST_TALENT.id);
    this.raidSize = Object.entries(this.owner.combatants.players).length;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.CHI_BURST_TALENT.id) {
      this.castChiBurst++;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    if (!this.owner.combatants.players[targetId]) {
      return;
    }

    if(spellId === SPELLS.CHI_BURST_HEAL.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.targetsChiBurst++;
    }
  }

  suggestions(when) {
    when(this.avgChiBurstTargets).isLessThan(this.raidSize * .3)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You are not utilizing your <SpellLink id={SPELLS.CHI_BURST_TALENT.id} /> talent as effectively as you should. You should work on both your positioning and aiming of the spell. Always aim for the highest concentration of players, which is normally melee.</span>)
          .icon(SPELLS.CHI_BURST_TALENT.icon)
          .actual(`${this.avgChiBurstTargets.toFixed(2)} targets hit per Chi Burst cast - ${formatPercentage(this.avgChiBurstTargets / this.raidSize)}% of raid hit`)
          .recommended(`30% of the raid hit is recommended`)
          .regular(recommended - .05).major(recommended - .1);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CHI_BURST_TALENT.id} />}
        value={`${formatNumber(this.healing)}`}
        label={(
          <dfn data-tip={`You healed an average of ${this.avgChiBurstTargets.toFixed(2)} targets per Chi Burst cast over your ${this.castChiBurst} casts.`}>
            Total Healing
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
  on_finished() {
    this.avgChiBurstTargets = this.targetsChiBurst / this.castChiBurst || 0;
    if(debug) {
      console.log('ChiBurst Casts: ' + this.castChiBurst);
      console.log('Total Chi Burst Healing: ' + this.healing);
      console.log('Chi Burst Targets Hit: ' + this.targetsChiBurst);
    }
  }
}

export default ChiBurst;
