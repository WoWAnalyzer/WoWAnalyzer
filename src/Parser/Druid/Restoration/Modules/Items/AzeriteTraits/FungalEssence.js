import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import {formatPercentage, formatNumber} from 'common/format';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import StatWeights from '../../Features/StatWeights';
/**
 * Swiftmend causes your Efflorescence mushroom to burst, healing a nearby injured ally for 4637
 */
class FungalEssence extends Analyzer{
  static dependencies = {
    statWeights: StatWeights,
  };

  healing = 0;
  avgItemLevel = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FUNGAL_ESSENCE_TRAIT.id);
    if(this.active) {
      this.avgItemLevel = this.selectedCombatant.traitsBySpellId[SPELLS.FUNGAL_ESSENCE_TRAIT.id]
        .reduce((a, b) => a + b) / this.selectedCombatant.traitsBySpellId[SPELLS.FUNGAL_ESSENCE_TRAIT.id].length;
    }
  }
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.FUNGAL_ESSENCE.id) {
      this.healing += event.amount + (event.absorbed || 0);
    }
  }

  getPrimaryStatForItemLevel(itemLevel) {
    const SCALE = 17.3;
    return Math.floor(SCALE * (1.15**(itemLevel/15)));
  }
  findItemLevelByPrimaryStat(primaryStat) {
    // Ehm..this is the same formula in getPrimaryStatForItemLevel but itemLevel broken out. ¯\_(ツ)_/¯
    return Math.floor((15 * Math.log(173/(5*primaryStat)))/(2* Math.log(2) + Math.log(5) - Math.log(23)) - (15 * Math.log(2)) / (2 * Math.log(2) + Math.log(5) - Math.log(23)));
  }

  statistic(){
    const throughputPercent = this.owner.getPercentageOfTotalHealingDone(this.healing);
    const onePercentThroughputInInt = this.statWeights._ratingPerOnePercent(this.statWeights.totalOneInt);
    const intGain = onePercentThroughputInInt * throughputPercent * 100;
    const ilvlGain = this.findItemLevelByPrimaryStat(this.getPrimaryStatForItemLevel(this.avgItemLevel) + intGain) - this.avgItemLevel;

    return(
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.FUNGAL_ESSENCE_TRAIT.id}
        value={(
          <React.Fragment>
            {formatPercentage(throughputPercent)} %<br />
          </React.Fragment>
        )}
        tooltip={`Fungal essence healing gave you equivalent to <b>${formatNumber(intGain)}</b> int. This is worth roughly <b>${formatNumber(ilvlGain)}</b> item levels.`}
      />
    );
  }
}

export default FungalEssence;
