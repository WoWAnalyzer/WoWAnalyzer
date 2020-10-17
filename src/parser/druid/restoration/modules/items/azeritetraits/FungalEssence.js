import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import {formatPercentage, formatNumber} from 'common/format';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

import StatWeights from '../../features/StatWeights';
import {getPrimaryStatForItemLevel, findItemLevelByPrimaryStat} from "./common";
import Events from 'parser/core/Events';

/**
 * Swiftmend causes your Efflorescence mushroom to burst, healing a nearby injured ally for 4637
 */
class FungalEssence extends Analyzer{
  static dependencies = {
    statWeights: StatWeights,
  };

  healing = 0;
  avgItemLevel = 0;
  traitLevel = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FUNGAL_ESSENCE_TRAIT.id);
    if(this.active) {
      this.avgItemLevel = this.selectedCombatant.traitsBySpellId[SPELLS.FUNGAL_ESSENCE_TRAIT.id]
        .reduce((a, b) => a + b) / this.selectedCombatant.traitsBySpellId[SPELLS.FUNGAL_ESSENCE_TRAIT.id].length;
      this.traitLevel = this.selectedCombatant.traitsBySpellId[SPELLS.FUNGAL_ESSENCE_TRAIT.id].length;
    }
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FUNGAL_ESSENCE), this.onHeal);
  }
  onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);
  }

  statistic(){
    const throughputPercent = this.owner.getPercentageOfTotalHealingDone(this.healing);
    const onePercentThroughputInInt = this.statWeights._ratingPerOnePercent(this.statWeights.totalOneInt);
    const intGain = onePercentThroughputInInt * throughputPercent * 100;
    const ilvlGain = findItemLevelByPrimaryStat(getPrimaryStatForItemLevel(this.avgItemLevel) + intGain) - this.avgItemLevel;

    return(
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.FUNGAL_ESSENCE_TRAIT.id}
        value={`${formatPercentage(throughputPercent)} %`}
        tooltip={(
          <>
            Fungal Essence healing gave you equivalent to <strong>{formatNumber(intGain)}</strong> ({formatNumber(intGain/this.traitLevel)} per level) Intellect.
            This is worth roughly <strong>{formatNumber(ilvlGain)}</strong> ({formatNumber(ilvlGain/this.traitLevel)} per level) item levels.
          </>
        )}
      />
    );
  }
}

export default FungalEssence;
