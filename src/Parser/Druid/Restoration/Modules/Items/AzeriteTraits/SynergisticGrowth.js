import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import {formatPercentage, formatNumber} from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import StatWeights from '../../Features/StatWeights';

/**
 Casting Wild Growth grants you 165 Mastery for 10 sec sec. This cannot occur more than once every 30 sec.
 */
class SynergisticGrowth extends Analyzer{
  static dependencies = {
    statWeights: StatWeights,
  };

  masteryBuff = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SYNERGISTIC_GROWTH.id);
    if(this.active) {
      this.masteryBuff = this.selectedCombatant.traitsBySpellId[SPELLS.SYNERGISTIC_GROWTH.id]
        .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.SYNERGISTIC_GROWTH.id, rank)[0], 0);
    }
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SYNERGISTIC_GROWTH_BUFF.id) / this.owner.fightDuration;
  }

  get averageStatGain(){
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.SYNERGISTIC_GROWTH_BUFF.id) / this.owner.fightDuration;
    return averageStacks * this.masteryBuff;
  }

  statistic(){
    return(
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.SYNERGISTIC_GROWTH.id}
        value={(
          <React.Fragment>
            {formatPercentage(this.totalBuffUptime)}% uptime<br />
            {formatNumber(this.averageStatGain)} average mastery gained.
          </React.Fragment>
        )}
      />
    );
  }
}

export default SynergisticGrowth;
