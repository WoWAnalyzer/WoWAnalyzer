import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import {formatPercentage, formatNumber} from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatWeights from '../../../../../druid/restoration/modules/features/StatWeights';

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
          <>
            {formatPercentage(this.totalBuffUptime)}% uptime<br />
            {formatNumber(this.averageStatGain)} average mastery gained.
          </>
        )}
      />
    );
  }
}

export default SynergisticGrowth;
