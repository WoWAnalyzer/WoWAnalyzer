import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import {formatPercentage, formatNumber} from 'common/format';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatWeights from '../../features/StatWeights';
import {getPrimaryStatForItemLevel, findItemLevelByPrimaryStat} from '../AzeriteTraits/common';

/**
 If Rejuvenation is your only heal over time effect on the target, increase the healing of Rejuvenation by 107.
 */
class AutumnLeaves extends Analyzer{
  static dependencies = {
    statWeights: StatWeights,
  };

  healing = 0;
  avgItemLevel = 0;
  traitLevel = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.AUTUMN_LEAVES_TRAIT.id);
    if(this.active) {
      this.avgItemLevel = this.selectedCombatant.traitsBySpellId[SPELLS.AUTUMN_LEAVES_TRAIT.id]
        .reduce((a, b) => a + b) / this.selectedCombatant.traitsBySpellId[SPELLS.AUTUMN_LEAVES_TRAIT.id].length;
      this.traitLevel = this.selectedCombatant.traitsBySpellId[SPELLS.AUTUMN_LEAVES_TRAIT.id].length;
    }
  }
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.AUTUMN_LEAVES.id) {
      this.healing += event.amount + (event.absorbed || 0);
    }
  }

  statistic(){
    const throughputPercent = this.owner.getPercentageOfTotalHealingDone(this.healing);
    const onePercentThroughputInInt = this.statWeights._ratingPerOnePercent(this.statWeights.totalOneInt);
    const intGain = onePercentThroughputInInt * throughputPercent * 100;
    const ilvlGain = findItemLevelByPrimaryStat(getPrimaryStatForItemLevel(this.avgItemLevel) + intGain) - this.avgItemLevel;

    return(
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.AUTUMN_LEAVES_TRAIT.id}
        value={(
          <React.Fragment>
            {formatPercentage(throughputPercent)} %<br />
          </React.Fragment>
        )}
        tooltip={`Autumn Leaves gave you equivalent to <b>${formatNumber(intGain)}</b> (${formatNumber(intGain/this.traitLevel)}
            per level) int. This is worth roughly <b>${formatNumber(ilvlGain)}</b> (${formatNumber(ilvlGain/this.traitLevel)}
            per level) item levels.`}
      />
    );
  }
}

export default AutumnLeaves;
