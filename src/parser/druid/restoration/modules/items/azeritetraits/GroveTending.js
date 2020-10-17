import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Mastery from 'parser/druid/restoration/modules/core/Mastery';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

import StatWeights from '../../features/StatWeights';
import { getPrimaryStatForItemLevel, findItemLevelByPrimaryStat } from "./common";
import Events from 'parser/core/Events';

/**
 Swiftmend heals the target for 2772 over 9 sec.
 */
class GroveTending extends Analyzer {
  static dependencies = {
    statWeights: StatWeights,
    mastery: Mastery,
  };

  healing = 0;
  avgItemLevel = 0;
  traitLevel = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.GROVE_TENDING_TRAIT.id);
    if (this.active) {
      this.avgItemLevel = this.selectedCombatant.traitsBySpellId[SPELLS.GROVE_TENDING_TRAIT.id]
        .reduce((a, b) => a + b) / this.selectedCombatant.traitsBySpellId[SPELLS.GROVE_TENDING_TRAIT.id].length;
      this.traitLevel = this.selectedCombatant.traitsBySpellId[SPELLS.GROVE_TENDING_TRAIT.id].length;
    }
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GROVE_TENDING), this.onHeal);
  }
  onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const throughputPercent = this.owner.getPercentageOfTotalHealingDone(this.healing);
    const masteryHealing = this.mastery.getMasteryHealing(SPELLS.GROVE_TENDING.id);
    const masteryPercent = this.owner.getPercentageOfTotalHealingDone(masteryHealing);

    const onePercentThroughputInInt = this.statWeights._ratingPerOnePercent(this.statWeights.totalOneInt);
    const intGain = onePercentThroughputInInt * (throughputPercent + masteryPercent) * 100;
    const ilvlGain = findItemLevelByPrimaryStat(getPrimaryStatForItemLevel(this.avgItemLevel) + intGain) - this.avgItemLevel;

    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.GROVE_TENDING_TRAIT.id}
        value={this.owner.formatItemHealingDone(this.healing + masteryHealing)}
        tooltip={(
          <>
            Healing from HoT: {this.owner.formatItemHealingDone(this.healing)}<br />
            Healing from extra mastery stack: {this.owner.formatItemHealingDone(masteryHealing)}<br />
            Grove Tending gave you equivalent to <b>{formatNumber(intGain)}</b> ({formatNumber(intGain / this.traitLevel)}
            per level) int. This is worth roughly <b>{formatNumber(ilvlGain)}</b> ({formatNumber(ilvlGain / this.traitLevel)}
            per level) item levels.
          </>
        )}
      />
    );
  }
}

export default GroveTending;
